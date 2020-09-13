/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * assetDetDb module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'moment', 'dataservice', 'datatables', 'datatables.net', "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, $, moment, ds) {
    /**
     * The view model for the main content view template
     */
    function assetDetDbContentViewModel() {
        var self = this;
        self.alertArr = ko.observableArray([]);
        self.ready = ko.observable(true)
        self.message = ko.observable();

        //Loading Data
        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.dbViewModel = ko.dataFor(document.getElementById('dashboard'));

        self.loadData = function () {
            self.ready(false);
            ds.getAlertList({}, 0, 5).
                    then(function (result) {
                        if (result.success) {
                            self.alertArr.removeAll();
                            result.data.forEach(function(row){
                                row.createdAt = moment(new Date(row.ts)).format('DD/MMM hh:mm A');
                                row.prio = row.prio.toUpperCase();
                                row['assetName'] = row.assetName || row.assetId;
                            })
                            self.alertArr(result.data);
                        } else {
                            self.message(result.error);
                        }
                        self.ready(true);
                    });
        };

        self.rootViewModel.tenantId.subscribe(function (newValue) {
            self.loadData();
        });


        self.dbViewModel.lastrefresh.subscribe(function (newValue) {
            self.loadData();
        });

        self.loadData();
    }

    return assetDetDbContentViewModel;
});
