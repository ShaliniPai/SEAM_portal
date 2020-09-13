/**
 * dbMetric module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'ojs/ojarraydataprovider', 'ojs/ojchart', 'ojs/ojlegend','ojs/ojvalidation-base','ojs/ojvalidation-number'
], function (oj, ko, ds, ArrayDataProvider ) {
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
        self.labelStyle = ko.observable({ fontSize: '18px', color: '#999999' }); 


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

        var converterFactory = oj.Validation.converterFactory('number');
        var decimalConverter = converterFactory.createConverter({ minimumFractionDigits: 0, maximumFractionDigits: 0 });
        self.numberConverter = ko.observable(decimalConverter);
        self.dataProvider = new ArrayDataProvider(self.chartData, { keyAttributes: 'id' });

        self.loadData = function () {
            self.ready(false);
            ds.getDBOnlineStat().
                then(function (result) {
                    if (result.success) {
                        self.dbMetric(result.data);
                        self.chartData()[0].value = result.data.assetAlive;
                        self.chartData()[0].label = result.data.assetAlive + '';

                        self.chartData()[1].value = result.data.assetCount - result.data.assetAlive;
                        self.chartData()[1].label = result.data.assetCount - result.data.assetAlive + '';
                        self.dataProvider = new ArrayDataProvider(self.chartData, { keyAttributes: 'id' });
                        self.centerLabel = ko.observable(result.data.assetAlive + '/' + result.data.assetCount + ' Online');


                    } else {
                        self.message(result.error);
                    }
                    self.ready(true);
                });
        };

        var status = [{ status: "Online", color: 'green' }, { status: "Offline", color: "red" }];
        self.legendDP = new ArrayDataProvider(status, { keyAttributes: 'status' });


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
