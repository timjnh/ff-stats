'use strict';

var workerService = require('../../../lib/worker/worker_service'),
    playerNetworkMessageHandler = require('./player_network_service_message_handler');

function PlayerNetworkWorkerService() {
    workerService.registerMsgHandler(playerNetworkMessageHandler);
}

PlayerNetworkWorkerService.prototype.buildNetworkUpToGame = function buildNetworkUpToGame(player, game, inputs, strategy) {
    var payload = {
        player: player,
        game: game,
        inputs: inputs,
        strategy: strategy
    };
    return workerService.queueJob(playerNetworkMessageHandler.command, payload);
};

module.exports = new PlayerNetworkWorkerService();