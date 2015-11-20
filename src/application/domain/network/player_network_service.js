'use strict';

var synaptic = require('synaptic'),
    trainingService = require('./training_service'),
    NetworkStrategyFactory = require('./strategies/network_strategy_factory'),
    PlayerNetwork = require('./player_network');

function PlayerNetworkService() {}

PlayerNetworkService.prototype.buildNetworkUpToGame = function buildNetworkUpToGame(player, game, inputs, strategy) {
    console.log('Building network for player "' + player.name + '" for ' + game.year + ', week ' + game.week + ' with inputs ' + inputs.join(', '));
    return trainingService.getTrainingSetsForPlayerUpToGame(player, game, inputs)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network,
                networkStrategy = NetworkStrategyFactory.createStrategy(strategy),
                startTime = new Date();

            if(!trainingSets.length) {
                console.log('Could not build any training sets for player "' + player.name + '" in ' + game.year + ', week ' + game.week);
                return null;
            }

            network = networkStrategy.createAndTrainNetwork(trainingSets);

            console.log('Network built in ' + ((new Date).getTime() - startTime.getTime()) + ' ms');

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