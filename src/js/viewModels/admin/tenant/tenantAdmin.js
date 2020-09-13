define(['ojs/ojcore', 'knockout', 'config', 'dataservice', 'bootbox', 'ojs/ojbutton', 'ojs/ojinputnumber', 'ojs/ojinputtext', 'ojs/ojselectcombobox'
], function (oj, ko, config, ds, bootbox) {
    /**
     * The view model for the main content view template
     */
    function tenantAdminContentViewModel(params) {
        var self = this;
        /*Initialize the Screen Variables*/

        self.email = ko.observable();
        self.password = ko.observable();
        self.firstName = ko.observable();
        self.lastName = ko.observable();
        self.phone = ko.observable();
        self.enabled = ko.observable(true);
        self.role = ko.observable('TenantAdmin');
        self.tenantId = ko.observable(params);


        /*Disable/Enable User name field based on update mode*/
        self.updateMode = ko.observable(false);


        self.roles = [
            {name: 'Tenant Admin', id: 'TenantAdmin'}
        ];

        /*Handle Screen Control Actions*/
        /*Handle Screen Control Actions*/

        self.saveUser = function () {
            $('#save').hide();
            $('#cancel').hide();

            $.ajaxSetup({contentType: "application/json; charset=utf-8"});

            let method = "POST";

            if (self.getJSONData().password) {
                if (self.getJSONData().password.length < 8) {
                    return    bootbox.alert('Error:' + "Password Length is less than 8");
                }
            }

            if (self.getJSONData()) {
                ds.regTenantAdmin(self.getJSONData(), method)
                        .done(function (result) {
                            if (result.success) {
                                self.updateMode(true)
                            } else {
                                bootbox.alert('Error:' + result.error);
                            }
                        })
                        .fail(function (err) {
                            bootbox.alert('Not Authorized to create a Tenant Admin');
                            $('#save').show();
                            $('#cancel').show();
                        });
            }

        };

        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                'email': self.email(),
                'firstName': self.firstName(),
                'lastName': self.lastName(),
                'phone': self.phone(),
                'sysRole': self.role(),
                'enabled': self.enabled(),
                'password': self.password(),
                'tenantId': params
            };
            if (self.password().length > 8) {
                return ko.toJSON(data);
            } else {
                bootbox.alert('Error:' + "Password Length is less than 8");
                return {};
            }
        }
    }

    return tenantAdminContentViewModel;
});
