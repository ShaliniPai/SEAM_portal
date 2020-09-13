
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'ojs/ojknockout', 'ojs/ojrouter', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 'ojs/ojselectcombobox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetListContentViewModel(params) {
        var self = this;
        document.getElementById('tenantSelect').disabled=false;
        self.headerReady = ko.observable(false);
        self.ready = ko.observable(true);
        self.assetRouteModel = ko.dataFor(document.getElementById('assetRoute'));
        self.assetList = ko.observableArray();

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
            {name: 'Asset Id', id: 'assetId'},
            {name: 'Name', id: 'assetName'}

        ];

        self.headers = ko.observableArray([]);

          /*Success message code*/
          self.result = ko.observable();
          self.mode = ko.observable();
          self.added = ko.observable();
          self.message = ko.observable();
          self.modify = ko.observable();
          try {
             self.added(params.result.modify) 
             self.message(params.result.updateMode ? "Asset Updated Successfully!" : "Asset Added Successfully!")
              setTimeout(function () {
                  self.added(false);
              }, 2000);
              //console.log(params.result);
          } catch (e) {
              //console.log(e);
          }
 

        /*Search Data*/
        self.searchData = function () {
            self.message('');
            let filter = {};
            self.searchArray().forEach(function (row) {
                if (row.value) {
                    filter[row.key] = row.value;
                }
            });

            self.ready(false);
            self.assetList.removeAll();
            self.headers.removeAll();
            ds.getAssetList(filter, self.page(), self.skip()).
                    then(function (result) {
                        if (result.success) {
                            if (result.header) {
                                result.header.levels.forEach(function (level) {
                                    self.headers.push(level);
                                });
                            }
                            result.data.forEach(function (asset) {
                                self.assetList.push(asset);
                            });

                            if (result.data.length > 0) {
                                self.totDoc(result.totalCount);
                                self.fromDoc((self.skip() * self.page()) + 1);
                                self.toDoc((self.page() * self.skip()) + self.skip());
                            }

                            self.assetRouteModel.cache = result;
                        } else {
                            bootbox.alert('Unable to fetch Asset List. Try again !!');
                        }

                        self.ready(true);
                    }).catch(function(err) {
                //console.log(err);
                self.message(err.responseJSON.error);
                self.ready(true);
            });
        };

        self.loadCache = function () {
            if (self.assetRouteModel.cache.data) {
                self.assetRouteModel.cache.data.forEach(function (asset) {
                    self.assetList.push(asset);
                });
                if (self.assetRouteModel.cache.data.length > 0) {
                    self.totDoc(self.assetRouteModel.cache.totalCount);
                    self.page(self.assetRouteModel.cache.page);
                    self.skip(self.assetRouteModel.cache.skip);
                    self.fromDoc((self.skip() * self.page()) + 1);
                    self.toDoc((self.page() * self.skip()) + self.skip());
                }
            }

        };
        self.loadCache();

        /*Route to Add Row*/
        self.addAsset = function () {
            self.assetRouteModel.addAsset();
        };

        /*Route to Update Row*/
        self.updateRow = function (row) {
            self.assetRouteModel.updateRow(row);

        };

        /*Route to Loading the asset tree*/
        self.loadTree = function () {
            self.assetRouteModel.loadTree();
        };

        /*Route to loading the asset config*/
        self.assetConfig = function () {
            self.assetRouteModel.assetConfig();
        };


        /*Delete Row With Prompt*/
        self.deleteAsset = function (row) {
            bootbox.confirm({
                title: 'Delete tenant ' +row.assetName,
                message: 'Do you want to delete the asset ' +row.assetName+ ' permanently, this action cannot be undone',
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
                        ds.deleteAsset(row.assetId)
                                .then(function () {
                                    self.searchData();
                                    self.ready(true);
                                    bootbox.alert('Asset deleted Successfully!');
                                })
                                .catch(function (err) {
                                    alert('Error:' + err.responseText);
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

    return assetListContentViewModel;
});
