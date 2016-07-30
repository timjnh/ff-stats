'use strict';

var _ = require('underscore'),
    synaptic = require('synaptic'),
    NetworkStrategy = require('./network_strategy');

function LiquidStrategy() {
    NetworkStrategy.call(this);
};
LiquidStrategy.prototype = _.create(NetworkStrategy.prototype, { constructor: LiquidStrategy });

LiquidStrategy.NAME = 'liquid';

LiquidStrategy.prototype.createAndTrainNetwork = function createAndTrainNetwork(trainingSets) {
    var network = new synaptic.Architect.Liquid(
            trainingSets[0].input.length, // inputs
            trainingSets[0].input.length * 5, // pool size
            1, // outputs
            trainingSets[0].input.length * 10, // random connections in the pool
            trainingSets[0].input.length), // random gates
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

module.exports = LiquidStrategy;