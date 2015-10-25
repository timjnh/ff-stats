'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    gameRepository = require('../../../port/game/game_repository');

function HomeVsAway() {
    Input.call(this);

    this.HOME_VALUE = 1;
    this.AWAY_VALUE = 0;
}
HomeVsAway.prototype = _.create(Input.prototype, { constructor: HomeVsAway });

HomeVsAway.prototype.evaluate = function evaluate(player, game) {
    var _this = this;
    return gameRepository.findOneByEid(game.eid)
        .then(function determineHomeVsAway(game) {
            return game.isHomeTeam(player.team) ? _this.HOME_VALUE : _this.AWAY_VALUE;
        });
};

module.exports = HomeVsAway;