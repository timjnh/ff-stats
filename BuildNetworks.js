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
    Team = require('./domain/Team');

var BRADY = 'T Brady',
    RODGERS = 'A Rodgers';

function buildNetworkForPlayer(player) {
    return trainingService.getTrainingSetsForPlayer(player)
        .then(function buildNetworkFromTrainingSets(trainingSets) {
            var network = new synaptic.Architect.Perceptron(trainingSets[0].input.length, trainingSets[0].input.length + 1, 1),
                trainer = new synaptic.Trainer(network);

            trainer.train(trainingSets, { rate: 0.01, iterations: 20000 });

            return player.setNetwork(network);
        });
}

bootstrap.start()
    .then(function findAllPlayers() {
        return playerRepository.findAll();
    })
    .then(function buildNetworks(players) {
        var playersWithNetworks = players.map(buildNetworkForPlayer);
        return q.all(playersWithNetworks);
    })
    .then(function tryNetwork(playersWithNetworks) {
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
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();