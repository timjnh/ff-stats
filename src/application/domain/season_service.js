'use strict';

module.exports = {
    getCurrentSeason: function getCurrentSeason() {
        var currentYear = new Date().getFullYear(),
            currentMonth = new Date().getMonth();

        // if we're before september (months are zero-indexed) then we return
        // the previous year because the current season hasn't started yet
        if(currentMonth < 8) {
            return currentYear - 1;
        } else {
            return currentYear;
        }
    }
};