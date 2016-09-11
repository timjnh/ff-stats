'use strict';

var q = require('q'),
    Genome = require('../../application/domain/evolution/genome'),
    GenomeModel = require('./model/genome_model');

function GenomeRepository(player, inputsList, strategy) {
    this.player = player;
    this.inputsList = inputsList;
    this.strategy = strategy;
}

GenomeRepository.prototype.findOneByChromosomes = function findOneByChromosomes(chromosomes) {
    var _this = this;

    chromosomes.sort();

    return findWithCriteria.bind(this)({
            'player.name': this.player.name,
            'player.team': this.player.team,
            strategy: this.strategy,
            chromosomes: chromosomes
        })
        .then(function first(genomes) {
            if(genomes.length == 1) {
                return genomes[0];
            } else if(genomes.length == 0) {
                return null;
            } else {
                throw new Error('Found multiple genomes matching "' + chromosomes.join(', ') + '" for player "' + _this.player.name + '" of the "' + _this.player.team + '"');
            }
        });
};

GenomeRepository.prototype.save = function save(genome) {
    var chromosomesList = buildChromosomesList.bind(this)(genome),
        genomeModelData = {
            player: {
                name: this.player.name,
                team: this.player.team
            },
            fitness: genome.fitness,
            strategy: this.strategy,
            chromosomes: chromosomesList,
            chromosomeKey: chromosomesList.join()
        };

    return q.Promise(function(resolve, reject) {
        if(!genome._id) {
            var model = new GenomeModel(genomeModelData);
            model.save(function(err) {
                return err ? reject(err) : resolve(genome);
            });
        } else {
            GenomeModel.update({ _id: genome._id }, genomeModelData, function(err) {
                return err ? reject(err) : resolve(genome);
            });
        }
    });
};

function buildChromosomesList(genome) {
    var chromosomes = [];
    for(var i = 0; i < genome.chromosomes.length; ++i){
        if(genome.chromosomes[i] == 1) {
            chromosomes.push(this.inputsList[i]);
        }
    }

    chromosomes.sort();
    return chromosomes;
}

function findWithCriteria(criteria) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        GenomeModel.find(criteria, function(err, genomes) {
            if(err) {
                reject(err);
            } else {
                resolve(genomes.map(buildGenomefromModel.bind(_this)));
            }
        });
    });
};

function buildGenomefromModel(genomeModel) {
    var chromosomes = [],
        genome = genomeModel.toObject();

    for(var i = 0; i < this.inputsList.length; ++i) {
        if(genomeModel.chromosomes.indexOf(this.inputsList[i]) !== -1) {
            chromosomes.push(1);
        } else {
            chromosomes.push(0);
        }
    }

    return Genome.create({ chromosomes: chromosomes, fitness: genome.fitness });
}

module.exports = GenomeRepository;