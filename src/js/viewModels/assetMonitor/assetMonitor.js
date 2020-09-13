/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * assetMonitor module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment'
], function (oj, ko, ds, moment) {
    /**
     * The view model for the main content view template
     */
    function assetMonitorContentViewModel() {
        var self = this;
        self.assetId = ko.observable(getQueryParam('assetId'));
        self.from = ko.observable(getQueryParam('from')) || 'monitor';
        self.message = ko.observable();
        self.ready = ko.observable(true);
        self.message = ko.observable();
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));

        document.getElementById('tenantSelect').disabled = true;
        self.lastrefresh = ko.observable(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString())

        self.refreshDb = function () {
            self.lastrefresh(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
            self.loadData();
        };

        self.asset = ko.observable({assetId: '1234', assetName: 'Kasturba Road SW 1', status: 'Active', 'floors': 1052, doorCycl: 922, energy: 256, activeHours: 102, alerts: 123, availability: 90});

        function getQueryParam(param) {
            location.search.substr(1)
                    .split("&")
                    .some(function (item) { // returns first occurence and stops
                        return item.split("=")[0] === param && (param = item.split("=")[1]);
                    });
            return param;
        }

        self.back = function () {
            history.pushState(null, '', 'index.html?root=monitor');
            oj.Router.sync();
        };

        self.maxChart = ko.observable(true);

        self.minimise = function () {
            self.maxChart(false)
        }

        self.maximise = function () {
            self.maxChart(true)
        }


        self.module = ko.observable();
        self.params = ko.observable();

        self.loadData = function () {
            self.ready(false);
            ds.getAssetDet(self.assetId()).
                    then(function (result) {
                        if (result.success) {
                            if (result.data.maintDt !== 'NA') {
                                result.data.maintDt = moment(parseInt(result.data.maintDt)).format('DD-MMM');
                            }

                            if (result.data.level) {
                                result.data.levelKeys = ''
                                result.data.levelVals = ''
                                for (let key in result.data.level) {
                                    if (result.data.level.hasOwnProperty(key)) {
                                        result.data.levelKeys = result.data.levelKeys + key + '/';
                                        result.data.levelVals = result.data.levelVals + result.data.level[key] + '/';
                                    }
                                }

                                //result.data.activeHrs = Math.ceil(((result.data.floors * 16) * 100 / 60 / 60) / 100);

                                result.data.activeHrs = Math.round(((result.data.activeHrs / 1000 / 60 / 60)));
                                result.data.levelKeys = result.data.levelKeys.slice(0, -1);
                                result.data.levelVals = result.data.levelVals.slice(0, -1);
                            }
                            if (result.data.level.Category === 'Single side') {
                                result.data.floors = 'NA';
                                result.data.doorCyc = 'NA';
                            }
                            self.asset(result.data);

                            if (result.data.level.Category === 'Single side') {
                                self.module('liftCharts/escStateDet');
                                console.log('Escalator');
                                var chartData = [
                                    {name: 'Usage', id: 'liftCharts/escStateDet', visible: true},
                                    {name: 'Energy', id: 'liftCharts/energyDet', visible: true},
                                    {name: 'Electrical Parameters', id: 'liftCharts/rawEnergyDet', visible: true},
                                    {name: 'Alerts', id: 'liftCharts/alerts', visible: true},
                                    {name: 'Lift Heartbeat', id: 'liftCharts/liftHeartBeat', visible: true}
                                ];
                            } else {
                                self.module('liftCharts/mileageDet');
                                console.log('Elevator');
                                var chartData = [
                                    {name: 'Floors', id: 'liftCharts/mileageDet', visible: true},
                                    {name: 'Door Cycle', id: 'liftCharts/doorCycleDet', visible: true},
                                    {name: 'Energy', id: 'liftCharts/energyDet', visible: true},
                                    {name: 'Electrical Parameters', id: 'liftCharts/rawEnergyDet', visible: true},
                                    {name: 'Alerts', id: 'liftCharts/alerts', visible: true},
                                    {name: 'Lift Heartbeat', id: 'liftCharts/liftHeartBeat', visible: true}
                                ];
                            }
                            self.chartDataSource = new oj.ArrayTableDataSource(chartData, {idAttribute: 'id'});
                            self.params(self.asset());
                        } else {
                            self.message(result.error);
                        }
                        self.ready(true);
                    })
        };

        self.loadData();
        self.selectedItem = ko.observable("dashboard");

    }

    return assetMonitorContentViewModel;
});
