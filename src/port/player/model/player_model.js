'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
    eid: String,
    week: Number,
    year: Number,
    opponent: String,
    points: Number,
    stats: {
        passingYards: Number,
        passingTDs: Number,

        conversions: Number,

        rushingYards: Number,
        rushingTDs: Number,

        receivingYards: Number,
        receivingTDs: Number,

        fumblesLost: Number,
        interceptionsLost: Number
    },
    inputs: Schema.Types.Mixed
}, { strict: 'throw', id: false, minimize: false });

var PlayerSchema = new Schema({
    name: { type: String },
    team: { type: String },
    games: [GameSchema]
}, { strict: 'throw'});

PlayerSchema.index({ name: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('players', PlayerSchema);