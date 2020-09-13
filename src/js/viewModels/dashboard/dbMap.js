/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'map', 'dataservice', 'rw1000', 'markerclusterer', 'leaflet', 'leafletCluster', 'leafletFullScreen'],
        function (oj, ko, $, Map, ds, rw1000) {

            function DashboardViewModel() {
                var self = this;


                self.ready = ko.observable(true)
                self.message = ko.observable();

                var ap = addressPoints;

                var getColorIcon = function (L, isOnline) {
                    var color = isOnline ? 'green' : 'red';
                    return new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+color+'.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                };

                self.handleAttached = function () {
                    //Loading Data
                    self.rootViewModel = ko.dataFor(document.getElementById('globalBody'));
                    self.dbViewModel = ko.dataFor(document.getElementById('dashboard'));

                    self.rootViewModel.tenantId.subscribe(function (newValue) {
                        //console.log(newValue)
                        self.loadData();
                    });


                    self.dbViewModel.lastrefresh.subscribe(function (newValue) {
                        //console.log(newValue)
                        self.loadData();
                    });

                    $(document).ready(function () {
                        self.loadData();
                    });
                };

                self.loadMap = function (ap) {
                    let accessToken = 'pk.eyJ1IjoiY2hldGhhbmNtayIsImEiOiJjandhMHBjMGEwNTEyNDNvZGVidzFyMXMxIn0.4j048ootHHWtfrR_2cqi6Q'
                    var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+accessToken, {
                        maxZoom: 18,
                        id: 'mapbox.streets',
                        accessToken: accessToken
                    });

                    var latlng = L.latLng(ap[0].latLong[0], ap[0].latLong[1]);

                    var map = L.map('mapid', {center: latlng, zoom: 12, layers: [tiles], fullscreenControl: true,
                        fullscreenControlOptions: {
                            position: 'topleft'
                        }});

                    var markers = L.markerClusterGroup(
                            {chunkedLoading: true,
                                iconCreateFunction: function (cluster) {
                                    var markers = cluster.getAllChildMarkers();
                                    var n = markers.length;
                                    var clusterClass = 'myClusterGreen';
                                    markers.forEach(function(point){
                                        if (!point.isOnline) {
                                            clusterClass = 'myClusterRed';
                                        }
                                    })
                                    return L.divIcon({html: n, className: clusterClass, iconSize: L.point(40, 40)});
                                }});


                    for (var i = 0; i < ap.length; i++) {
                        var a = ap[i];
                        var title = a.assetName;
                        var marker = L.marker(L.latLng(a.latLong[0], a.latLong[1]), {title: title, icon: getColorIcon(L, a.isOnline)});
                        marker.isOnline = a.isOnline;
                        marker.bindPopup(title);
                        markers.addLayer(marker);
                    }
                    map.addLayer(markers);
                }



                self.loadData = function () {
                    self.ready(false);
                    self.message('');
                    ds.getDBAssetMap().
                            then(function (result) {
                                if (result.success) {
                                    self.ready(true);
                                    if (result.data.length > 0) {
                                        self.loadMap(result.data)
                                    } else {
                                        self.message('No Data Points for the Map Available')
                                       // console.log('No Data Points for the Map Available')
                                    }

                                } else {
                                    self.ready(true);
                                    self.message(result.error);
                                }

                            });
                };



                self.loadData();

            }

            return new DashboardViewModel();
        }
);
