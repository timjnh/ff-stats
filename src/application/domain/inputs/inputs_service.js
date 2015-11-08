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
    PlayerPosition = require('../player_position'),
    Input = require('./input'),
    InputSet = require('../input_set');

function InputsService() {
    this.inputsByPosition = {};

    this.inputsByPosition[PlayerPosition.QB] = [
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

    this.inputsByPosition[PlayerPosition.RB] = [
        new HomeVsAway(),
        new PointsInRecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff(),
        new RecentRushingYards(3),
        new RecentRushingTouchdowns(3),
        new RecentPassingYardsAllowedByOpponent(3),
        new RecentRushingYardsAllowedByOpponent(3),
        new RecentPassingTouchdownsAllowedByOpponent(3),
        new RecentRushingTouchdownsAllowedByOpponent(3)
    ];

    this.inputsByPosition[PlayerPosition.WR] = [
        new HomeVsAway(),
        new PointsInRecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff(),
        new RecentPassingYardsAllowedByOpponent(3),
        new RecentRushingYardsAllowedByOpponent(3),
        new RecentPassingTouchdownsAllowedByOpponent(3),
        new RecentRushingTouchdownsAllowedByOpponent(3),
        new RecentInterceptionsByOpponent(3)
    ];

    this.inputsByPosition[PlayerPosition.DEFENSE] = [
        new HomeVsAway(),
        new PointsInRecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff()
    ];

    this.inputsByPosition[PlayerPosition.KICKER] = [
        new HomeVsAway(),
        new PointsInRecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff()
    ];
}

InputsService.prototype.getInputsForPlayerAndGame = function getInputsForPlayerAndGame(player, game) {
    var _this = this,
        playerInputTypes = this.getInputsForPosition(player.position),
        inputPromises = playerInputTypes.map(function getInputForPlayerAndGame(input) {
            return q.when(input.evaluate(player, game));
        });

    return q.all(inputPromises)
        .then(function mapInputs(inputs) {
            var mappedInputs = {};
            for(var i in playerInputTypes) {
                mappedInputs[playerInputTypes[i].getName()] = inputs[i];
            }
            return InputSet.create(mappedInputs);
        });
};

InputsService.prototype.getInputsForPosition = function getInputsForPosition(position) {
    return this.inputsByPosition[position];
};

InputsService.prototype.getInputsListForPosition = function getInputsListForPosition(position) {
    var inputsForPosition = this.getInputsForPosition(position);
    return inputsForPosition.map(function getName(input) { return input.getName(); });
};

module.exports = new InputsService();