'use strict';

var q = require('q'),
    cluster = require('cluster'),
    bootstrap = require('./bootstrap'),
    Player = require('./application/domain/player'),
    PlayerGame = require('./application/domain/player_game'),
    playerNetworkService = require('./application/domain/player_network_service');

bootstrap.start()
    .then(function waitForWork() {
        var deferred = q.defer();

        console.log('Started player network worker ' + cluster.worker.id + '...');

        process.on('message', function(msg) {
            var player,
                game,
                inputs;

            console.log('Worker ' + cluster.worker.id + ' received a buildNetworkUpToGame event');

            player = Player.create(msg.payload.player);
            game = PlayerGame.create(msg.payload.game);
            inputs = msg.payload.inputs;

            playerNetworkService.buildNetworkUpToGame(player, game, inputs)
                .then(function respondToMaster(playerNetwork) {
                    process.send({
                        deferredId: msg.deferredId,
                        workerId: cluster.worker.id,
                        payload: playerNetwork
                    });
                })
                .done();
        });

        cluster.on('disconnect', function resolveDeferred() {
            deferred.resolve();
        });

        return deferred.promise;
    })
    .then(function inform() {
        console.log('Stopping player network worker #' + cluster.worker.id + '...');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();