mapboxgl.accessToken = mapToken; // this mapToken is defined in the show.ejs and other places where needed the token to show the map. 
// we have to define in the ejs file to access the map. 
const map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    style: `mapbox://styles/mapbox/outdoors-v12`,
    center: japanLandmark.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});
// cool examples for many https://docs.mapbox.com/android/maps/examples/

//https://docs.mapbox.com/mapbox-gl-js/example/point-from-geocoder-result/ all getting codes from here. 

map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
    .setLngLat(japanLandmark.geometry.coordinates)
    //https://docs.mapbox.com/mapbox-gl-js/example/popup/
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${japanLandmark.title}</h3><p>${japanLandmark.location}</p>`
            )
    )
    .addTo(map)

