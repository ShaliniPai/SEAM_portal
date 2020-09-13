define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojswitch', 'ojs/ojselectcombobox'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function assetLevelsContentViewModel() {
        var self = this;
        self.RouteModel = ko.dataFor(document.getElementById('assetRoute'));

        self.levelsArray = ko.observableArray([]);
        self.updateMode = ko.observable(false);
        self.ready = ko.observable(false);
        self.totalAssets = ko.observable(0);
        self.disableForm = ko.observable(false)

        self.loadData = function () {
            self.ready(false);
            ds.getAssetConfig()
                    .done(function (result) {
                        if (result.success) {
                            if (result.result.levels) {
                                self.levelsArray(result.result.levels.slice(0));
                            }
                            self.ready(true);
                        } else {
                            bootbox.alert('Unable to fetch Asset Configurations. Try again !!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to fetch Asset Configurations. Try again !!');
                    });
        };

        self.loadData();

        ds.getAssetTypeCount()
                .then(function (result) {
                    if (result.success) {
                        result.data.forEach(function (type) {
                            if (self.totalAssets() + type.assetCount > 0) {
                                self.disableForm(false);
                                //console.log("Loc count:" + type.assetCount)
                            } else {
                                self.disableForm(true);
                                //console.log("Loc count:" + type.assetCount)
                            }

                        });
                    }
                })
                .fail(function (err) {
                    //console.log(err);
                    bootbox.alert('Unable to fetch Asset types data. Try again !!');
                    self.chartReady1(true);
                });


        self.saveConfig = function () {

            self.updateMode(false);

            $('#save').hide();
            $('#cancel').hide();

            $.ajaxSetup({contentType: "application/json; charset=utf-8"});

            let method = "POST";

            ds.addUpdateAssetConfig(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {
                            $('#save').show();
                            $('#cancel').show();

                            self.updateMode(true);

                            setTimeout(function () {
                                self.updateMode(false);
                            }, 5000);

                        } else {
                            bootbox.alert('Unable to add/update Asset Config Data. Try again !!');
                        }
                    })
                    .fail(function (err) {
                       // console.log(err);
                        alert('Unable to add/update Asset Config Data. Try again !!');
                        $('#save').show();
                        $('#cancel').show();
                    });

        };

        self.cancel = function () {
            self.RouteModel.goToList();
        };


        self.addLevel = function () {
            self.levelsArray.push({level: 0, label: ''});
        };

        self.deleteLevel = function (data, index) {
            self.levelsArray.splice(index(), 1);
        };

        self.getJSONData = function () {

            self.levelsArray().forEach(function (level, index) {
                level.level = index;
            });
            let data = {levelCount: self.levelsArray().length, levels: self.levelsArray()};
            return ko.toJSON(data);
        };


    }

    return assetLevelsContentViewModel;
});
