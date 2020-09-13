
/**
 * mileageDet module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'moment', 'bootbox', 'slimscroll', 'ojs/ojselectcombobox', "daterangepicker", 'bootstrap-datepicker', 'ojs/ojtimezonedata', 'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojselectcombobox', 'ojs/ojdialog'
], function (oj, ko, ds, moment, bootbox, slimscroll) {
    /**
     * The view model for the main content view template
     */
    function alertsContentViewModel(asset) {
        // console.log('Asset:'+assetId)
        var self = this;
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        document.getElementById('tenantSelect').disabled=false;
        //console.log(asset);
        //console.log(rootViewModel.userLogin());
        self.ready = ko.observable(false);
        //self.params = ko.observable(asset);
        //console.log("asset details" +self.params().tenantId);
        self.messageArray = ko.observableArray();

        /*Date Time Picker Parameters*/
        self.start = moment().subtract(6, 'days');
        self.end = moment();
        self.dateText = ko.observable();

        /*Alert Parameters*/
        self.status = ko.observable("Open");
        self.assetId = ko.observable(asset.assetId);
        self.alerts = ko.observableArray();
        self.action = ko.observable("Open");
        self.selectedAlertId = ko.observable();
        self.alertsno = ko.observable();
        self.statusdetail = ko.observable();
        // self.userLogin = ko.observable(rootViewModel.userLogin());

        self.commentsArray = ko.observableArray();
        self.commentDet = ko.observableArray();

        /*Save Comment Parameters*/
        self.alertId = ko.observable();
        self.tenantId = ko.observable();
        self.did = ko.observable();
        self.username = ko.observable();
        self.usercomment = ko.observable();

        //Paging Functionality
        self.page = ko.observable(0);
        self.skip = ko.observable(10);

        self.fromDoc = ko.observable(0);
        self.toDoc = ko.observable(0);
        self.totDoc = ko.observable(0);


        self.actions = [
            { name: 'Open', id: 'Open' },
            { name: 'Close', id: 'Closed' },
            { name: 'In Progress', id: 'Inprogress' }];

        self.statlLkp = ko.observableArray([
            {
                "value": "Open",
                "label": "Open"
            },
            {
                "value": "Closed",
                "label": "Closed"
            },
            {
                "value": "Inprogress",
                "label": "In Progress"
            }
        ]);
        self.assetLkp = ko.observableArray([]);

        
        /*Initial Load of All Alerts*/
        function getFilterData() {
            let filterObj = {};
            filterObj.status = self.status();
            filterObj.fromTs = self.start;
            filterObj.toTs = self.end;

            if (self.assetId()) {
                filterObj.assetId = [self.assetId()];
            }

            return filterObj;
        }

        self.loadData = function () {
            ds.getAlertList(getFilterData(), self.page(), self.skip()).
                then(function (result) {
                    if (result.success) {
                        //self.messageArray.removeAll();
                        result.data.forEach(function (row) {
                            if (!row.alertType || !row.alertText) {
                                row.alertType = ' ';
                                row.alertText = ' ';
                            }

                        });
                        self.messageArray(result.data);

                        if (result.data.length > 0) {
                            self.totDoc(result.totalCount);
                            self.fromDoc((self.skip() * self.page()) + 1);
                            self.toDoc((self.page() * self.skip()) + self.skip());
                        }

                        self.ready(true);
                    }
                })
                .fail(function (err) {
                    console.log(err);
                    bootbox.alert('Error:' + err.responseText);
                });
        };


        /*Alert List*/
        self.loadAssets = function () {
            ds.getAssetList().then(function (result) {
                if (result.success) {
                    //self.assetLkp.removeAll();
                    result.data.forEach(function (row) {
                        //self.assetLkp.removeAll();
                        //let assetLkp=[];
                        self.assetLkp.push({ "value": row.assetId, "label": row.assetName });
                    });
                }
                self.loadData();
            })
        }
        self.loadAssets();


        $(document).ready(function () {
            /*Date Time Code*/
            $("#reportrange1").daterangepicker({
                startDate: self.start,
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

           

        });

        //  $('#reportrange span').html(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'));

        self.datePicked = function (start, end) {
            // console.log(moment(start).unix(), moment(end).unix());
            self.start = start;
            self.end = end;
            self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
            console.log(self.start.unix(), self.end.unix());
            //console.log(self.start.utc().toString(),self.end.utc().toString());
        };

        // self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
        self.addComments = function (row) {
            document.querySelector('#modalDialog2').open();
            self.commentsArray(row.comments);
            self.did(row.did);
            self.alertsno(row.alertsno);
            self.tenantId(row.tenantId);
            if (row.status === 'closed') {
                // $("#btnLoad").attr('value', 'View Comments');
                document.getElementById('commentText').hidden = true;
                document.getElementById('Action').hidden = true;
                document.getElementById('commentButtons').hidden = true;
                document.getElementById('commentsHeader').hidden = false;
            } else {
                document.getElementById('commentText').hidden = false;
                document.getElementById('Action').hidden = false;
                document.getElementById('commentButtons').hidden = false;
                document.getElementById('commentsHeader').hidden = true;
            }
        };


        self.saveAlert = function () {
            $('#save').hide();
            $('#cancel').hide();
            $.ajaxSetup({ contentType: "application/json; charset=utf-8" });
            console.log(JSON.stringify(self.getJSONData()));

            //let method = "POST";

            ds.addAlertComment(self.getJSONData())
                .done(function (result) {
                    if (result.success) {
                        self.messageArray.removeAll();
                        self.messageArray(result.data);
                        self.ready(true);
                        //bootbox.alert('Alert updated Successfully !!!');
                        $('#commentButtons').click(function () {
                            document.querySelector('#modalDialog2').close();
                            // self.loadData();
                        });
                        self.ready(true);
                        document.querySelector('#modalDialog2').close();
                    } else {
                        bootbox.alert('Kindly insert a comment before submitting !!!');

                    }

                    self.usercomment("");
                    self.action("");
                })
                .fail(function () {
                    bootbox.alert('Kindly insert a comment before submitting !!!');
                    $('#save').show();
                    $('#cancel').show();
                });
        };


        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                "alertId": self.alertsno().toString() || '',
                "tenantId": self.tenantId() || '',
                "did": self.did() || '',
                "status": self.action(),
                "username": localStorage.getItem('upUsername'),
                "usercomment": self.usercomment()
            };
            return data;
        };



        //Paging functionality
        self.previous = function () {
            if (self.page() > 0) {
                self.page(self.page() - 1);
                self.loadData();
            } else {
                console.log('No Action');
            }
        };

        self.next = function () {
            if (self.totDoc() >= self.toDoc()) {
                self.page(self.page() + 1);
                self.loadData();
            }
        };

        self.cancel = function () {
            document.querySelector('#modalDialog2').close();
        };


    }
    return alertsContentViewModel;
});
