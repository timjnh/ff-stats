'use strict';

var _ = require('underscore'),
    MessageHandler = require('../../../lib/worker/message_handler'),
    PlayerGame = require('./player_game'),
    playerRepository = require('../../../port/player/player_repository'),
    playerTimelineService = require('./player_timeline_service'),
    playerPositionService = require('./player_position_service');

function ExtractPlayerMessageHandler() {
    MessageHandler.call(this, 'ExtractPlayerService.addGameToPlayer');
}
ExtractPlayerMessageHandler.prototype = _.create(MessageHandler.prototype, { constructor: ExtractPlayerMessageHandler });

ExtractPlayerMessageHandler.prototype.onMsgReceived = function onMsgReceived(payload) {
    var playerName = payload.playerName,
        teamName = payload.teamName,
        playerGame = PlayerGame.create(payload.playerGame);

    console.log('hi');

    return playerRepository.findOneByNameAndTeam(playerName, teamName, true)
        .then(function addGameToPlayer(player) {
            return player.addGame(playerGame);
        })
        .then(function fillGameGaps(player) {
            return playerTimelineService.addMissingGamesToPlayer(player);
        })
        .then(function guessPlayerPosition(player) {
            var position = playerPositionService.calculatePlayerPosition(player);
            return player.setPosition(position);
        })
        .then(function savePlayer(player) {
            return playerRepository.save(player);
        });
};

ExtractPlayerMessageHandler.prototype.onResponseReceived = function onResponseReceived(payload) {
    return payload; // nothing to see here
};

module.exports = new ExtractPlayerMessageHandler();