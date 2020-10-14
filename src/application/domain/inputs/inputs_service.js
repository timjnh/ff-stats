'use strict';

var _ = require('underscore'),
    q = require('q'),
    HomeVsAway = require('./home_vs_away'),
    RecentPoints = require('./recent_points'),
    RecentPointsTrend = require('./recent_points_trend'),
    Opponent = require('./opponent'),
    AveragePointsAgainstOpponent = require('./average_points_against_opponent'),
    RecentPointsAgainstOpponent = require('./recent_points_against_opponent'),
    DaysOff = require('./days_off'),
    RecentPassingYards = require('./recent_passing_yards'),
    RecentPassingYardsTrend = require('./recent_passing_yards_trend'),
    RecentPassingTouchdowns = require('./recent_passing_touchdowns'),
    RecentPassingTouchdownsTrend = require('./recent_passing_touchdowns_trend'),
    RecentRushingYards = require('./recent_rushing_yards'),
    RecentRushingYardsTrend = require('./recent_rushing_yards_trend'),
    RecentRushingTouchdowns = require('./recent_rushing_touchdowns'),
    RecentRushingTouchdownsTrend = require('./recent_rushing_touchdowns_trend'),
    RecentPassingYardsAllowedByOpponent = require('./recent_passing_yards_allowed_by_opponent'),
    RecentRushingYardsAllowedByOpponent = require('./recent_rushing_yards_allowed_by_opponent'),
    RecentPassingTouchdownsAllowedByOpponent = require('./recent_passing_touchdowns_allowed_by_opponent'),
    RecentRushingTouchdownsAllowedByOpponent = require('./recent_rushing_touchdowns_allowed_by_opponent'),
    RecentSacksByOpponent = require('./recent_sacks_by_opponent'),
    RecentInterceptionsByOpponent = require('./recent_interceptions_by_opponent'),
    OutDueToInjury = require('./out_due_to_injury'),
    PlayingInjured = require('./playing_injured'),
    TopTargetOut = require('./top_target_out'),
    TopToucherOut = require('./top_toucher_out'),
    WeekOfYear = require('./week_of_year'),
    PlayerPosition = require('../player/player_position'),
    TopOfDepthChartInjured = require('./top_of_depth_chart_injured'),
    RecentTargets = require('./recent_targets'),
    RecentReceivingTouchdowns = require('./recent_receiving_touchdowns'),
    RecentReceivingTouchdownsTrend = require('./recent_receiving_touchdowns_trend'),
    RecentReceivingYards = require('./recent_receiving_yards'),
    RecentReceivingYardsTrend = require('./recent_receiving_yards_trend'),
    InputSet = require('./input_set'),
    RecentTouches = require('./recent_touches'),
    RecentTouchesTrend = require('./recent_touches_trend'),
    RecentTargetsTrend = require('./recent_targets_trend'),
    QbInjured = require('./qb_injured'),
    TopOfDepthChartTargetsTrend = require('./top_of_depth_chart_targets_trend'),
    TopOfDepthChartTouchesTrend = require('./top_of_depth_chart_touches_trend');

function InputsService() {
    var sharedInputs = [
        new HomeVsAway(),
        new RecentPoints(3),
        new RecentPointsTrend(4),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff(),
        new OutDueToInjury(),
        new PlayingInjured(),
        new WeekOfYear()
    ];

    this.inputsByPosition = {};

    this.inputsByPosition[PlayerPosition.QB] = [
        new RecentPassingYards(3),
        new RecentPassingYardsTrend(3),
        new RecentPassingTouchdowns(3),
        new RecentPassingTouchdownsTrend(4),
        new RecentRushingYards(3),
        new RecentRushingTouchdowns(3),
        new RecentPassingYardsAllowedByOpponent(3),
        new RecentRushingYardsAllowedByOpponent(3),
        new RecentPassingTouchdownsAllowedByOpponent(3),
        new RecentRushingTouchdownsAllowedByOpponent(3),
        new RecentSacksByOpponent(3),
        new RecentInterceptionsByOpponent(3),
        new TopTargetOut(),
        new TopToucherOut(),
        new TopOfDepthChartInjured()
    ].concat(sharedInputs);

    this.inputsByPosition[PlayerPosition.RB] = [
        new RecentRushingYards(3),
        new RecentRushingYardsTrend(4),
        new RecentRushingTouchdowns(3),
        new RecentRushingTouchdownsTrend(4),
        new RecentPassingYardsAllowedByOpponent(3),
        new RecentRushingYardsAllowedByOpponent(3),
        new RecentPassingTouchdownsAllowedByOpponent(3),
        new RecentRushingTouchdownsAllowedByOpponent(3),
        new TopOfDepthChartInjured(),
        new RecentTouches(3),
        new RecentTouchesTrend(4),
        new QbInjured(),
        new TopOfDepthChartTouchesTrend(4)
    ].concat(sharedInputs);

    this.inputsByPosition[PlayerPosition.WR] = [
        new RecentPassingYardsAllowedByOpponent(3),
        new RecentRushingYardsAllowedByOpponent(3),
        new RecentPassingTouchdownsAllowedByOpponent(3),
        new RecentRushingTouchdownsAllowedByOpponent(3),
        new RecentInterceptionsByOpponent(3),
        new TopOfDepthChartInjured(),
        new RecentTargets(3),
        new RecentTargetsTrend(4),
        new RecentReceivingTouchdowns(3),
        new RecentReceivingTouchdownsTrend(4),
        new RecentReceivingYards(3),
        new RecentReceivingYardsTrend(4),
        new QbInjured(),
        new TopOfDepthChartTargetsTrend(4)
    ].concat(sharedInputs);

    this.inputsByPosition[PlayerPosition.DEFENSE] = sharedInputs;

    this.inputsByPosition[PlayerPosition.KICKER] = sharedInputs;
}

InputsService.prototype.getInputsForPlayerAndGame = function getInputsForPlayerAndGame(player, game) {
    var playerInputTypes = this.getInputsForPosition(player.position),
        inputPromises = playerInputTypes.map(function getInputForPlayerAndGame(input) {
            try {
                return q.when(input.evaluate(player, game));
            } catch(err) {
                return q.reject(err);
            }
        });

    return q.allSettled(inputPromises)
        .then(function mapInputs(inputs) {
            var mappedInputs = {};
            for(var i in playerInputTypes) {
                if(inputs[i].state === 'fulfilled') {
                    mappedInputs[playerInputTypes[i].getName()] = inputs[i].value;
                } else {
                    throw new Error('Failed generating input "' + playerInputTypes[i].getName() + '" with error "' + inputs[i].reason + '"' + "\n" + inputs[i].reason.stack);
                }
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

InputsService.prototype.getInputsList = function getInputsList() {
    var allInputs = [];

    for(var position in this.inputsByPosition) {
        allInputs = allInputs.concat(this.getInputsListForPosition(position));
    }

    return _.uniq(allInputs);
};

module.exports = new InputsService();