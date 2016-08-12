'use strict';

var q = require('q'),
    synaptic = require('synaptic'),
    playerNetworkRepository = require('../../../port/player_network/player_network_repository'),
    inputsService = require('../inputs/inputs_service'),
    InputSet = require('../inputs/input_set'),
    playerNetworkWorkerService = require('./player_network_worker_service'),
    Projection = require('./projection');

function ProjectionsService() {}

function createNetworkIfNotExists(player, game, inputs, strategy, playerNetwork) {
    if(playerNetwork) {
        return playerNetwork;
    } else {
        if(!game.hasAllInputs(inputs)) {
            console.log('No network exists for ' + player.name + ' of the ' + player.team + ' in week ' + game.week + ', ' + game.year + ' and inputs have not been generated to build the network from scratch');
            return playerNetwork;
        } else {
            return playerNetworkWorkerService.buildNetworkUpToGame(player, game, inputs, strategy)
                .then(function saveNetwork(generatedPlayerNetwork) {
                    // there will not be network if we couldn't generate training sets
                    if(generatedPlayerNetwork) {
                        return playerNetworkRepository.save(generatedPlayerNetwork)
                            .then(function() { return generatedPlayerNetwork; });
                    }
                });
        }
    }
}

ProjectionsService.prototype.buildProjectionsForDateRange = function buildProjectionsForDateRange(player, inputs, strategy, startDate, endDate) {
    var _this = this,
        projectionPromises;

    projectionPromises = player.getOrderedGamesInDateRange(startDate, endDate).map(function calculateProjectionsForGame(game) {
        return playerNetworkRepository.findByPlayerAndGameAndInputListAndStrategy(player, game, inputs, strategy)
            .then(createNetworkIfNotExists.bind(_this, player, game, inputs, strategy))
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