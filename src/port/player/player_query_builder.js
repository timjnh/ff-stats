'use strict';

function PlayerQueryBuilder() {
    this.criteria = {};
}

PlayerQueryBuilder.create = function create() {
    return new PlayerQueryBuilder();
};

PlayerQueryBuilder.prototype.withTeam = function withTeam(team) {
    this.criteria['team'] = team;
    return this;
};

PlayerQueryBuilder.prototype.build = function build() {
    return this.criteria;
};

module.exports = PlayerQueryBuilder;