// define(function () {

//     //let hostname = 'up3.seam-up.com'
//     let hostname = 'https://www.bosch-connected-elevators.com/api'

//     // let hostname2 = `ec2-18-185-4-127.eu-central-1.compute.amazonaws.com`
//     //let hostname = `localhost`
//     return {
//         prod: true,
//         env: 'prod',
//         user: hostname,
//         tenant: hostname,
//         location: hostname,
//         asset: hostname,
//         portal: hostname,
//         liftdb: hostname,
//         alerts: hostname
//     };
// });

define(function () {
    let hostname = 'https://dev.bosch-connected-elevators.com/api'
   
    //let hostname = `localhost`
    //let hostname = '/api'
    return {
        prod: true,
        env: 'prod',
        user: hostname,
        tenant: hostname,
        location: hostname,
        asset: hostname,
        portal: hostname,
        liftdb: hostname,
        alerts: hostname
    };
});

