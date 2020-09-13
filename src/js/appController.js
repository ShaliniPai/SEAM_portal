/**
 * @license
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojmodule-element-utils', 'appFunc', 'ojs/ojarraydataprovider','dataservice','bootbox', 'ojs/ojmodule-element', 'ojs/ojrouter', 'ojs/ojknockout', 'ojs/ojarraytabledatasource',
    'ojs/ojoffcanvas'],
    function (oj, ko, moduleUtils, appFunc, ArrayDataProvider,ds,bootbox) {
        function ControllerViewModel() {
            var self = this;

            //Login Tracking Vars
            self.isLoggedIn = ko.observable(false);
            self.restSessionId = ko.observable("");
            self.tenantId = ko.observable("");
            self.sysRole = ko.observable("");
            self.message = ko.observable();
            self.tenantName = ko.observable();
            self.navDataReady = ko.observable(true);
            self.tenantArr = ko.observableArray();
            self.username = ko.observable();
            self.assetArray = ko.observableArray();
            // Media queries for repsonsive layouts
            var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
            self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
            var mdQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
            self.mdScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

            // Router setup
            self.router = oj.Router.rootInstance;
            self.router.configure({
                'login': { label: 'Login', isDefault: true },
                'logout': { label: 'Logout' }
            });

            oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

            self.moduleConfig = ko.observable({ 'view': [], 'viewModel': null });

            self.loadModule = function () {
                ko.computed(function () {
                    var name = self.router.moduleConfig.name();
                    //console.log("modulename: " + name)
                    var viewPath = 'views/' + name + '.html';
                    var modelPath = 'viewModels/' + name;
                    var masterPromise = Promise.all([
                        moduleUtils.createView({ 'viewPath': viewPath }),
                        moduleUtils.createViewModel({ 'viewModelPath': modelPath })
                    ]);
                    masterPromise.then(
                        function (values) {
                            self.moduleConfig({ 'view': values[0], 'viewModel': values[1] });
                        }
                    );
                });
            };

            self.navDataSource = new oj.ArrayTableDataSource([], { idAttribute: 'id' });

            // Drawer
            // Close offcanvas on medium and larger screens
            self.mdScreen.subscribe(function () {
                oj.OffcanvasUtils.close(self.drawerParams);
            });
            self.drawerParams = {
                displayMode: 'push',
                selector: '#navDrawer',
                content: '#pageContent'
            };
            // Called by navigation drawer toggle button and after selection of nav drawer item
            self.toggleDrawer = function () {
                return oj.OffcanvasUtils.toggle(self.drawerParams);
            }
            // Add a close listener so we can move focus back to the toggle button when the drawer closes
            $("#navDrawer").on("ojclose", function () {
                $('#drawerToggleButton').focus();
            });

            // Header
            // Application Name used in Branding Area
            self.appName = ko.observable("Device Manager");
            self.tenantId = ko.observable("Guest");
            self.sysRole = ko.observable("Guest");

            self.rootViewModel = self;

            self.signOut = function (message) {
                self.username("");
                self.tenantId("");
                self.isLoggedIn(false);
                self.restSessionId("");
                self.message(message);

                ds.logout(getJSONData())
                    .done(function (result) {
                        console.log("User Logged out");
                    })
                    .fail(function (err) {
                        //console.log('Error:' + err);
                    });

                self.router.configure({
                    'login': { label: 'Login', isDefault: true },
                    'logout': { label: 'Logout' }
                });

                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("upLoggedIn", false);
                    localStorage.removeItem("upLoggedIn");
                    localStorage.removeItem("upToken");
                }

                navData = [
                    {
                        name: 'Login', id: 'login',
                        iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'
                    },
                    { name: 'Logout', id: 'logout' }
                ];


                self.navDataSource = new ArrayDataProvider(navData, { keyAttributes: 'id' });

                self.router.go().then(
                    function (result) {
                        if (result.hasChanged) {
                        } else {
                            oj.Router.sync();
                        }
                    },
                    function (error) {
                        console.log('Transition to default state failed: ' + error.message);
                    }
                );
            }

            function getJSONData() {
                return {'email':localStorage.getItem("upUsername")};
            }
 
            //Check if the user is logged in
            if (appFunc.isLoggedIn()) {
                //console.log("User Logged in");
                self.isLoggedIn(true);
                appFunc.setRootLoginVars(self);
                appFunc.loadTenantIds(self);
                appFunc.loadMenu(self);
            } else {
                var navData = [
                    {
                        name: 'Login', id: 'login',
                        iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 glyphicon glyphicon-lock'
                    }
                ];
                // self.navDataSource = new oj.ArrayTableDataSource(navData, {idAttribute: 'id'});
                self.navDataSource = new ArrayDataProvider(navData, { keyAttributes: 'id' });
                self.signOut('User not signed in');
            }

            //User Menu on the header
            self.menuItemSelect = function (event, ui) {
                //console.log(event.target.value)
                switch (event.target.value) {
                    case "pref":
                        break;
                    case "about":
                        break;
                    case "out":
                        self.signOut('User Successfully Signed Out!')
                        break;
                    default:
                }
            };


            self.alertSelect = function (event, ui) {
                self.router.go('alerts');
            }

            // Footer
            function footerLink(name, id, linkTarget) {
                this.name = name;
                this.linkId = id;
                this.linkTarget = linkTarget;
            }
            self.footerLinks = ko.observableArray([
                new footerLink('About Bosch', 'aboutOracle', 'https://www.bosch.com/corporate-information'),
                new footerLink('Contact Us', 'contactUs', 'https://www.bosch.com/contact/'),
                new footerLink('Legal Notices', 'legalNotices', 'https://www.bosch.com/legal-notice'),
                new footerLink('Terms Of Use', 'termsOfUse', 'https://www.bosch.com/corporate-information'),
                new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'https://www.bosch.com/data-protection-policy/')
            ]);
        }

        function openPdf(e, path, redirect) {
            // stop the browser from going to the href
            e = e || window.event; // for IE
            e.preventDefault();

            // launch a new window with your PDF
            window.open(path, 'OSS_Scan_Report');

            // redirect current page to new location
            window.location = redirect;
        }


        return new ControllerViewModel();
    }
);
