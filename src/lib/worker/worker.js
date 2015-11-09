'use strict';

var q = require('q'),
    cluster = require('cluster'),
    logger = require('../logger');

function Worker() {}

Worker.prototype.start = function start() {
    var _this = this,
        deferred = q.defer();

    logger.info('Started ' + this.constructor.name + ' worker ' + cluster.worker.id + '...');

    process.on('message', function(msg) {
        logger.debug('Worker ' + cluster.worker.id + ' received a "' + msg.command + '" event');

        _this.onMsgReceived(msg.payload)
            .then(function respondToMaster(payload) {
                _this.respondToMaster(msg, payload);
            })
            .done();
    });

    cluster.on('disconnect', function resolveDeferred() {
        deferred.resolve();
    });

    return deferred.promise
        .then(function inform() {
            logger.debug('Stopping ' + _this.constructor.name + ' worker #' + cluster.worker.id + '...');
        });
};

Worker.prototype.onMsgReceived = function onMsgReceived(payload) {
    throw 'The Worker subclass "' + this.constructor.name + '" must implement onMsgReceived';
};

Worker.prototype.respondToMaster = function respondToMaster(msg, payload) {
    process.send({
        deferredId: msg.deferredId,
        workerId: cluster.worker.id,
        payload: payload
    });
};

module.exports = Worker;