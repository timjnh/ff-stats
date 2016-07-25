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
    Team = require('./application/domain/team/team');

var argv = require('yargs')
    .usage('Usage: npm run extract-teams[-nm] -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .describe('t', 'Name of team that should be extracted')
    .alias('t', 'team')
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
                        players: [teamPlayer]
                    });

                teamGames.push(teamGame);
            });

            team = team.addOrUpdateGames(teamGames);

            return teamRepository.save(team);
        });
}

bootstrap.start()
    .then(function getAllPlayers() {
        var builder = PlayerQueryBuilder.create();

        if(argv.team) {
            builder.withTeam(argv.team);
        }

        logger.info('Finding players...');
        return playerRepository.findAllWithBuilder(builder);
    })
    .then(function addPlayersToTeams(players) {
        var teamChain = q.when();

        players.forEach(function(player) {
            teamChain = teamChain.then(addPlayerToTeam.bind(this, player));
        });

        return teamChain;
    })
    .then(function logCompletion() {
        logger.info('All done!');
    })
    .done();