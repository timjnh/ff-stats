'use strict';

var q = require('q'),
    bootstrap = require('./bootstrap'),
    scheduleRepository = require('./port/schedule/schedule_repository'),
    gameRepository = require('./port/game/game_repository');

var argv = require('yargs')
    .usage('Usage: npm run fetch-games[-nm] -- [options]')
    .strict()
    .help('h')
    .alias('h', 'help')
    .describe('start-year', 'Year to start with')
    .default('start-year', 2009)
    .describe('end-year', 'Year to end with')
    .default('end-year', 2017)
    .argv;

var WEEKS_PER_SEASON = 17,
    END_WEEK = 1;

function findAndSaveGamesByYearAndWeekNumber(year, weekNumber) {
    var promise,
        findAndSaveGamePromises = [];

    console.log('Retrieving games for ' + year + ', week ' + weekNumber);

    promise = scheduleRepository.findGamesByYearAndWeekNumber(year, weekNumber)
        .then(function saveGames(games) {
            var currentPromise,
                conditionalSavePromises = [];

            games.forEach(function(game) {
                game.week = weekNumber;
                game.year = year;

                currentPromise = gameRepository.findOneByEid(game.eid)
                    .then(function saveGame(game) {
                        console.log('Game with eid "' + game.eid + '" already exists.  Skipping');
                    }.bind(game))
                    .catch(function(err) {
                        if(err.message.indexOf('Could not find a Game matching') == -1) {
                            return q.reject(err);
                        } else {
                            return gameRepository.save(game);
                        }
                    });

                conditionalSavePromises.push(currentPromise);
            });

            return q.all(conditionalSavePromises);
        });

    findAndSaveGamePromises.push(promise);

    return q.all(findAndSaveGamePromises);
}

bootstrap.start()
    .then(function retrieveGames() {
        var retrieveChain = q.when();

        for(var year = argv.startYear; year <= argv.endYear; ++year) {
            for (var weekNumber = 1; (year != argv.endYear || weekNumber < END_WEEK) && weekNumber <= WEEKS_PER_SEASON; weekNumber++) {
                console.log('Setting up retrieval for ' + year + ', week ' + weekNumber);

                retrieveChain = retrieveChain.then(findAndSaveGamesByYearAndWeekNumber.bind(this, year, weekNumber))
                    .then(function addDelay() {
                        return q.delay(5000);
                    });
            }
        }

        return retrieveChain;
    })
    .then(function afterAllSaved() {
        console.log('All saved!');
    })
    .finally(bootstrap.stop.bind(bootstrap))
    .done();