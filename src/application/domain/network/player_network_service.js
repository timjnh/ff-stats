'use strict';

var synaptic = require('synaptic'),
    trainingService = require('./training_service'),
    PlayerNetwork = require('./player_network');

function PlayerNetworkService() {}

PlayerNetworkService.prototype.buildNetworkUpToGame = function buildNetworkUpToGame(player, game, inputs) {
    console.log('Building network for player "' + player.name + '" for ' + game.year + ', week ' + game.week + ' with inputs ' + inputs.join(', '));
    return trainingService.getTrainingSetsForPlayerUpToGame(player, game, inputs)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network,
                trainer,
                startTime = new Date();

            if(!trainingSets.length) {
                console.log('Could not build any training sets for player "' + player.name + '" in ' + game.year + ', week ' + game.week);
                return null;
            }

            network = new synaptic.Architect.Perceptron(trainingSets[0].input.length, trainingSets[0].input.length + 1, 1);
            trainer = new synaptic.Trainer(network);

            trainer.train(trainingSets, { rate: 0.01, iterations: 20000 });

            console.log('Network built in ' + ((new Date).getTime() - startTime.getTime()) + ' ms');

            return PlayerNetwork.create({
                player: { name: player.name, team: player.team },
                game: { eid: game.eid },
                inputsList: inputs,
                network: network.toJSON()
            });
        });
}

module.exports = new PlayerNetworkService();