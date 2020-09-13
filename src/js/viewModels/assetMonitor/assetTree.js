/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * assetTree module
 */
define(['ojs/ojcore', 'knockout', 'dataservice', 'jquery','bootbox', 'jstree'
], function (oj, ko, ds, $,bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetTreeContentViewModel() {
        var self = this;

        self.ready = ko.observable(true);
        self.assetTree = ko.observableArray();
        self.message = ko.observable();

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.monViewModel = ko.dataFor(document.getElementById('monitor'));
        self.tenantId = ko.observable(localStorage.getItem("upTenantId"));

        if (!self.monViewModel) {
            self.monViewModel = ko.dataFor(document.getElementById('alertRoute'));
        }

        self.assetArray = ko.observableArray([]);
        document.getElementById('tenantSelect').disabled=false;

        self.loadData = function () {
            self.ready(false);
            ds.getAssetLocTree().
                then(function (result) {
                    self.assetTree.removeAll();
                    if (result.success) {
                        self.ready(true);
                        self.ActivateTree(result.data)
                        //  $("#container").jstree("refresh");
                    } else {
                        self.message(result.error);
                    }

                });
        };

        self.rootViewModel.tenantId.subscribe(function (newValue) {
            self.loadData();
        });


        if (self.monViewModel.lastrefresh) {
            self.monViewModel.lastrefresh.subscribe(function (newValue) {
                self.loadData();
            });
        }

        /*Get Asset List Call*/
        ds.getAssetListTree(self.tenantId()).
            then(function(res){
                self.rootViewModel.assetArray(res[0].savedAssetListId);
            });

        self.loadUserAssets = function () {
            $('#container').jstree('select_node', self.rootViewModel.assetArray());
        }

        /*Save Asset Call*/
        self.saveUserAssets = function () {
            ds.saveAssetList(getJSONData(), self.tenantId()).
                then(function (result) {
                    bootbox.alert('Assets saved Successfully !!!');
                });
        };

        function getJSONData() {
            var dataVal = {
                'tenantId': self.tenantId(),
                'savedAssetListId': self.assetArray()
            };
            return dataVal;
        }
        $(document).ready(function () {
            self.loadData();
        });


        self.ActivateTree = function (treeData) {
            $('#container').on('changed.jstree', function (e, data) {
                var i, j;
                self.assetArray.removeAll();
                for (i = 0, j = data.selected.length; i < j; i++) {
                    if (data.instance.get_node(data.selected[i]).original.type === 'asset') {
                        self.assetArray.push(data.instance.get_node(data.selected[i]).id);
                    }
                }
                self.rootViewModel.assetArray(self.assetArray());

            }).on('loaded.jstree', function () {
                self.loadUserAssets();
            }).jstree({
                'core': {
                    'data': treeData
                },
                types: {
                    "asset": {
                        "icon": "fa fa-leaf"
                    }
                },
                "plugins": ["checkbox", "search", "types"],
                "search": {
                    'case_sensitive': false,
                    'show_only_matches': true
                }
            });
        }


        self.searchNode = function () {
            $("#container").jstree(true).search($("#q").val());
        }

    }

    return assetTreeContentViewModel;
});
