/**
 * @file 公用方法
 * @author xuexb <fe.xiaowu@gmail.com>
 */

(function () {
    const MIP = window.MIP = {};

    /**
     * 通知
     *
     * @param  {Object|string} options 配置参数或者通知消息
     * @param {string} [options.title=MIP 开发者工具] 通知标题
     * @param {number} [options.time=0] 自动关闭时间，单位秒
     * @param {Function} options.onClicked 点击通知回调，点击后就会关闭该通知
     */
    MIP.notifications = options => {
        if ('string' === typeof options) {
            options = {
                message: options
            };
        }

        options = Object.assign({
            title: 'MIP 开发者工具',
            iconUrl: chrome.runtime.getURL('static/img/icon-48.png'),
            time: 0,
            onClicked: null
        }, options);

        if (!options.message) {
            throw new TypeError('`options.message` 不能为空');
        }

        chrome.notifications.create({
            type: 'basic',
            iconUrl: options.iconUrl,
            title: options.title,
            message: options.message
        }, id => {
            // 自动关闭
            if (options.time) {
                setTimeout(() => {
                    MIP.notifications.close(id);
                }, options.time * 1000);
            }

            MIP.notifications.cache[id] = options;
        });
    };
    MIP.notifications.cache = {};
    MIP.notifications.close = function (id) {
        chrome.notifications.clear(id);
        delete MIP.notifications.cache[id];
    };
    chrome.notifications.onClicked.addListener(id => {
        if (MIP.notifications.cache[id] && 'function' === typeof MIP.notifications.cache[id].onClicked) {
            MIP.notifications.cache[id].onClicked();
        }
        MIP.notifications.close(id);
    });

    MIP.config = {
        get() {
            return new Promise(resolve => {
                MIP.chrome.storage.sync.get().then(res => {
                    res.local = Object.assign({
                        enabled: false,
                        rules: ['*'],
                        host: 'http://127.0.0.1:8000'
                    }, res.local);

                    res.cache = Object.assign({
                        authkey: ''
                    }, res.cache);

                    res.push = Object.assign({
                        site: '',
                        token: ''
                    }, res.push);

                    resolve(res);
                });
            });
        },
        set(data) {
            localStorage['mip-devtools'] = JSON.stringify(data);
            return MIP.chrome.storage.sync.set(data).then(() => data);
        }
    };

    MIP.chrome = new ChromePromise();
})();