'use strict';

var _ = require('underscore');

module.exports = Stats;

function Stats(attributes) {
    _.extendOwn(this, attributes);
    Object.freeze(this);
}

Stats.create = function create(attributes) {
    return new Stats(attributes);
};

