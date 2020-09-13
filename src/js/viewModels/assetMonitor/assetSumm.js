/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * assetSumm module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment'
], function (oj, ko, ds, moment) {
    /**
     * The view model for the main content view template
     */
    function assetSummContentViewModel() {
        var self = this;
        self.liftsFiltered = ko.observableArray();
        self.message = ko.observable();

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.monViewModel = ko.dataFor(document.getElementById('monitor'));

        self.assetArr = ko.observableArray([]);
        self.ready = ko.observable();
        document.getElementById('tenantSelect').disabled = false;

        self.filter = [];


        self.router = oj.Router.rootInstance;
        self.loadDetail = function (data) {
            history.pushState(null, '', 'index.html?root=assetMonitor&assetId=' + data.assetId + '&from=monitor');
            oj.Router.sync();
        };

        self.loadData = function () {
            self.ready(false);
            ds.getDBAssets().
                    then(function (result) {
                        if (result.success) {
                            self.assetArr.removeAll();
                            self.assetArr(result.data);
                            self.assetArr().forEach(function (asset) {
                                asset.activeHrs = Math.round(((asset.activeHrs / 1000 / 60 / 60)));
                                if (asset.category === 'Single side') {
//                                asset.activeHrs=Math.ceil(((asset.floors*16)*100/60/60)/100);
//                                    asset.activeHrs = Math.ceil(((asset.activeHrs / 1000 / 60 / 60)));
                                    asset.floors = 'NA';
                                    asset.doorCyc = 'NA';
                                }
                            });
                            self.assetArr().forEach(function (asset) {
                                if (asset.maintDt !== 'NA') {
                                    asset.maintDt = moment(parseInt(asset.maintDt)).format('DD-MMM');
                                }
                            })

                            self.filterAssets();

                        } else {
                            self.message(result.error);
                        }
                        self.ready(true);
                    })
        };

        self.filterAssets = function () {
            self.liftsFiltered.removeAll();
            self.assetArr().forEach(function (asset) {
                if (self.filter.indexOf(asset.assetId) >= 0) {
                    self.liftsFiltered.push(asset);
                }
            })

        }

        self.rootViewModel.tenantId.subscribe(function (newValue) {
            self.loadData();
        });

        self.monViewModel.lastrefresh.subscribe(function (newValue) {
            self.loadData();
        });

        self.rootViewModel.assetArray.subscribe(function (newValue) {
            self.filter = newValue;
            self.filterAssets();
        });

        self.loadData();
    }
    return assetSummContentViewModel;
});
