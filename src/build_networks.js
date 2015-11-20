'use strict';

var args,
    _ = require('underscore'),
    q = require('q'),
    bootstrap = require('./bootstrap'),
    playerRepository = require('./port/player/player_repository'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    playerInputsService = require('./application/domain/inputs/player_inputs_service'),
    projectionsService = require('./application/domain/network/projections_service'),
    networkStrategyFactory = require('./application/domain/network/strategies/network_strategy_factory'),
    PerceptronStrategy = require('./application/domain/network/strategies/perceptron_strategy'),
    playerNetworkWorkerService = require('./application/domain/network/player_network_worker_service');

args = require('yargs')
    .usage('Usage: npm run build-networks[-nm] -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .array('player')
    .describe('player', 'Name of player or players to calculate inputs and build network for')
    .describe('team', 'Name of team whose player inputs and networks should be calculated')
    .describe('strategy', 'Network strategy to use')
    .choices('strategy', networkStrategyFactory.getStrategyNames())
    .default('strategy', PerceptronStrategy.NAME)
    .boolean('inputs-only')
    .describe('inputs-only', 'If set, inputs will be calculated by not networks')
    .boolean('force-input-calc')
    .describe('force-input-calc', 'If set, inputs will be calculated regardless of whether they have already been calculated')
    .argv;

function buildAndSaveInputsForPlayer(player) {
    var inputsPromiseChain = q.when(player);
    player.games.forEach(function(playerGame) {
        inputsPromiseChain = inputsPromiseChain.then(function getInputsForPlayerAndGame(updatedPlayer) {
            var playerInputList = inputsService.getInputsListForPosition(updatedPlayer.position);

            if(playerGame.hasAllInputs(playerInputList) && !args.forceInputCalc) {
                console.log('Player "' + updatedPlayer.name + '" has required inputs for week ' + playerGame.week + ', ' + playerGame.year + '.  Skipping...');
                return updatedPlayer;
            } else {
                console.log('Building inputs for "' + updatedPlayer.name + '" for week ' + playerGame.week + ', ' + playerGame.year + '...');
                return playerInputsService.updateInputsForPlayerAndGame(updatedPlayer, playerGame);
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

function showProjectionsForPlayerOverTime(player) {
    console.log('Projections for "' + player.name + ' of the ' + player.team);
    return projectionsService.buildProjectionsForAllGames(player, inputsService.getInputsListForPosition(player.position), args.strategy)
        .then(function displayProjections(projections) {
            projections.forEach(function displayProjection(projection) {
                console.log('  Week ' + projection.game.week + ', ' + projection.game.year + ': ' + projection.projected + ' projected, ' + projection.actual + ' actual');
            });
        });
}

function getPlayers() {
    if(args.player) {
        return playerRepository.findAllByNames(args.player);
    } else if(args.team) {
        return playerRepository.findAllByTeam(args.team);
    } else {
        return playerRepository.findAll();
    }
}

bootstrap.start()
    .then(function startPlayerNetworkWorkerService() {
        return playerNetworkWorkerService.start();
    })
    .then(getPlayers)
    .then(function buildAndSavePlayerInputs(players) {
        var playerInputPromises = players.map(buildAndSaveInputsForPlayer.bind(this));
        return q.all(playerInputPromises);
    })
    .then(getPlayers)
    .then(function showProjectionsOverTime(players) {
        var projectionsChain = q.when();

        if(args.inputsOnly) {
            console.log('Skipping network calculations...');
            return;
        }

        players.forEach(function addProjectionDisplayToChain(player) {
            projectionsChain = projectionsChain.then(showProjectionsForPlayerOverTime.bind(this, player));
        });

        return projectionsChain;
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(function stopEverything() {
        return playerNetworkWorkerService.stop()
            .then(bootstrap.stop.bind(bootstrap));
    })
    .done();

