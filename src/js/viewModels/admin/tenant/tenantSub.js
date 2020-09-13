/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * tenantSub module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function tenantSubContentViewModel(params) {
        var self = this;
        self.tenant = ko.observable();
        self.tenant(params.result);
        self.subTenantArr = ko.observableArray();

        self.tenantRouteModel = ko.dataFor(document.getElementById('tenantRoute'));

        self.goToTenantList = function () {
            self.tenantRouteModel.goToList();
        };

        self.addTenant = function () {
            let arrObj = {tenantId: '', tenantName: ''};
            self.subTenantArr.push(arrObj);
        };

        self.deleteRow = function (data, index) {
            self.subTenantArr.splice(index(), 1);
        };

        self.getSubTenants = function () {
            ds.getSubTenants(self.tenant().tenantId)
                    .then(function (result) {
                        if (result.success) {
                            self.subTenantArr.removeAll();
                            self.subTenantArr(result.data);
                        } else {
                            bootbox.alert('Error Fetching Sub-Tenants :' + result.error)
                        }
                    });
        };

        self.getSubTenants();

        self.getSubTenantArr = function () {
            let subTenantArr = [];
            self.subTenantArr().forEach(sub => {
                subTenantArr.push(sub.tenantId);
            });
            return subTenantArr;
        };

        self.save = function () {
            ds.putSubTenants({tenantId: self.tenant().tenantId, subTenantArr: self.getSubTenantArr()})
                    .then(function (result) {
                        if (result.success) {
                            self.getSubTenants();
                            bootbox.alert("Successfully added the Sub Tenants.")
                        } else {
                            bootbox.alert('Error Saving Sub-Tenants :' + result.error)
                        }
                    });
        }

    }

    return tenantSubContentViewModel;
});
