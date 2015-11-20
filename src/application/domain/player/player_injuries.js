'use strict';

module.exports = (function() {
    var _ = require('underscore');

    function findByWeekAndYear(week, year) {
        return _.findWhere(this, { week: week, year: year });
    }

    return {
        findByWeekAndYear: findByWeekAndYear
    }
})();