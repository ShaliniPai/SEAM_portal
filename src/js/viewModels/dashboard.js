/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * dashboard module
 */
define(['ojs/ojcore', 'knockout'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function dashboardContentViewModel() {
        var self = this;

        self.lastrefresh = ko.observable(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());


        self.intervalTimer;
        self.counter = 0;

        self.refreshDb = function () {
            self.counter++
            if (self.counter <= 15) {
                self.lastrefresh(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
            } else {
                clearInterval(self.intervalTimer);
            }
        };

        self.handleDetached = function (info) {
            console.log('Auto Refresh Cleared')
            clearInterval(self.intervalTimer);
        }

        self.handleActivated = function (info) {
            console.log('Auto Refresh Interval set to 1 Minute')
            self.intervalTimer = setInterval(self.refreshDb, 60000);
        }

        document.addEventListener("DOMContentLoaded", function (event) {
            document.getElementById('tenantSelect').disabled = false;
        });

        ko.computed(function () {
            self.refreshDb();
            $(document).ready(function () {
                console.log("ready!");
                document.getElementById('tenantSelect').disabled = false;
            });
        });
    }

    return dashboardContentViewModel;
});
