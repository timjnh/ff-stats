'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GenomeSchema = new Schema({
    player: {
        name: String,
        team: String
    },
    chromosomes: [String],
    chromosomeKey: String,
    strategy: String,
    fitness: Number
}, { strict: 'throw' });

GenomeSchema.index({ 'player.name': 1, 'player.team': 1, chromosomeKey: 1, strategy: 1 }, { unique: true });

module.exports = mongoose.model('genomes', GenomeSchema);