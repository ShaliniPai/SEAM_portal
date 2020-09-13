define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojswitch', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetTypeContentViewModel(params) {
        var self = this;

        self.ready = ko.observable(true);
        self.keysArray = ko.observableArray();
        self.assetType = ko.observable();
        self.assetTypeName = ko.observable();
        self.enabled = ko.observable(true);
        self.devTypes = ko.observableArray();
        self.computedReady = ko.observable(true);

        /*Disable/Enable User name field based on update mode*/
        self.type = params.mode === 'update' ? 'PUT' : 'POST';
        self.route = 'assetRoute';
        self.updateMode = ko.observable(false);
        self.RouteModel = ko.dataFor(document.getElementById(self.route));


        /*Get the complete object for Edit or Just Open for Add*/
        if (params.mode === 'update') {
            self.updateMode(true);
            self.assetType(params.data['assetType']);
            self.assetTypeName(params.data['assetTypeName']);
            self.enabled(params.data['enabled']);

            if (params.data['assetTypeKeys']) {
                let assetTypeKeys = params.data['assetTypeKeys'];
                for (var key in assetTypeKeys) {
                    //Convert Object to Array
                    if (assetTypeKeys.hasOwnProperty(key)) {
                        var obj = assetTypeKeys[key];
                        self.keysArray.push({key: obj.key, type: obj.type, desc: obj.desc, value: obj.value,flag:'false' || ''});
                    }
                }
            }

            self.devTypes(params.data['devTypes'] || [])
        }

        /*Handle Screen Control Actions*/

        self.saveAssetType = function () {
            $('#save').hide();
            $('#cancel').hide();
            $.ajaxSetup({contentType: "application/json; charset=utf-8"});
           // console.log(self.getJSONData());

            let method = "POST";

            if (self.updateMode()) {
                method = "PUT";
            }

            ds.addUpdateAssetType(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {
                            if (!self.updateMode()) {
                                self.updateMode(true);
                            }
                            bootbox.alert('Asset Type Saved');
                            self.RouteModel.goToAssetType();
                        } else {
                            bootbox.alert('Unable to add/update Asset type. Try again !!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to add/update Asset type. Try again !!');
                        $('#save').show();
                        $('#cancel').show();
                    });
        };


        self.cancel = function () {
            self.RouteModel.goToAssetType();
        };


        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                'assetType': self.assetType(),
                'assetTypeName': self.assetTypeName(),
                'enabled': self.enabled(),
                'assetTypeKeys': [],
                'devTypes': self.devTypes()
            };

            self.keysArray().forEach(function (key) {
                data.assetTypeKeys.push({
                    "key": key.key,
                    "type": key.type,
                    "desc": key.desc,
                    "value": key.value
                })

            });



            return ko.toJSON(data);
        };

        self.types = [
            {name: 'String', id: 'String'},
            {name: 'Number', id: 'Number'}
        ];

        self.addAssetTypeProp = function () {
            self.keysArray.push({key: '', type: '', desc: '',value:'',flag:'true'});
        };

        self.deleteAssetTypeProp = function (data, index) {
            self.keysArray.splice(index(), 1)
        };



        //Add Delete Device Types and its computed values

        self.devTypeOpts = [
            {name: 'Phantom NILM', id: 'NILM'},
            {name: 'Embdesense MMU', id: 'MMU'}
        ]



        self.addDeviceType = function () {
            self.devTypes.push({devType: '', computed: []});
        };

        self.deleteDeviceType = function (data, index) {
            self.devTypes.splice(index(), 1);
        };

        self.addComputed = function (data) {
            self.computedReady(false);
            data.computed.push({key: '', type: '', desc: '', value: ''});
            self.computedReady(true);
        };


        self.deleteComputed = function (data, index) {
            self.computedReady(false);
            data.computed.splice(index(), 1);
            self.computedReady(true);
        };


    }

    return assetTypeContentViewModel;
});
