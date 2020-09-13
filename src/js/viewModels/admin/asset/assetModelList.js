
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'ojs/ojknockout', 'ojs/ojrouter', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 'ojs/ojselectcombobox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetTypeListContentViewModel(params) {
        var self = this;
         /*Success message code*/
        self.result = ko.observable();  
        self.mode=ko.observable();
        self.added = ko.observable(false);
        self.message = ko.observable();
        self.modify = ko.observable();
        try {
           self.added(params.result.modify) 
           self.message(params.result.updateMode ? "Asset Model Updated Successfully!" : "Asset Model Added Successfully!")
            setTimeout(function () {
                self.added(false);
            }, 2000);
           // console.log(params.result);
        } catch (e) {
           // console.log(e);
        }

        self.ready = ko.observable(true);

        self.assetRouteModel = ko.dataFor(document.getElementById('assetRoute'));

        self.assetModelList = ko.observableArray();

        //Setup Search
        self.searchArray = ko.observableArray();
        self.searchArray.push({key: "assetModel", value: ""});

        self.searchKeys = [
            {name: 'Model', id: 'assetModel'}
        ];

        /*Search Data*/
        self.searchData = function () {

            let filter = {};
            self.searchArray().forEach(function (row) {
                if (row.value) {
                    filter[row.key] = row.value;
                }
            });

            self.ready(false);
            self.assetModelList.removeAll();
            ds.getAssetModelList(filter).
                    then(function (result) {
                        //console.log(filter);
                        if (result.success) {
                            result.data.forEach(function (assetModel) {
                                assetModel.assetModelName = assetModel.assetModelName || 'Test';
                                self.assetModelList.push(assetModel);
                            });
                        } else {
                            bootbox.alert('Unable to fetch Asset model list. Try again !!');
                        }

                        self.ready(true);
                    });
        };

        /*Route to Add Row*/
        self.addAssetModel = function () {
            self.assetRouteModel.goToAssetModel();
        };

        /*Route to Update Row*/
        self.updateAssetModel = function (row) {
            self.assetRouteModel.updateAssetModel(row);

        };

        /*Delete Row With Prompt*/
        self.deleteAssetModel = function (row) {
            bootbox.confirm({
                title: 'Delete asset model ' +row.assetModel,
                message: 'Do you want to delete the asset type ' +row.assetModel+ ' permanently, this action cannot be undone',
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
                        ds.deleteAssetModel(row.assetType, row.assetModel)
                                .then(function () {
                                    self.searchData();
                                    self.ready(true);
                                })
                                .catch(function (err) {
                                    alert('Unable to delete Asset model list. Try Again !!!');
                                    self.ready(true);
                                });
                    }
                }
            });

        };

    }

    return assetTypeListContentViewModel;
});
