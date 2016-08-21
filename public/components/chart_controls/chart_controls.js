(function() {
    'use strict';

    angular.module('myApp.chartControls', ['myApp.chartControlsService', 'myApp.playersService', 'myApp.teamsService', 'underscore', 'angular.filter'])
        .directive('chartControls', function() {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/chart_controls/chart_controls.html',
                controllerAs: 'chartControlsController',
                controller: 'chartControlsController'
            };
        })
        .controller('chartControlsController', function(chartControlsService, playersService, teamsService, inputsService, _, $filter) {
            var _this = this;

            this.chartControlsService = chartControlsService;

            this.teamSearchText = '';

            teamsService.getAll().then(function(teams) {
                _this.teams = teams;
            });

            this.getMatchedTeams = function getMatchTeams(searchText) {
                if(!_this.teams) {
                    return [];
                }

                return _.filter(_this.teams, function doesMatchTeamText(team) {
                    return team.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                });
            };

            this.findPlayersOnTeam = function findPlayersOnTeam(team) {
                var _this = this;
                playersService.findByTeam(team.name).then(function(players) {
                    _this.players = players;
                });
            };

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
        });
})();
