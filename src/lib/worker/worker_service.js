module.exports = (function() {
    'use strict';

    var q = require('q'),
        os = require('os'),
        cluster = require('cluster'),
        logger = require('../logger');

    var workQueue = [],
        availableWorkers = [],
        workerDeferredId = 0,
        workerDeferreds = {},
        queueCheckInterval = null;

    function WorkerService(workerPath) { this.workerPath = workerPath; }

    WorkerService.prototype.start = function start() {
        logger.info('Starting ' + this.constructor.name + ' worker service...');

        cluster.on('exit', function handleChildDeath(worker) {
            logger.warn('Worker ' + worker.id + ' has died...');
        });

        cluster.setupMaster({
            exec: this.workerPath
        });

        return startWorkers.call(this)
            .then(function setupCheckQueueInterval() {
                queueCheckInterval = setInterval(checkQueue, 50);
            });
    };

    function startWorkers() {
        var i,
            worker,
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
                }, 500);
            }
        });

        for(i = 0; i < numWorkersToStart; i++) {
            worker = cluster.fork();
            worker.on('message', receivedMessage.bind(this));
            availableWorkers.push(worker);
        }

        return deferred.promise;
    }

    WorkerService.prototype.stop = function stop() {
        var deferred = q.defer();

        logger.info('Stopping ' + this.constructor.name + ' worker service');

        if(queueCheckInterval) {
            clearInterval(queueCheckInterval);
            queueCheckInterval = null;
        }

        cluster.disconnect(function resolvePromise() {
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

        availableWorkers.push(cluster.workers[msg.workerId]);

        logger.debug('Job completed by worker ' + msg.workerId + '...');

        deferred.resolve(this.onMsgReceived(msg.payload));
        delete workerDeferreds[msg.deferredId];
    }

    WorkerService.prototype.onMsgReceived = function onMsgReceived(payload) {
        throw 'The WorkerService subclass "' + this.constructor.name + '" must implemented onMsgReceived';
    };

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

    return WorkerService;
})();