mapboxgl.accessToken = mapToken; // this mapToken is from the ejs file of  const mapToken = '<%-process.env.MAPBOX_TOKEN%>';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [139.7454, 37.9167],
    zoom: 4
});

map.addControl(new mapboxgl.NavigationControl());
//https://materialui.co/colors#google_vignette color pallet

map.on('load', function () {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('japanLandmark', { // this is the name of the source. - japanLandmark. so have to change source for other keys all with the same this japanLandmark name. 
         //---------- this map.addSource is the one provide the base map based on our data.
        type: 'geojson',
        data: japanLandmark, //-------------this japanLandmark also comes from the data from the index.ejs  of   const japanLandmark = { features: <%- JSON.stringify(japanLandmark) %>} 
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'japanLandmark', // here, change to japanLandmark for source.
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [ 
                'step',
                ['get', 'point_count'],
                '#FFEB3B',
                5, // when point_count is below 3, then the circle color becomes '#00BCD4'
                '#2196F3',
                10,
                '#3F51B5'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                10, // pixcel - the size of the circle for point-count10
                5,
                20, // pixcel - the size of the circle for point-count 20
                10,
                30 // any other, size 25
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'japanLandmark',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'japanLandmark',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('japanLandmark').getClusterExpansionZoom(
            clusterId,
            function (err, zoom) {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in the unclustered-point layer, open a popup at
    // the location of the feature
    map.on('click', 'unclustered-point', function (e) {
        const { popUpMarkup } = e.features[0].properties; 
        // now since japanLandmark model did virtual setup for the properties.popUpMarkup, we can use this to store. 
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup) // what the message to show up
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});
