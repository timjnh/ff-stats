'use strict';

var _ = require('underscore'),
    q = require('q'),
    synaptic = require('synaptic'),
    bootstrap = require('./Bootstrap'),
    gameRepository = require('./port/game/GameRepository'),
    fantasyPointService = require('./domain/FantasyPointService'),
    gameEventService = require('./domain/GameEventService'),
    PlayerStats = require('./domain/PlayerStats'),
    Player = require('./domain/Player'),
    PlayerGame = require('./domain/PlayerGame'),
    playerRepository = require('./port/player/PlayerRepository'),
    trainingService = require('./domain/TrainingService'),
    inputsService = require('./domain/inputs/InputsService'),
    Team = require('./domain/Team'),
    PlayerNetwork = require('./domain/PlayerNetwork'),
    playerNetworkRepository = require('./port/player_network/PlayerNetworkRepository');

var BRADY = 'T Brady',
    RODGERS = 'A Rodgers';

function buildPlayerNetworkUpToGame(player, game) {
    var startTime = new Date();

    console.log('Building network for player "' + player.name + '" for ' + game.year + ', week ' + game.week);
    return trainingService.getTrainingSetsForPlayerUpToGame(player, game)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network,
                trainer;

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

bootstrap.start()
    .then(function findAllPlayers() {
        return playerRepository.findAll();
    })
    .then(function buildAndSaveNetworks(players) {
        var playerNetworkPromiseChain = q.when();

        players.forEach(function(player) {
            playerNetworkPromiseChain = playerNetworkPromiseChain.then(buildAndSaveNetworkForPlayer.bind(this, player));
        });

        return playerNetworkPromiseChain;
    })
    /*.then(function tryNetwork(playersWithNetworks) {
        var tryNetworkPromises = [];

        playersWithNetworks.forEach(function tryIt(player) {
            var promise = gameRepository.findNextGameForTeam(player.team)
                .then(function buildInputs(nextGame) {
                    var nextPlayerGame = PlayerGame.create({
                        eid: nextGame.eid,
                        week: nextGame.week,
                        year: nextGame.year,
                        opponent: nextGame.getOpposingTeam(player.team),
                        points: 0,
                        stats: {}
                    });

                    return inputsService.getInputsForPlayerAndGame(player, nextPlayerGame);
                })
                .then(function executeNetwork(inputs) {
                    console.log(inputs);
                    console.log(player.name + ': ' + (player.network.activate(inputsService.flatten(inputs)) * 100));
                });

            tryNetworkPromises.push(promise);
        });

        return q.all(tryNetworkPromises);
    })*/
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();