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
        var stats = {};
        stats[BRADY] = [
            0,
            17.7 / 100,
            19.38 / 100,
            27.62 / 100,
            Team.getId(Team.BILLS) / Team.TEAMS.length,
            30.1 / 100,
            32 / 100,
            14.8 / 100,
            32.4 / 100
        ];
        stats[RODGERS] = [
            1,
            27.88 / 100,
            24.92 / 100,
            23.06 / 100,
            Team.getId(Team.SEAHAWKS) / Team.TEAMS.length,
            9 / 100,
            1.9 / 100,
            28.9 / 100,
            36.6 / 100
        ];

        playersWithNetworks.forEach(function tryIt(player) {
            console.log(player.name + ': ' + (player.network.activate(stats[player.name]) * 100));
        });
    })
    .then(function() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();