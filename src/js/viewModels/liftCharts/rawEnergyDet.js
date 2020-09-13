
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment', 'bootbox', 'ojs/ojchart', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, ds, moment, bootbox) {
    /**
     * The view model for the main content view template
     */
    function maintenanceDetContentViewModel(asset) {
        var self = this;
        self.asset = ko.observable(asset);
        self.chartReady = ko.observable(false);
        self.lineSeriesValue = ko.observableArray();
        self.timeAxisTypeValue = ko.observable('enabled');
        var regularGroups = ["Group A", "Group B", "Group C", "Group D"];
        self.MileageReady = ko.observable(true);
        self.regularGroupsValue = ko.observableArray(regularGroups);
        self.selectedAttr = ko.observable("cur");
        self.resultTotalDays=ko.observable();
        self.attributeValueOptions = ko.observable({"vlt": "Voltage (Volts)", "cur": "Current (Amps)", "frq": "Frequency (Hz)", "pf": "Power Factor", "pd": "Power Demand (Watt)", "rxp": "Reactive power (KVAR)", "thd": "THD Voltage	Total Harmonic Distortion"})
        
          /*Tooltips value format*/
        self.groupOption = ko.observable("Timestamp");
        self.seriesOption = ko.observable("");
        self.seriesDisplay = ko.observableArray(["auto"]);
        self.groupDisplay = ko.observableArray(["auto"]);
        
        self.tooltipDisplaySeries = ko.pureComputed(function() {
          return self.seriesDisplay().length > 0 ? "off" : "auto";
        });

        self.tooltipDisplayGroup = ko.pureComputed(function() {
          return self.groupDisplay().length > 0 ? "auto" : "off";
        });
        
        
        self.yTitle = ko.observable('Raw Energy Value');
        self.yAxis = ko.pureComputed(function () {
            return {
                title: self.attributeValueOptions()[self.selectedAttr()]
            };
        });

        self.xTitle = ko.observable('Date-Time');
        self.xAxis = ko.pureComputed(function () {
            return {

                title: self.xTitle(),
                axisLine: {                   
                    lineWidth: 3
                }
            };
        });
    
//        self.axisLine = ko.pureComputed(function () {
//            return {
//                lineWidth: 2
//            }
//        });


        self.attributeOptions = ko.observableArray([{"value": "vlt", "label": "Voltage"}, {"value": "cur", "label": "Current"},
            {"value": "frq", "label": "Frequency"}, {"value": "pf", "label": "Power Factor"}, {"value": "pd", "label": "Power Demand"},
            {"value": "rxp", "label": "Reactive Power"}, {"value": "thd", "label": "THD Voltage"}]);


        /*Gets the Device ID*/
        self.device = ko.observable();
        asset.devices.forEach(function (device) {
            if (device.devType === 'NILM') {
                self.device(device.devId);
            }
        })


        var dateTimeConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME);
        var dateOptions = {day: 'numeric', month: 'numeric'};
        self.dayMonth = dateTimeConverter.createConverter(dateOptions);
        var dateOptions2 = {year: 'numeric'};
        self.year = dateTimeConverter.createConverter(dateOptions2);
        var dateOptions3 = {year: '2-digit', month: 'numeric', day: 'nujmeric'};
        self.dayMonthYear = dateTimeConverter.createConverter(dateOptions3);

        self.xAxisOptions1 = ko.observable({});

        self.updateData = function (event) {
            if (event.detail.value === "apply") {
                self.xAxisOptions1({tickLabel: {converter: [ko.toJS(self.dayMonth), ko.toJS(self.year)]}});
            } else {
                self.xAxisOptions1({});
            }
        };

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
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()]
                }
            }, self.datePicked);
        };

        self.datePicked = function (start, end) {
            self.start = start;
            self.end = end;
            self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
        };


        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))

        self.loadData = function () {
            self.chartReady(false);
            self.lineSeriesValue.removeAll();
            self.totalDays = self.end - self.start;
            var duration = moment.duration(self.totalDays, 'milliseconds');
            var days = duration.asDays();
            days = Math.ceil(days);
            self.resultTotalDays(days);


            /*Total Days*/


            let r = {name: "R-Phase", items: [], color: "#E20015", lineWidth: 1.5};
            let y = {name: "Y-Phase", items: [], color: "#F8BD19", lineWidth: 1.5};
            let b = {name: "B-Phase", items: [], color: "#22A4FF", lineWidth: 1.5};


            ds.getRawEnergyDetails(self.device(), self.start, self.end, self.selectedAttr())
                    .then(function (result) {
                        if ((self.end - self.start) <= 604800000) {
                            result.data.values.forEach(function (row) {
                                r.items.push({x: row.ts, y: row.r});
                                y.items.push({x: row.ts, y: row.y});
                                b.items.push({x: row.ts, y: row.b});
                            });

                            self.lineSeriesValue.push(r);
                            self.lineSeriesValue.push(y);
                            self.lineSeriesValue.push(b);
                            //console.log(self.lineSeriesValue());
                            self.chartReady(true);
                        } else {                          
                           bootbox.alert("Select less than or equal to 7 days !!!");
                           self.chartReady(true);
                        }
                    })
                    .fail(function (err) {
                        console.log(err);
                        //bootbox.alert('Error:' + err.responseText);    
                        self.chartReady(true);
                    });
        }
        self.loadData();


        self.zoomAndScrollValue = ko.observable('live');
        self.overviewValue = ko.observable('on');

        self.scrollbarValue = ko.observable('on');

        self.zoomValue = ko.observable('live');

    }

    return maintenanceDetContentViewModel;
});
