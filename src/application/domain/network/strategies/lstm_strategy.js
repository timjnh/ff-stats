module.exports = (function() {
    'use strict';

    var _ = require('underscore'),
        synaptic = require('synaptic'),
        NetworkStrategy = require('./network_strategy');

    function LSTMStrategy() {
        NetworkStrategy.call(this);
    };
    LSTMStrategy.prototype = _.create(NetworkStrategy.prototype, { constructor: LSTMStrategy });

    LSTMStrategy.NAME = 'lstm';

    LSTMStrategy.prototype.createAndTrainNetwork = function createAndTrainNetwork(trainingSets) {
        var network = new synaptic.Architect.LSTM(trainingSets[0].input.length, 20, 10, 1),
            trainer = new synaptic.Trainer(network);

        trainer.train(
            trainingSets,
            {
                rate: [0.1, 0.1, 0.05, 0.01],
                iterations: 2000000,
                cost: synaptic.Trainer.cost.MSE
            }
        );

        return network;
    };

    return LSTMStrategy;
})();