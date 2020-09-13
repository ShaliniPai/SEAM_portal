/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * alert module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'moment', 'ojs/ojselectcombobox', 'ojs/ojcheckboxset', 'ojs/ojlabel', 'ojs/ojtreeview', 'ojs/ojjsontreedatasource', "daterangepicker", 'bootstrap-datepicker', 'ojs/ojtimezonedata', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', 'ojs/ojvalidationgroup', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojinputnumber', 'ojs/ojswitch'
], function (oj, ko, ds, bootbox, moment) {
    /**
     * The view model for the main content view template
     */
    function alertContentViewModel(params) {
        var self = this;
        self.alertRouteModel = ko.dataFor(document.getElementById('alertRoute'));
        document.getElementById('tenantSelect').disabled = false;
        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));

        self.rootViewModel.assetArray.removeAll();
        self.ready = ko.observable(true);
        self.updateMode = ko.observable(false);
        /*Form Attributes*/
        self.alertName = ko.observable();
        self.description = ko.observable();
        self.ruleName = ko.observable();
        self.priority = ko.observable();
        self.executionFrequencyTime = ko.observable();
        self.frequency = ko.observable();
        self.suppressAfter = ko.observable();
        self.active = ko.observable(true);
        self.nextExecution = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.notificationParams = ko.observableArray();
        self.oldAlertName = ko.observable();
 	

        /*Notification Medium*/
        self.notifyCB = ko.observableArray([""])

        self.smsList = ko.observableArray([]);
        self.to = ko.observableArray([]);
        self.cc = ko.observableArray([]);

        self.paramReady = ko.observable(false);


        //Setup Search
        self.searchArray = ko.observableArray();
        self.searchArray.push({ key: "email", value: "" });

        //Paging Functionality
        self.page = ko.observable(0);
        self.skip = ko.observable(10);
        self.fromDoc = ko.observable(0);
        self.toDoc = ko.observable(0);
        self.totDoc = ko.observable(0);

        self.searchKeys = [
            { name: 'Email', id: 'email' }
        ];


        self.users = ko.observableArray();
        self.searchData = function () {

            let filter = {};
            self.searchArray().forEach(function (row) {
                if (row.value) {
                    filter[row.key] = row.value;
                }
            });

            self.ready(false);
            return ds.getUserList(filter, self.page(), self.skip()).
                then(function (result) {
                    let userList = []
                    result.data.forEach(function (ele) {
                        userList.push({ value: ele.email, label: ele.email });
                    });
                    self.users(userList)
                    self.ready(false);
                    self.ready(true);
                    if (result.data.length > 0) {
                        self.totDoc(result.totalCount);
                        self.fromDoc((self.skip() * self.page()) + 1);
                        self.toDoc((self.page() * self.skip()) + self.skip());
                    }
                });
        }
        self.searchData();


        // //Look Up Values
        // self.users = ko.observableArray([
        //     {value: 'chethan.cmk@gmail.com', label: 'Chethan Krishna'},
        //     {value: 'chethan.munikrishna@in.bosch.com', label: 'Chethan Bosch'}
        // ]);

        self.rules = [
	    { name: 'Daily Energy Threshold', id: 'DailyThresholdEnergy' },
            { name: 'Lift Offline', id: 'LiftOffline' },
	    { name: 'Lift On or Off', id: 'LiftOff' },         
            { name: 'Daily Mileage Threshold', id: 'dailyMileageThreshold' },
            { name: 'Door Cycle Threshold NILM', id: 'doorCycleThresholdNilm' }
           // { name: 'Energy Threshold', id: 'energyThreshold' },
            //{ name: 'Maintenance Mileage Threshold', id: 'maintMileageThreshold' },            
           // { name: 'Mileage Threshold NILM', id: 'mileageThresholdNilm' },
            // { name: 'Door Cycle Threshold MMU', id: 'doorCycleThreshold' },          
            // { name: 'Lift Velocity Threshold', id: 'liftVelocityThreshold' },
            // { name: 'Lift Acceleration Threshold', id: 'liftAccelerationThreshold' },
            // { name: 'Device based Offline', id: 'deviceBasedOffline' }
        ]
        self.executionFrequency = [
            { name: '5 Minutes', id: '5' },
            { name: '10 Minutes', id: '10' },
            { name: '15 Minutes', id: '15' },
            { name: '20 Minutes', id: '20' },
            { name: '25 Minutes', id: '25' },
            { name: '30 Minutes', id: '30' },
            { name: '1 Hour', id: '60' },
            { name: '2 Hours', id: '120' },
            { name: '5 Hours', id: '300' },
            { name: '10 Hours', id: '600' },
            { name: '24 Hours', id: '1440' }
        ]
        suppressAfterArray = [
            { name: '1', id: 1 },
            { name: '2', id: 2 },
            { name: '5', id: 5 },
            { name: '10', id: 10 },
            { name: '20', id: 20 },
            { name: 'Never', id: 10000000 }
        ]

        self.priorities = [
            { name: 'High', id: 'high' },
            { name: 'Medium', id: 'medium' },
            { name: 'Low', id: 'low' }
        ]

        this.notifyOpts = ko.observableArray([
            { id: "Email", value: "Email", option: "Email" },
            { id: "SMS", value: "SMS", option: "SMS" }
        ]);


        self.reset = function () {
            self.alertRouteModel.goToList();
        }

        self.emailSelect = function (data) {
            console.log(data)
        }

        self.smsSelect = function (data) {
            console.log(data)
        }


        self.submit = function () {
            let method = 'POST';
            if (params.mode === 'update') {
                method = 'PUT';
                self.oldAlertName(params.data['alertName']);
            }

            ds.addAlertRule(getJSONData(), method, self.oldAlertName())
                .done(function (result) {
                    console.log(method);
                    bootbox.alert('Notification Updated Successfully');
                    self.alertRouteModel.goToList();
                })
                .fail(function (err) {
                    bootbox.alert('Unable to add/update Notification... ' + err.responseJSON.error + ' Try Again !!!');
                    console.log('Error:' + err);
                });
        };


        $(document).ready(function () {
            document.getElementById('executionFrequency').disabled = false;
            document.getElementById('suppressAfter').disabled = false;
	    document.getElementById('notificationParams').hidden = false;
            $.getJSON("./js/demoData/notificationParams.json", function (result) {
                self.notificationParams(result[0].Params);
                if (params.mode === 'add') {
                  
                    $('#rules').on('change', function () {
                        let selectedVal = this.value;
                        if(selectedVal==='LiftOff'){
                            document.getElementById('notificationParams').hidden = true;
                        }
                        if (selectedVal === 'DailyThresholdEnergy' ||selectedVal === 'dailyMileageThreshold') {
                            self.executionFrequencyTime(parseInt('1440'));
                            document.getElementById('executionFrequency').disabled = true;
                            self.suppressAfter(parseInt('10000000'));
                            document.getElementById('suppressAfter').disabled = true; 
			    document.getElementById('notificationParams').hidden = false;
                        } else if(selectedVal === 'doorCycleThresholdNilm' ||selectedVal === 'LiftOffline') {
                            self.executionFrequencyTime(parseInt('5'));
                            document.getElementById('executionFrequency').disabled = false;
                            self.suppressAfter(parseInt('1'));
                            document.getElementById('suppressAfter').disabled = false; 
			    document.getElementById('notificationParams').hidden = false;
                        }
                        result.forEach(function (row) {
                            if (selectedVal === row.Alerttype) {
                                row.Params["value"] = self.notificationParams(row.Params);
                            }
                        })

                    });
                    self.paramReady(true);
                } else if (params.mode === 'update') {
                    self.updateMode(true);
                    document.getElementById('rules').disabled=true;
                    self.alertName(params.data['alertName']);
                    self.description(params.data['description']);
                    self.ruleName(params.data['ruleName']);
                    self.priority(params.data['priority']);
                    self.executionFrequencyTime(parseInt(params.data['frequency']));
                    self.suppressAfter(params.data['suppressAfter']);
                    self.nextExecution(oj.IntlConverterUtils.dateToLocalIso(new Date(params.data['nextExecution'])))
                    self.active(params.data['active']);

                    if (params.data.email) {
                        self.notifyCB.push('Email');
                    }

                    if (params.data.sms) {
                        self.notifyCB.push('SMS');
                    }

                    self.to(params.data.toAddress);
                    self.cc(params.data.ccAddress);
                    self.smsList(params.data.smsList);

                    result.forEach(function (row) {
                        if (params.data['ruleName'] === row.Alerttype) {
                            row.Params.forEach(
                                function (paramIter) {
                                    paramIter["ParamValue"] = params.data.property[paramIter['Key']] || '';
                                })
                            self.notificationParams(row.Params);
                            self.paramReady(true);
                        }
                        return;
                    });

                    self.rootViewModel.assetArray(params.data.assets);
                }
            }
            );
        });


        self.ready = ko.observable(true);
        /*API Call*/
        self.createEvent = function () {
            ds.addEvent(getJSONData())
                .done(function (result) {
                    console.log(result);
                })
                .fail(function (err) {
                    console.log('Error:' + err);
                });
        };
        function getJSONData() {
            console.log(self.notificationParams());
            var dataVal = {
                'alertName': self.alertName(),
                'description': self.description(),
                'ruleName': self.ruleName(),
                'priority': self.priority(),
                'frequency': parseInt(self.executionFrequencyTime()),
                'suppressAfter': self.suppressAfter(),
                'nextExecution': (new Date(self.nextExecution())).getTime(),
                'active': self.active(),
                'toAddress': self.to(),
                'ccAddress': self.cc(),
                'smsList': self.smsList(),
                'assets': self.rootViewModel.assetArray(),
                'email': self.notifyCB().indexOf('Email') >= 0,
                'sms': self.notifyCB().indexOf('SMS') >= 0,
                'property': {}
            };
            self.notificationParams().forEach(function (param) {
                dataVal.property[param.Key] = param.ParamValue;
            });
            return { data: dataVal };
        }
    }
    return alertContentViewModel;
}
);
