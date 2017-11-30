var map;


var initialLocations = [
    {
        title: 'Tasty Subs & Pizza',
        position: {lat: 37.383162, lng: -121.995069}
    },
    {
        title: "Inchin's Bamboo Garden",
        position: {lat: 37.376281, lng: -122.031072}
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
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        map: map
    });


    this.marker.addListener('mouseover', function(){
        this.setIcon(highlightedIcon);
    })

}



function viewModel(){
    var self = this;

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.391884, lng: -122.014869},
        zoom: 13
    });
    this.locationList = ko.observableArray([]);
    initialLocations.forEach(function(location){
        self.locationList.push(new Marker(location));
    });
    var hide = document.getElementById('hide-listings');
    hide.addEventListener('click', function(){
        self.locationList().forEach(function(location){
            location.marker.setMap(null);
        })
    });
}

function startApp(){
    ko.applyBindings(new viewModel());
}






