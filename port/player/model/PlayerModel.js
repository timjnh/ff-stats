'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
    eid: String,
    week: Number,
    year: Number,
    points: Number,
    stats: {
        passingYards: Number,
        passingTDs: Number,

        rushingYards: Number,
        rushingTDs: Number,

        fumblesLost: Number,
        interceptionsLost: Number
    }
}, { strict: 'throw', id: false });

var PlayerSchema = new Schema({
    name: { type: String, unique: true },
    games: [GameSchema]
}, { strict: 'throw'});

module.exports = mongoose.model('players', PlayerSchema);