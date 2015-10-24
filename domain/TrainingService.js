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
    var trainingSet = TrainingSet.create({
        input: inputsService.sortInputSet(game.inputs),
        output: [game.points / 100]
    });

    return q.when(trainingSet);
};

module.exports = new TrainingService();
