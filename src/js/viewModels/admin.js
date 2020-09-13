define(['ojs/ojcore', 'knockout', 'jquery', 'dataservice', 'ojs/ojknockout',
    'ojs/ojrouter', 'ojs/ojnavigationlist', 'ojs/ojconveyorbelt'
], function (oj, ko, $, ds) {

    function adminContentViewModel(params) {
        var self = this;
        self.router = undefined;

        self.connected = function () {


            self.parentRouter = oj.Router.rootInstance;
            self.currentState = self.parentRouter.currentState();

            self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
            self.ready = ko.observable(false)

            self.loadSetupRoutes = function () {
                self.ready(false);
                self.router = self.parentRouter.createChildRouter('admin')
                        .configure({ 'users': {label: 'Users',   "value": "admin/location/locationRoute" , isDefault: true},});
                // Now that the router for this view exist, synchronise it with the URL
                self.ready(true)
                oj.Router.sync();
            };

            self.loadSetupRoutes();


        };

        self.selectHandler = function (event, ui) {
            if ('menu' === event.target.id && event.originalEvent) {
                // Invoke go() with the selected item.
                self.router.go(ui.key);
            }
        },
                /**
                 * Optional ViewModel method invoked after the View is disconnected from the DOM.
                 */
                self.disconnected = function () {
                    self.router.dispose();
                    self.router = null;
                };

    }

    return adminContentViewModel;
});
