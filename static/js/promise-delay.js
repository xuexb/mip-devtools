function delay(t, v) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t);
    });
}

Promise.prototype.delay = function (t) {
    return this.then(function (v) {
        return delay(t, v);
    });
};
