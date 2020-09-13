define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'moment', 'ojs/ojbutton', 'ojs/ojswitch', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', 'ojs/ojdialog'
], function (oj, ko, config, ds, bootbox, moment) {
    /**
     * The view model for the main content view template
     */
    function assetContentViewModel(params) {
        var self = this;
        document.getElementById('tenantSelect').disabled=false;
        self.ready = ko.observable(false);
        self.levelsArray = ko.observableArray();
        self.assetId = ko.observable();
        self.assetName = ko.observable();
        self.assetType = ko.observable("");
        self.assetModel = ko.observable("");
        self.locId = ko.observable("");
        self.enabled = ko.observable(true);
        self.maintDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(1532951954632)));

        self.locLkpReady = ko.observable(true);
        self.typeLkpReady = ko.observable(true);
        self.modelLkpReady = ko.observable(true);

        self.locations = ko.observableArray();
        self.types = ko.observableArray();
        self.models = ko.observableArray();
        self.defTenantId = ko.observable();
        self.defTenantName = ko.observable();

        /*Disable/Enable User name field based on update mode*/
        self.type = params.mode === 'update' ? 'PUT' : 'POST';
        self.route = 'assetRoute';
        self.updateMode = ko.observable(false);
        self.RouteModel = ko.dataFor(document.getElementById(self.route));

        //Fields for the Models and Types Tab
        self.modelKeysArray = ko.observableArray();
        self.typeKeysArray = ko.observableArray();
        self.devsArray = ko.observableArray();

        self.loadUpdateMode = function () {
            /*Get the complete object for Edit or Just Open for Add*/
            if (params.mode === 'update') {
                self.updateMode(true);
                self.assetId(params.data['assetId']);
                self.assetName(params.data['assetName']);
                self.assetType(params.data['assetType']);
                self.assetModel(params.data['assetModel'] || '');
                self.locId(params.data['locId']);
                self.enabled(params.data['enabled']);

                if (params.data['maintDt']) {
                    self.maintDt(oj.IntlConverterUtils.dateToLocalIso(new Date(parseInt(params.data['maintDt']))));
                } else {
                    self.maintDt(oj.IntlConverterUtils.dateToLocalIso(new Date()));
                }

                //Get the Asset Model 
                ds.getAssetModelList({assetModel: params.data['assetModel'], assetType: params.data['assetType']})
                        .done(function (result) {

                            if (result.success) {
                                result.data.forEach(function (model) {

                                    //Populate the Model Keys
                                    for (var key in model.assetModelKeys) {
                                        //Convert Object to Array
                                        if (model.assetModelKeys.hasOwnProperty(key)) {
                                            var obj = model.assetModelKeys[key];

                                            var assetValue = obj;
                                            if (params.data && params.data.property) {
                                                assetValue = params.data.property[key] || '';
                                            }
                                            self.modelKeysArray.push({key: key, value: assetValue.value, desc: obj.desc});
                                        }
                                    }

                                    //Populate the Asset Type Keys
                                    for (var key in model.assetTypeKeys) {
                                        if (model.assetTypeKeys.hasOwnProperty(key)) {
                                            var obj = model.assetTypeKeys[key];

                                            var assetValue = obj.value;
                                            if (params.data && params.data.property) {
                                                assetValue = params.data.property[key] || '';
                                            }

                                            self.typeKeysArray.push({key: key, value: assetValue.value, desc: obj.desc});
                                        }
                                    }
                                });

                            } else {
                                bootbox.alert('Unable to fetch Asset Model List. Try Again !!!');
                            }
                        })
                        .fail(function (err) {
                            bootbox.alert('Unable to fetch Asset Model List. Try Again !!!');
                        });

                if (params.data.devices) {
                    let deviceKeys = params.data['devices'];
                    for (var key in deviceKeys) {
                        //Convert Object to Array
                        if (deviceKeys.hasOwnProperty(key)) {
                            var obj = deviceKeys[key];
                            self.devsArray.push({devName: obj.devName, devType: obj.devType});
                        }
                    }
                }
            }
        };

        self.loadData = function () {
            self.ready(false);
            ds.getAssetConfig(localStorage.getItem("upTenantId"))
                    .done(function (result) {
                        if (result.success) {
                            if (result.result.levels) {
                                result.result.levels.forEach(function (level) {
                                    if (params && params.data && params.data.level && self.updateMode()) {
                                        level.value = params.data.level[level.label];
                                    } else {
                                        level.value = '';
                                    }
                                    self.levelsArray.push(level)
                                });
                            }
                        } else {
                            bootbox.alert('Unable to fetch Asset Config List. Try Again !!!');
                        }
                        self.ready(true);
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to fetch Asset Config List. Try Again !!!');
                    });
        };

        self.loadData();
        self.loadUpdateMode();


        /*Handle Screen Control Actions*/

        self.saveAsset = function () {
            $('#save').hide();
            $('#cancel').hide();
            $.ajaxSetup({contentType: "application/json; charset=utf-8"});
            //console.log(self.getJSONData());

            let method = "POST";

            if (self.updateMode()) {
                method = "PUT";
            }
            //console.log(self.getJSONData());
            ds.addUpdateAsset(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {
                            let data = {
                                modify: true,
                                updateMode: self.updateMode()
                            }
                            self.RouteModel.goToList(data);
                            if (!self.updateMode()) {
                                params.mode = "update";
                                params.data = result.data;
                                //Run the code for update data mode to load the model and type details.                          
                                self.loadUpdateMode();
                            }
                        } else {
                            bootbox.alert('Unable to add/update Asset. Verify all fields and try again !!!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to add/update Asset. Verify all fields and try again !!!');
                        $('#save').show();
                        $('#cancel').show();
                    });
        };


        self.cancel = function () {
            self.RouteModel.goToList();
        };


        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                'assetId': self.assetId(),
                'assetName': self.assetName(),
                'assetType': self.assetType(),
                'assetModel': self.assetModel(),
                'locId': self.locId(),
                'enabled': self.enabled() ? true : false,
                'maintDt': moment(self.maintDt()).startOf('day').valueOf(),
                'level': {},
                'model': {assetModelKeys: {}, assetTypeKeys: {}}
            };

            self.levelsArray().forEach(function (level) {
                data.level[level.label] = level.value;
            });


            self.modelKeysArray().forEach(function (key) {
                data.model.assetModelKeys[key.key] = {value: key.value, desc: key.desc};
            });

            self.typeKeysArray().forEach(function (key) {
                data.model.assetTypeKeys[key.key] = {value: key.value, desc: key.desc};
            });

            return ko.toJSON(data);
        };


        self.readyTags = ko.observable(false);
        self.tagsArray = ko.observableArray();

        self.openTags = function () {
            self.readyTags(false);
            self.tagsArray.removeAll();
            ds.getAssetTags(self.assetId())
                    .done(function (result) {
                        if (result.success) {
                            if (result.tags) {
                                self.tagsArray(result.tags.slice(0));
                            }
                            self.readyTags(true);
                        } else {
                            bootbox.alert('Error:Unable to fetch Tags. Try Again !!!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to fetch Tags. Try Again !!!');
                    });
        };

        self.saveTags = function (tagsArray) {
            //console.log(tagsArray);
            ds.updateAssetTags(self.assetId(), JSON.stringify({tags: tagsArray}))
                    .done(function (result) {
                        if (result.success) {
                            console.log('Tags Updated Successfully');
                        } else {
                            bootbox.alert('Error:Unable to add/update Tags. Try Again !!!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to add/update Tags. Try Again !!!');
                    });
        };


        self.locLkp = function () {
            self.locLkpReady(false)
            let filter = {};
            ds.getLocList(filter)
                    .done(function (result) {
                        if (result.success) {
                            self.locations.removeAll();
                            result.data.forEach(function (loc) {

                                self.locations.push({label: loc.locName, value: loc.locId})
                            })
                        } else {
                            bootbox.alert('Error:Unable to fetch Location. Try Again !!!');
                        }
                        self.locLkpReady(true)
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to fetch Location. Try Again !!!');
                    });
        };

        self.locLkp();


        self.typeLkp = function () {
            self.typeLkpReady(false);
            let filter = {};
            ds.getAssetTypeList(filter)
                    .done(function (result) {
                        if (result.success) {
                            self.types.removeAll();
                            result.data.forEach(function (type) {
                                self.types.push({label: type.assetTypeName, value: type.assetType})
                            })
                        } else {
                            bootbox.alert('Error:Unable to fetch Asset type list. Try Again !!!');
                        }
                        self.typeLkpReady(true)
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to fetch Asset type list. Try Again !!!');
                    });
        };

        self.typeLkp();

        self.modelLkp = function () {
            self.modelLkpReady(false);
            let filter = {};
            ds.getAssetModelList(filter)
                    .done(function (result) {
                        if (result.success) {
                            self.models.removeAll();
                            result.data.forEach(function (model) {
                                self.models.push({label: model.assetModelName, value: model.assetModel, details: model});
                            });
                        } else {
                            bootbox.alert('Error:Unable to fetch Asset model list. Try Again !!!');
                        }
                        self.modelLkpReady(true);
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to fetch Asset model list. Try Again !!!');
                    });
        };

        self.modelLkp();



        //Device Registration to Asset

        self.readyRegisterDevice = ko.observable(false);
        self.deviceReady = ko.observable(true);

        self.regDevice = function () {
            self.readyRegisterDevice(true);
        }

        self.addDevice = function () {
            self.devsArray.push({devName: '', devType: ''});
        };


//Refresh the device list when the Modal is Closed
        self.closeDevice = function () {
            self.deviceReady = ko.observable(false);
            self.devsArray.removeAll();
            ds.getDeviceAssets(self.assetId())
                    .done(function (result) {
                        if (result.success) {
                            self.devsArray(result.devices.splice(0));
                        } else {
                            bootbox.alert('Error:Unable to fetch Device Asset list. Try Again !!!');
                        }
                        self.deviceReady(true);
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to fetch Device Asset list. Try Again !!!');
                    });
            document.querySelector('#modalDialog5').close();
        };

        self.deleteDev = function (data, index) {
            self.devsArray.splice(index(), 1);
        };

    
//Deregister a Device from Asset
        self.deleteDev = function (data, index) {
            ds.deRegsiterAssetDevice(self.assetId(), data.devName)
                    .done(function (result) {
                        if (result) {
                            self.devsArray.splice(index(), 1);
                            self.deviceReady(true);
                        } else {
                            bootbox.alert('Error:Unable to delete Asset Device . Try Again !!!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to delete Asset Device . Try Again !!!' + err.responseText);
                    });
        };
    }

    return assetContentViewModel;
});
