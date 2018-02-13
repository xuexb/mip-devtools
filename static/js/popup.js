MIP.config.get().then(data => {
    $('.settings').click(() => {
        chrome.tabs.create({
            url: "template/config.html",
            active: true
        });
    });

    $('#mip-local-enabled').on('change', event => {
        data.local.enabled = event.target.checked;
        MIP.config.set(data);
    });
    $('#mip-local-enabled').prop('checked', data.local.enabled);

    MIP.config.set(data);
});
