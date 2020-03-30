var user_login = false;
var map;
var infoWindow;
var active_markers;
var cases_active = false;
var unsubscribe;
var max_count = 1;

function initMap() {
    // Make the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 3,
        styles: [
          {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
          {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
          {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{color: '#263c3f'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#6b9a76'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#38414e'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{color: '#212a37'}]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9ca5b3'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#746855'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{color: '#1f2835'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{color: '#f3d19c'}]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{color: '#2f3948'}]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{color: '#17263c'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#515c6d'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{color: '#17263c'}]
          }
        ],
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false,
        disableDoubleClickZoom: true,
        streetViewControl: false
      });

    // Set position to current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(pos);
          map.setZoom(15);
        }, function() {
          Console.log("Current Location Set");
        });
      } else {
        // Browser doesn't support Geolocation
        Console.log("Current Location Failed");
      }

    // Add data
    var database = firebase.firestore();

    database.collection('constants').doc('max_count').get().then(function(doc){
        max_count = doc.data().count;
    });
    unsubscribe = database.collection('markers').onSnapshot(function(markers){
        console.log("Here");
        markers.forEach(marker => {
            data = marker.data();
            console.log(data.Latitude);
            console.log(data.Longitude);
            var point = new google.maps.Circle({
                strokeColor: '#FF0000',
            strokeOpacity: data.Count / max_count,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: data.Count / max_count,
            map: map,
            center: {lat: parseFloat(data.Latitude), lng: parseFloat(data.Longitude)},
            radius: (data.Count / max_count) * 20,
            });
            //console.log(map.getBounds().contains(point.center));
            if (map.getBounds().contains(point.center)) {
                cases_active = true;
            }
            point.addListener('click', showInfo);
        });
        if (cases_active == false) {
            document.getElementById("noData").style.display = "block";
        }
    });

    infoWindow = new google.maps.InfoWindow;
    if (document.contains(document.getElementById("info"))) {
        document.getElementById("info").style.display = "block";
    }
    if (document.contains(document.getElementById("info_add"))) {
        document.getElementById("info_add").style.display = "none";
    }
    document.getElementById("add").style.display = "block";
    document.getElementById("done").style.display = "none";
    document.getElementById("cancel").style.display = "none";
    active_markers = [];
}

function enableAddMarker(){
    unsubscribe();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 3,
        sytles: [{
            featureType: 'poi',
            stylers: [{visibility: 'off'}]
        }, {
            featureType: 'transit.station',
            stylers: [{visibility: 'off'}]
        }],
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false,
        disableDoubleClickZoom: true,
        streetViewControl: false
    });

    // Set position to current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(pos);
          map.setZoom(15);
        }, function() {
          Console.log("Current Location Set");
        });
      } else {
        // Browser doesn't support Geolocation
        Console.log("Current Location Failed");
      }
    const database = firebase.firestore();
    database.collection('users').doc(user.uid).collection('user_markers').get().then(function(markers){
        markers.forEach(marker => {
            database.collection('markers').doc(marker.data().Marker_id).get().then(function(curr_marker){
                data = curr_marker.data();
                var old_marker = new google.maps.Marker({
                    position: {lat: data.Latitude, lng: data.Longitude},
                    map: map,
                    title: curr_marker.id,
                    opacity: 0.5
                });
                old_marker.addListener('click', removeOldMarker);
            });
        });
    })

    map.addListener('click', function(e) {
        active_markers.push(e.latLng);
        var marker = new google.maps.Marker({
            position: e.latLng,
            map: map,
        });
        marker.addListener('click', removeMarker);
        map.panTo(e.latLng);
    });
    if (document.contains(document.getElementById("info"))) {
        document.getElementById("info").style.display = "none";
    }
    if (document.contains(document.getElementById("info_add"))) {
        document.getElementById("info_add").style.display = "block";
    }
    document.getElementById("add").style.display = "none";
    document.getElementById("done").style.display = "block";
    document.getElementById("cancel").style.display = "block";
}

function removeMarker() {
    active_markers.splice(active_markers.indexOf(this.position), 1);
    this.setMap(null);
}

function removeOldMarker() {
    var del = false;
    const database = firebase.firestore();
    database.collection('markers').doc(this.title).update({
        Count: firebase.firestore.FieldValue.increment(-1)
    });
    database.collection('markers').doc(this.title).get().then(function(doc){
        if (doc.data().Count == 0) {
            del = true;
        }
    });
    if (del) {
        database.collection('markers').doc(this.title).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }
    database.collection('users').doc(user.uid).collection('user_markers').doc(this.title).delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
    this.setMap(null);
}

function showInfo(event){
    console.log( (this.radius * max_count / 10).toString());
    var contentString = (this.radius * max_count / 10).toString()  + ' Visits'
    
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);

    infoWindow.open(map);
}

function addLocations(){
    var geocoder = new google.maps.Geocoder;
    const database = firebase.firestore();
    active_markers.forEach(location => {
        geocoder.geocode({'location' : location}, function(results, status){
            if (status == 'OK') {
                database.collection('markers').where('Address', '==', results[0].formatted_address).get().then(function(query){
                    if(query.empty) {
                        if (results[0]) {
                            database.collection('markers').add({
                                Latitude: location.lat(),
                                Longitude: location.lng(),
                                Address: results[0].formatted_address,
                                Count: 1,
                            }).then(function(marker){
                                console.log("Database Access Success");
                                database.collection('users').doc(user.uid).set({
                                    User: user.uid,
                                });
                                database.collection('users').doc(user.uid).collection('user_markers').doc(marker.id).set({
                                    Marker_id: marker.id,
                                })
                            })
                            .catch(function(error) {
                                console.log("Database Access Fail");
                            })
                        } else {
                            console.log("No Geocode Found");
                        }  
                    }
                    else {
                        query.forEach(marker => {
                            database.collection('markers').doc(marker.id).set({
                                Latitude:  (marker.data().Latitude + location.lat()) / 2,
                                Longitude:  (marker.data().Longitude + location.lng()) / 2,
                                Address:   marker.data().Address,
                                Count: marker.data().Count + 1,
                            })
                            .then(function() {
                                console.log("Document successfully written!");
                                database.collection('constants').doc('max_count').get().then(function(doc) {
                                    if (doc.data().count < marker.data().Count + 1) {
                                        database.collection('constants').doc('max_count').set({
                                            count: marker.data().Count + 1
                                        });
                                    }
                                }).catch(function(error) {
                                    console.error("Document get error");
                                });
                                database.collection('users').doc(user.uid).set({
                                    User: user.uid,
                                });
                                database.collection('users').doc(user.uid).collection('user_markers').doc(marker.id).set({
                                    Marker_id: marker.id,
                                })
                            })
                            .catch(function(error) {
                                console.error("Error writing document: ", error);
                            });
                        });
                    }
                });
            } else {
                console.log("Geocode failed due to:" + status);
            }
        });
    });
    initMap();
}

function infoRemove(){
    var element = document.getElementById("info");
    element.parentNode.removeChild(element);
}

function info_addRemove(){
    var element = document.getElementById("info_add");
    element.parentNode.removeChild(element);
}

function hideNoData(){
    document.getElementById("noData").style.display = "none";
}