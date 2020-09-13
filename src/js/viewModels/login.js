/**
 * login module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'dataservice', 'appFunc', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojknockout-validation', 'ojs/ojrouter', 'ojs/ojdialog', 'ojs/ojcheckboxset'
], function (oj, ko, $, ds, appFunc) {
    /**
     * The view model for the main content view template
     */
    function loginContentViewModel() {
        var self = this;

        //Function to convert user id to lower case
        ko.extenders.lowercase = function (target, option) {
            //console.log(target)
            target.subscribe(function (newValue) {
                target(newValue.toLowerCase());
            });
            return target;
        };
        self.agreement = ko.observableArray();
        self.module = ko.observable();

        self.username = ko.observable("").extend({ lowercase: true });

        self.password = ko.observable("");

        self.message = ko.observable("");
        self.loginError = ko.observable(false);
        self.ready = ko.observable(true);
        self.alert = ko.observable("alert-danger");

        //List of tenants
        self.tenants = ko.observableArray([]);

        self.currentPassword = ko.observable("");
        self.newPassword = ko.observable("");
        self.confirmNewPassword = ko.observable("");

        self.resetPass = ko.observable(false);
        self.forgotPass = ko.observable(false);


        self.router = oj.Router.rootInstance;


        self.token = ko.observable()

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));


        self.prepLogin = function () {
            self.ready(false);
            self.message('');
            self.loginError(false);

            if (!self.username() || !self.password()) {
                self.message("Please enter Username, Password");
                self.alert("alert-danger");
                self.loginError(true);
                self.ready(true);
                return;
            }
        }

        self.login = function () {
            self.prepLogin();
            //console.log(self.username())
            let authObj = {
                email: self.username(),
                password: self.password() || self.currentPassword()
            };
            if (self.newPassword()) {
                authObj.newPassword = self.newPassword();
            }

            ds.doLogin(authObj).then(function (data) {
                if (data.success) {
                    if (data.token) {
                        appFunc.setLogin(data);
                    }
                    if (data.user.eula === undefined) {                  
                        popupCenter("end_user_agreement.html", "_blank", 600, 500);
                    } else if (data.user.eula.accepted === false) {
                        popupCenter("end_user_agreement.html", "_blank", 600, 500);
                    } else if (data.user.eula.accepted === true) {
                        self.message("");
                        self.ready(true);
                        if (data.token) {
                            appFunc.setLogin(data);
                            appFunc.setRootLoginVars(self);
                            appFunc.loadMenu(self);
                            appFunc.loadTenantIds(self);
                        } else {
                            self.message(data.error);
                            self.loginError(true);
                        }
                    }
                } else {
                    if (data.error.newPasswordRequired) {
                        self.resetPass(true);
                        self.ready(true);
                    } else {
                        self.message(data.error);
                        self.alert("alert-danger");
                        self.loginError(true);
                        self.ready(true);
                    }
                }

            }).catch(function (err) {
                self.message(err.responseText.error);
                self.loginError(true);
                self.ready(true);
            });
        };

        //Login on Key Press

        $("login").keypress(function () {
            self.login();
        });

        self.resetPassword = function () {
            self.prepLogin();

            if (self.newPassword() !== self.confirmNewPassword()) {
                self.message("Passwords do not match");
                self.alert("alert-warning");
                self.ready(true)
                self.loginError(true);
                return;
            }

            let authObj = {
                email: self.username(),
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

        self.forgotPassword = function () {
            self.forgotPass(true)
        };

        self.backToLogin = function () {
            self.forgotPass(false);
            self.resetPass(false);
        };


        self.eula = function (row) {
            // document.querySelector('#modalDialog1').open();
            popupCenter("end_user_agreement.html", "_blank", 600, 500);
        };

        function popupCenter(url, title, w, h) {
            //console.log("screen.width :" + screen.width + "screen.height : " + screen.height)
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }

        self.resetForgotPassword = function () {

            self.ready(false);
            self.message('');
            self.loginError(false);

            if (!self.username()) {
                self.message("Please enter Username");
                self.alert("alert-danger");
                self.loginError(true);
                self.ready(true);
                return;
            }

            let dataObj = {
                email: self.username()
            };

            ds.forgotPassword(dataObj).then(function (result) {
                if (result.success) {
                    self.forgotPass(false);
                    self.message(result.message);
                    self.alert("alert-success");
                    self.loginError(true);
                    self.ready(true);
                } else {
                    self.message(result.error);
                    self.alert("alert-danger");
                    self.loginError(true);
                    self.ready(true);
                }
            }).fail(function (err) {
                self.message(JSON.stringify(err));
                self.alert("alert-success");
                self.loginError(true);
                self.ready(true);
            });


        };

        if (localStorage.getItem("seamUsername")) {
            self.username(localStorage.getItem("seamUsername"));
        }


        if (appFunc.isLoggedIn()) {
            appFunc.setRootLoginVars(self);
            appFunc.loadTenantIds(self);
            appFunc.loadMenu(self);
        } else {
            console.log("User Not Logged In");
        }
    }

    return loginContentViewModel;
});
