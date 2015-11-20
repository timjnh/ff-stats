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

InputSet.prototype.getSubset = function getSubset(inputNames) {
    var _this = this,
        inputSet = {};

    inputNames.forEach(function getInput(inputName) {
        inputSet[inputName] = _this[inputName];
    });

    return InputSet.create(inputSet);
};

InputSet.prototype.sortAndFlatten = function sortAndFlatten() {
    var sortedPairs = _.sortBy(_.pairs(this), _.first);
    return _.flatten(sortedPairs.map(_.last));
};

module.exports = InputSet;