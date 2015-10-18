'use strict';

var _ = require('underscore'),
    q = require('q'),
    TrainingSet = require('./TrainingSet'),
    inputsService = require('./inputs/InputsService');

function TrainingService() {}

TrainingService.prototype.getTrainingSetsForPlayerUpToGame = function getTrainingSetsForPlayerUpToGame(player, game) {
    var precedingGames = player.findAllPrecedingGames(game);
    return q.all(precedingGames.map(this.buildTrainingSetForPlayerAndGame.bind(this, player)));
};

TrainingService.prototype.buildTrainingSetForPlayerAndGame = function buildTrainingSetForPlayerAndGame(player, game) {
    return inputsService.getInputsForPlayerAndGame(player, game)
        .then(function buildTrainingSet(inputs) {
            return TrainingSet.create({ input: inputsService.flatten(inputs), output: [game.points / 100] });
        });
};

module.exports = new TrainingService();
