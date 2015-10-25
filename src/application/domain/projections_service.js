'use strict';

var q = require('q'),
    synaptic = require('synaptic'),
    playerNetworkRepository = require('../../port/player_network/player_network_repository'),
    inputsService = require('./inputs/inputs_service'),
    Projection = require('./projection');

function ProjectionsService() {}

ProjectionsService.prototype.buildProjectionsForAllGames = function buildProjectionsForAllGames(player) {
    var projectionPromises = player.getOrderedGames().map(function calculateProjectionsForGame(game) {
        return playerNetworkRepository.findByPlayerAndGameAndInputList(player, game, inputsService.getInputsList())
            .then(function activateNetwork(playerNetwork) {
                var projected;

                if(!playerNetwork) {
                    console.log('No network exists for ' + player.name + ' of the ' + player.team + ' in week ' + game.week + ', ' + game.year);
                } else {
                    var network = synaptic.Network.fromJSON(playerNetwork.network),
                        projection = network.activate(game.inputs.sortAndFlatten());
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