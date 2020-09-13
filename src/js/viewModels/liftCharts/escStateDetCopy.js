
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'moment', 'dataservice', 'bootbox', 'ojs/ojchart', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, moment, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function escStateDetContentViewModel(asset) {
        var self = this;
        self.asset = ko.observable(asset);
        self.chartReady = ko.observable(false);
        self.message = ko.observable();


        /*Group and Series values for Chart*/
        self.mileageSeriesValue = ko.observableArray();
        self.energyGroupsDefault = ["Group A", "Group B", "Group C", "Group D"];
        self.energyGroupsValue = ko.observableArray([]);

        /*Chart Parameters are set*/
        self.timeAxisTypeValue = ko.observable('enabled');
        self.zoomAndScrollValue = ko.observable('live');
        self.scrollbarValue = ko.observable('on');
        self.zoomValue = ko.observable('live');
        self.stackValue = ko.observable('on');
        self.stackLabelValue = ko.observable('off');
        self.labelPosition = ko.observable('belowMarker');

        /*Tooltips value format*/
        self.groupOption = ko.observable("Timestamp");
        self.seriesOption = ko.observable("Series");
        self.seriesDisplay = ko.observableArray(["auto"]);
        self.groupDisplay = ko.observableArray(["auto"]);

        self.tooltipDisplaySeries = ko.pureComputed(function () {
            return self.seriesDisplay().length > 0 ? "auto" : "off";
        });

        self.tooltipDisplayGroup = ko.pureComputed(function () {
            return self.groupDisplay().length > 0 ? "auto" : "off";
        });


        self.yTitle = ko.observable('Minutes');

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
        };
        // self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))

        self.hourly = ko.observable(false)
        self.timeAxisType = ko.observable('disabled')

        self.loadData = function () {
            self.chartReady(false)
            /*Charts Data*/

            self.sumAct = ko.observable(0);
            self.sumSlow = ko.observable(0);
            self.sumIdle = ko.observable(0);
            self.sumOff = ko.observable(0);
            self.resultTotalDays = ko.observable(0);


            if (self.end - self.start > 86399999) {
                self.xAxisOptions({tickLabel: {converter: ko.toJS(self.dayMonth)}});
                self.hourly(false);
                self.xTitle('Date');
                self.yTitle('Hours');
                self.timeAxisType = ko.observable('enabled')

            } else {
                self.xAxisOptions({});
                self.hourly(true);
                self.xTitle('Hour (0-23)');
                self.yTitle('Minutes');
                self.timeAxisType = ko.observable('disabled')

            }

            /*Total Days*/
            self.totalDays = self.end - self.start;
            var duration = moment.duration(self.totalDays, 'milliseconds');
            var days = duration.asDays();
            days = Math.ceil(days);
            self.resultTotalDays(days);
            self.mileageSeriesValue.removeAll();
            ds.getEscStateDetails(self.device(), self.start.valueOf(), self.end.valueOf(), self.devType())
                    .then(function (result) {
                        if (result.success) {
                            self.energyGroupsValue.removeAll();
                            let stateAct = [];
                            let stateSlow = [];
                            let stateIdle = [];
                            let stateOff = [];
                            let stateUk = [];

                            var sumAct = 0;
                            var sumSlow = 0;
                            var sumIdle = 0;
                            var sumOff = 0;

                            //Seed Hourly X Axis with 24 values
                            if (self.hourly()) {
                                //console.log('Processing Hourly - Pushing X and Y values')
                                for (let i = 0; i < 24; i++) {
                                    self.energyGroupsValue.push(i);
                                    stateAct.push({y: 0})
                                    stateSlow.push({y: 0})
                                    stateIdle.push({y: 0})
                                    stateOff.push({y: 0})
                                    stateUk.push({y: 0})

                                    self.xTitle('Hour (0-23)');
                                    self.timeAxisType = ko.observable('disabled')
                                }
                            } else {
                                self.timeAxisType = ko.observable('enabled')
                            }

                            result.data.values.forEach(function (row) {

                                if (!self.hourly()) {
                                    self.energyGroupsValue.push(row.date);

                                    stateUk.push({y: row['0']});
                                    stateAct.push({y: row['1']});
                                    stateSlow.push({y: row['2']});
                                    stateIdle.push({y: row['3']});
                                    stateOff.push({y: row['4']});

                                } else {

                                    let totMins = 0;
                                    totMins = row['0'] + row['1'] + row['2'] + row['3'] + row['4']
                                    if (totMins > 60) {
                                        let diff = totMins - 60;
                                        if (row['4'] > diff) {
                                            row['4'] = row['4'] - diff;
                                        } else if (row['3'] > diff) {
                                            row['3'] = row['3'] - diff;
                                        } else if (row['2'] > diff) {
                                            row['2'] = row['2'] - diff;
                                        } else if (row['1'] > diff) {
                                            row['1'] = row['1'] - diff;
                                        }
                                    }


                                    stateUk[new Date(row.date).getHours()]['y'] = row['0'];
                                    stateAct[new Date(row.date).getHours()]['y'] = row['1'];
                                    stateSlow[new Date(row.date).getHours()]['y'] = row['2'];
                                    stateIdle[new Date(row.date).getHours()]['y'] = row['3'];
                                    stateOff[new Date(row.date).getHours()]['y'] = row['4'];
                                }

                                /*Summary Metrics*/
                                sumAct += row['1'];
                                sumSlow += row['2'];
                                sumIdle += row['3'];
                                sumOff += row['4'];

                            })

                            //Convert to Hours if measuring it in minutes.
                            if (self.hourly()) {
                                sumAct = Math.round(sumAct * 10 / 60) / 10
                                sumSlow = Math.round(sumSlow * 10 / 60) / 10
                                sumIdle = Math.round(sumIdle * 10 / 60) / 10
                                sumOff = Math.round(sumOff * 10 / 60) / 10
                            } else {
                                sumAct = Math.round(sumAct * 10) / 10
                                sumSlow = Math.round(sumSlow * 10) / 10
                                sumIdle = Math.round(sumIdle * 10) / 10
                                sumOff = Math.round(sumOff * 10) / 10
                            }

                            self.sumAct(sumAct)
                            self.sumSlow(sumSlow)
                            self.sumIdle(sumIdle)
                            self.sumOff(sumOff)


                            /*Average Trips Per day*/
//                            var resTripsPerDay = self.totalFloorsTravelled / self.resultTotalDays();
//                            resTripsPerDay = Math.ceil(resTripsPerDay);

//                            self.avgTripsPerDay(resTripsPerDay);

                            self.mileageSeriesValue.push({name: "Active", items: stateAct})
                            self.mileageSeriesValue.push({name: "Slow", items: stateSlow})
                            self.mileageSeriesValue.push({name: "Idle", items: stateIdle})
                            self.mileageSeriesValue.push({name: "Off", items: stateOff})

                            self.chartReady(true);
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
        } else {
            self.message('No Device Assigned for this Asset')
        }
    }

    return escStateDetContentViewModel;
});
