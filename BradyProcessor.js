'use strict';

var _ = require('underscore'),
    bootstrap = require('./Bootstrap'),
    gameRepository = require('./port/game/GameRepository'),
    fantasyPointService = require('./domain/FantasyPointService'),
    gameEventService = require('./domain/GameEventService'),
    PlayerStats = require('./domain/PlayerStats'),
    Player = require('./domain/Player');

var PATRIOTS = 'patriots';

function addPlayersToGame(game) {
    var player,
        playerStats = new PlayerStats(),
        points;

    _.values(game.stats.drives).forEach(function(drive) {
        _.values(drive.plays).forEach(function(play) {
            var event;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];

                    // for now we're only dealing with brady
                    if(event.playerName == 'T Brady') {
                        playerStats.add(gameEventService.buildPlayerStatsFromEvent(event));
                    }
                }
            }
        });
    });

    points = fantasyPointService.calculatePointsForPlayerStats(playerStats);

    player = Player.create({
        name: 'T Brady',
        points: parseFloat(points.toFixed(1)),
        stats: playerStats
    });

    return game.add({ players: [player] });
}

bootstrap.start()
    .then(function findPatriotsGames() {
        return gameRepository.findGamesWithTeam(PATRIOTS);
    })
    .then(function skipGamesWithoutStats(games) {
        return _.filter(games, function(game) { return game.hasOwnProperty('stats'); });
    })
    .then(function buildPlayers(games) {
        return games.map(addPlayersToGame);
    })
    .then(function(games) {
        console.log('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();