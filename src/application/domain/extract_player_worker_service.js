// TODO - find a better place for this to live
module.exports = (function() {
    'use strict';

    var _ = require('underscore'),
        WorkerService = require('../../lib/worker/worker_service');

    function ExtractPlayerWorkerService() {
        WorkerService.call(this, __dirname + '/../../extract_player_worker.js');
    }
    ExtractPlayerWorkerService.prototype = _.create(WorkerService.prototype, { constructor: ExtractPlayerWorkerService });

    ExtractPlayerWorkerService.prototype.onMsgReceived = function onMsgReceived(payload) {
        return payload; // nothing to see here
    };

    ExtractPlayerWorkerService.prototype.addGameToPlayer = function addGameToPlayer(playerName, teamName, playerGame) {
        var payload = {
            playerName: playerName,
            teamName: teamName,
            playerGame: playerGame
        };
        return this.queueJob('addGameToPlayer', payload);
    };

    return new ExtractPlayerWorkerService();
})();