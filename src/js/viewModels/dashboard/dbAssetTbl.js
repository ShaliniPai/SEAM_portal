/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * assetDetDb module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'moment', 'dataservice', 'bootbox', 'datatables', 'datatables.net', "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, $, moment, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetDetDbContentViewModel() {
        var self = this;
        self.assetArr = ko.observableArray([]);
        self.ready = ko.observable(true)
        self.message = ko.observable();
        $("#example").dataTable().fnDestroy();

        // $(document).ready(function () {
        //     $('#example').DataTable({
        //         retrieve: true,
        //         "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]]
        //     });
        // });

        /*Date Attributes */
        self.start = moment().subtract(6, 'days').startOf("day");
        self.end = moment().endOf("day");
        self.dateText = ko.observable();

        self.handleAttached = function () {
            $("#reportrange").daterangepicker({startDate: self.start,
                endDate: self.end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, self.datePicked);
        };

        self.datePicked = function (start, end) {
            // console.log(moment(start).unix(), moment(end).unix());
            self.start = start;
            self.end = end;
            self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
            //console.log(self.start.unix(), self.end.unix());
            //console.log(self.start.utc().toString(),self.end.utc().toString());
        };

        // self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))

        //Loading Data
        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.dbViewModel = ko.dataFor(document.getElementById('dashboard'));

        self.loadData = function () {
            self.ready(false);
            ds.getDBAssets().
                    then(function (result) {
                        if (result.success) {
                            self.assetArr.removeAll();
                            self.assetArr(result.data);
                        } else {
                            bootbox.alert('Unable to load Elevators List. Try Again Later !!')
                            console.log(result.error);
                        }
                        self.ready(true);

                        $('#example').DataTable({
                            retrieve: true,
                            "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]]
                        });
                    });
        };

        self.rootViewModel.tenantId.subscribe(function (newValue) {
            self.loadData();
        });


        self.dbViewModel.lastrefresh.subscribe(function (newValue) {
            self.loadData();
        });

        self.loadData();
    }

    return assetDetDbContentViewModel;
});
