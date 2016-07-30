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
    var network = new synaptic.Architect.Liquid(trainingSets[0].input.length, 20, 1, 30, 10),
        trainer = new synaptic.Trainer(network);

    trainer.train(
        trainingSets,
        {
            rate: 0.1,
            iterations: 20000,
            cost: synaptic.Trainer.cost.MSE
        }
    );

    return network;
};

module.exports = LiquidStrategy;