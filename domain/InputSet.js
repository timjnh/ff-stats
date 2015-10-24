'use strict';

var _ = require('underscore');

function InputSet(attributes) {
    _.extendOwn(this, attributes);
    Object.freeze(this);
}

InputSet.create = function create(attributes) {
    return new InputSet(attributes);
};

InputSet.prototype.hasValueForInput = function hasValueForInput(input) {
    return this.hasOwnProperty(input);
};

InputSet.prototype.sortAndFlatten = function sortAndFlatten() {
    var sortedPairs = _.sortBy(_.pairs(this), _.first);
    return _.flatten(sortedPairs.map(_.last));
};

module.exports = InputSet;