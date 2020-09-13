/**
 * dbMetric module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'ojs/ojarraydataprovider', 'ojs/ojchart'
], function (oj, ko, ds, ArrayDataProvider) {
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

        self.innerRadius = ko.observable(0.8);
        self.centerLabel = ko.observable('2/5 Online');
        self.labelStyle = ko.observable({fontSize: '18px', color: '#999999'});

        self.chartData = ko.observableArray([{
                "id": 'on',
                "series": "Online",
                "value": 0,
                "color": "green",
                "label": "0 Online"
            },
            {
                "id": "off",
                "series": "Offline",
                "value": 0,
                "color": "red",
                "label": "0 Offline"
            }]);

        self.dataProvider = new ArrayDataProvider(self.chartData, {keyAttributes: 'id'});

        self.loadData = function () {
            self.ready(false);
            ds.getDBMetric().
                    then(function (result) {
                        if (result.success) {
                            self.dbMetric(result.data);
                            self.chartData()[0].value = result.data.assetAlive;
                            self.chartData()[0].label = result.data.assetAlive + ' Online';

                            self.chartData()[1].value = result.data.assetCount - result.data.assetAlive;
                            self.chartData()[1].label = result.data.assetCount - result.data.assetAlive + ' Offline';
                            self.dataProvider = new ArrayDataProvider(self.chartData, {keyAttributes: 'id'});

                            self.centerLabel = ko.observable(result.data.assetAlive + '/' + result.data.assetCount + ' Online');


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
