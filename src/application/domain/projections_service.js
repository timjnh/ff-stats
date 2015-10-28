'use strict';

var q = require('q'),
    synaptic = require('synaptic'),
    playerNetworkRepository = require('../../port/player_network/player_network_repository'),
    inputsService = require('./inputs/inputs_service'),
    InputSet = require('./input_set'),
    playerNetworkService = require('./player_network_service'),
    Projection = require('./projection');

function ProjectionsService() {}

function createNetworkIfNotExists(player, game, inputs, playerNetwork) {
    if(playerNetwork) {
        return playerNetwork;
    } else {
        if(!game.hasAllInputs(inputs)) {
            console.log('No network exists for ' + player.name + ' of the ' + player.team + ' in week ' + game.week + ', ' + game.year + ' and inputs have not been generated to build the network from scratch');
            return playerNetwork;
        } else {
            return playerNetworkService.buildNetworkUpToGame(player, game, inputs)
                .then(function saveNetwork(generatedPlayerNetwork) {
                    // there no be no network if we couldn't generate training sets
                    if(generatedPlayerNetwork) {
                        return playerNetworkRepository.save(generatedPlayerNetwork)
                            .then(function() { return generatedPlayerNetwork; });
                    }
                });
        }
    }
}

ProjectionsService.prototype.buildProjectionsForAllGames = function buildProjectionsForAllGames(player, inputs) {
    var _this = this,
        projectionPromises;

    projectionPromises = player.getOrderedGames().map(function calculateProjectionsForGame(game) {
        return playerNetworkRepository.findByPlayerAndGameAndInputList(player, game, inputs)
            .then(createNetworkIfNotExists.bind(_this, player, game, inputs))
            .then(function activateNetwork(playerNetwork) {
                var projected;

                // if we don't have a network there's nothing we can do at this point
                if(playerNetwork) {
                    var inputSet = game.inputs.getSubset(inputs),
                        network = synaptic.Network.fromJSON(playerNetwork.network),
                        projection = network.activate(inputSet.sortAndFlatten());

                    projected = projection * 100;
                }

                return Projection.create({
                    projected: projected,
                    actual: game.points,
                    game: game,
                    player: player
                });
            });
    });

    return q.all(projectionPromises);
};

module.exports = new ProjectionsService();