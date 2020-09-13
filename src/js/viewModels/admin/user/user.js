define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojswitch'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function userContentViewModel(params) {
        var self = this;
        /*Initialize the Screen Variables*/
        self.email = ko.observable();
        self.password = ko.observable();
        self.firstName = ko.observable();
        self.lastName = ko.observable();
        self.phone = ko.observable();
        self.enabled = ko.observable(true);
        self.role = ko.observable();
        self.tenantId = ko.observable();

        /*Disable/Enable User name field based on update mode*/
        self.updateMode = params.mode === 'update' ? true : false;
        self.type = params.mode === 'update' ? 'PUT' : 'POST';
        self.route = params.profile ? 'selfProfileRoute' : 'userRoute';
        self.updateMode = ko.observable(false);

        self.rootViewModel = ko.dataFor(document.getElementById("globalBody"));
        self.sysRole = self.rootViewModel.sysRole();

        self.roles = [];

        if (self.sysRole === 'SystemAdmin' || self.sysRole === 'SystemUser') {
            self.role('TenantUser');
            self.roles.push({name: 'Tenant User', id: 'TenantUser'});
        } else {
            self.role('TenantUser');
            self.roles.push({name: 'Tenant User', id: 'TenantUser'});
        }


//        self.roles = [
//            {name: 'Tenant Admin', id: 'TenantAdmin'},
//            {name: 'Tenant User', id: 'TenantUser'},
//            {name: 'System Admin', id: 'SystemAdmin'},
//            {name: 'System User', id: 'SystemUser'}];

        /*Get the parent context reference*/
        self.RouteModel = ko.dataFor(document.getElementById(self.route));

        /*Get the complete object for Edit or Just Open for Add*/
        if (params.mode === 'update') {
            self.updateMode(true);
            self.email(params.data['email']);
            self.password('');
            self.firstName(params.data['firstName']);
            self.lastName(params.data['lastName']);
            self.phone(params.data['phone'] || '');
            self.role(params.data['sysRole']);
            self.enabled(params.data['enabled']);
            self.tenantId(params.data['tenantId']);
        }

        /*Handle Screen Control Actions*/
        self.saveUser = function () {
            $('#save').hide();
            $('#cancel').hide();

            $.ajaxSetup({contentType: "application/json; charset=utf-8"});

            let method = "POST";
            if (params.mode === 'update') {
                method = "PUT";
            }

            if (self.getJSONData().password) {
                if (self.getJSONData().password.length < 8) {
                    return    bootbox.alert('Error:' + "Password Length is less than 8");
                }
            }

            ds.addUpdateUser(self.getJSONData(), method)
                    .done(function (result) {
                        if (result.success) {                       
                           let data = {
                                modify : true,
                                updateMode: self.updateMode()
                            }
                             self.RouteModel.goToList(data);
                        } else {
                            bootbox.alert('Error:'+result.error);
                        }
                    })
                    .fail(function (err) {
                        let op;
                        if(method==='POST'){
                            op='add'
                        }else{
                            op='update'
                        }
                        bootbox.alert('Unable to ' +op+ ' user. Verify all fields. Try Again !!!');
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
                'email': self.email(),
                'firstName': self.firstName(),
                'lastName': self.lastName(),
                'phone': self.phone(),
                'sysRole': self.role(),
                'enabled': self.enabled()
            };

            if (self.password()) {
                if (self.password().length > 8) {
                    data.password = self.password();
                } else {
                    bootbox.alert('Error:' + "Password Length is less than 8");
                }
            }
            return ko.toJSON(data);
        };

        self.setPassword = function () {
            bootbox.prompt({
                title: "Please enter the password",
                inputType: 'password',
                callback: function (result) {
                   // console.log('Setting Password:' + result);
                    self.password(result);
                }});
        };

        self.readyTags = ko.observable(false);
        self.tagsArray = ko.observableArray();

        self.openTags = function () {
            self.readyTags(false);
            self.tagsArray.removeAll();
            ds.getUserTags(self.tenantId(), self.email())
                    .done(function (result) {
                        if (result.success) {
                            if (result.tags) {
                                self.tagsArray(result.tags.slice(0));
                            }
                            self.readyTags(true);
                        } else {
                            bootbox.alert('Error:' + result.error);
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:Unable to get user Tags. Check Authorization !!!');
                    });
        };

        self.saveTags = function (tagsArray) {
            ds.updateUserTags(self.tenantId(), self.email(), JSON.stringify({tags: tagsArray}))
                    .done(function (result) {
                        if (result.success) {
                            bootbox.alert('Tags Updated Successfully.');
                        } else {
                            bootbox.alert('Error:' +result.error);
                        }
                    })
                    .fail(function (err) {
                        bootbox.alert('Error:' +"Unable to add Tags. Try Again !!!");
                    });
        };
    }

    return userContentViewModel;
});
