
define(['ojs/ojcore', 'knockout'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function tenantRouteContentViewModel() {
        var self = this;
//        document.getElementById('tenantSelect').disabled=false;
        self.value = ko.observable('admin/tenant/tenantList');
        self.params = ko.observable({});
        self.cache = ko.observable();

        self.updateRow = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/tenant/tenant');
        };

        self.addRow = function () {
            self.params().mode = 'add';
            self.value('admin/tenant/tenant');
        };


        self.goToList = function (result) {
            self.params().result = result;
            self.value('admin/tenant/tenantList');
        };

        self.subTenant = function (result) {
            self.params().result = result;
            self.value('admin/tenant/tenantSub');
        };
        
          self.devTypes = function (result) {
            self.params().result = result;
            self.value('admin/tenant/tenantDevTypes');
        };


    }

    return tenantRouteContentViewModel;
});
