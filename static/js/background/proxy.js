chrome.webRequest.onBeforeRequest.addListener(details => {
    const url = details.url.split('?')[0];
    const devtools = JSON.parse(localStorage['mip-devtools'] || null);
    const config = details ? devtools.local : null;
    const host = config ? config.host : '';
    const rules = config ? config.rules : null;

    // 如果没有配置或者没有开启
    if (!config || !config.enabled || !host) {
        return;
    }

    // 代理 mip.js
    if (url.indexOf('/static/v1/mip.js') > -1 && (rules.indexOf('mip.js') > -1 || rules.indexOf('*') > -1)) {
        return {
            redirectUrl: `${host}/miplocal/dist/mip.js`
        }
    }

    // 代理 mip.css
    if (url.indexOf('/static/v1/mip.css') > -1 && (rules.indexOf('mip.css') > -1 || rules.indexOf('*') > -1)) {
        return {
            redirectUrl: `${host}/miplocal/dist/mip.css`
        }
    }

    // 代理组件
    const matched = url.match(/\/(mip-[\w-]+)\.js/i);
    const name = matched ? matched[1] : null;
    if (!name || (rules.indexOf(name) === -1 && rules.indexOf('*') === -1)) {
        return;
    }
    return {
        redirectUrl: `${host}/local-extension-loader/${name}.js`
    }
},
    {
        urls: [
            '*://*.mipcdn.com/static/*/*.js*',
            '*://mipcache.bdstatic.com.com/static/*/*.js*',
            '*://*.mipcdn.com/static/*/*.css*',
            '*://mipcache.bdstatic.com.com/static/*/*.css*'
        ]
    },
    ['blocking']
);