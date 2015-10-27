(function() {
    'use strict';

    angular.module('myApp.chartControlsService', [])
        .factory('chartControlsService', function() {
            var chartControlsService = {
                onChangeCallbacks: [],
                player: {},
                inputs: {}
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