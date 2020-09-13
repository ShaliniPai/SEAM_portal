
define(['ojs/ojcore', 'knockout'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function userRouteContentViewModel() {
        var self = this;
        self.value = ko.observable('admin/user/userList');
        self.params = ko.observable({});
        self.cache = ko.observable();

        self.updateRow = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/user/user');
        };

        self.addRow = function () {
            self.params().mode = 'add';
            self.value('admin/user/user');
        };


        self.goToList = function (result) {
            self.params().result = result;
            self.value('admin/user/userList');
        };

        self.goToUserTenant = function (result) {
            self.params().result = result;
            self.value('admin/user/userTenant');
        };



    }

    return userRouteContentViewModel;
});
