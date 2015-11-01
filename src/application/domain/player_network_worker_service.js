// TODO - find a better place for this to live
module.exports = (function() {
    'use strict';

    var q = require('q'),
        os = require('os'),
        cluster = require('cluster'),
        queueCheckInterval = null,
        workQueue = [],
        availableWorkers = [],
        workerDeferredId = 0,
        workerDeferreds = {},
        PlayerNetwork = require('./player_network');

    function PlayerNetworkWorkerService() {};

    PlayerNetworkWorkerService.prototype.start = function start() {
        var i,
            worker,
            deferred = q.defer();

        console.log('Starting player network worker service...');

        cluster.on('exit', function handleChildDeath(worker) {
            console.log('Worker ' + worker.id + ' has died...');
        });

        cluster.setupMaster({
            exec: __dirname + '/../../player_network_worker.js'
        });

        for(i = 0; i < os.cpus().length; i++) {
            worker = cluster.fork();
            worker.on('message', receivedMessage);
            availableWorkers.push(worker);
        }

        queueCheckInterval = setInterval(checkQueue, 50);

        deferred.resolve();
        return deferred.promise;
    };

    PlayerNetworkWorkerService.prototype.stop = function stop() {
        var deferred = q.defer();

        console.log('Stopping player network worker service');

        if(queueCheckInterval) {
            clearInterval(queueCheckInterval);
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

        console.log('Sent job to worker ' + worker.id + '... ' + job.payload.game.eid + ',' + job.deferredId);
    }

    function receivedMessage(msg) {
        var playerNetwork = msg.payload,
            deferred = workerDeferreds[msg.deferredId];

        availableWorkers.push(cluster.workers[msg.workerId]);

        console.log('Job completed by worker ' + msg.workerId + '...');

        if(playerNetwork) {
            playerNetwork = PlayerNetwork.create(playerNetwork);
        }

        deferred.resolve(playerNetwork);
        delete workerDeferreds[msg.deferredId];
    }

    PlayerNetworkWorkerService.prototype.buildNetworkUpToGame = function buildNetworkUpToGame(player, game, inputs) {
        var deferred = q.defer(),
            deferredId = workerDeferredId++;

        workerDeferreds[deferredId] = deferred;

        workQueue.push({
            deferredId: deferredId,
            command: 'buildNetworkUpToGame',
            payload: {
                player: player,
                game: game,
                inputs: inputs
            }
        });

        return deferred.promise;
    };

    return new PlayerNetworkWorkerService();
})();