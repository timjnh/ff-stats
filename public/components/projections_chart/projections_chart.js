(function() {
    'use strict';

    angular.module('myApp.projectionsChart', ['chart.js', 'myApp.projectionsService', 'myApp.chartControlsService'])
        .directive('projectionsChart', [function() {
            return {
                restrict: 'A',
                templateUrl: 'components/projections_chart/projections_chart.html',
                controllerAs: 'projectionsChartController',
                controller: 'projectionsChartController'
            };
        }])
        .controller('projectionsChartController', function($scope, projectionsService, chartControlsService, $timeout) {
            var _this = this;

            this.series = ['Projected', 'Actual'];
            this.labels = [];
            this.data = [[], []];

            this.title = 'Select a player';
            this.isLoading = false;

            this.onChangeTimeout = null;

            this.hasData = function hasData() {
                return _this.labels.length > 0;
            };

            chartControlsService.onChange(function doChartUpdate() {
                cancelOnChangeTimeout();

                _this.labels = [];
                _this.data = [[], []];

                if(!chartControlsService.hasValidPlayer()) {
                    return;
                }

                if(!chartControlsService.hasSelectedInputs()) {
                    return;
                }

                _this.onChangeTimeout = $timeout(function beginChartUpdate() {
                    cancelOnChangeTimeout();
                    updateChart();
                }, 1000);
            });

            function updateChart() {
                _this.title = chartControlsService.player.name + ' - ' + chartControlsService.player.team;
                _this.isLoading = true;

                _this.labels = [];
                _this.data = [[], []];

                projectionsService.getProjectionsForAllGames(chartControlsService.player, chartControlsService.getSelectedInputs(), chartControlsService.networkStrategy)
                    .then(function assembleChartData(projections) {
                        _this.isLoading = false;

                        _this.labels = [];
                        _this.data = [[], []];

                        projections.forEach(function addProjectionToChartData(projection) {
                            if(projection.projected !== undefined) {
                                _this.labels.push('Week ' + projection.game.week + ', ' + projection.game.year);
                                _this.data[0].push(Math.round(projection.projected * 10) / 10);
                                _this.data[1].push(projection.actual === undefined ? null : projection.actual);
                            }
                        });
                    });
            }

            function cancelOnChangeTimeout() {
                if(_this.onChangeTimeout) {
                    $timeout.cancel(_this.onChangeTimeout);
                    _this.onChangeTimeout = null;
                }
            }
        });
})();
