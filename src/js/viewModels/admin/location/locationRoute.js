
define(['ojs/ojcore', 'knockout'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function locationRouteContentViewModel() {
        var self = this;
        self.value = ko.observable('admin/location/locationList');
        self.params = ko.observable({});
        document.getElementById('tenantSelect').disabled=false;
        self.updateRow = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/location/location');
        };

        self.addRow = function () {
            self.params().mode = 'add';
            self.value('admin/location/location');
        };


        self.goToList = function (result) {
            self.params().result=result;
            self.value('admin/location/locationList');
        };

        self.locationConfig = function () {
            self.params().mode = 'levels';
            self.value('admin/location/locationConfig');
        };

        self.loadTree = function () {
            self.params().mode = 'tree';
            self.value('admin/location/locationTree');
        };
    }

    return locationRouteContentViewModel;
});
