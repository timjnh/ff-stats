module.exports = (function() {
    'use strict';

    function NetworkStrategy() {}

    NetworkStrategy.prototype.createAndTrainNetwork = function createAndTrainNetwork(trainingSets) {
        throw this.constructor.name + '.createAndTrainNetwork has not been implemented!';
    };

    return NetworkStrategy;
})();