'use strict';

var q = require('q'),
    cluster = require('cluster'),
    logger = require('../logger'),
    bootstrap = require('../../bootstrap');

function Worker() {
    this.messageHandlers = {};
}

Worker.prototype.start = function start() {
    var _this = this,
        deferred = q.defer();

    logger.info('Started worker ' + cluster.worker.id + '...');

    process.on('message', function(msg) {
        logger.debug('Worker ' + cluster.worker.id + ' received a "' + msg.command + '" event');

        _this.onMsgReceived(msg.command, msg.payload)
            .then(function respondToMaster(payload) {
                _this.respondToMaster(msg, payload);
            })
            .done();
    });

    cluster.worker.on('disconnect', function resolveDeferred() {
        logger.debug('Worker ' + cluster.worker.id + ' was disconnected.  Terminating...');
        deferred.resolve();
    });

    return deferred.promise
        .then(function inform() {
            logger.debug('Stopping worker #' + cluster.worker.id + '...');
        });
};

Worker.prototype.respondToMaster = function respondToMaster(msg, payload) {
    process.send({
        deferredId: msg.deferredId,
        workerId: cluster.worker.id,
        payload: payload,
        command: msg.command
    });
};

Worker.prototype.onMsgReceived = function onMsgReceived(command, payload) {
    if(!this.messageHandlers[command]) {
        throw new Error('Worker does not know how to handle command "' + command + '"!');
    }

    return q.when(this.messageHandlers[command].onMsgReceived(payload));
};

Worker.prototype.registerMsgHandler = function registerMsgHandler(handler) {
    if(!handler.command) {
        throw new Error('Cannot register a handler if we don\t have a command!');
    }

    return this.messageHandlers[handler.command] = handler;
};

bootstrap.start()
    .then(function waitForWork() {
        var worker = new Worker();

        worker.registerMsgHandler(require('../../application/domain/network/player_network_service_message_handler'));
        worker.registerMsgHandler(require('../../application/domain/player/extract_player_message_handler'));
        worker.registerMsgHandler(require('../../application/domain/network/projections_service_message_handler'));

        return worker.start();
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();