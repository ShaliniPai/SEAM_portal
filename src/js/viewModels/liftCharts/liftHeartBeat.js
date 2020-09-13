
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment', 'bootbox', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', "daterangepicker", 'bootstrap-datepicker', 'ojs/ojchart'
], function (oj, ko, ds, moment, bootbox) {
    /**
     * The view model for the main content view template
     */
    function liftHeartBeatContentViewModel(asset) {
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

        self.yTitle = ko.observable('Message Received');
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
        self.end = moment();
        self.dateText = ko.observable();
        self.handleAttached = function () {
            $("#reportrange").daterangepicker({
                startDate: self.start,
                endDate: self.end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')]
                }
            }, self.datePicked);
        };

        //  $('#reportrange span').html(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'));

        self.datePicked = function (start, end) {
            // console.log(moment(start).unix(), moment(end).unix());
            self.start = start;
            self.end = end.isAfter(new moment()) ? new moment() : end;

            self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'));
            //console.log(self.start.utc().toString(),self.end.utc().toString());
        };

        // self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))

        self.hourly = ko.observable(false)
        self.timeAxisType = ko.observable('enabled')

        self.loadData = function () {
            self.chartReady(false);
            /*Charts Data*/

            //console.log(self.end - self.start);
            if (self.end - self.start > 86400000) {
                bootbox.alert('Heart beat can only be fetched for a day. Please select the filter appropriately');
                self.chartReady(true);
                return;

            } else {
                self.xAxisOptions({});
                self.hourly(true);
                self.xTitle('Time (5 Minute Interval)');
                self.timeAxisType = ko.observable('enabled')
            }

            self.energySeriesValue.removeAll();
            ds.getLiftHeartBeat(self.device(), self.start, self.end)
                    .then(function (result) {
                        if (result.success) {
                            self.energyGroupsValue.removeAll();
                            let mainItems = [];

                            //Seed Hourly X Axis with 15 minute values
                            if (self.hourly()) {
                                //console.log('Processing Daily - Pushing X and Y values')
                                for (let i = self.start; i < self.end + 1; i = i + 300000) {
                                    self.energyGroupsValue.push(new Date(i).toISOString());
                                    mainItems.push({y: 0, color: 'red'})
                                    self.xTitle('Time (5 Minute Interval)');
                                    self.timeAxisType = ko.observable('enabled')
                                }
                            }

                            var coeff = 1000 * 60 * 5; //5 minute intervals

                            result.data.forEach(function (row) {
                                //Seed Hourly X Axis with 15 minute values       
                                let dtLkp = new Date(Math.round(new Date(row['date']).getTime() / coeff) * coeff).toISOString();
                                let index = self.energyGroupsValue.indexOf(dtLkp);
                                //console.log(row['_id']['date'], '==>', dtLkp, index);
                                if (index >= 0) {
                                    mainItems[index]['y'] = 1;
                                    mainItems[index]['color'] = 'green';
                                }else{
                                    console.log(dtLkp + ' Incorrect for the selected Scope')
                                }

                            });
                            self.chartReady(true);

                            self.energySeriesValue.push({name: "Lift Heart Beat", markerDisplayed: "on", color:"green", items: mainItems});
                        }
                    })
                    .fail(function (err) {
                        console.log(err);
                        bootbox.alert('Unable to load the data. Try Again later !!!');
                        self.chartReady(true);
                    })
        }

        if (self.device()) {
            self.loadData();
        }
    }
    return liftHeartBeatContentViewModel;
});
