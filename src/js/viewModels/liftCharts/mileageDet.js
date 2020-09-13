
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'moment', 'dataservice', 'bootbox', 'ojs/ojchart', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, moment, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function mileageDetContentViewModel(asset) {
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
        self.stackValue = ko.observable('off');
        self.stackLabelValue = ko.observable('on');
        self.labelPosition = ko.observable('auto');

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


        self.yTitle = ko.observable('Floors / Trips');

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
            self.totalFloorsStopped = ko.observable(0);
            self.totalFloorsTravelled = ko.observable(0);
            self.avgTripsPerDay = ko.observable(0);
            self.totalTrips = ko.observable(0);
            self.totalDays = ko.observable();
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
            self.resultTotalDays = ko.observable(days);
            self.mileageSeriesValue.removeAll();
            ds.getMileageDetails(self.device(), self.start.valueOf(), self.end.valueOf(), self.devType())
                    .then(function (result) {
                        if (result.success) {
                            self.energyGroupsValue.removeAll();
                            let floorsTravelled = [];
                            let floorsStopped = [];
                            var sumFT = 0;
                            var sumTS = 0;

                            //Seed Hourly X Axis with 24 values
                            if (self.hourly()) {
                                //console.log('Processing Hourly - Pushing X and Y values')
                                for (let i = 0; i < 24; i++) {
                                    self.energyGroupsValue.push(i);
                                    floorsTravelled.push({y: 0})
                                    floorsStopped.push({y: 0})
                                    self.xTitle('Hour (0-23)');
                                    self.timeAxisType = ko.observable('disabled')
                                }
                            }else{
                                self.timeAxisType = ko.observable('enabled')
                            }

                            result.data.values.forEach(function (row) {
                                if (!self.hourly()) {
                                    self.energyGroupsValue.push(row.date);
                                    let record = {y: row.mileage};
                                    floorsTravelled.push(record);
                                    record = {y: row.stops};
                                    floorsStopped.push(record);
                                    
                                } else {
                                    floorsTravelled[row._id.hh]['y'] = row.mileage;
                                    floorsStopped[row._id.hh]['y'] = row.stops;                                    
                                }

                                /*Floors Travelled*/
                                sumFT = sumFT + row.mileage;
                                self.totalFloorsTravelled = sumFT;

                                /*Floors Stopped*/
                                sumTS = sumTS + row.stops;
                               // console.log(sumTS);
                                self.totalFloorsStopped = sumTS;

                                /*Total Trips*/
                                self.totalTrips = self.totalFloorsStopped;
                            })

                            /*Average Trips Per day*/
                            var resTripsPerDay = self.totalFloorsTravelled / self.resultTotalDays();
                            resTripsPerDay = Math.ceil(resTripsPerDay);
                            
                            if(isNaN(resTripsPerDay)){
                                resTripsPerDay = 0;
                            }
                            self.avgTripsPerDay(resTripsPerDay);

                            self.mileageSeriesValue.push({name: "Floors Travelled", items: floorsTravelled})
                            self.mileageSeriesValue.push({name: "Number of Trips", items: floorsStopped})

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

    return mileageDetContentViewModel;
});
