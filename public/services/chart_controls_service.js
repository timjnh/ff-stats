(function() {
    'use strict';

    angular.module('myApp.chartControlsService', ['underscore', 'myApp.inputsService'])
        .factory('chartControlsService' , function(_, inputsService) {
            var chartControlsService = {
                onChangeCallbacks: [],
                player: null,
                inputs: {},
                isRetrievingInputs: false
            };

            chartControlsService.getSelectedInputs = function getSelectedInputs() {
                var selected = [];
                for(var k in this.inputs) {
                    if(this.inputs[k].selected) {
                        selected.push(k);
                    }
                }
                return selected;
            };

            chartControlsService.setInputSelected = function setInputSelected(input, selected) {
                this.inputs[input].selected = selected;
            };

            chartControlsService.hasValidPlayer = function hasValidPlayer() {
                return this.player && this.player.name;
            };

            chartControlsService.getInputsForCurrentPlayer = function getInputsForCurrentPlayer() {
                var _this = this;

                this.inputs = {};
                this.isRetrievingInputs = true;

                return inputsService.getInputsForPosition(this.player.position).then(function(inputs) {
                    _this.inputs = inputs;
                    for(var k in inputs) {
                        _this.setInputSelected(k, true);
                    }
                })
                .finally(function unsetIsRetrievingInputs() {
                    _this.isRetrievingInputs = false;
                });
            };

            chartControlsService.hasInputs = function hasInputs() {
                return _.values(this.inputs).length > 0;
            };

            chartControlsService.onPlayerSelected = function onPlayerSelected() {
                var _this = this;
                this.getInputsForCurrentPlayer().then(function() {
                    _this.onChange();
                })
            };

            chartControlsService.onChange = function onChange(callback) {
                if(callback === undefined) {
                    this.onChangeCallbacks.forEach(function executeCallback(callback) {
                        callback();
                    });
                } else {
                    this.onChangeCallbacks.push(callback);
                }
            };

            return chartControlsService;
        })
})();