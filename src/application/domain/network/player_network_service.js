'use strict';

var synaptic = require('synaptic'),
    trainingService = require('./training_service'),
    NetworkStrategyFactory = require('./strategies/network_strategy_factory'),
    PlayerNetwork = require('./player_network'),
    logger = require('../../../lib/logger');

function PlayerNetworkService() {}

PlayerNetworkService.prototype.buildNetworkUpToGame = function buildNetworkUpToGame(player, game, inputs, strategy) {
    var startTime = new Date();
    logger.debug('Building network for player "' + player.name + '" for ' + game.year + ', week ' + game.week + ' with inputs ' + inputs.join(', '));
    return trainingService.getTrainingSetsForPlayerUpToGame(player, game, inputs)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network,
                networkStrategy = NetworkStrategyFactory.createStrategy(strategy);

            logger.debug('Training set with ' + trainingSets.length + ' items retrieved in ' + ((new Date()).getTime() - startTime.getTime()) + ' ms');
            startTime = new Date();

            if(!trainingSets.length) {
                logger.error('Could not build any training sets for player "' + player.name + '" in ' + game.year + ', week ' + game.week);
                return null;
            }

            network = networkStrategy.createAndTrainNetwork(trainingSets);

            logger.debug('Network built in ' + ((new Date()).getTime() - startTime.getTime()) + ' ms');

            return PlayerNetwork.create({
                player: { name: player.name, team: player.team },
                game: { eid: game.eid },
                strategy: strategy,
                inputsList: inputs,
                network: network.toJSON()
            });
        });
}

module.exports = new PlayerNetworkService();