'use strict';

var _ = require('underscore'),
    q = require('q'),
    TrainingSet = require('./training_set'),
    inputsService = require('../inputs/inputs_service');

function TrainingService() {}

TrainingService.prototype.getTrainingSetsForPlayerUpToGame = function getTrainingSetsForPlayerUpToGame(player, game, inputs) {
    var _this = this,
        precedingGames = player.findAllPrecedingGames(game);

    return q.all(precedingGames.map(function buildTrainingSetForPlayerAndGame(precedingGame) {
        return _this.buildTrainingSetForPlayerAndGame(player, precedingGame, inputs)
    }));
};

TrainingService.prototype.buildTrainingSetForPlayerAndGame = function buildTrainingSetForPlayerAndGame(player, game, inputs) {
    var trainingSet = TrainingSet.create({
        input: game.inputs.getSubset(inputs).sortAndFlatten(),
        output: [game.points / 100]
    });

    return q.when(trainingSet);
};

module.exports = new TrainingService();
