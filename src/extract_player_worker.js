'use strict';

var _ = require('underscore'),
    bootstrap = require('./bootstrap'),
    PlayerGame = require('./application/domain/player_game'),
    playerRepository = require('./port/player/player_repository'),
    playerPositionService = require('./application/domain/player_position_service'),
    playerTimelineService = require('./application/domain/player_timeline_service'),
    Worker = require('./lib/worker/worker');

function ExtractPlayerWorker() {
    Worker.call(this);
}
ExtractPlayerWorker.prototype = _.create(Worker.prototype, { constructor: ExtractPlayerWorker });

ExtractPlayerWorker.prototype.onMsgReceived = function onMsgReceived(payload) {
    var playerName = payload.playerName,
        teamName = payload.teamName,
        playerGame = PlayerGame.create(payload.playerGame);

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

bootstrap.start()
    .then(function waitForWork() {
        var extractPlayerWorker = new ExtractPlayerWorker();
        return extractPlayerWorker.start();
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();