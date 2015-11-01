'use strict';

var _ = require('underscore'),
    q = require('q'),
    bootstrap = require('./bootstrap'),
    playerRepository = require('./port/player/player_repository'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    projectionsService = require('./application/domain/projections_service'),
    playerNetworkWorkerService = require('./application/domain/player_network_worker_service');

var BRADY = 'T Brady',
    RODGERS = 'A Rodgers';

function buildAndSaveInputsForPlayer(player) {
    var inputsPromiseChain = q.when(player);
    player.games.forEach(function(playerGame) {
        inputsPromiseChain = inputsPromiseChain.then(function getInputsForPlayerAndGame(updatedPlayer) {
            if(updatedPlayer.hasInputsForGame(playerGame) && process.env.FORCE_INPUT_CALC !== 'true') {
                console.log('Player "' + updatedPlayer.name + '" has required inputs for week ' + playerGame.week + ', ' + playerGame.year + '.  Skipping...');
                return updatedPlayer;
            } else {
                console.log('Building inputs for "' + updatedPlayer.name + '" for week ' + playerGame.week + ', ' + playerGame.year + '...');
                return updatedPlayer.buildInputsForGame(playerGame);
            }
        });
    });

    return inputsPromiseChain
        .then(function saveAndReturnUpdatedPlayer(updatedPlayer) {
            return playerRepository.save(updatedPlayer)
                .then(function returnUpdatedPlayer() {
                    return updatedPlayer;
                });
        });
}
bootstrap.start()
    .then(function startPlayerNetworkWorkerService() {
        return playerNetworkWorkerService.start();
    })
    .then(function findAllPlayers() {
        return playerRepository.findAll();
     })
     .then(function buildAndSavePlayerInputs(players) {
        var playerInputPromises = players.map(buildAndSaveInputsForPlayer.bind(this));
        return q.all(playerInputPromises);
     })
    .then(function findTomBrady() {
        return playerRepository.findOneByNameAndTeam(BRADY, 'patriots');
    })
    .then(function showProjectionsOverTime(brady) {
        return projectionsService.buildProjectionsForAllGames(brady, inputsService.getInputsList())
            .then(function displayProjections(projections) {
                projections.forEach(function displayProjection(projection) {
                    console.log('Week ' + projection.game.week + ', ' + projection.game.year + ': ' + projection.projected + ' projected, ' + projection.actual + ' actual');
                });
            });
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(function stopEverything() {
        return playerNetworkWorkerService.stop()
            .then(bootstrap.stop.bind(bootstrap));
    })
    .done();

