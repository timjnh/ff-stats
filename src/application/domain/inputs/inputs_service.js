'use strict';

var _ = require('underscore'),
    q = require('q'),
    HomeVsAway = require('./home_vs_away'),
    PointsInRecentGames = require('./points_in_recent_games'),
    Opponent = require('./opponent'),
    AveragePointsAgainstOpponent = require('./average_points_against_opponent'),
    RecentPointsAgainstOpponent = require('./recent_points_against_opponent'),
    DaysOff = require('./days_off'),
    RecentPassingYards = require('./recent_passing_yards'),
    RecentPassingTouchdowns = require('./recent_passing_touchdowns'),
    RecentRushingYards = require('./recent_rushing_yards'),
    RecentRushingTouchdowns = require('./recent_rushing_touchdowns'),
    RecentPassingYardsAllowedByOpponent = require('./recent_passing_yards_allowed_by_opponent'),
    RecentRushingYardsAllowedByOpponent = require('./recent_rushing_yards_allowed_by_opponent'),
    RecentPassingTouchdownsAllowedByOpponent = require('./recent_passing_touchdowns_allowed_by_opponent'),
    RecentRushingTouchdownsAllowedByOpponent = require('./recent_rushing_touchdowns_allowed_by_opponent'),
    RecentSacksByOpponent = require('./recent_sacks_by_opponent'),
    RecentInterceptionsByOpponent = require('./recent_interceptions_by_opponent'),
    Input = require('./input'),
    InputSet = require('../input_set');

function InputsService() {
    this.inputTypes = [
        new HomeVsAway(),
        new PointsInRecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff(),
        new RecentPassingYards(3),
        new RecentPassingTouchdowns(3),
        new RecentRushingYards(3),
        new RecentRushingTouchdowns(3),
        new RecentPassingYardsAllowedByOpponent(3),
        new RecentRushingYardsAllowedByOpponent(3),
        new RecentPassingTouchdownsAllowedByOpponent(3),
        new RecentRushingTouchdownsAllowedByOpponent(3),
        new RecentSacksByOpponent(3),
        new RecentInterceptionsByOpponent(3)
    ];
}

InputsService.prototype.getInputsForPlayerAndGame = function getInputsForPlayerAndGame(player, game) {
    var _this = this,
        inputPromises = this.inputTypes.map(function getInputForPlayerAndGame(input) {
            return q.when(input.evaluate(player, game));
        });

    return q.all(inputPromises)
        .then(function mapInputs(inputs) {
            var mappedInputs = {};
            for(var i in _this.inputTypes) {
                mappedInputs[_this.inputTypes[i].getName()] = inputs[i];
            }
            return InputSet.create(mappedInputs);
        });
};

InputsService.prototype.getInputsList = function getInputsList() {
    return this.inputTypes.map(function getName(input) { return input.getName(); });
};

module.exports = new InputsService();