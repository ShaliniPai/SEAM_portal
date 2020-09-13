define(['ojs/ojcore', 'knockout', 'jquery', 'dataservice', 'ojs/ojknockout',
    'ojs/ojrouter', 'ojs/ojnavigationlist', 'ojs/ojconveyorbelt'
], function (oj, ko, $, ds) {

    function assetRouteContentViewModel(params) {
        var self = this;
        self.router = undefined;



        self.parentRouter = oj.Router.rootInstance;
        self.currentState = self.parentRouter.currentState();

        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.routeArray = ko.observableArray();
        self.ready = ko.observable(false);

        self.loadAssetRoutes = function () {
            self.ready(false);
            ds.getAssetRouterMenu(self.rootViewModel.sysRole() || 'guest').then(function (result) {
                self.routeArray(result.data.slice(0));
                self.ready(true);
            });
        };

        self.loadAssetRoutes();


        self.selectHandler = function (event, ui) {
            if ('menu' === event.target.id && event.originalEvent) {
                // Invoke go() with the selected item.
                self.router.go(ui.key);
            }
        }
        /**
         * Optional ViewModel method invoked after the View is disconnected from the DOM.
         */
        self.disconnected = function () {
            self.router.dispose();
            self.router = null;
        };

    }

    return assetRouteContentViewModel;
});
