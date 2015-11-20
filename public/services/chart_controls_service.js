(function() {
    'use strict';

    angular.module('myApp.chartControlsService', ['underscore', 'myApp.inputsService'])
        .factory('chartControlsService', function(_, inputsService, $timeout) {
            var chartControlsService = {
                onChangeCallbacks: [],
                onChangeTimeout: null,
                player: null,
                inputs: {},
                networkStrategy: 'perceptron',
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

            chartControlsService.hasSelectedInputs = function hasSelectedInputs() {
                return this.getSelectedInputs().length > 0;
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
                        _this.setInputSelected(k, false);
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
                var _this = this;

                cancelOnChangeTimeout();

                if(callback === undefined) {
                    this.onChangeTimeout = $timeout(function executeOnChangeCallbacks() {
                        cancelOnChangeTimeout();
                        _this.onChangeCallbacks.forEach(function executeCallback(callback) {
                            callback();
                        });
                    }, 1000);
                } else {
                    this.onChangeCallbacks.push(callback);
                }
            };

            function cancelOnChangeTimeout() {
                if(chartControlsService.onChangeTimeout) {
                    $timeout.cancel(chartControlsService.onChangeTimeout);
                    chartControlsService.onChangeTimeout = null;
                }
            }

            return chartControlsService;
        })
})();