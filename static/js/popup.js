Promise.all([
    MIP.config.get(),
    Promise.resolve().then(() => {
        const tab = chrome.extension.getBackgroundPage().getCurrent();

        if (!tab) {
            return {};
        }

        return MIP.chrome.tabs.sendMessage(tab.id, {MIP: true});
    })
]).then(data => {
    let config = data[0];
    let runtime = data[1];

    $('.settings').click(() => {
        chrome.tabs.create({
            url: "template/config.html",
            active: true
        });
    });

    // 代理配置
    $('#mip-local-enabled').on('change', event => {
        config.local.enabled = event.target.checked;
        MIP.config.set(config);
    });
    $('#mip-local-enabled').prop('checked', config.local.enabled);

    // 清理缓存
    if (!config.cache || !config.cache.authkey || !runtime.MIPUrl) {
        $('#mip-cache').addClass('disabled');
    }
    else {
        $('#mip-cache').on('click', () => {
            const mipurl = runtime.MIPUrl;
            const orgin = mipurl.indexOf('https://') === 0 ? `s/${mipurl.slice(8)}` : mipurl.slice(7);
            const url = `http://mipcache.bdstatic.com/update-ping/c/${orgin}`;

            $.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                data: {
                    key: config.cache.authkey
                },
                cache: false,
                timeout: 3000,
                success(res) {
                    let msg = '清除出错';
                    if (res.msg === 'cache clean success') {
                        msg = '清理成功';
                    }
                    else if (res.msg === 'auth check fail') {
                        msg = '清理失败，授权信息错误';
                    }
                    MIP.notifications({
                        message: msg,
                        time: 2
                    });
                },
                error() {
                    MIP.notifications({
                        message: '请求出错',
                        time: 2
                    });
                }
            });
        });
    }

    // 推送
    if (!config.push || !config.push.site || !config.push.token || !runtime.MIPUrl) {
        $('#mip-push').addClass('disabled');
    }
    else {
        $('#mip-push').on('click', () => {
            const url = `http://data.zz.baidu.com/urls?site=${config.push.site}&token=${config.push.token}&type=mip`;

            $.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                data: runtime.MIPUrl,
                contentType: 'multipart/form-data',
                processData: false,
                cache: false,
                timeout: 3000,
                success(res) {
                    let msg = '推送失败';
                    if (res.success_mip > 0) {
                        msg = '推送成功';
                    }
                    else if (res.not_same_site && res.not_same_site.length) {
                        msg = '推送失败，站点域名不匹配';
                    }

                    MIP.notifications({
                        message: msg,
                        time: 2
                    });
                },
                error() {
                    MIP.notifications({
                        message: '请求出错',
                        time: 2
                    });
                }
            });
        });
    }

    // 重写配置
    MIP.config.set(config);

    console.log(runtime)
});
