var map;
var infoWindow;
var bounds;
var initialLocations = [
    {
        title: 'Tasty Subs & Pizza',
        position: {lat: 37.383162, lng: -121.995069},
        place_id: 'ChIJ9YoEpR-2j4ARO_aEnQAFS70',
        types: ['restaurant']
    },
    {
        title: "Inchin's Bamboo Garden",
        position: {lat: 37.376281, lng: -122.031072},
        place_id: 'ChIJDRdgSly2j4ARagXDhT9yhrQ',
        types: ['restaurant']
    },
    {
        title: "Sliderbar",
        position: {lat: 37.446152,lng: -122.160983},
        place_id: 'ChIJ-VM9uzm7j4ARA3OpSuevYAA',
        types: ['restaurant', 'cafe', 'bar']
    }
];



var Marker = function(data){
    var self = this;
    function makeMarkerIcon(markerColor){
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    }

    var highlightedIcon = makeMarkerIcon('FFFF24');
    var defaultIcon = makeMarkerIcon('0091ff');

    this.marker = new google.maps.Marker({
        position: data.position,
        title: data.title,
        place_id: data.place_id,
        types: data.types,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        map: map
    });

    bounds.extend(this.marker.position);

    this.marker.addListener('mouseover', function(){
        this.setIcon(highlightedIcon);
    });

    this.marker.addListener('mouseout', function(){
        this.setIcon(defaultIcon);
    });

    this.marker.addListener('click', function(){
        //populateInfoWindow(this, infoWindow);
        getPlaceDetails(this, infoWindow);
    });

}

function hideList(locations){
    locations.forEach(function(location){
        location.marker.setMap(null);
    })
}

function showList(locations){
    locations.forEach(function(location){
        location.marker.setMap(map);
    })
}

function filterList(locations, category)
{
    locations.forEach(function(location){
        if (location.marker.types.indexOf(category)>=0){
            location.marker.setMap(map);
        }
        else{
            location.marker.setMap(null);
        }
    })
}
function getPlaceDetails(marker, infowindow) {
    var service = new google.maps.places.PlacesService(map);
    console.log(marker.place_id);
    service.getDetails({
        placeId: marker.place_id
    }, function(place, status){
        if (status === google.maps.places.PlacesServiceStatus.OK){
            infowindow.marker = marker;
        }
        var innerHTML = '<div>'
        if (place.name){
            innerHTML += '<strong>' + place.name + '</strong>';
        }
        if (place.formatted_address){
            innerHTML += '<br>' + place.formatted_address;
        }
        if(place.formatted_phone_number){
            innerHTML += '<br>' + place.formatted_phone_number;
        }
        if (place.opening_hours) {
            innerHTML += '<br><br><strong>Hours:</strong><br>' +
                place.opening_hours.weekday_text[0] + '<br>' +
                place.opening_hours.weekday_text[1] + '<br>' +
                place.opening_hours.weekday_text[2] + '<br>' +
                place.opening_hours.weekday_text[3] + '<br>' +
                place.opening_hours.weekday_text[4] + '<br>' +
                place.opening_hours.weekday_text[5] + '<br>' +
                place.opening_hours.weekday_text[6];
        }
        if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
        }
        innerHTML += '</div>';
        infowindow.setContent(innerHTML);
        infowindow.open(map, marker);
        infowindow.addListener('closedclick', function(){
            infowindow.marker = null;
        });
    })
}

function viewModel(){
    var self = this;

    this.searchTerm = ko.observable("aaaaa");
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.391884, lng: -122.014869},
        zoom: 13
    });
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    this.locationList = ko.observableArray([]);
    initialLocations.forEach(function(location){
        self.locationList.push(new Marker(location));
    });
    map.fitBounds(bounds);
    var hide = document.getElementById('hide-listings');
    var show = document.getElementById('show-listings');
    var filter = document.getElementById('filter-listings');

    hide.addEventListener('click', function(){
        hideList(self.locationList());
    });

    show.addEventListener('click', function () {
        showList(self.locationList());
    })

    filter.addEventListener('click', function(){
        var category = document.getElementById('category-selection').value;
        filterList(self.locationList(),category);
    })
}

function startApp(){
    ko.applyBindings(new viewModel());
}






