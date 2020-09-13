/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * userTenant module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function userTenantContentViewModel(params) {
        var self = this;

        self.user = ko.observable();
        self.user(params.result);
        self.tenantIds = ko.observableArray();
        self.defTenantId = ko.observable();
        self.defTenantName = ko.observable();


        self.userRouteModel = ko.dataFor(document.getElementById('userRoute'));

        self.goToUserList = function () {
            self.userRouteModel.goToList();
        };

        self.addTenant = function () {
            let arrObj = {tenantId: '', tenantName: '', role: ''};
            self.tenantIds.push(arrObj);
        };

        self.deleteRow = function (data, index) {
            if (data.tenantId === self.defTenantId()) {
                self.defTenantId('');
                self.defTenantName('');
            }
            self.tenantIds.splice(index(), 1);
        };

        self.selectDefault = function (data) {
            self.defTenantId(data.tenantId);
            self.defTenantName(data.tenantName);
        };


        self.getUserTenants = function () {
            ds.getTenantIds(self.user().email)
                    .then(function (result) {
                        if (result.success) {
                            self.tenantIds.removeAll();

                            result.result.forEach(row => {
                                row.tenantName = row.tenantName || '';
                            })
                            self.tenantIds(result.result);
                            self.defTenantId(self.user().tenantId);
                        } else {
                            bootbox.alert('Error Fetching User-Tenants :' + result.error)
                        }
                    });
        };

        self.getUserTenants();

        self.getTenantIds = function () {
            let tenantObj = {email: self.user().email, tenantId: '', tenantIds: []};
            tenantObj.tenantId = self.defTenantId();
            self.tenantIds().forEach(tenant => {
                let obj = {tenantId: tenant.tenantId, sysRole: tenant.sysRole, isDefault: false};
                if (tenant.tenantId === self.defTenantId()) {
                    obj.isDefault = true;
                }
                tenantObj.tenantIds.push(obj);
            });
            return tenantObj;
        };

        self.save = function () {
            if (!self.defTenantId()) {
                bootbox.alert('Please select default tenantId for the user');
            } else {
                ds.putUserTenants(self.getTenantIds())
                        .then(function (result) {
                            if (result.success) {
                                self.getUserTenants();
                                bootbox.alert("Successfully updated the Tenants under the User !!!")
                            } else {
                                bootbox.alert('Error Saving Sub-Tenants :' + result.error);
                            }
                        });
            }
        };

        self.roles = [];

        self.roles.push({name: 'System Admin', id: 'SystemAdmin'});
        self.roles.push({name: 'System User', id: 'SystemUser'});
        self.roles.push({name: 'Tenant Admin', id: 'TenantAdmin'});
        self.roles.push({name: 'Tenant User', id: 'TenantUser'});
    }

    return userTenantContentViewModel;
});
