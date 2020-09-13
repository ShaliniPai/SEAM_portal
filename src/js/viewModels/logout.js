/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * logout module
 */
define(['ojs/ojcore', 'knockout'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function logoutContentViewModel() {
        var self = this;
        console.log('In Logout')
        self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.rootViewModel.signOut('User Session Signed Out!');
    }

    return logoutContentViewModel;
});
