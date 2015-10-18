'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlayerSchema = {
    name: String,
    team: String
};

var GameSchema = {
    eid: String
};

var PlayerNetworkSchema = new Schema({
    player: PlayerSchema,
    game: GameSchema,
    inputsList: [{ type: String }],
    network: Schema.Types.Mixed
}, { strict: 'throw'});

PlayerNetworkSchema.index({
    'player.name': 1,
    'player.team': 1,
    'game.eid': 1,
    'inputsList': 1
}, { unique: true });

module.exports = mongoose.model('player_networks', PlayerNetworkSchema);