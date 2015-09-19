'use strict';

var q = require('q'),
    TrainingSet = require('./TrainingSet'),
    inputsService = require('./inputs/InputsService');

function TrainingService() {}

TrainingService.prototype.getTrainingSetsForPlayer = function getTrainingSetsForPlayer(player) {
    return q.all(player.games.map(this.buildTrainingSetForPlayerAndGame.bind(this, player)));
};

TrainingService.prototype.buildTrainingSetForPlayerAndGame = function buildTrainingSetForPlayerAndGame(player, game) {
    return inputsService.getInputsForPlayerAndGame(player, game)
        .then(function buildTrainingSet(inputs) {
            return TrainingSet.create({ input: inputs, output: [game.points / 100] });
        });
};

module.exports = new TrainingService();
