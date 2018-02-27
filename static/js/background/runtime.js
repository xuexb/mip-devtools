let currentTab = null;

/**
 * Updates the tabId's extension icon and badge.
 *
 * @param {number} tabId ID of a tab.
 * @param {string} iconPrefix File name prefix of the icon to use.
 * @param {string} title Title to display in extension icon hover.
 * @param {string} text Text to display in badge.
 * @param {string} color Background color for badge.
 */
function updateTabStatus(tabId, iconPrefix, title, text, color) {
    // Verify tab still exists
    chrome.tabs.get(tabId, function (tab) {
        if (!chrome.runtime.lastError) {
            chrome.browserAction.setIcon({
                path: {
                    19: `/static/img/${iconPrefix}-icon-128.png`,
                    38: `/static/img/${iconPrefix}-icon-48.png`
                },
                tabId: tabId
            });
            if (title !== undefined) {
                chrome.browserAction.setTitle({title: title, tabId: tabId});
            }

            if (text !== undefined) {
                chrome.browserAction.setBadgeText({text: text, tabId: tabId});
            }

            if (color !== undefined) {
                chrome.browserAction.setBadgeBackgroundColor(
                    {color: color, tabId: tabId});
            }
        }

    });
}

function isForbiddenUrl(url) {
    return (url.startsWith('chrome://') || url.startsWith('view-source'));
}

const setMIPCacheStatus = tab => {
    updateTabStatus(tab.id, 'cache', '当前为 MIP-Cache 页面');
};

const setMIPStatus = tab => {
    updateTabStatus(tab.id, 'mip', '当前为 MIP 页面');
};

const setNoMIPStatus = tab => {
    updateTabStatus(tab.id, 'nomip', '当前不是 MIP 页面');
};

const validateForTab = tab => {
    if (typeof window.MIPValidator === 'undefined') {
        return updateTabStatus(tab.id, 'mip', 'MIP-HTML 校验失败', '!', '#f00');
    }

    var xhr = new XMLHttpRequest();
    var url = tab.url.split('#')[0];
    xhr.open('GET', url, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const errors = window.MIPValidator().validate(xhr.responseText);

            if (errors.length) {
                updateTabStatus(tab.id, 'mip', 'MIP-HTML 校验错误', errors.length > 9 ? '9+' : errors.length, '#f00');
            }
            else {
                updateTabStatus(tab.id, 'mip', 'MIP-HTML 校验通过');
            }
        }

    };
    xhr.send();
};

let timer = null;
function updateTab(tab) {
    if (!isForbiddenUrl(tab.url)) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
                MIP: true
            }, response => {
                if (response && response.isMIP && response.isMIPCache) {
                    setMIPCacheStatus(tab);
                }
                else if (response && response.isMIP) {
                    setMIPStatus(tab);
                    validateForTab(tab);
                }
                else {
                    setNoMIPStatus(tab);
                }
            });

            currentTab = tab;
        }, 100);
    }
}

chrome.tabs.onCreated.addListener(tab => updateTab(tab));
chrome.tabs.onUpdated.addListener((tabId, info, tab) => updateTab(tab));
chrome.tabs.onReplaced.addListener(tabId => chrome.tabs.get(tabId, tab => updateTab(tab)));
chrome.tabs.onRemoved.addListener(tabId => {
    if (currentTab && tabId === currentTab.id) {
        currentTab = null;
    }
});

window.getCurrent = () => currentTab;
