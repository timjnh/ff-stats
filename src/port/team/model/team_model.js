'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlayerSchema = new Schema({
    name: String,
    position: String,
    played: Boolean,
    injured: Boolean
});

var GameSchema = new Schema({
    eid: String,
    week: Number,
    year: Number,
    players: [PlayerSchema]
});

var TeamSchema = new Schema({
    name: String,
    games: [GameSchema]
}, { strict: 'throw', id: false, minimize: false });

TeamSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('teams', TeamSchema);