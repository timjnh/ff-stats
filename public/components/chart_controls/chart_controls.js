(function() {
    'use strict';

    angular.module('myApp.chartControls', ['myApp.chartControlsService', 'myApp.playersService', 'underscore', 'angular.filter'])
        .directive('chartControls', function() {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/chart_controls/chart_controls.html',
                controllerAs: 'chartControlsController',
                controller: 'chartControlsController'
            };
        })
        .controller('chartControlsController', function(chartControlsService, playersService, inputsService, _, $filter) {
            var _this = this;

            this.chartControlsService = chartControlsService;

            playersService.getAll().then(function(players) {
                _this.players = players;
            });

            this.playerSearchText = '';

            this.getMatchedPlayers = function getMatchedPlayers(searchText) {
                if(!_this.players) {
                    return [];
                }

                return _.filter(_this.players, function doesPlayerMatchText(player) {
                    return player.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                        player.team.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                });
            };

            this.getFullPlayerName = function getFullPlayerName(player) {
                if(!player.name || !player.team) {
                    return '';
                }

                return $filter('ucfirst')(player.name + ', ' + player.team);
            };
        });
})();
