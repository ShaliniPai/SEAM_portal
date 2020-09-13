define(['ojs/ojcore', 'knockout', 'dataservice', 'ojs/ojarraydataprovider'], function (oj, ko, ds, ArrayDataProvider) {

    function isLoggedIn() {
        if (typeof (Storage) !== "undefined") {
            var loggedIn = localStorage.getItem("upLoggedIn");
            var token = localStorage.getItem("upToken");
            if (loggedIn && token) {
                ds.headers.Authorization = 'Bearer ' + token;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    function setLogin(data, self) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("upLoggedIn", true);
            localStorage.setItem("upToken", data.token);
            localStorage.setItem("upAccess", data.access);
            localStorage.setItem("upUsername", data.user.email);
            localStorage.setItem("upTenantId", data.user.tenantId);
            localStorage.setItem("upTenantName", data.user.tenantName);
            localStorage.setItem("upSysRole", data.user.sysRole);
        }


        ds.headers.Authorization = 'Bearer ' + data.token;
    }

    function setRootLoginVars(self) {
        //Set the App Controller Variable
        self.rootViewModel.isLoggedIn(true);
        self.rootViewModel.username(localStorage.getItem("upUsername"));
        self.rootViewModel.tenantId(localStorage.getItem("upTenantId"));
        self.rootViewModel.tenantName(localStorage.getItem("upTenantName"));
        if (localStorage.getItem("upTenantName") === undefined) {
            self.rootViewModel.tenantName(localStorage.getItem("upTenantId"));
        }
        self.rootViewModel.sysRole(localStorage.getItem("upSysRole"));
        self.rootViewModel.message('')

    }

    function loadMenu(self) {
        //console.log('Loading Menu')
        self.rootViewModel.navDataReady(false);
        var navData = [
            { name: 'Dashboard', id: 'dashboard', visible: true },
            { name: 'Elevator Monitoring', id: 'monitor', visible: true },
            { name: 'Alerts & Notifications', id: 'alerts', visible: true },
            { name: 'Administration', id: 'setups', visible: true }
        ];

        self.rootViewModel.router.configure({
            'dashboard': { label: 'Dashboard', isDefault: true },
            'monitor': { label: 'Elevator Monitoring' },
            'alerts': { label: 'Alerts & Notifications' },
            'setups': { label: 'Administration' },
            'logout': { label: 'Logout' },
            'assetMonitor': { label: 'Monitor', value: 'assetMonitor/assetMonitor' },
        });

        self.rootViewModel.navDataSource = new ArrayDataProvider(navData, { keyAttributes: 'id' });
        self.rootViewModel.navDataReady(true);
        self.rootViewModel.isLoggedIn(true);

        let queryParams = ds.getUrlVars();

        if (queryParams.root && queryParams.root !== 'login') {
            oj.Router.sync();
        } else {
            self.rootViewModel.router.go('dashboard');

        }
    }


    let currentTenantId;
    function loadTenantIds(self) {
        currentTenantId = self.rootViewModel.tenantId();
        self.username(localStorage.getItem("upUsername"));
        ds.getTenantIds(self.username())
            .done(function (result) {
                if (result.success) {
                    self.rootViewModel.tenantArr.removeAll();
                    result.result.forEach( function(tenant) {
                        if (tenant.tenantId === currentTenantId) {
                            self.rootViewModel.tenantName(tenant.tenantName);
                        }
                        self.rootViewModel.tenantArr.push(tenant);
                    })
                } else {
                    console.log('Error Unable to Load Tenant Ids for the user')
                }
            })
            .fail(function (err) {
                console.log('Error:' + err.responseText);
            });
    }
    

//    setInterval(function () {
//        loadTenantIds(self);// this will run after every 5 seconds
//    }, 5000);


    function initCap(str) {
        return str.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
            return m.toUpperCase();
        });
    }

    function switchTenant(self, tenantId, tenantName) {
        ds.refreshToken(tenantId)
            .done(function(result) {
                if (result.success) {
                    localStorage.setItem("upTenantId", result.result.tenantId);
                    localStorage.setItem("upToken", result.result.token);
                    ds.headers.Authorization = 'Bearer ' + result.result.token;
                    self.rootViewModel.tenantId(result.result.tenantId);
                    self.rootViewModel.tenantName(tenantName);
                    loadMenu(self);
                } else {
                    console.log('Error Unable to Switch Tenant Ids for the user')
                }
            }).fail(function (err) {
                console.log('Error:' + err.responseText);
            });
    }


    return {
        isLoggedIn: isLoggedIn,
        setLogin: setLogin,
        setRootLoginVars: setRootLoginVars,
        loadMenu: loadMenu,
        loadTenantIds: loadTenantIds,
        initCap: initCap,
        switchTenant: switchTenant

    };
});
