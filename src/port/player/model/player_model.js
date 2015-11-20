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
        // offense
        passingYards: Number,
        passingTDs: Number,

        conversions: Number,

        rushingYards: Number,
        rushingTDs: Number,

        receivingYards: Number,
        receivingTDs: Number,
        targets: Number,

        fumblesLost: Number,
        interceptionsLost: Number,

        // defense
        sacks: Number,
        interceptions: Number,
        fumbleRecoveries: Number,

        tdsFromTurnovers: Number,
        extraPointsBlocked: Number,

        pointsAllowed0: Number,
        pointsAllowedLessThan7: Number,
        pointsAllowedLessThan14: Number,
        pointsAllowedLessThan18: Number,
        pointsAllowedLessThan28: Number,
        pointsAllowedLessThan35: Number,
        pointsAllowedLessThan46: Number,
        pointsAllowed46OrMore: Number,

        rushingYardsAllowed: Number,
        rushingTDsAllowed: Number,

        passingYardsAllowed: Number,
        passingTDsAllowed: Number,

        // kicking
        fieldGoalsMissed: Number,
        fieldGoalsMade50Plus: Number,
        fieldGoalsMade40Plus: Number,
        fieldGoalsMade0Plus: Number,
        extraPointsMade: Number,
        extraPointsMissed: Number
    },
    inputs: { type: Schema.Types.Mixed, default: {} }
}, { strict: 'throw', id: false, minimize: false });

var InjurySchema = new Schema({
    week: Number,
    year: Number,
    status: String,
    reason: String,
    played: Boolean
});

var PlayerSchema = new Schema({
    name: { type: String },
    team: { type: String },
    position: { type: String },
    games: [GameSchema],
    injuries: [InjurySchema]
}, { strict: 'throw'});

PlayerSchema.index({ name: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('players', PlayerSchema);