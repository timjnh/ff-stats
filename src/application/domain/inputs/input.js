'use strict';

var assert = require('assert');

function Input() {}

Input.prototype.evaluate = function evaluate(player, game) {
    throw this.constructor.name + '.evaluate has not been implemented!';
};

Input.prototype.getName = function getName() {
    return this.constructor.name;
};

Input.prototype.padWithAverage = function padWithAverage(values, desiredValueCount) {
    if(values.length < desiredValueCount) {
        var average = (values.reduce(function (points, total) { return points + total; }, 0) / values.length) || 0,
            filler = Array.apply(null, Array(desiredValueCount - values.length)).map(Number.prototype.valueOf, average);
        values.unshift.apply(values, filler);
    }

    return values;
};

module.exports = Input;