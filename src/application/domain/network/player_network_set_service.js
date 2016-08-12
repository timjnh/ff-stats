module.exports = (function() {
    'use strict';

    var _ = require('underscore'),
        math = require('mathjs'),
        logger = require('../../../lib/logger'),
        projectionsService = require('./projections_service'),
        PlayerNetworkSet = require('./player_network_set'),
        PlayerNetworkSetRepository = require('../../../port/player_network_set/player_network_set_repository'),
        GameDate = require('../season/game_date');

    function NetworkSetService() {}

    NetworkSetService.prototype.findOrCreateSet = function findOrCreateSet(player, inputs, strategy, startYear, endYear) {
        var startDate = new GameDate({ week: GameDate.getMinWeek(), year: startYear }),
            endDate = new GameDate({ week: GameDate.getMaxWeek, year: endYear });

        logger.info('Building networks for "' + player.name + ' of the ' + player.team + ' with strategy ' + strategy + ' and inputs ' + inputs.join(', '));

        return projectionsService.buildProjectionsForDateRange(player, inputs, strategy, startDate, endDate)
            .then(function createNetworkSet(projections) {
                return PlayerNetworkSet.create({
                    player: { name: player.name, team: player.team },
                    inputsList: inputs,
                    strategy: strategy,
                    startYear: startYear,
                    endYear: endYear,
                    standardDeviation: calculateStandardDeviationFromProjections(projections)
                });
            })
            .then(function saveNetworkSet(networkSet) {
                return PlayerNetworkSetRepository.findMatching(networkSet)
                    .then(function updateIfExists(existingNetworkSet) {
                        if(existingNetworkSet) {
                            networkSet = networkSet.setId(existingNetworkSet._id);
                        }
                        return PlayerNetworkSetRepository.save(networkSet);
                    });
            });
    };

    function calculateStandardDeviationFromProjections(projections) {
        var errors = projections.map(function calculateError(projection) {
            return projection.actual - projection.projected;
        });

        // first value can be NaN if this was the player's first game.  if there are any after that, it's bad
        if(isNaN(errors[0])) {
            errors.shift();
        }
        if(_.filter(errors, isNaN).length > 0) {
            throw 'Unexpected NaN value when calculating standard deviation for projections!';
        }

        return math.std(errors);
    }

    return new NetworkSetService();
})();