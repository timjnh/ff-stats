'use strict';

var _ = require('underscore'),
    q = require('q'),
    HomeVsAway = require('./HomeVsAway'),
    RecentGames = require('./RecentGames'),
    Opponent = require('./Opponent'),
    AveragePointsAgainstOpponent = require('./AveragePointsAgainstOpponent'),
    RecentPointsAgainstOpponent = require('./RecentPointsAgainstOpponent'),
    DaysOff = require('./DaysOff'),
    Input = require('./Input'),
    InputSet = require('../InputSet');

function InputsService() {
    this.inputTypes = [
        new HomeVsAway(),
        new RecentGames(3),
        new Opponent(),
        new AveragePointsAgainstOpponent(),
        new RecentPointsAgainstOpponent(3),
        new DaysOff()
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