'use strict';

var args,
    _ = require('underscore'),
    q = require('q'),
    combinatorics = require('js-combinatorics'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    playerRepository = require('./port/player/player_repository'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    playerNetworkSetService = require('./application/domain/network/player_network_set_service'),
    projectionsService = require('./application/domain/network/projections_service'),
    networkStrategyFactory = require('./application/domain/network/strategies/network_strategy_factory'),
    playerNetworkWorkerService = require('./application/domain/network/player_network_worker_service');

args = require('yargs')
    .usage('Usage: npm run build-network-combos[-nm] -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .array('player')
    .describe('player', 'Name of player or players to build networks for')
    .array('team')
    .describe('team', 'Name of team or teams whose players to build networks for')
    .array('strategy')
    .describe('strategy', 'Strategy or list of strategies to use when building networks')
    .choices('strategy', networkStrategyFactory.getStrategyNames())
    .default('strategy', networkStrategyFactory.getStrategyNames())
    .describe('start-year', 'Year to start calculations on.  Affects network calculations, not input calculations')
    .default('start-year', 2009)
    .describe('end-year', 'Year to end calculations on.  Affectds network calculations, not input calculations')
    .default('end-year', (new Date().getYear()) + 1900)
    .describe('group-size', 'Number of items to include in each group of inputs')
    .default('group-size', 5)
    .describe('log-level', 'Log level to use')
    .choices('log-level', Object.keys(logger.levels))
    .default('log-level', 'info')
    .argv;

logger.level = args.logLevel;

function buildNetworksForPlayer(player) {
    var networkSetChain = q.when(),
        playerInputs = inputsService.getInputsListForPosition(player.position),
        inputCombos = combinatorics.combination(playerInputs, args.groupSize);

    inputCombos.forEach(function buildNetworksForInputs(inputs) {
        args.strategy.forEach(function buildNetworksForStrategy(strategy) {
            networkSetChain = networkSetChain.then(function buildNetworksForInputAndPlayer() {
                return playerNetworkSetService.findOrCreateSet(player, inputs, strategy, args.startYear, args.endYear);
            });
        });
    });

    return networkSetChain;
}

function getPlayers() {
    if(args.player) {
        return playerRepository.findAllByNames(args.player);
    } else if(args.team) {
        return playerRepository.findAllByTeams(args.team);
    } else {
        return playerRepository.findAll();
    }
}

bootstrap.start()
    .then(function startPlayerNetworkWorkerService() {
        return playerNetworkWorkerService.start();
    })
    .then(getPlayers)
    .then(function showProjectionsOverTime(players) {
        var projectionsChain = q.when();

        players.forEach(function buildNetworks(player) {
            projectionsChain = projectionsChain.then(buildNetworksForPlayer.bind(this, player));
        });

        return projectionsChain;
    })
    .then(function() {
        logger.info('All done!');
    })
    .finally(function stopEverything() {
        return playerNetworkWorkerService.stop()
            .then(bootstrap.stop.bind(bootstrap));
    })
    .done();

