'use strict';

var q = require('q'),
    bootstrap = require('./Bootstrap'),
    scheduleRepository = require('./port/schedule/ScheduleRepository'),
    gameRepository = require('./port/game/GameRepository');

var START_YEAR = 2014,
    GAMES_PER_SEASON = 16,
    END_YEAR = 2016,
    END_WEEK = 1;

var currentYear = (new Date()).getFullYear();

function findAndSaveGamesByYearAndWeekNumber(year, weekNumber) {
    var promise,
        findAndSaveGamePromises = [];

    console.log('Retrieving games for ' + year + ', week ' + weekNumber);

    promise = scheduleRepository.findGamesByYearAndWeekNumber(year, weekNumber)
        .then(function saveGames(games) {
            var saveGamePromises = [];

            games.forEach(function(game) {
                game.week = weekNumber;
                game.year = year;
                saveGamePromises.push(gameRepository.save(game));
            });

            return q.all(saveGamePromises);
        });

    findAndSaveGamePromises.push(promise);

    return q.all(findAndSaveGamePromises);
}

bootstrap.start()
    .then(function retrieveGames() {
        var retrieveChain = q.when();

        for(var year = START_YEAR; year <= END_YEAR; ++year) {
            for (var weekNumber = 1; (year != END_YEAR || weekNumber < END_WEEK) && weekNumber < GAMES_PER_SEASON; weekNumber++) {
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