'use strict';

var q = require('q'),
    synaptic = require('synaptic'),
    playerNetworkRepository = require('../../../port/player_network/player_network_repository'),
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
                return buildProjection(playerNetwork, player, inputs, game);
            });
    });

    return q.all(projectionPromises);
};

function buildProjection(playerNetwork, player, inputs, game) {
    var projected,
        actual;

    // if we don't have a network there's nothing we can do at this point
    if(playerNetwork) {
        var inputSet = game.inputs.getSubset(inputs),
            network = synaptic.Network.fromJSON(playerNetwork.network),
            projection = network.activate(inputSet.sortAndFlatten());

        projected = projection * 100;
    }

    if(game.hasBeenPlayed()) {
        actual = game.points;
    }

    return Projection.create({
        projected: projected,
        actual: actual,
        game: game,
        player: player
    });
}

ProjectionsService.prototype.buildProjectionsFromSingleNetwork = function buildProjectionsFromSingleNetwork(playerNetwork, player, inputs, startDate, endDate) {
    return player.getOrderedGamesInDateRange(startDate, endDate).map(function calculateProjectionsForGame(game) {
        return buildProjection(playerNetwork, player, inputs, game);
    });
};

module.exports = new ProjectionsService();