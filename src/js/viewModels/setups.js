/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * SetupsContent module
 */

define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout',
    'ojs/ojrouter', 'ojs/ojnavigationlist', 'ojs/ojconveyorbelt'
], function (oj, ko) {

    SetupsContentViewModel = {
        router: undefined,

        initialize: function (params) {
            // Retrieve parentRouter from ojModule parameter
            var parentRouter = params.valueAccessor().params['ojRouter']['parentRouter'];

            // Restore current state from parent router, if exist.
            var currentState = parentRouter.currentState();

            let states;
            var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
            
            console.log(rootViewModel.sysRole())
            
            if (rootViewModel.sysRole() === 'TenantUser') {
                states = {'alerts': {label: 'Alerts Configuration', value: 'admin/alerts/alertRoute', isDefault: true}}
            } else if (rootViewModel.sysRole() === 'TenantAdmin' || rootViewModel.sysRole() === 'SystemAdmin') {
                states = {
                    'user': {label: 'Users', value: 'admin/user/userRoute', isDefault: true},
                    'tenant': {label: 'Tenants', value: 'admin/tenant/tenantRoute'},
                    'asset': {label: 'Assets', value: 'admin/asset/assetRoute'},
                    'location': {label: 'Locations', value: 'admin/location/locationRoute'},
                    'alerts': {label: 'Alerts Configuration', value: 'admin/alerts/alertRoute'},
                }
            }

            this.router = parentRouter.createChildRouter('setups')
                    .configure(states);
            // Now that the router for this view exist, synchronise it with the URL
            oj.Router.sync();
        },

        selectHandler: function (event, ui) {
            if ('menu' === event.target.id && event.originalEvent) {
                // Invoke go() with the selected item.
                SetupsContentViewModel.router.go(ui.key);
            }
        },

        dispose: function () {
            this.router.dispose();
            this.router = null;
        }
    };

    return SetupsContentViewModel;
});

