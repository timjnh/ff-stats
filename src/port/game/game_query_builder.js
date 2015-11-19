'use strict';

function GameQueryBuilder() {
    this.criteria = {};
}

GameQueryBuilder.create = function create() {
    return new GameQueryBuilder();
};

GameQueryBuilder.prototype.withTeam = function withTeam(team) {
    this.criteria['$or'] = [{ home: team }, { away: team }];
    return this;
};

GameQueryBuilder.prototype.withEid = function withEid(eid) {
    this.criteria.eid = eid;
    return this;
};

GameQueryBuilder.prototype.withYears = function withYears(years) {
    this.criteria.year = { '$in': years };
    return this;
};

GameQueryBuilder.prototype.build = function build() {
    return this.criteria;
};

module.exports = GameQueryBuilder;