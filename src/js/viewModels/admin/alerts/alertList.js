/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * alertList module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'bootbox', 'ojs/ojlabel', 'ojs/ojselectcombobox', 'ojs/ojdialog'
], function (oj, ko, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function alertListContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        document.getElementById('tenantSelect').disabled=false;
        self.alertList = ko.observableArray();
        self.ready(false);
        self.alertList.removeAll();
        self.result = ko.observable();
        self.mode = ko.observable();
        self.assetArray = ko.observableArray();
        self.assetName = ko.observable();
        self.alertCount = ko.observable();
        self.to = ko.observableArray();

        /*AssetID Array*/

        self.assetIdArrayTemp = ko.observableArray();
        self.assetIdArray = ko.observableArray();

        //Reload page
        self.refreshDb = function () {
            self.searchData();
        };


        self.searchData = function () {
            ds.getAlertRules().
                    then(function (result) {
                        self.alertList(result.data);

                        self.ready(true);
                        self.alertList().forEach(function (item) {
                            self.assetIdArray.push(item.assets);
                            self.assetIdArrayTemp.push(item.assets);
                        });
                    });
        };
        self.searchData();

        /*Route to Update Row*/
        self.updateRow = function (row) {
            //console.log(row);
            self.alertRouteModel.updateRow(row);
        };

        self.edit = function (row) {        
            document.querySelector('#modalDialog6').open();
            //console.log(row);

            self.assetArray.removeAll();
            for (var key1 in row.alertDetails) {
                self.to(row.ccAddress);
                  if (row.alertDetails.hasOwnProperty(key1)) {
                        var val1 = row.alertDetails[key1];
                    self.assetArray.push({key: key1, value: val1});
                  }
            }
        };

        self.mute = function (row, mute) {
            var updateObj = {
                alertName: row.alertName,
                active: !mute
            }
            
            // console.log(updateObj)
            ds.addAlertRule({data:updateObj}, "PUT",row.alertName)
                    .done(function (result) {
                        bootbox.alert('Notification Updated Successfully');
                        self.searchData();
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to add/update Notification... ' + err.responseJSON.error + ' Try Again !!!');
                        //console.log('Error:' + err);
                    });
        }


        /*Delete Row With Prompt*/
        self.deleteRow = function (row) {
            bootbox.confirm({
                title: 'Delete Alert ' +row.alertName,
                message: 'Do you want to delete ' +row.alertName+ ' permanently, this action cannot be undone',
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
                        ds.deleteAlertRule(row.alertName)
                                .then(function () {
                                    self.searchData();
                                    bootbox.alert('Alert deleted Successfully!');
                                    self.ready(true);
                                })
                                .catch(function (err) {
                                    alert('Unable to delete alert. Try Again Later !!!');
                                    self.ready(true);
                                });
                    }
                }
            });
        };

        $(document).ready(function () {
            self.alertRouteModel = ko.dataFor(document.getElementById('alertRoute'));
        });
    }

    return alertListContentViewModel;
});
