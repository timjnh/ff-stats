'use strict';

var GameDate = require('./game_date');

module.exports = {
    getCurrentSeason: function getCurrentSeason() {
        var currentYear = new Date().getFullYear(),
            currentMonth = new Date().getMonth();

        // if we're before september (months are zero-indexed) then we return
        // the previous year because the current season hasn't started yet
        if(currentMonth < 7) {
            return currentYear - 1;
        } else {
            return currentYear;
        }
    },

    getFirstSeason: function getFirstSeason() { return GameDate.getMinYear(); }
};