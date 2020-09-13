/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * monitor module
 */
define(['ojs/ojcore', 'knockout', 'moment'
], function (oj, ko, moment) {
    /**
     * The view model for the main content view template
     */
    function monitorContentViewModel() {
        var self = this;

        self.lastrefresh = ko.observable(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());

        self.refreshDb = function () {
            self.lastrefresh(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
        };

        self.assetArray = ko.observableArray([]);

        self.cache = ko.observable();

    }

    return monitorContentViewModel;
});
