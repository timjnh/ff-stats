'use strict';

var q = require('q'),
    inputsService = require('../../../domain/inputs/inputs_service'),
    InputModel = require('./input_model');

function InputsResource() {}

InputsResource.prototype.getListForPosition = function getListForPosition(position) {
    return q.when(inputsService.getInputsListForPosition(position))
        .then(function buildInputModels(inputNames) {
            return inputNames.map(function buildInputModel(inputName) {
                return InputModel.create({name: inputName});
            });
        });
};

module.exports = new InputsResource();