module.exports = (function() {
    'use strict';

    var q = require('q'),
        os = require('os'),
        cluster = require('cluster');

    var workQueue = [],
        availableWorkers = [],
        workerDeferredId = 0,
        workerDeferreds = {},
        queueCheckInterval = null;

    function WorkerService(workerPath) { this.workerPath = workerPath; }

    WorkerService.prototype.start = function start() {
        console.log('Starting ' + this.constructor.name + ' worker service...');

        cluster.on('exit', function handleChildDeath(worker) {
            console.log('Worker ' + worker.id + ' has died...');
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
                setTimeout(function resolveDeferred() {
                    deferred.resolve();
                }, 100);
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

        console.log('Stopping ' + this.constructor.name + ' worker service');

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

        console.log('Sent job to worker ' + worker.id + ' with deferredId ' +  job.deferredId + '...');
    }

    function receivedMessage(msg) {
        var deferred = workerDeferreds[msg.deferredId];

        availableWorkers.push(cluster.workers[msg.workerId]);

        console.log('Job completed by worker ' + msg.workerId + '...');

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