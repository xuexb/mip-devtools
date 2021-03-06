(function () {
    const App = {
        init() {
            MIP.config.get().then(config => {
                console.log(config)
                App.local.set(config.local);
                App.cache.set(config.cache);
                App.push.set(config.push);

                $('form').on('submit', event => {
                    const $button = $(event.target).find('button[type="submit"]');

                    // 禁用按钮，实现 loading
                    $button.prop('disabled', true).text('保存中...');

                    // 合并数据
                    $.extend(config.local, App.local.get());
                    $.extend(config.cache, App.cache.get());
                    $.extend(config.push, App.push.get());

                    MIP.config.set(config).delay(500).then(data => {
                        MIP.notifications({
                            message: '配置保存成功!',
                            time: 2
                        });
                        $button.prop('disabled', false).text('保存');
                    });

                    event.preventDefault();
                });

                $('#close').on('click', () => {
                    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                        chrome.tabs.remove(tabs[0].id);
                    });
                });
            });

        }
    };

    /**
     * 清空缓存配置
     *
     * @type {Object}
     */
    App.cache = {
        set(data = {}) {
            $('#authkey').val(data.authkey);
        },
        get() {
            return {
                authkey: $('#authkey').val()
            }
        }
    };

    /**
     * 推送配置
     *
     * @type {Object}
     */
    App.push = {
        set(data = {}) {
            $('#site').val(data.site);
            $('#token').val(data.token);
        },
        get() {
            return {
                site: $('#site').val(),
                token: $('#token').val()
            };
        }
    };

    /**
     * 本地化配置
     *
     * @type {Object}
     */
    App.local = {
        init() {
            const $all = $('#local-all');
            const $fieldset = $all.closest('fieldset');
            const getFilters = () => $fieldset.find('code');
            const $extensions = $('#local-mip-extensions');

            $all.off('.local').on('change.local', () => {
                const checked = $all.prop('checked');

                $fieldset.find('input').not($all).prop('disabled', checked);
                getFilters().tooltip(checked ? 'disable' : 'enable');
                $fieldset.attr('data-all', checked);
            }).trigger('change.local');

            $extensions.off('.local').on('keydown.local', event => {
                if (!(event.metaKey || event.ctrlKey) && event.keyCode === 13) {
                    if (/^mip-.+$/.test(event.target.value)) {
                        const list = getFilters().map((i, v) => $(v).text()).get().concat($extensions.val());
                        App.local.setExtensions(list);
                        $extensions.val('');
                    }
                    event.preventDefault();
                }
            });

            $('#local-mip-extensions-list').off('.local').on('click.local', 'code', event => {
                if (!$all.prop('checked')) {
                    $(event.target).tooltip('dispose').remove();
                }

            });
        },
        distinct(arr) {
            const list = {};
            arr.forEach(key => {
                if (!list[key]) {
                    list[key] = 1;
                }

            });
            return Object.keys(list);
        },
        setExtensions(rules) {
            const html = App.local.distinct(rules)
                .filter(v => v.indexOf('mip-') === 0)
                .map(v => `<code title="点击删除">${v}</code>`);

            $('#local-mip-extensions-list code').tooltip('dispose').remove();
            $('#local-mip-extensions-list').html(html).find('code').tooltip();
        },
        set(data = {}) {
            const rules = data.rules || [];

            if (rules.indexOf('*') > -1) {
                $('#local-all').prop('checked', true);
            }

            if (rules.indexOf('mip.js') > -1) {
                $('#local-mipjs').prop('checked', true);
            }

            if (rules.indexOf('mip.css') > -1) {
                $('#local-mipcss').prop('checked', true);
            }

            if (data.host) {
                $('#local-host').val(data.host);
            }

            App.local.setExtensions(rules);
            App.local.init();
        },
        get() {
            const rules = [];

            if ($('#local-all').prop('checked')) {
                rules.push('*');
            }

            if ($('#local-mipjs').prop('checked')) {
                rules.push('mip.js');
            }

            if ($('#local-mipcss').prop('checked')) {
                rules.push('mip.css');
            }

            rules.push.apply(rules, $('#local-mip-extensions-list code').map((i, v) => $(v).text()).get());

            return {
                rules,
                host: $('#local-host').val()
            };
        }
    };
      

    App.init();
})();
