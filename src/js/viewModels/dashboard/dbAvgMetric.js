/**
 * dbMetric module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment', 'bootbox', 'ojs/ojgauge', 'ojs/ojchart'
], function (oj, ko, ds, moment, bootbox) {
    /**
     * The view model for the main content view template
     */
    function dbMetricContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.dbMetric = ko.observable();
        self.message = ko.observable();
        self.dataProvider = ko.observableArray([])

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.dbViewModel = ko.dataFor(document.getElementById('dashboard'));

        self.fromTs = moment().startOf('day').valueOf();
        self.toTs = new Date().getTime();

        self.loadData = function () {
            self.ready(false);
            ds.getDBAvgMetric(self.fromTs, self.toTs).
                then(function (result) {
                    if (result.success) {
                         //console.log(result.data);
                        /**To fetch current hours and minutes */
                        let avgActiveHours=result.data.activeHrs;
                        let avgPrevActiveHours=result.data.prevActiveHrs;
                        var d = new Date();
                        var currentHours = d.getHours();

                         /**To calculate Active, Idle and Remaining minutes */
                         let avgIdleHours;
                         if (currentHours > avgActiveHours) {
                             avgIdleHours = currentHours - avgActiveHours;
                         } else {
                             avgIdleHours = avgActiveHours - currentHours;
                         }
                         let avgRemainingHours = 24 - (avgActiveHours + avgIdleHours);

                        /**To fetch today's Active hours in HH h:MM m format */
                        var decimalTimeString = result.data.activeHrs;
                        var decimalTime = parseFloat(decimalTimeString);
                        decimalTime = decimalTime * 60 * 60;
                        var hours = Math.floor((decimalTime / (60 * 60)));
                        decimalTime = decimalTime - (hours * 60 * 60);
                        var minutes = Math.floor((decimalTime / 60));
                        result.data.activeHrs = Math.floor((parseFloat(avgActiveHours * 60 * 60) / (60 * 60))) + 'h ' + (minutes ? minutes : 0) + 'm';

                        /**To fetch yesterday's Active hours in HH h:MM m format */
                        var decimalTimeStringp = result.data.prevActiveHrs;
                        var decimalTimep = parseFloat(decimalTimeStringp);
                        decimalTimep = decimalTimep * 60 * 60;
                        var hoursp = Math.floor((decimalTimep / (60 * 60)));
                        decimalTimep = decimalTimep - (hoursp * 60 * 60);
                        var minutesp = Math.floor((decimalTimep / 60));
                        result.data.prevActiveHrs = Math.floor((parseFloat(avgPrevActiveHours * 60 * 60) / (60 * 60))) + 'h ' + (minutesp ? minutesp : 0) + 'm';
                        self.dbMetric(result.data);

                        /*Alert Pie chart Data  */
                        self.pieSeriesValue = ko.observableArray();
                        var pieGroups = ["Group A"];
                        self.pieGroupsValue = ko.observableArray(pieGroups);
                        self.innerRadius = ko.observable(0.7);
                        var converterFactory = oj.Validation.converterFactory('number');
                        var decimalConverter = converterFactory.createConverter({ style: "decimal", decimalFormat: "standard" });
                        self.numberConverter = ko.observable(decimalConverter);
                        self.effectValue = ko.observable('explode');
                        let alertprio=[];
                        alertprio.push({ name: "Active Hours", items: [{ value:avgActiveHours.toFixed(2)  , label:avgActiveHours.toFixed(2)}], color: "rgb(0, 166, 90)" })
                        alertprio.push({ name: "Idle Hours", items: [{ value: avgIdleHours.toFixed(2), label:avgIdleHours.toFixed(2)}], color: "rgb(255,211,0)" })
                        alertprio.push({ name: "Remaining Hours", items: [{ value: avgRemainingHours.toFixed(2), label:avgRemainingHours.toFixed(2)}], color: "rgb(200,200,200)" })
                        self.pieSeriesValue(alertprio);
                        self.ready(true);
                       
                    } else {
                        bootbox.alert('Unable to load Average metric. Try Again Later !!')
                        console.log(result.error);
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
