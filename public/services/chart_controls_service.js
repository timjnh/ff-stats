(function() {
    'use strict';

    angular.module('myApp.chartControlsService', [])
        .factory('chartControlsService' , function() {
            var chartControlsService = {
                onChangeCallbacks: [],
                player: null,
                inputs: {}
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
                if(!this.inputs[input]) {
                    this.inputs[input] = {};
                }
                this.inputs[input].selected = selected;
            };

            chartControlsService.hasValidPlayer = function hasValidPlayer() {
                return !!this.player.name;
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