
define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojknockout', 'ojs/ojrouter', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 'ojs/ojselectcombobox'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function tenantArrContentViewModel(params) {
        var self = this;
        document.getElementById('tenantSelect').disabled = false;
        /*Success message code*/
        self.result = ko.observable();
        self.mode = ko.observable();
        self.added = ko.observable();
        self.message = ko.observable();
        self.error = ko.observable();
        self.modify = ko.observable();
        try {
            if (params && params.result) {
                self.added(params.result.modify)
                self.message(params.result.updateMode ? "Tenant Updated Successfully!" : "Tenant Added Successfully!")
                setTimeout(function () {
                    self.added(false);
                }, 2000);
                // console.log(params.result);
            }

        } catch (e) {
            console.log(e);
        }

        self.ready = ko.observable(true);
        self.tenantRouteModel = ko.dataFor(document.getElementById('tenantRoute'));

        self.tenantOrigList = ko.observableArray();
        self.tenantArr = ko.observableArray();
        self.selectedTenant = ko.observable();
        self.selectedTenantId = ko.observable();

        //Paging Functionality
        self.page = ko.observable(0);
        self.skip = ko.observable(10);

        self.fromDoc = ko.observable(0);
        self.toDoc = ko.observable(0);
        self.totDoc = ko.observable(0);

        //Setup Search
        self.searchArray = ko.observableArray();
        self.searchArray.push({key: "name", value: ""});

        self.searchKeys = [
            {name: 'Tenant Name', id: 'name'},
            {name: 'Tenant Id', id: 'tenantId'}
        ];

        self.searchData = function () {
            self.error('')
            let filter = {};
            self.error('');
            self.tenantArr.removeAll();
            self.searchArray().forEach(function (row) {
                if (row.value) {
                    filter[row.key] = row.value;
                }
            });


            ds.getTenantList(filter, self.page(), self.skip()).
                    then(function (result) {
                        if (result.success === true) {
                            result.data.forEach(function (device) {
                                device.type = device.type || 'own';
                                self.tenantArr.push(device);

                            });
                            if (result.data.length > 0) {
                                self.totDoc(result.totalCount);
                                self.fromDoc((self.skip() * self.page()) + 1);
                                self.toDoc((self.page() * self.skip()) + self.skip());
                            }

                            self.tenantRouteModel.cache = result;
                        }

                    }).catch(function (err) {
                if (err.responseJSON) {
                    console.log(err);
                    self.error(err.responseJSON.error)
                }
            })
        };

        self.loadCache = function () {
            if (self.tenantRouteModel.cache.data) {
                self.tenantRouteModel.cache.data.forEach(function (tenant) {
                    self.tenantArr.push(tenant);
                });
                if (self.tenantRouteModel.cache.data.length > 0) {
                    self.totDoc(self.tenantRouteModel.cache.totalCount);
                    self.page(self.tenantRouteModel.cache.page);
                    self.skip(self.tenantRouteModel.cache.skip);
                    self.fromDoc((self.skip() * self.page()) + 1);
                    self.toDoc((self.page() * self.skip()) + self.skip());
                }
            }

        };
        self.loadCache();

        /*Add Row*/
        self.addRow = function () {
            self.tenantRouteModel.addRow();
        };

        /*Update Row*/
        self.updateRow = function (row) {
            self.tenantRouteModel.updateRow(row);
        };

        /*Update Sub Tenants*/
        self.subTenant = function (row) {
            self.tenantRouteModel.subTenant(row);
        };

        /*Update Sub Tenants*/
        self.devTypes = function (row) {
            self.tenantRouteModel.devTypes(row);
        };



        /*Delete Row*/
        self.deleteTenant = function (row) {
            bootbox.confirm({
                title: 'Delete tenant ' + row.tenantId,
                message: 'Do you want to delete the tenant ' + row.tenantId + ' permanently, this action cannot be undone',
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> Cancel'
                    },
                    confirm: {
                        label: '<i class="fa fa-check"></i> Confirm'
                    }
                },
                callback: function (result) {
                    if (result) {
                        self.ready(false);
                        ds.deleteTenant(row.tenantId)
                                .then(function () {
                                    bootbox.alert('Tenant deleted Successfully!');
                                    self.ready(true);
                                    self.searchData();
                                })
                                .catch(function (err) {
                                    bootbox.alert('Unable to delete Tenant. Try Again !!!');
                                    self.ready(true);
                                });
                    }
                }
            });

        };


//Paging functionality
        self.previous = function () {
            if (self.page() > 0) {
                self.page(self.page() - 1)
                self.searchData();
            } else {
                console.log('No Action')
            }
        };

        self.next = function () {
            if (self.totDoc() >= self.toDoc()) {
                self.page(self.page() + 1);
                self.searchData();
            }
        };

    }

    return tenantArrContentViewModel;
});
