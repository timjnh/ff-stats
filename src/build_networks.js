'use strict';

var _ = require('underscore'),
    q = require('q'),
    synaptic = require('synaptic'),
    bootstrap = require('./bootstrap'),
    gameRepository = require('./port/game/game_repository'),
    fantasyPointService = require('./application/domain/fantasy_point_service'),
    gameEventService = require('./application/domain/game_event_service'),
    PlayerStats = require('./application/domain/player_stats'),
    Player = require('./application/domain/player'),
    PlayerGame = require('./application/domain/player_game'),
    playerRepository = require('./port/player/player_repository'),
    trainingService = require('./application/domain/training_service'),
    inputsService = require('./application/domain/inputs/inputs_service'),
    Team = require('./application/domain/team'),
    PlayerNetwork = require('./application/domain/player_network'),
    playerNetworkRepository = require('./port/player_network/player_network_repository'),
    projectionsService = require('./application/domain/projections_service');

var BRADY = 'T Brady',
    RODGERS = 'A Rodgers';

function buildPlayerNetworkUpToGame(player, game) {
    console.log('Building network for player "' + player.name + '" for ' + game.year + ', week ' + game.week);
    return trainingService.getTrainingSetsForPlayerUpToGame(player, game)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network,
                trainer,
                startTime = new Date();

            if(!trainingSets.length) {
                console.log('Could not build any training sets for player "' + player.name + '" in ' + game.year + ', week ' + game.week);
                return null;
            }

            network = new synaptic.Architect.Perceptron(trainingSets[0].input.length, trainingSets[0].input.length + 1, 1),
            trainer = new synaptic.Trainer(network);

            trainer.train(trainingSets, { rate: 0.01, iterations: 20000 });

            console.log('Network built in ' + ((new Date).getTime() - startTime.getTime()) + ' ms');

            return network;
        });
}

function savePlayerNetwork(player, game, network) {
    var playerNetwork = PlayerNetwork.create({
        player: { name: player.name, team: player.team },
        game: { eid: game.eid },
        inputsList: inputsService.getInputsList(),
        network: network.toJSON()
    });

    return playerNetworkRepository.save(playerNetwork);
}

function findNetworkForPlayerAndGame(player, game) {
    return playerNetworkRepository.findByPlayerAndGameAndInputList(player, game, inputsService.getInputsList())
}

function buildAndSaveNetworkForPlayer(player) {
    var orderedGames = player.getOrderedGames(),
        buildNetworkPromiseChain = q.when();

    orderedGames.forEach(function(game) {
        buildNetworkPromiseChain = buildNetworkPromiseChain
            .then(findNetworkForPlayerAndGame.bind(this, player, game))
            .then(function buildNetworkForPlayerIfNetworkNotFound(existingPlayerNetwork) {
                if(existingPlayerNetwork) {
                    console.log('Network for "' + player.name + '" already exists for ' + game.year + ', week ' + game.week + '. Skipping...');
                } else {
                    return buildPlayerNetworkUpToGame(player, game)
                        .then(function verifyNetworkAndSave(network) {
                            if(network) {
                                return savePlayerNetwork(player, game, network);
                            }
                        });
                }
            });

    });

    return buildNetworkPromiseChain;
}

function buildAndSaveInputsForPlayer(player) {
    var inputsPromiseChain = q.when(player);
    player.games.forEach(function(playerGame) {
        inputsPromiseChain = inputsPromiseChain.then(function getInputsForPlayerAndGame(updatedPlayer) {
            if(updatedPlayer.hasInputsForGame(playerGame)) {
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
    .then(function findAllPlayers() {
        return playerRepository.findAll();
    })
    .then(function buildAndSavePlayerInputs(players) {
        var playerInputPromises = players.map(buildAndSaveInputsForPlayer.bind(this));
        return q.all(playerInputPromises);
    })
    .then(function buildAndSaveNetworks(players) {
        var playerNetworkPromiseChain = q.when();

        players.forEach(function(player) {
            playerNetworkPromiseChain = playerNetworkPromiseChain.then(buildAndSaveNetworkForPlayer.bind(this, player));
        });

        return playerNetworkPromiseChain;
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
    .finally(bootstrap.stop.bind(bootstrap))
    .done();