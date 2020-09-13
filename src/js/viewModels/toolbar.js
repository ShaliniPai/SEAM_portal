/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * toolbar module
 */
define(['ojs/ojcore', 'knockout', 'appFunc', 'dataservice', 'ojs/ojdialog', 'ojs/ojswitch', 'ojs/ojbutton', 'ojs/ojinputnumber', 'ojs/ojinputtext'
], function (oj, ko, appFunc, ds) {
    /**
     * The view model for the main content view template
     */
    function toolbarContentViewModel() {
        var self = this;

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'))
        self.tenantArr = self.rootViewModel.tenantArr();

        /**Reset Password */
        self.currentPassword = ko.observable("");
        self.newPassword = ko.observable("");
        self.confirmNewPassword = ko.observable("");
        self.resetPass = ko.observable(true);
        self.message = ko.observable("");
        self.loginError = ko.observable(false);
        self.userProfileMessage = ko.observable(false);
        self.ready = ko.observable(true);
        self.alert = ko.observable("alert-danger");
        self.username = ko.observable("").extend({ lowercase: true });
        self.password = ko.observable("");
        self.email = ko.observable();
        self.firstName = ko.observable();
        self.lastName = ko.observable();
        self.phone = ko.observable();
        self.enabled = ko.observable(true);

        self.resetPasswordFunction = function (row) {
            document.querySelector('#modalDialog1').open();
        };

        self.editUserProfileFunction = function (row) {
            document.querySelector('#modalDialog11').open();
            ds.editUserProfile(localStorage.getItem('upUsername'))
                .done(function (result) {
                    if (result.success) {
                        result.data.forEach(function (row) {
                            self.email(row.email);
                            self.firstName(row.firstName);
                            self.lastName(row.lastName);
                            self.phone(row.phone);
                            self.enabled(row.enabled);
                        })
                    } else {
                        bootbox.alert('Error:' + result.error);
                    }
                })
                .fail(function (err) {
                    bootbox.alert('Error:Unable to get User Details !!!');
                });
        };

        self.editUserProfile = function () {
            let method = "PUT";
            self.userProfileMessage(false);
            self.ready(false);
            ds.addUpdateUser(self.getJSONData(), method)
                .done(function (result) {
                    if (result.success) {
                        let data = {
                            modify: true
                        }
                        self.message("User Profile Updated Successfully");
                        self.alert("alert-success");
                        self.userProfileMessage(true);
                        self.ready(false);
                    } else {
                        bootbox.alert('Error:' + result.error);
                    }
                })
                .fail(function (err) {
                    bootbox.alert('Unable to update user Profile. Verify all fields. Try Again !!!');
                    $('#save').show();
                    $('#cancel').show();
                });
        };


        /*JSON Data from form for AJAX Call*/
        self.getJSONData = function () {
            var data = {
                'email': self.email(),
                'firstName': self.firstName(),
                'lastName': self.lastName(),
                'phone': self.phone(),
                'enabled': self.enabled()
            };
            return ko.toJSON(data);
        };

        self.resetPassword = function () {
            if (self.newPassword() !== self.confirmNewPassword()) {
                self.message("Passwords do not match");
                self.alert("alert-warning");
                self.ready(true)
                self.loginError(true);
                return;
            }

            let authObj = {
                email: localStorage.getItem("upUsername"),
                password: self.password()
            };

            if (self.newPassword()) {
                authObj.newPassword = self.newPassword();
            }

            ds.resetPassword(authObj).then(function (data) {
                if (data.success) {
                    self.message("Password Reset Successful");
                    self.alert("alert-success");
                    self.loginError(true);
                    self.ready(true);
                    self.resetPass(false);
                } else {
                    self.message(data.error);
                    self.loginError(true);
                    self.ready(true);
                }
            }).catch(function (err) {
                self.message(err.responseText.error);
                self.loginError(true);
                self.ready(true);
            });
        };
        if (ds.isTokenValid()) {
            self.tenantSelect = function (event) {
                self.tenantArr.forEach(function (tenant) {
                    if (tenant.tenantId === event.target.value) {
                        appFunc.switchTenant(self, tenant.tenantId, tenant.tenantName || '');
                        return;
                    }
                })

            }
        }
        self.eula = function (row) {
            // document.querySelector('#modalDialog1').open();
            popupCenter("end_user_agreement.readOnly.html", "_blank", 600, 500);
        };

        function popupCenter(url, title, w, h) {
            //  console.log("screen.width :"+screen.width + "screen.height : "+ screen.height)
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }
    }

    return toolbarContentViewModel;
});
