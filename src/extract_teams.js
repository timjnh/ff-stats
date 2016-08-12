'use strict';

var argv,
    q = require('q'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    playerRepository = require('./port/player/player_repository'),
    PlayerQueryBuilder = require('./port/player/player_query_builder'),
    teamRepository = require('./port/team/team_repository'),
    TeamPlayer = require('./application/domain/team/team_player'),
    TeamGame = require('./application/domain/team/team_game'),
    Team = require('./application/domain/team/team'),
    depthChartService = require('./application/domain/team/depth_chart_service');

var argv = require('yargs')
    .usage('Usage: npm run extract-teams[-nm] -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .array('t')
    .describe('t', 'Name of team(s) that should be extracted')
    .alias('t', 'team')
    .describe('skip-rosters', 'If set, we don\'t bother to build rosters')
    .default('skip-rosters', false)
    .describe('log-level', 'Log level to use')
    .choices('log-level', Object.keys(logger.levels))
    .default('log-level', 'info')
    .argv;

logger.level = argv.logLevel;

function addPlayerToTeam(player) {
    logger.info('Adding "' + player.name + '" to "' + player.team + '"');

    return teamRepository.findOneByName(player.team)
        .then(function addPlayerGamesToTeam(team) {
            var teamGames = [];

            if(!team) {
                team = Team.create({
                    name: player.team,
                    games: []
                });
            }

            player.games.forEach(function addPlayerGameToTeam(playerGame) {
                var teamPlayer = TeamPlayer.create({
                        name: player.name,
                        position: player.position,
                        played: player.isActivePlayerInGame(playerGame.week, playerGame.year),
                        injured: !!player.injuries.findByWeekAndYear(playerGame.week, playerGame.year)
                    }),
                    teamGame = TeamGame.create({
                        eid: playerGame.eid,
                        week: playerGame.week,
                        year: playerGame.year,
                        date: playerGame.date,
                        players: [teamPlayer]
                    });

                teamGames.push(teamGame);
            });

            team = team.addOrUpdateGames(teamGames);

            return teamRepository.save(team);
        });
}

function buildRosters() {
    if(argv.skipRosters) {
        return;
    }

    logger.info('Building rosters...');

    var queryBuilder = PlayerQueryBuilder.create();

    if(argv.team) {
        queryBuilder.withTeam(argv.team);
    }

    return playerRepository.findAllWithBuilder(queryBuilder, { stream: true })
        .then(function addPlayersToTeams(playerStream) {
            var deferred = q.defer();

            playerStream.on('data', function(player) {
                playerStream.pause();

                addPlayerToTeam(player)
                    .then(function resumeStream() {
                        playerStream.resume();
                    })
                    .catch(function closeStreamAndFail(err) {
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
        .then(function logCompletion() {
            logger.info('Done building rosters');
        });
}

function calculateTeamDepthCharts() {
    var teamsPromise;

    logger.info('Calculating team depth charts...');

    if(argv.team) {
        teamsPromise = teamRepository.findAllByName(argv.team);
    } else {
        teamsPromise = teamRepository.findAll();
    }

    return teamsPromise
        .then(function calculateDepths(teams) {
            var chartPromiseChain = q.when();

            teams.forEach(function(team) {
                chartPromiseChain = chartPromiseChain.then(function calculateNextTeamChart() {
                    logger.info('Calculating depth charts for "' + team.name + '"');

                    return depthChartService.calculateChartsForTeam(team)
                        .then(function saveTeam(team) {
                            return teamRepository.save(team);
                        });
                });
            });

            return chartPromiseChain;
        })
        .then(function logCompletion() {
            logger.info('Done building depth charts');
        });
}

bootstrap.start()
    .then(buildRosters)
    .then(calculateTeamDepthCharts)
    .then(function logCompletion() {
        logger.info('All done!');
    })
    .done();