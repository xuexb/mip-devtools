const globals = {};

globals.isMIP = () => document.documentElement.hasAttribute('mip');

globals.isMIPCache = () => location.hostname.endsWith('.mipcdn.com');

globals.getMIPUrl = () => {
    if (location.pathname.startsWith('/c/s')) {
        return 'https://' + window.location.pathname.slice(5);
    }
    else if (location.pathname.startsWith('/c')) {
        return 'http://' + window.location.pathname.slice(3);
    }
    else {
        return location.href;
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.MIP) {
        sendResponse({
            isMIP: globals.isMIP(),
            isMIPCache: globals.isMIPCache(),
            MIPUrl: globals.getMIPUrl(),
            userAgent: navigator.userAgent
        });
    }
});
