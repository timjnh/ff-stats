'use strict';

var argv,
    _ = require('underscore'),
    q = require('q'),
    synaptic = require('synaptic'),
    bootstrap = require('./bootstrap'),
    gameRepository = require('./port/game/game_repository'),
    GameQueryBuilder = require('./port/game/game_query_builder'),
    fantasyPointService = require('./application/domain/fantasy_point_service'),
    gameEventService = require('./application/domain/game/game_event_service'),
    defensiveStatsService = require('./application/domain/defensive_stats_service'),
    PlayerStats = require('./application/domain/player/player_stats'),
    Player = require('./application/domain/player/player'),
    PlayerGame = require('./application/domain/player/player_game'),
    extractPlayerWorkerService = require('./application/domain/player/extract_player_worker_service'),
    logger = require('./lib/logger');

var HOME = 'home',
    AWAY = 'away',
    HOMESCORE = 'homeScore',
    AWAYSCORE = 'awayScore';

argv = require('yargs')
    .usage('Usage: npm run extract-players[-nm] -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .describe('t', 'Name of team that should be extracted')
    .alias('t', 'team')
    .describe('g', 'EID of the game to extract players from')
    .alias('g', 'game')
    .array('y')
    .describe('y', 'Year or list of years to extract players from')
    .alias('y', 'year')
    .array('p')
    .describe('p', 'Player or list of players to extract.  Note that this does not restrict the number of games that need to be evaluated.')
    .alias('p', 'player')
    .describe('log-level', 'Log level to use')
    .choices('log-level', Object.keys(logger.levels))
    .default('log-level', 'info')
    .argv;

logger.level = argv.logLevel;

function addGameToPlayer(playerName, teamName, game, playerStats) {
    var points = fantasyPointService.calculatePointsForPlayerStats(playerStats),
        opponent = game.getOpposingTeam(teamName),
        playerGame = PlayerGame.create({
            eid: game.eid,
            week: game.week,
            year: game.year,
            opponent: opponent,
            points: parseFloat(points.toFixed(1)),
            stats: playerStats,
            inputs: {}
        });

    return extractPlayerWorkerService.addGameToPlayer(playerName, teamName, playerGame);
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

    _.values(game.stats.drives).forEach(function(drive, driveIndex) {
        _.values(drive.plays).forEach(function(play, playIndex) {
            var event,
                teamName;

            for(var j in play.players) {
                for(var k in play.players[j]) {
                    event = play.players[j][k];
                    teamName = findNameForTeamByClubCode(teams, event.clubcode);

                    // some events have blank playerNames. skip em
                    if(event.playerName == '') {
                        logger.warn('Skipping event with blank player name for game with eid "' + game.eid + '", driveIndex ' + driveIndex + ' and playIndex ' + playIndex);
                        continue;
                    }

                    if(argv.team && argv.team.indexOf(teamName) == -1) {
                        logger.debug('Skipping event for team "' + teamName + '"');
                        continue;
                    }

                    if(argv.player && argv.player.indexOf(event.playerName) == -1) {
                        logger.debug('Skipping event for player "' + event.playerName + '"');
                        continue;
                    }

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
        opposingSide = side === HOME ? AWAY : HOME,
        opposingScore = side === HOME ? AWAYSCORE : HOMESCORE;

    if(!playerStats.hasOwnProperty(team)) {
        playerStats[team] = {};
    }
    if(!playerStats[team].hasOwnProperty(team)) {
        playerStats[team][team] = PlayerStats.create({});
    }

    playerStats[team][team].add(defensiveStatsService.buildPlayerStatsForTeamFromHomeAndAway(game.stats[side].stats, game.stats[opposingSide].stats));
    playerStats[team][team].add(defensiveStatsService.buildPlayerStatsFromOpponentScore(game[opposingScore]));
}

function extractPlayersFromGame(game) {
    var startTime = new Date(),
        playerStats = {};

    logger.info('Extracting players from game between ' + game.home + ' and ' + game.away + ' for week ' + game.week + ', ' + game.year);

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

    logger.verbose('Saving stats data for ' + playerPromises.length + ' players...');
    return q.all(playerPromises)
        .then(function() {
            logger.info('Done extracting players in ' + ((new Date()).getTime() - startTime.getTime()) + ' ms...');
        });
}

function getGamesAsStream() {
    var queryBuilder = GameQueryBuilder.create();

    if(argv.team) {
        queryBuilder.withTeam(argv.team);
    }

    if(argv.game) {
        queryBuilder.withEid(argv.game);
    }

    if(argv.year) {
        queryBuilder.withYears(argv.year);
    }

    return gameRepository.findAllWithBuilder(queryBuilder, { stream: true });
}

bootstrap.start()
    .then(function startExtractPlayerWorkerService() {
        return extractPlayerWorkerService.start();
    })
    .then(getGamesAsStream)
    .then(function extractPlayers(gameStream) {
        var deferred = q.defer();

        gameStream.on('data', function(game) {
            // skip games without any stats since they won't have any players
            if(!game.hasOwnProperty('stats')) {
                return;
            }

            // pause the stream until we are done processing this game
            gameStream.pause();

            extractPlayersFromGame(game)
                .then(function resumeStream() {
                    // all done processing the game so we can resume the stream again
                    gameStream.resume();
                })
                .catch(function closeStreamAnFail(err) {
                    deferred.reject(err);
                })
                .done();
        }).on('error', function(err) {
            deferred.reject(err);
        }).on('close', function() {
            deferred.resolve();
        });

        return deferred.promise;
    })
    .then(function allDone() {
        console.info('All done!');
    })
    .catch(function(err) {
        console.error(err);
    })
    .finally(function stopEverything() {
        return extractPlayerWorkerService.stop()
            .then(bootstrap.stop.bind(bootstrap));
    })
    .done();