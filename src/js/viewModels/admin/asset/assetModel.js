define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojswitch', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetModelContentViewModel(params) {
        var self = this;

        self.ready = ko.observable(true);
        self.keysArray = ko.observableArray();
        self.typeKeysArray = ko.observableArray();
        self.assetType = ko.observable();
        self.assetModel = ko.observable();
        self.assetModelName = ko.observable();
        self.mfr = ko.observable();
        self.enabled = ko.observable(true);
        self.assetTypes = ko.observableArray();

        self.types = ko.observableArray();
        self.typeLkpReady = ko.observable(false);

        /*Disable/Enable User name field based on update mode*/
        self.type = params.mode === 'update' ? 'PUT' : 'POST';
        self.route = 'assetRoute';
        self.updateMode = ko.observable(false);
        self.RouteModel = ko.dataFor(document.getElementById(self.route));


        /*Get the complete object for Edit or Just Open for Add*/
        if (params.mode === 'update') {
            self.updateMode(true);
            self.assetType(params.data['assetType']);
            self.assetModel(params.data['assetModel']);
            self.assetModelName(params.data['assetModelName']);
            self.mfr(params.data['mfr']);

            self.enabled(params.data['enabled']);

            if (params.data['assetModelKeys']) {
                let assetModelKeys = params.data['assetModelKeys'];
                for (var key in assetModelKeys) {
                    //Convert Object to Array
                    if (assetModelKeys.hasOwnProperty(key)) {
                        var obj = assetModelKeys[key];
                        self.keysArray.push({key: key, value: obj.value, desc: obj.desc,flag:'true'});
                    }
                }
            }

            if (params.data['assetTypeKeys']) {
                let assetTypeKeys = params.data['assetTypeKeys'];
                for (var key in assetTypeKeys) {
                    //Convert Object to Array
                    if (assetTypeKeys.hasOwnProperty(key)) {
                        var obj = assetTypeKeys[key];
                        self.typeKeysArray.push({key: key, value: obj.value, desc: obj.desc});
                    }
                }
            }
        }

        /*Handle Screen Control Actions*/

        self.saveAssetModel = function () {
            $('#save').hide();
            $('#cancel').hide();
            $.ajaxSetup({contentType: "application/json; charset=utf-8"});
           // console.log(self.getJSONData());

            let method = "POST";

            if (self.updateMode()) {
                method = "PUT";
            }

            ds.addUpdateAssetModel(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {                           
                            let data = {
                                modify : true,
                                updateMode: self.updateMode()
                            }
                            self.RouteModel.goToAssetModelList(data);
                             
                            if (!self.updateMode()) {
                                self.updateMode(true);
                            }
                        } else {
                            bootbox.alert('Error:' + result.error);
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to add/update Asset model. Try again !!');
                        $('#save').show();
                        $('#cancel').show();
                    });
        };


        self.cancel = function () {
            self.RouteModel.goToAssetModelList();
        };


        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                'assetType': self.assetType(),
                'assetModel': self.assetModel(),
                'assetModelName': self.assetModelName(),
                'mfr': self.mfr(),
                'enabled': self.enabled(),
                'assetTypeKeys': {},
                'assetModelKeys': {}
            };

            self.keysArray().forEach(function (key) {
                data.assetModelKeys[key.key] = {value: key.value, desc: key.desc};
            });

            self.typeKeysArray().forEach(function (key) {
                data.assetTypeKeys[key.key] = {value: key.value, desc: key.desc};
            });

            return ko.toJSON(data);
        };

        self.typeLkp = function () {
            self.typeLkpReady(false)
            let filter = {};
            ds.getAssetTypeList(filter)
                    .done(function (result) {
                        if (result.success) {
                            self.types.removeAll();
                            self.assetTypes(result.data.slice(0));
                            result.data.forEach(function (assetType) {
                                self.types.push({name: assetType.assetTypeName, id: assetType.assetType})
                            });
                        } else {
                            bootbox.alert('Unable to fetch Asset type List. Try again !!');
                        }
                        self.typeLkpReady(true)
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to fetch Asset type List. Try again !!');
                    });
        };

        self.typeLkp();


        self.addAssetModelProp = function () {
            self.keysArray.push({key: '', value: '', desc: '',flag:'false'});
        };

        self.deleteAssetModelProp = function (data, index) {
            self.keysArray.splice(index(), 1);
        };

        ko.computed(function () {
            if (!self.updateMode()) {
                self.typeKeysArray.removeAll();
                //In Add Mode , Update the type lookup fields.
                self.assetTypes().forEach(function (assetType) {
                    if (self.assetType() === assetType.assetType) {
                        //Loop through and assign fields.
                        assetType.assetTypeKeys.forEach(function (assetTypeKey) {
                            self.typeKeysArray.push({key: assetTypeKey.key, value: "", desc: assetTypeKey.desc});
                        });
                    }
                });
            }

        });

    }

    return assetModelContentViewModel;
});
