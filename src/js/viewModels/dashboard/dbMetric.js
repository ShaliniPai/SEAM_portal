/**
 * dbMetric module
 */
define(['ojs/ojcore', 'knockout', 'dataservice'
], function (oj, ko, ds) {
    /**
     * The view model for the main content view template
     */
    function dbMetricContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.dbMetric = ko.observable();
        self.message = ko.observable();
        
        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.dbViewModel = ko.dataFor(document.getElementById('dashboard'));

        self.loadData = function () {
            self.ready(false);
            ds.getDBMetric().
                    then(function (result) {
                        if (result.success) {
                            self.dbMetric(result.data);
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

    return dbMetricContentViewModel;
});
