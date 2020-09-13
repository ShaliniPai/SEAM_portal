/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * assetDeviceReg module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'ojs/ojinputtext', 'ojs/ojselectcombobox'
], function (oj, ko, ds) {
    /**
     * The view model for the main content view template
     */
    function assetDeviceRegContentViewModel(params) {
        var self = this;

        self.assetId = ko.observable(params.assetId)
        self.assetType = ko.observable(params.assetType)

        self.assetRouteModel = ko.dataFor(document.getElementById("asset"));

        self.devType = ko.observable();
        self.devName = ko.observable();
        self.deviceId=ko.observable();
        self.devId = ko.observable();

        self.regError = ko.observable(false);
        self.regErrorText = ko.observable();
        self.devices = ko.observableArray();


        self.deviceTypeOpts = ko.observableArray([
            {label: 'Phantom NILM', value: 'NILM'},
            {label: 'Embdesense MMU', value: 'MMU'}
        ]);

        self.deviceOpts = ko.observableArray([]);

        self.register = function () {
            self.regError(false);
            self.regErrorText("");


            self.deviceOpts().forEach(function (device) {
                if (device.value === self.devId()) {
                    self.devName(device.devName);
                }
            })

            if (!self.assetId() || !self.assetType() || !self.devType() || !self.devName()) {
                self.regError(true);
                self.regErrorText("Mandatory fields missing for registering the device");

            }

            let data = {
                assetId: self.assetId(),
                assetType: self.assetType(),
                devType: self.devType(),
                devName: self.devName(),
                devId: self.devId()
            }

            ds.regsiterAssetDevice(data,self.assetId())
                    .then(function (result) {
                        if (result.success) {
                            self.regError(true);
                            self.regErrorText('Device Added Successfully');
                        } else {
                            self.regError(true);
                            self.regErrorText(result.error);
                        }
                    })
                    .fail(function (err) {
                        self.regError(true);
                        self.regErrorText(err);
                    })
        };

        self.getDevices = function () {
            let filter = {
                active: true,
                assetAttached: false
            };

            ds.getAssetDevice(filter)
                    .then(function (result) {
                        self.devices.removeAll();
                        if (result.success) {
                            result.data.forEach(function (row) {
                                let obj = {label: row.devId, value: row.devId, devType: row.devType, devName: row.devName};
                                self.devices.push(obj);
                            })
                        }
                    }).fail(function (err) {
                self.regError(true);
                self.regErrorText(err);
            })

        };

        self.deviceOpts = ko.computed(function () {
            var filter = self.devType();
            if (!filter) {
                return null;
            } else {
                return ko.utils.arrayFilter(self.devices(), function (device) {
                    return device.devType === filter;
                });
            }
        });

        self.getDevices();

        // self.cancel = function () {
        //     self.assetRouteModel.closeDevice();
        //     //document.querySelector('#modalDialog5').close();
        // };
    }

    return assetDeviceRegContentViewModel;
});
