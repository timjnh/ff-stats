(function() {
    'use strict';

    angular.module('myApp.chartControls', ['myApp.chartControlsService', 'myApp.playersService', 'myApp.inputsService'])
        .directive('chartControls', function() {
            return {
                restrict: 'E',
                templateUrl: 'components/chart_controls/chart_controls.html',
                controllerAs: 'chartControlsController',
                controller: 'chartControlsController'
            };
        })
        .controller('chartControlsController', function(chartControlsService, playersService, inputsService) {
            var _this = this;

            this.chartControlsService = chartControlsService;

            playersService.getAll().then(function(players) {
                _this.players = players;
            });

            inputsService.getAll().then(function(inputs) {
                _this.inputs = inputs;
            })
        });
})();
