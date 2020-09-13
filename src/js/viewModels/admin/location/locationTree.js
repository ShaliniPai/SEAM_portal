/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * locationTree module
 */
define(['ojs/ojcore', 'knockout', "jquery", 'dataservice', 'ojs/ojtreeview', 'ojs/ojjsontreedatasource'
], function (oj, ko, $, ds) {
    /**
     * The view model for the main content view template
     */
    function locationTreeContentViewModel() {
        var self = this;
        self.ready = ko.observable();
        document.getElementById('tenantSelect').disabled=false;
        // self.data = new oj.JsonTreeDataSource(JSON.parse(jsonData));
        self.data;
        self.selection = ko.observableArray();


        self.locationList = ko.observableArray();
        self.locConfig = [];

        self.headers = ko.observableArray([])


        /*Initial Load of All Users*/
        self.loadData = function () {
            self.ready(false);
            self.locationList.removeAll();
            ds.getLocList().
                    then(function (result) {
                        //console.log(result);

                        result.header.levels.forEach(function (level) {
                            self.headers.push(level);
                        });

                        result.data.forEach(function (loc) {
                            self.locationList.push(loc);
                        });

                        let levels = self.headers().length;

                        //console.log(levels)

                        let jsonData = []
                        let tracker = [];

                        //Create Clone field with _1 for levels. 
                        //Append each field with the parent level element to avoid duplicates
                        self.locationList().forEach(function (loc) {
                            let tempKey = '';
                            for (let i = levels - 1; i >= 0; i--) {
                                let key = self.headers()[i].label;
                                let tempVar = key + '_1'
                                if (tempKey) {
                                    loc.level[tempVar] = loc.level[key];
                                    loc.level[key] = loc.level[key] + '+' + tempKey;
                                } else {
                                    loc.level[tempVar] = loc.level[key];
                                }
                                tempKey = loc.level[key];
                            }
                        });

                        for (let i = 0; i < levels; i++)
                        {
                            let key = self.headers()[i].label;
                            let parentKey = 'root';

                            if ((i + 1) < levels) {
                                parentKey = self.headers()[i + 1].label;
                            }

                            self.locationList().forEach(function (loc) {
                                if (tracker.indexOf(loc.level[key]) < 0)
                                {
                                    let tempVar = key + '_1'
                                    tracker.push(loc.level[key])
                                    jsonData.push({id: loc.level[key], parent: loc.level[parentKey], attr: {id: loc.level[key], title: loc.level[tempVar]}})
                                }
                            });
                        }
                        //console.log(JSON .stringify(jsonData));

                        let  treeObj = listToTree(jsonData, {idKey: 'id', parentKey: 'parent', childrenKey: 'children'});
                        self.data = new oj.JsonTreeDataSource(treeObj);
                        self.ready(true)
                    });
        }


        function listToTree(data, options) {
            options = options || {};
            var ID_KEY = options.idKey || 'id';
            var PARENT_KEY = options.parentKey || 'parent';
            var CHILDREN_KEY = options.childrenKey || 'children';

            var tree = [],
                    childrenOf = {};
            var item, id, parentId;

            for (var i = 0, length = data.length; i < length; i++) {
                item = data[i];
                id = item[ID_KEY];
                parentId = item[PARENT_KEY] || 0;
                // every item may have children
                childrenOf[id] = childrenOf[id] || [];
                // init its children
                item[CHILDREN_KEY] = childrenOf[id];
                if (parentId != 0) {
                    // init its parent's children object
                    childrenOf[parentId] = childrenOf[parentId] || [];
                    // push it into its parent's children object
                    delete item['id'];
                    delete item['parent'];
                    childrenOf[parentId].push(item);
                } else {
                    delete item['id'];
                    delete item['parent'];
                    tree.push(item);
                }
            }
            ;

            return tree;
        }


        self.loadData();
        self.ready(false);


        self.selectionChanged = function (event) {
            console.log(event.detail.value);
        }

        self.RouteModel = ko.dataFor(document.getElementById('locationRoute'));
        self.cancel = function () {
            self.RouteModel.goToList();
        };


    }

    return locationTreeContentViewModel;
});
