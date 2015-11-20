'use strict';

var argv,
    _ = require('underscore'),
    q = require('q'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    Team = require('./application/domain/team'),
    injuryRepository = require('./port/injury/injury_repository'),
    playerRepository = require('./port/player/player_repository'),
    PlayerInjury = require('./application/domain/player/player_injury');

argv = require('yargs')
    .usage('Usage: npm run fetch-injury-stats-nm -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .array('t')
    .describe('t', 'Team or teams to extract injury stats for')
    .alias('t', 'team')
    .default('t', Team.TEAMS)
    .array('y')
    .describe('y', 'Year or years to extract injury stats for')
    .alias('y', 'year')
    .default('y', _.range(2009, 2016)) // range is exclusive so we're only up to 2015 here
    .describe('log-level', 'Log level to use')
    .choices('log-level', Object.keys(logger.levels))
    .default('log-level', 'info')
    .argv;

logger.level = argv.logLevel;

function addInjuriesToPlayer(name, team, injuries) {
    logger.debug('Finding "' + name + '" of the ' + team);
    return playerRepository.findOneByNameAndTeam(name, team)
        .then(function addInjuriesToPlayer(player) {
            logger.info('Adding ' + injuries.length + ' injuries to "' + name + '" of the ' + team);
            player = player.addInjuries(injuries.map(PlayerInjury.create.bind(PlayerInjury)));
            return playerRepository.save(player);
        })
        .catch(function ignorePlayerNotFound(e) {
            if(!e.indexOf || e.indexOf('not found') === -1) {
                return q.reject(e);
            } else {
                logger.debug('No player found for "' + name + '" of the ' + team);
            }
        })
}

function findAndAddInjuriesToPlayersForTeamAndYear(team, year) {
    logger.info('Finding injuries for team ' + team + ' and year ' + year);
    return injuryRepository.findByTeamAndYear(team, year)
        .then(function addToPlayers(injuries) {
            var injuryPromises = [];

            for(var k in injuries) {
                injuryPromises.push(addInjuriesToPlayer(k, team, injuries[k]));
            }

            return q.all(injuryPromises);
        });
}

bootstrap.start()
    .then(function fetchInjuries() {
        var injuryPromiseChain = q.when();

        argv.team.forEach(function(team) {
            argv.year.forEach(function(year) {
                injuryPromiseChain = injuryPromiseChain.then(function getInjuriesForTeamAndYear() {
                        return findAndAddInjuriesToPlayersForTeamAndYear(team, year);
                    })
                    .then(function pause() {
                        logger.info('Pausing...');
                        return q.delay(2000);
                    });
            });
        });

        return injuryPromiseChain;
    })
    .then(function allDone() {
        logger.info('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();