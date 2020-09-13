
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment', 'bootbox', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', "daterangepicker", 'bootstrap-datepicker', 'ojs/ojchart'
], function (oj, ko, ds, moment, bootbox) {
    /**
     * The view model for the main content view template
     */
    function rawEnergyDetContentViewModel(asset) {
        var self = this;
        self.asset = ko.observable(asset);
        self.chartReady = ko.observable(false);
        self.chartReadyDG = ko.observable(false);
        /*Group and Series values for Chart*/
        self.energySeriesValue = ko.observableArray();
        self.energyGroupsDefault = ["Group A", "Group B", "Group C", "Group D"];
        self.energyGroupsValue = ko.observableArray([]);

        /*Chart Parameters are set*/
        self.stackValue = ko.observable('on');
        self.stackLabelValue = ko.observable('on');
        self.labelPosition = ko.observable('auto');
        self.orientationValue = ko.observable('vertical');
        self.zoomAndScrollValue = ko.observable('live');
        self.scrollbarValue = ko.observable('on');
        self.zoomValue = ko.observable('live');

        /*Tooltips value format*/
        self.groupOption = ko.observable("Timestamp");
        self.seriesOption = ko.observable("");
        self.seriesDisplay = ko.observableArray(["auto"]);
        self.groupDisplay = ko.observableArray(["auto"]);

        self.tooltipDisplaySeries = ko.pureComputed(function () {
            return self.seriesDisplay().length > 0 ? "off" : "auto";
        });

        self.tooltipDisplayGroup = ko.pureComputed(function () {
            return self.groupDisplay().length > 0 ? "auto" : "off";
        });

        self.yTitle = ko.observable('Energy (kWh)');
        self.yAxis = ko.pureComputed(function () {
            return {
                title: self.yTitle()
            };
        });

        self.xTitle = ko.observable('Date');
        self.xAxis = ko.pureComputed(function () {
            return {
                title: self.xTitle()
            };
        });


        var dateTimeConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME);
        var dateOptions = {day: '2-digit', month: 'short'};
        self.dayMonth = dateTimeConverter.createConverter(dateOptions);
        self.xAxisOptions = ko.observable({});
        //self.xAxisOptions({tickLabel: {converter: ko.toJS(self.dayMonth)}});

        /*Gets the Device ID*/
        self.device = ko.observable();
        asset.devices.forEach(function (device) {
            if (device.devType === 'NILM') {
                self.device(device.devId);
            }
        })

        /*Date Attributes */
        self.start = moment().startOf("day");
        self.end = moment().endOf("day");
        self.dateText = ko.observable();
        self.handleAttached = function () {
            $("#reportrange").daterangepicker({startDate: self.start,
                endDate: self.end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, self.datePicked);
        };

        //  $('#reportrange span').html(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'));

        self.datePicked = function (start, end) {
            // console.log(moment(start).unix(), moment(end).unix());
            self.start = start;
            self.end = end;
            self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
            //console.log(self.start.utc().toString(),self.end.utc().toString());
        };

        // self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))

        self.hourly = ko.observable(false)
        self.timeAxisType = ko.observable('disabled')

        self.loadData = function () {
            self.chartReady(false)
            /*Charts Data*/
            self.totalMainsEnergy = ko.observable(0);
            self.totalDGEnergy = ko.observable(0);
            self.avgEnergyPerDay = ko.observable(0);
            self.totalDays = ko.observable();

            if (self.end - self.start > 86399999) {
                self.xAxisOptions({tickLabel: {converter: ko.toJS(self.dayMonth)}});
                self.hourly(false);
                self.xTitle('Date');
                self.timeAxisType = ko.observable('enabled')

            } else {
                self.xAxisOptions({});
                self.hourly(true);
                self.xTitle('Hour (0-23)');
                self.timeAxisType = ko.observable('disabled')
            }

            /*Total Days*/
            self.totalDays = self.end - self.start;
            var duration = moment.duration(self.totalDays, 'milliseconds');
            var days = duration.asDays();
            days = Math.ceil(days);
            self.resultTotalDays = ko.observable(days);


            self.energySeriesValue.removeAll();
            ds.getEnergyDetails(self.device(), self.start, self.end)
                    .then(function (result) {
                        if (result.success) {
                            self.energyGroupsValue.removeAll();
                            let mainItems = [];
                            let dgItems = [];

                            //Seed Hourly X Axis with 24 values
                            if (self.hourly()) {
                                //console.log('Processing Hourly - Pushing X and Y values')
                                for (let i = 0; i < 24; i++) {
                                    self.energyGroupsValue.push(i);
                                    mainItems.push({y: 0})
                                    dgItems.push({y: 0})
                                    self.xTitle('Hour (0-23)');
                                    self.timeAxisType = ko.observable('disabled')
                                }
                            } else {
                                self.timeAxisType = ko.observable('enabled')
                            }

                            result.data.forEach(function (row) {

                                let main = 0;
                                let dg = 0;


                                if (!self.hourly()) {
                                    self.energyGroupsValue.push(row._id.date);
                                    row.values.forEach(function (src) {
                                        if (src.src === 0) {
                                            dg = src.energy;
                                            self.totalDGEnergy(self.totalDGEnergy() + dg);
                                        } else {
                                            main = src.energy;
                                            self.totalMainsEnergy(self.totalMainsEnergy() + main);
                                        }
                                    });
                                    mainItems.push({y: main});
                                    dgItems.push({y: dg});


                                } else {
                                    row.values.forEach(function (src) {
                                        if (src.src === 0) {
                                            dg = src.energy;
                                            self.totalDGEnergy(self.totalDGEnergy() + dg);
                                        } else {
                                            main = src.energy;
                                            self.totalMainsEnergy(self.totalMainsEnergy() + main);
                                        }
                                    });

                                    mainItems[row._id.dateObj.hh]['y'] = main;
                                    dgItems[row._id.dateObj.hh]['y'] = dg;
                                }

                            })
                            /*Average Energy Per day*/

                            self.totalMainsEnergy(Math.round(self.totalMainsEnergy()));
                            self.totalDGEnergy(Math.round(self.totalDGEnergy()));

                            var resEnergyPerDay = self.totalMainsEnergy() / self.resultTotalDays();
                            resEnergyPerDay = Math.ceil(resEnergyPerDay);
                            self.avgEnergyPerDay(resEnergyPerDay);

                            if (self.totalDGEnergy() <= '0') {
                                self.stackValue = ko.observable('off');
                                self.energySeriesValue.push({name: "Mains", items: mainItems})
                                self.chartReady(true);
                            } else {
                                self.stackValue('on');
                                self.energySeriesValue.push({name: "Mains", items: mainItems})
                                self.energySeriesValue.push({name: "DG", items: dgItems})
                                self.chartReady(true);
                            }
                        }
                    })
                    .fail(function (err) {
                        console.log(err);
                        //bootbox.alert('Error:' + err.responseText);                       
                        self.chartReady(true);
                    })
        }

        if (self.device()) {
            self.loadData();
        }
    }
    return rawEnergyDetContentViewModel;
});
