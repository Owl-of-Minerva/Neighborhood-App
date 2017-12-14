var map;
var infoWindow;
var bounds;

// a list of default locations that will automatically displayed
var initialLocations = [
    {
        title: 'Tasty Subs & Pizza',
        position: {lat: 37.383162, lng: -121.995069},
        place_id: 'ChIJ9YoEpR-2j4ARO_aEnQAFS70',
        types: ['restaurant'],
        cuisine: 'indian',
        visibility: true
    },
    {
        title: "Inchin's Bamboo Garden",
        position: {lat: 37.376281, lng: -122.031072},
        place_id: 'ChIJDRdgSly2j4ARagXDhT9yhrQ',
        types: ['restaurant'],
        cuisine: 'indian',
        visibility: true
    },
    {
        title: "Sliderbar",
        position: {lat: 37.446152,lng: -122.160983},
        place_id: 'ChIJ-VM9uzm7j4ARA3OpSuevYAA',
        types: ['restaurant', 'cafe', 'bar'],
        cuisine: 'american',
        visibility: true
    },
    {
        title: "Madras Cafe",
        position: {lat: 37.374284, lng: -122.054956},
        place_id: 'ChIJlbIO1Oi2j4ARp17Uf24xkHk',
        types: ['restaurant', 'cafe'],
        cuisine: 'indian',
        visibility: true
    },
    {
        title: "Jang Su Jang",
        position: {lat: 37.353713, lng: -121.994364},
        place_id: 'ChIJR-8-Fva1j4ARNOEp6OoFzKs',
        types: ['restaurant'],
        cuisine: 'korean',
        visibility: true
    },
    {
        title: "Taste Good Beijing",
        position: {lat: 37.429539, lng: -121.907570},
        place_id: 'ChIJTRaT5inJj4ARQ6Z6L6nH_2Q',
        types: ['restaurant'],
        cuisine: 'chinese',
        visibility: true
    },
    {
        title: "Mantra India",
        position: {lat: 37.392889, lng: -122.079855},
        place_id: 'ChIJ-0RVcTS3j4ARDEqD2bNEFrc',
        types: ['restaurant', 'bar'],
        cuisine: 'indian',
        visibility: true
    },
    {
        title: "Passage to India",
        position: {lat: 37.394356, lng: -122.099594},
        place_id: 'ChIJPwgBGLmwj4ARdFm9VCwWsA8',
        types: ['bakery'],
        cuisine: 'indian',
        visibility: true
    }
];
var client_id = "Y5XLAEJLUKQV5FL0BJUUDLQDGPUIMXLM22MRLHDP5CEJJ0RC";
var client_secret = "B1WLMXVULLD2XIQOYCWO4AZO11S4SZ5ZWQ4YGSHMXFEYPBTB";
var recommendations = [];
var cityCircle;

// Model for the default location lists
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

    this.visibility = ko.observable(true);
    this.name = data.title;
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
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function () {
            self.marker.setAnimation(null);
        }, 2000);
        getPlaceDetails(this, infoWindow);
    });

    this.createAnimation = function (){
        if (self.marker.getAnimation() !== null) {
            self.marker.setAnimation(null);
            infoWindow.marker = null;
            infoWindow.close();
        }
        else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout(function () {
                self.marker.setAnimation(null);
            }, 2000);
            getPlaceDetails(self.marker, infoWindow);
        }

    }

}

// Model for customized location result
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

    this.address = data.location.address;
    this.id = data.id;
    var highlightedIcon = makeMarkerIcon('FFFF24');
    var defaultIcon = makeMarkerIcon('ff0000');
    this.marker = new google.maps.Marker({
        position: {lat: data.location.lat, lng: data.location.lng},
        title: data.name,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        formatted_address: data.location.formattedAddress,
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
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function () {
            self.marker.setAnimation(null);
        }, 2000);
        getRecommendationDetails(this, infoWindow);
    });


}

// hide all the markers from default list
function hideList(locations){
    locations.forEach(function(location){
        location.marker.setMap(null);
    })
}

// show all the markers from default list
function showList(locations){
    locations.forEach(function(location){
        location.marker.setMap(map);
    })
}

