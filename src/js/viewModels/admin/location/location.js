define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojswitch', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function locationContentViewModel(params) {
        var self = this;
        document.getElementById('tenantSelect').disabled=false;
        self.ready = ko.observable(false);
        self.locId = ko.observable("");
        self.levelsArray = ko.observableArray();
        self.currency = ko.observable();
        self.locName = ko.observable();
        self.tz = ko.observable();
        self.country = ko.observable();
        self.lat = ko.observable();
        self.lon = ko.observable();
        self.enabled = ko.observable(true);

        /*Disable/Enable User name field based on update mode*/
        self.type = params.mode === 'update' ? 'PUT' : 'POST';
        self.route = 'locationRoute';
        self.updateMode = ko.observable(false);
        self.RouteModel = ko.dataFor(document.getElementById(self.route));


        /*Get the complete object for Edit or Just Open for Add*/
        if (params.mode === 'update') {
            self.updateMode(true);
            self.locId(params.data['locId']);
            self.currency(params.data['currency']);
            self.locName(params.data['locName']);
            self.tz(params.data['tz'] || '');
            self.enabled(params.data['enabled']);
            self.country(params.data['country']);
            self.lat(params.data.latLong[0]);
            self.lon(params.data.latLong[1]);
        }

        self.currencies = [
            {name: 'INR', id: 'INR'},
            {name: 'USD', id: 'USD'},
            {name: 'GBP', id: 'GBP'}

        ]
        self.tzs = [
            {name: 'Asia/Kolkata', id: 'Asia/Kolkata'},
            {name: 'Asia/Singapore', id: 'Asia/Singapore'},
            {name: 'Europe/Berlin', id: 'Europe/Berlin'},
            {name: 'Europe/London', id: 'Europe/London'}
        ]

        self.countries = [
            {name: 'India', id: 'IND'},
            {name: 'Singapore', id: 'SGP'},
            {name: 'Germany', id: 'GER'}
        ]
        self.loadData = function () {
            self.ready(false);
            ds.getLocConfig()
                    .done(function (result) {
                        if (result.success) {
                            if (result.result.levels) {
                                result.result.levels.forEach(function (level) {
                                    if (params && params.data && params.data.level && self.updateMode()) {
                                        level.value = params.data.level[level.label];
                                    } else {
                                        level.value = '';
                                    }
                                    self.levelsArray.push(level)
                                });
                            }
                        } else {
                            bootbox.alert('Unable to get the Location Configuraion. Try Again !!!');
                        }
                        self.ready(true);
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to get the Location Configuraion. Try Again !!!');
                    });
        };

        self.loadData();

        /*Handle Screen Control Actions*/

        self.saveLocation = function () {
            $('#save').hide();
            $('#cancel').hide();
            $.ajaxSetup({contentType: "application/json; charset=utf-8"});
           // console.log(self.getJSONData());

            let method = "POST";

            if (self.updateMode()) {
                method = "PUT";
                
            }

            ds.addUpdateLoc(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {
                            let data = {
                                modify : true,
                                updateMode: self.updateMode()
                            }
                             self.RouteModel.goToList(data);
                           
                        } else {
                            bootbox.alert('Unable to add/update Location. Try Again !!!');
                        }
                     
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to add/update Location. Try Again !!!');
                        $('#save').show();
                        $('#cancel').show();
                    });
        };

        self.cancel = function () {
            self.RouteModel.goToList();
        };


        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                'locName': self.locName() || 'Bangalore',
                'country': self.country() || 'IND',
                'latLong': [self.lat() || '0', self.lon() || '1'],
                'currency': self.currency(),
                'tz': self.tz(),
                'enabled': self.enabled(),
                'level': {}
            };

            if (self.updateMode()) {
                data.locId = self.locId();
            }

            self.levelsArray().forEach(function (level) {
                data.level[level.label] = level.value;
            });

            return ko.toJSON(data);
        };


        self.readyTags = ko.observable(false);
        self.tagsArray = ko.observableArray();

        self.openTags = function () {
            self.readyTags(false);
            self.tagsArray.removeAll();
            ds.getLocTags(self.locId())
                    .done(function (result) {
                        if (result.success) {
                            if (result.tags) {
                                self.tagsArray(result.tags.slice(0));
                            }
                            self.readyTags(true);
                        } else {
                            bootbox.alert('Unable to fetch Location Tags. Try Again !!!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to fetch Location Tags. Try Again !!!');
                    });
        };

        self.saveTags = function (tagsArray) {
            //console.log(tagsArray);
            ds.updateLocTags(self.locId(), JSON.stringify({tags: tagsArray}))
                    .done(function (result) {
                        if (result.success) {
                            console.log('Tags Updated Successfully');
                        } else {
                            bootbox.alert('Unable to update Location Tags. Try Again !!!');
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Unable to update Location Tags. Try Again !!!');
                    });
        };


    }

    return locationContentViewModel;
});
