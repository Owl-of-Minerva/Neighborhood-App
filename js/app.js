var map;
var infoWindow;
var bounds;
var initialLocations = [
    {
        title: 'Tasty Subs & Pizza',
        position: {lat: 37.383162, lng: -121.995069},
        place_id: 'ChIJ9YoEpR-2j4ARO_aEnQAFS70',
        types: ['restaurant'],
        cuisine: 'indian'
    },
    {
        title: "Inchin's Bamboo Garden",
        position: {lat: 37.376281, lng: -122.031072},
        place_id: 'ChIJDRdgSly2j4ARagXDhT9yhrQ',
        types: ['restaurant'],
        cuisine: 'indian'
    },
    {
        title: "Sliderbar",
        position: {lat: 37.446152,lng: -122.160983},
        place_id: 'ChIJ-VM9uzm7j4ARA3OpSuevYAA',
        types: ['restaurant', 'cafe', 'bar'],
        cuisine: 'american'
    },
    {
        title: "Madras Cafe",
        position: {lat: 37.374284, lng: -122.054956},
        place_id: 'ChIJlbIO1Oi2j4ARp17Uf24xkHk',
        types: ['restaurant', 'cafe'],
        cuisine: 'indian'
    },
    {
        title: "Jang Su Jang",
        position: {lat: 37.353713, lng: -121.994364},
        place_id: 'ChIJR-8-Fva1j4ARNOEp6OoFzKs',
        types: ['restaurant'],
        cuisine: 'korean'
    },
    {
        title: "Taste Good Beijing",
        position: {lat: 37.429539, lng: -121.907570},
        place_id: 'ChIJTRaT5inJj4ARQ6Z6L6nH_2Q',
        types: ['restaurant'],
        cuisine: 'chinese'
    },
    {
        title: "Mantra India",
        position: {lat: 37.392889, lng: -122.079855},
        place_id: 'ChIJ-0RVcTS3j4ARDEqD2bNEFrc',
        types: ['restaurant', 'bar'],
        cuisine: 'indian'
    }
];
var client_id = "Y5XLAEJLUKQV5FL0BJUUDLQDGPUIMXLM22MRLHDP5CEJJ0RC";
var client_secret = "B1WLMXVULLD2XIQOYCWO4AZO11S4SZ5ZWQ4YGSHMXFEYPBTB";
var recommendations = [];
var cityCircle;

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
        cuisine: data.cuisine,
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

var Recommendation = function(data){
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
    var defaultIcon = makeMarkerIcon('ff0000');
    console.log(data.location.lat);
    console.log(data.location.lng);
    console.log(data.name);
    this.marker = new google.maps.Marker({
        position: {lat: data.location.lat, lng: data.location.lng},
        //position: {lat: 59.327, lng: 18.067},
        title: data.name,
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

function filterListCategory(locations, category)
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

function filterListCuisine(locations, cuisine){
    locations.forEach(function(location){
        if(location.marker.cuisine == cuisine){
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

function getRecommendations(latlng, radius){

    if(cityCircle){
        cityCircle.setMap(null);
    }

    var radius = Number(document.getElementById("search-radius").value);
    if (radius == 0){
        radius = 5000;
    }
    console.log('radius: '+ radius);
    var limit = Number(document.getElementById("search-limit").value);
    if (limit == 0){
        limit = 10;
    }
    console.log('limit: '+limit);
    var query = document.getElementById("search-query").value;
    if (query == null){
        query = 'restaurant';
    }

    cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: latlng,
        radius: radius
    });

    var foursquareURL = 'https://api.foursquare.com/v2/venues/explore?ll='+ latlng.lat() + ',' + latlng.lng() + '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20160118' +
        //'&query=' + "sushi" +
        "&radius=" + radius + "&limit=" + limit + "&query=" + query;
    recommendations.forEach(function(recommendation){
        recommendation.marker.setMap(null)
    });
    recommendations = [];
    $.getJSON(foursquareURL).done(function(data) {
        var results = data.response.groups[0].items;
        for (var i = 0; i < results.length; i++){
            recommendations.push(new Recommendation(results[i].venue));
        }
        return recommendations;
    }).fail(function() {
        alert("Error")
        });
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
    this.recommendationList = ko.observableArray([]);

    initialLocations.forEach(function(location){
        self.locationList.push(new Marker(location));
    });


    google.maps.event.addListener(map, 'click', function(event) {
        console.log("number of elements previously: " + self.recommendationList.length);
        for (var i = 0; i < self.recommendationList.length; i++){
            console.log("clearing the recommendation");
            self.recommendationList[i].setMap(null);
        }
        //self.recommendationList = ko.observableArray([]);
        console.log("number of elements:" + self.recommendationList.length)
        console.log("clicked point lat: " + event.latLng.lat());
        console.log("clicked point lng: " + event.latLng.lng());
        recommendatsions = getRecommendations(event.latLng, 5000);
       // recommendatsions.forEach(function(recommendation){
         //   self.recommendationList.push(recommendation);
        //})
        console.log("number of elements afterwards:" + self.recommendationList.length);

    });
    map.fitBounds(bounds);
    var hide = document.getElementById('hide-listings');
    var show = document.getElementById('show-listings');
    var filterCategory = document.getElementById('filter-listings-category');
    var filterCuisine = document.getElementById('filter-listings-cuisine');

    hide.addEventListener('click', function(){
        hideList(self.locationList());
    });

    show.addEventListener('click', function () {
        showList(self.locationList());
    })

    filterCategory.addEventListener('click', function(){
        var category = document.getElementById('category-selection').value;
        filterListCategory(self.locationList(),category);
    })
    filterCuisine.addEventListener('click', function(){
        var cuisine = document.getElementById('cuisine-selection').value;
        filterListCuisine(self.locationList(), cuisine);
    })
}

function startApp(){
    ko.applyBindings(new viewModel());
}






