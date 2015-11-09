// TODO - find a better place for this to live
module.exports = (function() {
    'use strict';

    var _ = require('underscore'),
        WorkerService = require('../..//lib/worker/worker_service'),
        PlayerNetwork = require('./player_network');

    function PlayerNetworkWorkerService() {
        WorkerService.call(this, __dirname + '/../../player_network_worker.js');
    }
    PlayerNetworkWorkerService.prototype = _.create(WorkerService.prototype, { constructor: PlayerNetworkWorkerService });

    PlayerNetworkWorkerService.prototype.onMsgReceived = function onMsgReceived(payload) {
        var playerNetwork = payload;
        if(playerNetwork) {
            playerNetwork = PlayerNetwork.create(playerNetwork);
        }
        return playerNetwork;
    };

    PlayerNetworkWorkerService.prototype.buildNetworkUpToGame = function buildNetworkUpToGame(player, game, inputs) {
        var payload = {
            player: player,
            game: game,
            inputs: inputs
        };
        return this.queueJob('buildNetworkUpToGame', payload);
    };

    return new PlayerNetworkWorkerService();
})();