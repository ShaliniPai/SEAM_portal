
define(['ojs/ojcore', 'knockout', 'dataservice', 'ojs/ojnavigationlist', 'ojs/ojarraydataprovider', 'ojs/ojconveyorbelt'
], function (oj, ko, ds) {
    /**
     * The view model for the main content view template
     */
    function assetRouteContentViewModel() {
        var self = this;

        self.routesArray = ko.observableArray();
        self.ready = ko.observable(false);
        self.state = ko.observable('');
        self.cache = ko.observable();
        document.getElementById('tenantSelect').disabled=false;

        self.value = ko.observable();
        self.params = ko.observable({});

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));

        self.selectHandler = function () {
            self.value(self.state())
        };

        self.loadAssetRoutes = function () {
            self.ready(false);
            ds.getAssetRouterMenu(self.rootViewModel.sysRole() || 'guest').then(function (result) {
                let jsonData;
                if (typeof (result) == 'string') {
                    jsonData = JSON.parse(result);
                } else {
                    jsonData = result;
                }
                for (var key in jsonData.routes) {
                    if (jsonData.routes.hasOwnProperty(key)) {
                        self.routesArray.push(jsonData.routes[key]);
                        if (jsonData.routes[key].isDefault) {
                            self.state(jsonData.routes[key].value);
                            self.selectHandler();
                        }
                    }
                }

                if (!self.state() && self.routesArray()[0]) {
                    self.state(self.routesArray()[0].value);
                    self.selectHandler();
                }

                self.ready(true);
            });
        };

        self.loadAssetRoutes();


        self.selectedItem = ko.observable("listAssets");

        self.updateRow = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/asset/asset');
        };

        self.addAsset = function () {
            self.params().mode = 'add';
            self.value('admin/asset/asset');
        };

        self.goToList = function (result) {
            self.params().result=result;
            self.value('admin/asset/assetList');
        };

        self.assetConfig = function () {
            self.params().mode = 'levels';
            self.value('admin/asset/assetConfig');
        };

        self.loadTree = function () {
            self.params().mode = 'tree';
            self.value('admin/asset/assetTree');
        };


        self.goToAssetType = function () {
            self.params().mode = 'tree';
            self.value('admin/asset/assetTypeList');
        };

        self.addAssetType = function () {
            self.params().mode = 'add';
            self.value('admin/asset/assetType');
        };

        self.updateAssetType = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/asset/assetType');
        };


        self.goToAssetModelList = function (result) {
            self.params().mode = 'tree';
            self.params().result=result;
            self.value('admin/asset/assetModelList');
        };

        self.goToAssetModel = function () {
            self.params().mode = 'add';
            self.value('admin/asset/assetModel');
        };

        self.updateAssetModel = function (row) {
            self.params().data = row;
            self.params().mode = 'update';
            self.value('admin/asset/assetModel');
        };


    }

    return assetRouteContentViewModel;
});
