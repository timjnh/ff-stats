'use strict';

var _ = require('underscore'),
    mongoose = require('mongoose'),
    PlayerPosition = require('../../../application/domain/player/player_position'),
    Schema = mongoose.Schema;

var PlayerSchema = new Schema({
    name: String,
    position: String,
    played: Boolean,
    injured: Boolean
});

var depthChartSchema = {};
_.each(PlayerPosition, function addPositionToDepthChart(position) {
    depthChartSchema[position] = [String];
});

var GameSchema = new Schema({
    eid: String,
    week: Number,
    year: Number,
    players: [PlayerSchema],
    depthChart: depthChartSchema
});

var TeamSchema = new Schema({
    name: String,
    games: [GameSchema]
}, { strict: 'throw', id: false, minimize: false });

TeamSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('teams', TeamSchema);