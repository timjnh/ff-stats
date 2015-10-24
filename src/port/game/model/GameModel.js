'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
        eid: String,
        week: Number,
        year: Number,
        date: Date,
        home: String,
        away: String,
        homeScore: Number,
        awayScore: Number,
        stats: Schema.Types.Mixed
    }
);

module.exports = mongoose.model('games', GameSchema);