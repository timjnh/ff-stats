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

function addGameToPlayer(playerName, game, playerStats) {
    var points = fantasyPointService.calculatePointsForPlayerStats(playerStats),
        playerTeam = playerName == BRADY ? Team.PATRIOTS : Team.PACKERS,
        opponent = game.getOpposingTeam(playerTeam);

    return playerRepository.findOneByNameAndTeam(playerName, playerTeam)
        .then(function addGameToPlayer(player) {
            return player.addGame(PlayerGame.create({
                eid: game.eid,
                week: game.week,
                year: game.year,
                opponent: opponent,
                points: parseFloat(points.toFixed(1)),
                stats: playerStats
            }));
        })
        .then(function savePlayer(player) {
            return playerRepository.save(player);
        });
}

function extractPlayersFromGame(game) {
    var playerStats = {};
    playerStats[BRADY] = PlayerStats.create({});
    playerStats[RODGERS] = PlayerStats.create({});

    _.values(game.stats.drives).forEach(function(drive) {
        _.values(drive.plays).forEach(function(play) {
            var event;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];

                    if(playerStats.hasOwnProperty(event.playerName)) {
                        playerStats[event.playerName].add(gameEventService.buildPlayerStatsFromEvent(event));
                    }
                }
            }
        });
    });

    var playerPromises = [];
    for(var k in playerStats) {
        // TODO - hack to work around the fact that I create stats for a player even if their team
        // didn't play in a particular game
        if(playerStats[k].isEmpty()) {
            continue;
        }

        playerPromises.push(addGameToPlayer(k, game, playerStats[k]));
    }
    return q.all(playerPromises);
}

bootstrap.start()
    .then(function findGames() {
        return q.all([gameRepository.findGamesWithTeam(Team.PATRIOTS), gameRepository.findGamesWithTeam(Team.PACKERS)])
            .then(function mergeGames(games) {
                return _.uniq(
                    _.flatten(games),
                    false,
                    function extractEid(game) { return game.eid; }
                );
            });
    })
    .then(function skipGamesWithoutStats(games) {
        return _.filter(games, function(game) { return game.hasOwnProperty('stats'); });
    })
    .then(function extractPlayers(games) {
        // this needs to be done sequentially so we're not fighting over player objects
        var extractPlayersChain = q.when();
        games.map(function buildExtractPlayersPromiseChain(game) {
            extractPlayersChain = extractPlayersChain.then(extractPlayersFromGame.bind(this, game));
        });
        return extractPlayersChain;
    })
    /*.then(function findAllPlayers() {
        return playerRepository.findAll();
    })
    .then(function debugPlayers(players) {
        players.forEach(function(player) {
            console.log('');console.log('');
            console.log(player.name);

            var orderedGames = player.getOrderedGames();
            for(var i in orderedGames) {
                console.log(orderedGames[i].year + ', week ' + orderedGames[i].week + ': ' + orderedGames[i].points);
            }
        });
        return players;
    })*/
    .then(function allDone() {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();