// filter the default markers according to category
function filterListCategory(locations, category) {
    locations.forEach(function(location){
        if (location.marker.types.indexOf(category)>=0){
            location.marker.setMap(map);
        }
        else{
            location.marker.setMap(null);
        }
    })
}

// filter the default markers according to cuisine
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

// call google map api to get details for the specific marker
function getPlaceDetails(marker, infowindow) {

    var service = new google.maps.places.PlacesService(map);
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

function getRecommendationDetails(marker, infowindow) {
    infoWindow.marker = marker;
    var innerHTML = '<div>'
    if (marker.title){
        innerHTML += '<strong>' + marker.title + '</strong>';
    }
    if (marker.formatted_address){
        innerHTML += '<br>' + marker.formatted_address;
    }
    if(marker.formatted_phone_number){
        innerHTML += '<br>' + marker.formatted_phone_number;
    }
    if (marker.hours) {
        innerHTML += '<br>' + marker.hours;
    }
    if (marker.photos) {
        innerHTML += '<br><br><img src="' + marker.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
    }
    innerHTML += '</div>';
    infowindow.setContent(innerHTML);
    infowindow.open(map, marker);
    infowindow.addListener('closedclick', function(){
        infowindow.marker = null;
    });
}
// call the foursquare api to get recommendations according to user input
function getRecommendations(latlng, radius, limit, query){

    if(cityCircle){
        cityCircle.setMap(null);
    }

    // draw circle and center will be the place user clicked on the map
    // the radius will be from user input
    cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: latlng,
        radius: Number(radius)
    });

    var foursquareURL = 'https://api.foursquare.com/v2/venues/explore?ll='+ latlng.lat() + ',' + latlng.lng()
        + '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20160118' +
        "&radius=" + radius + "&limit=" + limit + "&query=" + query;

    // clear out previous results
    recommendations.forEach(function(recommendation){
        recommendation.marker.setMap(null)
    });
    recommendations = [];

    //get new results
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

// view model part
function viewModel(){
    var self = this;
    this.display_info = ko.observable("");
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.391884, lng: -122.014869},
        zoom: 13
    });

    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    this.locationList = ko.observableArray([]);
    this.recommendationList = ko.observableArray([]);
    this.filterList = ko.observableArray([])
    this.categoryOptions = ko.observableArray(['bakery', 'bar', 'cafe', 'restaurant']);
    this.selectedCategory = ko.observable("");
    this.cuisineOptions = ko.observableArray(['chinese', 'indian', 'korean', 'american']);
    this.selectedCuisine = ko.observable("");
    this.radius=ko.observable(5000);
    this.limit=ko.observable(10);
    this.query=ko.observable("restaurant");

    initialLocations.forEach(function(location){
        self.locationList.push(new Marker(location));

    });


    google.maps.event.addListener(map, 'click', function(event) {
        //clearing the previous results
        for (var i = 0; i < self.recommendationList.length; i++){
            self.recommendationList[i].setMap(null);
        }
        self.recommendationList([]);
        self.recommendationList(getRecommendations(event.latLng, self.radius(), self.limit(), self.query()));
    });
    map.fitBounds(bounds);

    this.hideDefaultList = function(){
        self.locationList().forEach(function(location){
            location.marker.setMap(null);
            location.visibility(false);
        });
    }

    this.showDefaultList = function(){
        self.locationList().forEach(function(location){
            location.marker.setMap(map);
            location.visibility(true);
        })
    }

    this.filterByCategory = function(){
        self.locationList().forEach(function(location){
            if (location.marker.types.indexOf(self.selectedCategory())>=0){
                location.marker.setMap(map);
                location.visibility(true);
            }
            else {
                location.marker.setMap(null);
                location.visibility(false);
            }
        })
    }

    this.filterByCuisine= function(){
        self.locationList().forEach(function(location){
            if (location.marker.cuisine == self.selectedCuisine()){
                location.marker.setMap(map);
                location.visibility(true);
            }
            else {
                location.marker.setMap(null);
                location.visibility(false);
            }
        })
    }


}

function startApp(){
    ko.applyBindings(new viewModel());
}

function mapError(){
    alert("Error when loading the map");
}



