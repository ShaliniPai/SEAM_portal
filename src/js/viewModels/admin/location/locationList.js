
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'ojs/ojknockout', 'ojs/ojrouter', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 'ojs/ojselectcombobox'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function locationListContentViewModel(params) {
        var self = this;
        document.getElementById('tenantSelect').disabled=false;
        /*Success message code*/
        self.result = ko.observable();  
        self.mode=ko.observable();
        self.added = ko.observable();
        self.message = ko.observable();
        self.modify = ko.observable();
        try {
           self.added(params.result.modify) 
           self.message(params.result.updateMode ? "Location Updated Successfully!" : "Location Added Successfully!")
            setTimeout(function () {
                self.added(false);
            }, 2000);
           // console.log(params.result);
        } catch (e) {
            console.log(e);
        }


        self.dataObservableArray = ko.observableArray();

        self.headerReady = ko.observable(false);
        self.ready = ko.observable(true);

        self.locationRouteModel = ko.dataFor(document.getElementById('locationRoute'));


        self.locationList = ko.observableArray();
        self.locConfig = [];

        //Setup Search
        self.searchArray = ko.observableArray();
        self.searchArray.push({key: "name", value: ""});

        self.searchKeys = [
            {name: 'Name', id: 'locName'}
        ];

        self.headers = ko.observableArray([]);


        /*Search Data*/

        self.searchData = function () {

            let filter = {};
            self.searchArray().forEach(function (row) {
                if (row.value) {
                    filter[row.key] = row.value;
                }
            });

            self.ready(false);
            self.locationList.removeAll();
            self.headers.removeAll();
            ds.getLocList(filter).
                    then(function (result) {
                        if (result.success) {
                            if (result.header) {
                                result.header.levels.forEach(function (level) {
                                    self.headers.push(level);
                                });
                            }
                            result.data.forEach(function (loc) {
                                self.locationList.push(loc);
                            });
                        } else {
                            bootbox.alert('Unable to fetch Location List. Try Again !!!');
                        }
                        self.ready(true);
                    });
        };

        /*Route to Add Row*/
        self.addRow = function () {
            self.locationRouteModel.addRow();

        };

        /*Route to Update Row*/
        self.updateRow = function (row) {
            self.locationRouteModel.updateRow(row);

        };

        /*Route to Loading the location tree*/
        self.loadTree = function () {
            self.locationRouteModel.loadTree();
        };

        /*Route to loading the location config*/
        self.locConfig = function () {
            self.locationRouteModel.locationConfig();
        };




        /*Delete Row With Prompt*/
        self.deleteLoc = function (row) {
            bootbox.confirm({
                title: 'Delete tenant ' +row.locName,
                message: 'Do you want to delete the location ' +row.locName+ ' permanently, this action cannot be undone',
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
                        ds.deleteLoc(row.locId)
                                .then(function () {
                                    self.searchData();
                                    self.ready(true);
                                    bootbox.alert('Location deleted Successfully!');
                                })
                                .catch(function (err) {
                                    bootbox.alert('Unable to delete Location. Try Again Later !!!');
                                    self.ready(true);
                                });
                    }
                }
            });

        };

    }

    return locationListContentViewModel;
});
