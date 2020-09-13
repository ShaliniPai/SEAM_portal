
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'moment', 'dataservice', 'bootbox', 'ojs/ojchart', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojlabel', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, moment, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function doorCycDetDetContentViewModel(asset) {
        var self = this;
        self.asset = ko.observable(asset);
        self.chartReady = ko.observable(false);

        /*Group and Series values for Chart*/
        self.DoorCycleSeriesValue = ko.observableArray();
        self.energyGroupsDefault = ["Group A", "Group B", "Group C", "Group D"];
        self.energyGroupsValue = ko.observableArray([]);
        self.zoomAndScrollValue = ko.observable('live');
        self.scrollbarValue = ko.observable('on');
        self.zoomValue = ko.observable('live');
        self.resultTotalDays = ko.observable();
        self.stackValue = ko.observable('off');
        self.stackLabelValue = ko.observable('on');
        self.labelPosition = ko.observable('auto');

        var dateTimeConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME);
        var dateOptions = {day: '2-digit', month: 'short'};
        self.dayMonth = dateTimeConverter.createConverter(dateOptions);
        self.xAxisOptions = ko.observable({});
        //self.xAxisOptions({tickLabel: {converter: ko.toJS(self.dayMonth)}});

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

        self.yTitle = ko.observable('Door Cycles');
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

        /*Gets the Device ID*/
        self.device = ko.observable();
        self.nilmDevice = ko.observable('');
        self.mmuDevice = ko.observable('');
        self.devType = ko.observable('');

        asset.devices.forEach(function (device) {
            if (device.devType === 'NILM') {
                self.nilmDevice(device.devId);
            }

            if (device.devType === 'MMU') {
                self.mmuDevice(device.devId);
            }
        });

        if (self.mmuDevice()) {
            self.devType('mmu');
            self.device(self.mmuDevice());
        } else if (self.nilmDevice()) {
            self.devType('nilm');
            self.device(self.nilmDevice());
        }

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
            //console.log(self.start.unix(), self.end.unix());
        };

        // self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))

        self.hourly = ko.observable(false)
        self.timeAxisType = ko.observable('disabled')

        self.loadData = function () {
            self.chartReady(false)
            /*Charts Data*/
            self.totalDoorCycles = ko.observable(0);
            self.avgCyclesPerDay = ko.observable(0);
            self.totalDays = ko.observable(0);
            self.resultTotalDays = ko.observable(0);


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
            self.resultTotalDays = days;


            self.DoorCycleSeriesValue.removeAll();
            ds.getDoorCycleDetails(self.device(), self.start.valueOf(), self.end.valueOf(), self.devType())
                    .then(function (result) {
                        if (result.success) {
                            self.energyGroupsValue.removeAll();
                            let doorCycle = [];
                            var sumDC = 0;

                            //Seed Hourly X Axis with 24 values
                            if (self.hourly()) {
                                //console.log('Processing Hourly - Pushing X and Y values')
                                for (let i = 0; i < 24; i++) {
                                    self.energyGroupsValue.push(i);
                                    doorCycle.push({y: 0})
                                    self.xTitle('Hour (0-23)');
                                }
                            }

                            result.data.values.forEach(function (row) {

                                if (!self.hourly()) {
                                    self.energyGroupsValue.push(row.date);
                                    let record = {y: row.cycles};
                                    doorCycle.push(record);

                                } else {
                                    doorCycle[row._id.hh]['y'] = row.cycles;
                                }


                                /*Floors Travelled*/
                                sumDC = sumDC + row.cycles;
                                self.totalDoorCycles = sumDC;
                            })

                            /*Average Trips Per day*/
                            var resCyclesPerDay = self.totalDoorCycles / self.resultTotalDays;
                            resCyclesPerDay = Math.ceil(resCyclesPerDay);
                            self.avgCyclesPerDay = resCyclesPerDay;

                            if (isNaN(self.avgCyclesPerDay)) {
                                self.avgCyclesPerDay = 0;
                            }

                            //console.log("Cycles per day:" + self.avgCyclesPerDay);

                            self.DoorCycleSeriesValue.push({name: "Door Cycle", items: doorCycle})
                            self.chartReady(true);
                        }
                    })
                    .fail(function (err) {
                        console.log(err);
                        bootbox.alert('Error:' + err.responseText);
                    })
        }

        if (self.device()) {
            self.loadData();
        }
    }
    return doorCycDetDetContentViewModel;
});
