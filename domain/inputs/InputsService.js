'use strict';

var _ = require('underscore'),
    q = require('q'),
    HomeVsAway = require('./HomeVsAway'),
    RecentGames = require('./RecentGames'),
    Opponent = require('./Opponent'),
    AveragePointsAgainstOpponent = require('./AveragePointsAgainstOpponent'),
    RecentPointsAgainstOpponent = require('./RecentPointsAgainstOpponent'),
    DaysOff = require('./DaysOff');

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
            var mappedInput,
                mappedInputs = [];

            for(var i in _this.inputTypes) {
                mappedInput = {};
                mappedInput[_this.inputTypes[i].constructor.name] = inputs[i];
                mappedInputs.push(mappedInput);
            }
            return mappedInputs;
        });
};

InputsService.prototype.flatten = function flatten(inputs) {
    return  _.flatten(inputs.map(function flattenInput(input) {
        return _.flatten(_.values(input));
    }));
};

InputsService.prototype.getInputsList = function getInputsList() {
    var inputsList = _.pluck(_.pluck(this.inputTypes, 'constructor'), 'name');
    inputsList.sort();
    return inputsList;
};

module.exports = new InputsService();