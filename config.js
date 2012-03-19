var config = {};


config.couchOpts = {
    host: 'localhost',
    port: 5984,
    db: 'test-notif',
    heartbeat: 10000,
    log: false
};


module.exports = config;