'use strict';

var _ = require('underscore'),
    q = require('q'),
    TrainingSet = require('./training_set'),
    inputsService = require('./inputs/inputs_service');

function TrainingService() {}

TrainingService.prototype.getTrainingSetsForPlayerUpToGame = function getTrainingSetsForPlayerUpToGame(player, game) {
    var precedingGames = player.findAllPrecedingGames(game);
    return q.all(precedingGames.map(this.buildTrainingSetForPlayerAndGame.bind(this, player)));
};

TrainingService.prototype.buildTrainingSetForPlayerAndGame = function buildTrainingSetForPlayerAndGame(player, game) {
    var trainingSet = TrainingSet.create({
        input: game.inputs.sortAndFlatten(),
        output: [game.points / 100]
    });

    return q.when(trainingSet);
};

module.exports = new TrainingService();
