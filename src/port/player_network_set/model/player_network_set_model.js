module.exports = (function() {
    'use strict';

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var PlayerSchema = {
        name: String,
        team: String
    };

    var PlayerNetworkSetSchema = new Schema({
        player: PlayerSchema,
        inputsList: [{ type: String }],
        inputsListKey: String,
        strategy: String,
        startYear: Number,
        endYear: Number,
        standardDeviation: Number
    }, { strict: 'throw'});

    PlayerNetworkSetSchema.index({
        'player.name': 1,
        'player.team': 1,
        'inputsListKey': 1,
        'strategy': 1,
        'startYear': 1,
        'endYear': 1
    }, { unique: true });

    PlayerNetworkSetSchema.pre('save', function setInputsListKey(next) {
        this.inputsList.sort();
        this.inputsListKey = this.inputsList.join();

        next();
    });

    return mongoose.model('player_network_sets', PlayerNetworkSetSchema);
})();