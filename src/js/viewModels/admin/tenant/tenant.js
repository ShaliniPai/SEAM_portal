define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojswitch'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function tenantContentViewModel(params) {
        var self = this;
        document.getElementById('tenantSelect').disabled=false;
        /*Initialize the Screen Variables*/
        self.tenantId = ko.observable();
        self.tenantName = ko.observable();
        self.plan = ko.observable();
        self.email = ko.observable();
        self.licExpDate = ko.observable();
        self.assetTypes = ko.observableArray();
        self.tenantType = ko.observable(false);
        self.enabled = ko.observable(true);
        self.subTenants = ko.observableArray();
        self.devTypesReady = ko.observable(true);

        /*Disable/Enable User name field based on update mode*/
        self.updateMode = ko.observable(false);
        self.type = params.mode === 'update' ? 'PUT' : 'POST';
        self.route = 'tenantRoute';

        self.plans = [
            {name: 'Gold', id: 'Gold'},
            {name: 'Silver', id: 'Silver'},
            {name: 'Platinum', id: 'Platinum'},
            {name: 'Free Tier', id: 'Free'},
        ]

        self.assetTypeOpts = [
            {name: 'Elevator', id: 'elevator'}
        ]

        self.typeOpts = [
            {name: 'Asset Owner', id: 'own'},
            {name: 'Virtual Owner', id: 'virt'}
        ]

        /*Get the complete object for Edit or Just Open for Add*/
        if (params.mode === 'update') {
            self.updateMode(true);
            self.email(params.data['email']);
            self.tenantId(params.data['tenantId']);
            self.tenantName(params.data['tenantName']);
            self.plan(params.data['plan'] || '');
            self.enabled(params.data['enabled']);
            self.licExpDate(params.data['licExpDate']);
            self.assetTypes(params.data['assetTypes'] || []);
            self.type = (params.data['type'] || []);
            self.subTenants = (params.data['subTenants'] || []);
        }

        /*Get the parent context reference*/
        self.RouteModel = ko.dataFor(document.getElementById(self.route));

        /*Handle Screen Control Actions*/
        self.saveTenant = function () {
            $('#save').hide();
            $('#cancel').hide();

            let method = "POST";
            if (params.mode === 'update') {
                method = "PUT";
            }

            ds.addUpdateTenant(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {
                            let data = {
                                modify : true,
                                updateMode: self.updateMode()
                            }
                            self.RouteModel.goToList(data);
                              
                        } else {
                            bootbox.alert('Error:' +result.error);
                            self.RouteModel.goToList();
                        }
                    })
                    .fail(function (err) {
                        let op;
                        if(method==='POST'){
                            op='add'
                        }else{
                            op='update'
                        }
                        bootbox.alert('Unable to ' +op+ ' Tenant. Verify all fields. Try Again !!!');
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
                'tenantId': self.tenantId(),
                'tenantName': self.tenantName(),
                'plan': self.plan(),
                'email': self.email(),
                'enabled': self.enabled() ? true : false,
                'assetTypes': self.assetTypes(),
                'type': self.tenantType(),
                // 'subTenants': self.subTenants()
            };
            return ko.toJSON(data);
        };

        self.readyTags = ko.observable(false);
        self.tagsArray = ko.observableArray();

        self.openTags = function () {
            self.readyTags(false);
            self.tagsArray.removeAll();
            ds.getTenantTags(self.tenantId())
                    .done(function (result) {
                        if (result.success) {
                            if (result.tags) {
                                self.tagsArray(result.tags.slice(0));
                            }
                            self.readyTags(true);
                        } else {
                            bootbox.alert('Error:' + "Unable to open Tags. Try Again !!!");
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:' + "Unable to open Tags. Try Again !!!");
                    });
        };

        self.saveTags = function (tagsArray) {
            ds.updateTenantTags(self.tenantId(), JSON.stringify({tags: tagsArray}))
                    .done(function (result) {
                        if (result.success) {
                            bootbox.alert('Tags Updated Successfully !!!');
                        } else {
                            bootbox.alert('Error:' + result.error);
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert("Error:Unable to update Tags. Try Again !!!");
                    });
        };

        self.readyTenantAdmin = ko.observable(false);

        self.openTenantReg = function () {
            self.readyTenantAdmin(true);
        };

        self.closeTenantReg = function () {
            self.readyTenantAdmin(false);
        };

        self.addAssetType = function () {
            self.assetTypes.push({assetType: '', devTypes: []});
        };

        self.deleteAssetType = function (data, index) {
            self.assetTypes.splice(index(), 1);
        };

        self.devTypeOpts = [
            {name: 'Phantom NILM', id: 'NILM'},
            {name: 'Embdesense MMU', id: 'MMU'}
        ]

        self.addDevice = function (data) {
            self.devTypesReady(false);
            data.devTypes.push({devType: ''});
            self.devTypesReady(true);
        };

        self.deleteDevice = function (data, index) {
            self.devTypesReady(false);
            data.devTypes.splice(index(), 1);
            self.devTypesReady(true);
        };
    }
    return tenantContentViewModel;
});
