'use strict';

var _ = require('underscore'),
    Joi = require('joi'),
    PlayerPosition = require('../player/player_position');

function DepthChart(attributes) {
    var validatedAttributes = Joi.validate(attributes, DepthChart.schema, { stripUnknown: true });
    if(validatedAttributes.error) {
        throw validatedAttributes.error;
    }

    _.extendOwn(this, validatedAttributes.value);
    Object.freeze(this);
}

DepthChart.schema = {};

_.each(PlayerPosition, function(position) {
    DepthChart.schema[position] = Joi.array().items(Joi.string()).default([]);
});

DepthChart.create = function create(attributes) {
    return new DepthChart(attributes);
};

DepthChart.prototype.setChartAtPosition = function setChartAtPosition(position, chart) {
    var toMerge = {};
    toMerge[position] = chart;
    return DepthChart.create(_.extend(_.clone(this), toMerge));
};

module.exports = DepthChart;

