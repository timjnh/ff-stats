'use strict';

var _ = require('underscore'),
    q = require('q'),
    HomeVsAway = require('./HomeVsAway'),
    RecentGames = require('./RecentGames'),
    Opponent = require('./Opponent'),
    AveragePointsAgainstOpponent = require('./AveragePointsAgainstOpponent'),
    RecentPointsAgainstOpponent = require('./RecentPointsAgainstOpponent');

function InputsService() {
    this.inputTypes = [
        new HomeVsAway(),
        new RecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3)
    ];
}

InputsService.prototype.getInputsForPlayerAndGame = function getInputsForPlayerAndGame(player, game) {
    var inputPromises = this.inputTypes.map(function getInputForPlayerAndGame(input) {
        return q.when(input.evaluate(player, game));
    });

    return q.all(inputPromises)
        .then(function flattenInputs(inputs) {
            return _.flatten(inputs);
        });
};

module.exports = new InputsService();