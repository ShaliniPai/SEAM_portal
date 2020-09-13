/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * hcTest module
 */
define(['ojs/ojcore', 'knockout', 'sparkline'
], function (oj, ko, sparkline) {
    /**
     * The view model for the main content view template
     */
    function hcTestContentViewModel() {
        var self = this;
        console.log(sparkline);

        $(function () {
            /** This code runs when everything has been loaded on the page */
            /* Inline sparklines take their values from the contents of the tag */
            $('.inlinesparkline').sparkline();

            /* Sparklines can also take their values from the first argument 
             passed to the sparkline() function */
            var myvalues = [10, 8, 5, 7, 4, 4, 1];
            $('.dynamicsparkline').sparkline(myvalues);

            /* The second argument gives options such as chart type */
            $('.dynamicbar').sparkline(myvalues, {type: 'bar', barColor: 'green', tooltipFormat: '{{value:myvalues}} - {{"aaa"}}',
                tooltipValueLookups: {
                    levels: $.range_map({':2': 'Low', '3:6': 'Medium', '7:': 'High'})
                }});

            /* Use 'html' instead of an array of values to pass options 
             to a sparkline with data in the tag */
            $('.inlinebar').sparkline('html', {type: 'bar', barColor: 'red'});
        });


    }


    return hcTestContentViewModel;
});
