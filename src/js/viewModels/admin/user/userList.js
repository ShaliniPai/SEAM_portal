
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'ojs/ojknockout', 'ojs/ojrouter', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojselectcombobox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function userListContentViewModel(params) {
        var self = this;

        self.ready = ko.observable(true);
        //  self.userRouteModel = ko.dataFor(document.getElementById('userRoute'));

        /*Success message code*/
        self.result = ko.observable();
        self.mode = ko.observable();
        self.added = ko.observable();
        self.message = ko.observable();
        self.modify = ko.observable();
        try {
            if (params && params.result) {
                self.added(params.result.modify)
                self.message(params.result.updateMode ? "User Updated Successfully!" : "User Added Successfully!")
                setTimeout(function () {
                    self.added(false);
                }, 2000);
            }
            //console.log(params.result);
        } catch (e) {
            console.log(e);
        }

        self.userOrigList = ko.observableArray();
        self.userList = ko.observableArray();
        self.selectedUser = ko.observable();

        self.searchTerm = ko.observable();


        //Paging Functionality
        self.page = ko.observable(0);
        self.skip = ko.observable(10);

        self.fromDoc = ko.observable(0);
        self.toDoc = ko.observable(0);
        self.totDoc = ko.observable(0);

        //Setup Search
        self.searchArray = ko.observableArray();
        self.searchArray.push({key: "email", value: ""});

        self.searchKeys = [
            {name: 'Email', id: 'email'}
        ];


        self.userRouteModel = ko.dataFor(document.getElementById('userRoute'));


        /*Initial Load of All Users*/
        self.searchData = function () {

            let filter = {};
            self.searchArray().forEach(function (row) {
                if (row.value) {
                    filter[row.key] = row.value;
                }
            });

            self.ready(false);
            self.userList([]);
            ds.getUserList(filter, self.page(), self.skip()).
                    then(function (result) {
                        self.userList(result);
                        if (result.data.length > 0) {
                            self.totDoc(result.totalCount);
                            self.fromDoc((self.skip() * self.page()) + 1);
                            self.toDoc((self.page() * self.skip()) + self.skip());
                        }
                        self.userRouteModel.cache = result;
                        self.ready(true);
                    });
        }

        self.loadCache = function () {
            if (self.userRouteModel.cache.data) {
                self.userRouteModel.cache.data.forEach(function (user) {
                    self.userList.push(user);

                });
                if (self.userRouteModel.cache.data.length > 0) {
                    self.totDoc(self.userRouteModel.cache.totalCount);
                    self.page(self.userRouteModel.cache.page);
                    self.skip(self.userRouteModel.cache.skip);
                    self.fromDoc((self.skip() * self.page()) + 1);
                    self.toDoc((self.page() * self.skip()) + self.skip());
                }
            }

        };
        self.loadCache();

        /*Add Row*/
        self.addRow = function () {
            if (!self.userRouteModel) {
                self.userRouteModel = ko.dataFor(document.getElementById('userRoute'));
            }
            self.userRouteModel.addRow();
        };

        /*Update Row*/
        self.updateRow = function (row) {
            if (!self.userRouteModel) {
                self.userRouteModel = ko.dataFor(document.getElementById('userRoute'));
            }
            self.userRouteModel.updateRow(row);
        };

        /*Delete Row*/
        self.deleteUser = function (row) {

            bootbox.confirm({
                title: 'Delete user ' + row.email,
                message: "Do you want to delete the user permanently, this action cannot be undone",
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
                        ds.deleteUser(row.tenantId, row.email)
                                .then(function () {
                                    bootbox.alert('User deleted Successfully!');
                                    self.ready(true);
                                    self.searchData();

                                })
                                .catch(function (err) {
                                    alert('Unable to delete the User. Try Again !!!');
                                    self.ready(true);
                                });
                    }
                }
            });

        };

        self.goToUserTenant = function (data) {
            self.userRouteModel.goToUserTenant(data);
        }

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

    return userListContentViewModel;
});
