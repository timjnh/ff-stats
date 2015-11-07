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
        interceptionsLost: Number,

        sacks: Number,
        interceptions: Number,
        fumbleRecoveries: Number,

        rushingYardsAllowed: Number,
        rushingTDsAllowed: Number,

        passingYardsAllowed: Number,
        passingTDsAllowed: Number,

        fieldGoalsMissed: Number,
        fieldGoalsMade50Plus: Number,
        fieldGoalsMade40Plus: Number,
        fieldGoalsMade0Plus: Number,
        extraPointsMade: Number,
        extraPointsMissed: Number
    },
    inputs: { type: Schema.Types.Mixed, default: {} }
}, { strict: 'throw', id: false, minimize: false });

var PlayerSchema = new Schema({
    name: { type: String },
    team: { type: String },
    position: { type: String },
    games: [GameSchema]
}, { strict: 'throw'});

PlayerSchema.index({ name: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('players', PlayerSchema);