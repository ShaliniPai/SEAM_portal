
define(['ojs/ojcore', 'knockout', 'dataservice'
], function (oj, ko, ds) {
    /**
     * The view model for the main content view template
     */
    function alertRouteContentViewModel() {
        var self = this;
        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        document.getElementById('tenantSelect').disabled=false;
        self.value = ko.observable('admin/alerts/alertList');
        self.params = ko.observable({});
        
        self.assetArray = ko.observableArray([])


        self.updateRow = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/alerts/alert');
        };

        self.addRow = function () {
            self.params().mode = 'add';
            self.value('admin/alerts/alert');

        };

        self.goToList = function (result) {
            self.params().result = result;
            self.value('admin/alerts/alertList');
        };
    }

    return alertRouteContentViewModel;
});
