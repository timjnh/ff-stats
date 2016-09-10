'use strict';

var q = require('q'),
    os = require('os'),
    cluster = require('cluster'),
    logger = require('../logger');

var MAX_MESSAGES_PER_WORKER = 1000,
    workQueue = [],
    availableWorkers = [],
    workerDeferredId = 0,
    workerDeferreds = {},
    queueCheckInterval = null,
    messageHandlers = {};

function WorkerService() {}

WorkerService.prototype.start = function start() {
    logger.info('Starting worker service...');

    cluster.on('exit', function handleChildDeath(worker) {
        logger.warn('Worker ' + worker.id + ' has died...');
    });

    cluster.setupMaster({ exec: __dirname + '/worker.js' });

    return startWorkers.call(this)
        .then(function setupCheckQueueInterval() {
            queueCheckInterval = setInterval(checkQueue, 50);
        });
};

function startWorkers() {
    var i,
        numWorkersToStart = os.cpus().length,
        onlineWorkers = 0,
        deferred = q.defer();

    cluster.on('online', function() {
        onlineWorkers++;
        if(onlineWorkers == numWorkersToStart) {
            // TODO - this exists so we don't send jobs to the workers before they're listening
            // a better way would be to send our own message back once we're started
            setTimeout(function resolveDeferred() {
                deferred.resolve();
            }, 2000);
        }
    });

    for(i = 0; i < numWorkersToStart; i++) {
        startWorker();
    }

    return deferred.promise;
}

function startWorker() {
    var worker = cluster.fork();
    worker.messagesHandled = 0;

    worker.on('message', receivedMessage);
    availableWorkers.push(worker);
}

function restartWorker(workerId) {
    shutdownWorker(workerId);
    startWorker();
}

function shutdownWorker(workerId) {
    logger.debug('Stopping worker ' + workerId);
    cluster.workers[workerId].kill();
}

WorkerService.prototype.registerMsgHandler = function registerMsgHandler(handler) {
    if(!handler.command) {
        throw new Error('Cannot register a message handler without a command!');
    }

    messageHandlers[handler.command] = handler;
};

WorkerService.prototype.stop = function stop() {
    var deferred = q.defer();

    logger.info('Stopping worker service');

    if(queueCheckInterval) {
        clearInterval(queueCheckInterval);
        queueCheckInterval = null;
    }

    cluster.disconnect(function resolveStopPromise() {
        deferred.resolve();
    });
    return deferred.promise;
};

function checkQueue() {
    var worker;

    if(!workQueue.length || availableWorkers.length == 0) {
        return;
    }

    worker = availableWorkers.shift();
    var job = workQueue.shift();
    worker.send(job);

    logger.debug('Sent job to worker ' + worker.id + ' with deferredId ' +  job.deferredId + '...');
}

function receivedMessage(msg) {
    var deferred = workerDeferreds[msg.deferredId];

    cluster.workers[msg.workerId].messagesHandled += 1;

    if(cluster.workers[msg.workerId].messagesHandled >= MAX_MESSAGES_PER_WORKER) {
        restartWorker(msg.workerId);
    } else {
        availableWorkers.push(cluster.workers[msg.workerId]);
    }

    logger.debug('Job completed by worker ' + msg.workerId + '...');

    if(!messageHandlers[msg.command]) {
        throw new Error('WorkerService does not know how to handle message with command "' + msg.command + '"!');
    }

    deferred.resolve(messageHandlers[msg.command].onResponseReceived(msg.payload));
    delete workerDeferreds[msg.deferredId];
}

WorkerService.prototype.queueJob = function queueJob(command, payload) {
    var deferred = q.defer(),
        deferredId = workerDeferredId++;

    workerDeferreds[deferredId] = deferred;

    workQueue.push({
        deferredId: deferredId,
        command: command,
        payload: payload
    });

    return deferred.promise;
};

module.exports = new WorkerService();