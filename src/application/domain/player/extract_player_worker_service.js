 'use strict';

var _ = require('underscore'),
    workerService = require('../../../lib/worker/worker_service'),
    extractPlayerMessageHandler = require('./extract_player_message_handler');

function ExtractPlayerWorkerService() {
    workerService.registerMsgHandler(extractPlayerMessageHandler);
}

ExtractPlayerWorkerService.prototype.addGameToPlayer = function addGameToPlayer(playerName, teamName, playerGame) {
    var payload = {
        playerName: playerName,
        teamName: teamName,
        playerGame: playerGame
    };
    return workerService.queueJob(extractPlayerMessageHandler.command, payload);
};

module.exports = new ExtractPlayerWorkerService();