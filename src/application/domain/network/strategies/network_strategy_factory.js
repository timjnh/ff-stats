module.exports = (function() {
    'use strict';

    var PerceptronStrategy = require('./perceptron_strategy'),
        LSTMStrategy = require('./lstm_strategy');

    function NetworkStrategyFactory() {}

    NetworkStrategyFactory.STRATEGIES = {};
    NetworkStrategyFactory.STRATEGIES[PerceptronStrategy.NAME] = PerceptronStrategy;
    NetworkStrategyFactory.STRATEGIES[LSTMStrategy.NAME] = LSTMStrategy;

    NetworkStrategyFactory.createStrategy = function createStrategy(name) {
        if(NetworkStrategyFactory.STRATEGIES.hasOwnProperty(name)) {
            return new NetworkStrategyFactory.STRATEGIES[name]();
        } else {
            throw 'Unknown network strategy "' + name + '"!';
        }
    };

    NetworkStrategyFactory.getStrategyNames = function getStrategyNames() {
        return Object.keys(NetworkStrategyFactory.STRATEGIES);
    };

    return NetworkStrategyFactory;
})();