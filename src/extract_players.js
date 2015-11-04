'use strict';

var _ = require('underscore'),
    q = require('q'),
    synaptic = require('synaptic'),
    bootstrap = require('./bootstrap'),
    gameRepository = require('./port/game/game_repository'),
    fantasyPointService = require('./application/domain/fantasy_point_service'),
    gameEventService = require('./application/domain/game_event_service'),
    defensiveStatsService = require('./application/domain/defensive_stats_service'),
    PlayerStats = require('./application/domain/player_stats'),
    Player = require('./application/domain/player'),
    PlayerGame = require('./application/domain/player_game'),
    playerRepository = require('./port/player/player_repository'),
    trainingService = require('./application/domain/training_service'),
    Team = require('./application/domain/team');

var HOME = 'home',
    AWAY = 'away',
    BRADY = 'T Brady',
    RODGERS = 'A Rodgers';

function addGameToPlayer(playerName, teamName, game, playerStats) {
    var points = fantasyPointService.calculatePointsForPlayerStats(playerStats),
        opponent = game.getOpposingTeam(teamName);

    return playerRepository.findOneByNameAndTeam(playerName, teamName, true)
        .then(function addGameToPlayer(player) {
            return player.addGame(PlayerGame.create({
                eid: game.eid,
                week: game.week,
                year: game.year,
                opponent: opponent,
                points: parseFloat(points.toFixed(1)),
                stats: playerStats,
                inputs: {}
            }));
        })
        .then(function savePlayer(player) {
            return playerRepository.save(player);
        });
}

function findNameForTeamByClubCode(teams, clubcode) {
    for(var k in teams) {
        if(teams[k].abbr == clubcode) {
            return teams[k].name;
        }
    }

    throw 'Could not find team matching clubcode "' + clubcode + '"';
}

function extractStatsFromDrives(game, playerStats) {
    var teams = {};

    teams[HOME] = { name: game.home, abbr: game.stats.home.abbr };
    teams[AWAY] = { name: game.away, abbr: game.stats.away.abbr };

    _.values(teams).forEach(function addTeamToPlayerStats(team) {
        if(!playerStats.hasOwnProperty(team.name)) {
            playerStats[team.name] = {};
        }
    });

    _.values(game.stats.drives).forEach(function(drive) {
        _.values(drive.plays).forEach(function(play) {
            var event,
                teamName;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];
                    teamName = findNameForTeamByClubCode(teams, event.clubcode);

                    if(!playerStats[teamName].hasOwnProperty(event.playerName)) {
                        playerStats[teamName][event.playerName] = PlayerStats.create({});
                    }
                    playerStats[teamName][event.playerName].add(gameEventService.buildPlayerStatsFromEvent(event));
                }
            }
        });
    });
}

function extractDefensiveStatsFromHomeAndAway(game, playerStats, side) {
    var team = game[side],
        opposingSide = side === HOME ? AWAY : HOME;

    if(!playerStats.hasOwnProperty(team)) {
        playerStats[team] = {};
    }
    if(!playerStats[team].hasOwnProperty(team)) {
        playerStats[team][team] = PlayerStats.create({});
    }

    playerStats[team][team].add(defensiveStatsService.buildPlayerStatsForTeamFromHomeAndAway(game.stats[side].stats, game.stats[opposingSide].stats));
}

function extractPlayersFromGame(game) {
    var playerStats = {};

    extractStatsFromDrives(game, playerStats);

    extractDefensiveStatsFromHomeAndAway(game, playerStats, HOME);
    extractDefensiveStatsFromHomeAndAway(game, playerStats, AWAY);

    var playerPromises = [];
    for(var teamName in playerStats) {
        for(var playerName in playerStats[teamName]) {
            if(playerStats[teamName][playerName].isEmpty()) {
                continue;
            }

            playerPromises.push(addGameToPlayer(playerName, teamName, game, playerStats[teamName][playerName]));
        }
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