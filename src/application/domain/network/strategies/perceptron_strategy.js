module.exports = (function() {
    'use strict';

    var _ = require('underscore'),
        synaptic = require('synaptic'),
        NetworkStrategy = require('./network_strategy');

    function PerceptronStrategy() {
        NetworkStrategy.call(this);
    };
    PerceptronStrategy.prototype = _.create(NetworkStrategy.prototype, { constructor: PerceptronStrategy });

    PerceptronStrategy.NAME = 'perceptron';

    PerceptronStrategy.prototype.createAndTrainNetwork = function createAndTrainNetwork(trainingSets) {
        var network = new synaptic.Architect.Perceptron(trainingSets[0].input.length, (trainingSets[0].input.length * 10) + 1, 1),
            trainer = new synaptic.Trainer(network);

        trainer.train(
            trainingSets,
            {
                rate: [0.1, 0.1, 0.05, 0.01],
                iterations: 1000000
            }
        );

        return network;
    };

    return PerceptronStrategy;
})();