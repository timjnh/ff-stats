'use strict';

var argv,
    _ = require('underscore'),
    q = require('q'),
    logger = require('./lib/logger'),
    bootstrap = require('./bootstrap'),
    Team = require('./application/domain/team'),
    injuryRepository = require('./port/injury/injury_repository'),
    playerRepository = require('./port/player/player_repository'),
    PlayerInjury = require('./application/domain/player_injury');

argv = require('yargs')
    .usage('Usage: npm run fetch-injury-stats-nm -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .describe('log-level', 'Log level to use')
    .choices('log-level', Object.keys(logger.levels))
    .default('log-level', 'info')
    .argv;

logger.level = argv.logLevel;

function addInjuriesToPlayer(name, team, injuries) {
    logger.debug('Finding "' + name + '" of the ' + team);
    return playerRepository.findOneByNameAndTeam(name, team)
        .then(function addInjuriesToPlayer(player) {
            logger.info('Adding ' + injuries.length + ' injuries to "' + name + ' of the ' + team);
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

bootstrap.start()
    .then(function fetchInjuries() {
        return injuryRepository.findByTeamAndYear(Team.BENGALS, 2010);
    })
    .then(function addToPlayers(injuries) {
        var injuryPromises = [];

        for(var k in injuries) {
            injuryPromises.push(addInjuriesToPlayer(k, Team.BENGALS, injuries[k]));
        }

        return q.all(injuryPromises);
    })
    .then(function allDone() {
        logger.info('All done!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();