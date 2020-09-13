
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'ojs/ojknockout', 'ojs/ojrouter', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable','ojs/ojselectcombobox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetTypeListContentViewModel() {
        var self = this;

        self.ready = ko.observable(true);

        self.assetRouteModel = ko.dataFor(document.getElementById('assetRoute'));

        self.assetTypeList = ko.observableArray();

        //Setup Search
        self.searchArray = ko.observableArray();
        self.searchArray.push({key: "assetType", value: ""});

        self.searchKeys = [
            {name: 'Asset Type', id: 'assetType'},
            {name: 'Name', id: 'assetTypeName'}

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
            self.assetTypeList.removeAll();
            ds.getAssetTypeList(filter).
                    then(function (result) {
                        if (result.success) {
                            result.data.forEach(function (assetType) {
                                self.assetTypeList.push(assetType);
                            });
                        } else {
                            bootbox.alert('Unable to fetch Asset type list. Try again !!');
                        }
                       // console.log(self.assetTypeList())
                        self.ready(true);
                    });
        };

        /*Route to Add Row*/
        self.addAssetType = function () {
            self.assetRouteModel.addAssetType();
        };

        /*Route to Update Row*/
        self.updateAssetType = function (row) {
            self.assetRouteModel.updateAssetType(row);

        };

        /*Delete Row With Prompt*/
        self.deleteAssetType = function (row) {
            bootbox.confirm({
                title: 'Delete tenant ' +row.assetType,
                message: 'Do you want to delete the asset type ' +row.assetType+ ' permanently, this action cannot be undone',
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
                        ds.deleteAssetType(row.assetType)
                                .then(function () {
                                    self.searchData();
                                    self.ready(true);
                                })
                                .catch(function (err) {
                                    alert('Error:' + err.responseText);
                                    self.ready(true);
                                });
                    }
                }
            });

        };

    }

    return assetTypeListContentViewModel;
});
