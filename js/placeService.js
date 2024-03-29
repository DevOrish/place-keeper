'use strict';
var gNextId = 101
var gMap;
const MARKERS_KEY = 'markers'
var gMarkers;
var gSessionMarkers = [];
var gCurrLoc;

function initMap(lat = 29.55805, lng = 34.94821) {
    gMap = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat,
            lng
        },
        zoom: 10
    });
    gMap.addListener('click', event => {
        var nameInput = document.querySelector('.marker-name-input')
        nameInput.focus()
        gCurrLoc = event.latLng
    });
}

function initMarkers() {
    if (gMarkers.length === 0) return
    var myLatLng;
    var marker;
    for (var i = 0; i < gMarkers.length; i++) {
        myLatLng = { lat: gMarkers[i].lat, lng: gMarkers[i].lng }
        marker = new google.maps.Marker({
            id: gMarkers[i].id,
            position: myLatLng,
            map: gMap,
            title: gMarkers[i].title
        });
        gSessionMarkers.push(marker)
    }
}

function onSetCurrLoc() {
    if (!navigator.geolocation) {
        alert("Plz switch to Google Chrome its 2019");
        return;
    }
    navigator.geolocation.getCurrentPosition(setCurrLoc, handleLocationError);
}

function setCurrLoc(position) {
    var currLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    setMapCenter(position.coords.latitude, position.coords.longitude);
    setMarker(currLoc, 'My Location')
}

function setMapOnAll(map) {
    for (var i = 0; i < gSessionMarkers.length; i++) {
        gSessionMarkers[i].setMap(map);
    }
}

function hideMarkers() {
    setMapOnAll(null)
}

function showMarkers() {
    setMapOnAll(gMap);
}

function removeMarkers() {
    hideMarkers();
    gSessionMarkers = [];
    gMarkers = []
    saveMarkersToStorage()
}

function setMarker(position, title) {

    var elErrorTxt = document.querySelector('.locationError')
    if (gMarkers.length > 12) {
        elErrorTxt.innerText = 'Maximum Markers Reached'
        setInterval(() => {
            elErrorTxt.innerText = ''
        }, 3000)
        return
    }

    if (!title) var title = 'No Name'
    var marker = new google.maps.Marker({
        id: gNextId++,
        position,
        map: gMap,
        title
    });
    gSessionMarkers.push(marker)

    var newMarker = {
        id: marker.id,
        lat: marker.position.lat(),
        lng: marker.position.lng(),
        title,
    }
    gMarkers.push(newMarker)
    saveMarkersToStorage()
    renderMarkers()
}

function removeMarker(markerId) {

    var sessionMarkerIdx = gSessionMarkers.findIndex(marker => marker.id === markerId)
    var markerIdx = gMarkers.findIndex(marker => marker.id === markerId)

    gSessionMarkers[sessionMarkerIdx].setMap(null)
    gSessionMarkers.splice(markerIdx, 1)
    gMarkers.splice(markerIdx, 1)
    saveMarkersToStorage()
}


function setMapCenter(lat, lng) {
    gMap.setCenter({
        lat,
        lng
    });
    gMap.setZoom(16)
}

function loadMarkersFromStorage() {
    var markers = loadFromStorage(MARKERS_KEY)
    if (!markers) markers = []
    gMarkers = markers
    if (gMarkers.length > 0) gNextId = gMarkers[gMarkers.length - 1].id + 1;

    saveMarkersToStorage()
}

function saveMarkersToStorage() {
    saveToStorage(MARKERS_KEY, gMarkers)
}

function getMarkers() {
    return gMarkers
}

function getSessionMarkers() {
    return gSessionMarkers
}

function getCurrLoc() {
    return gCurrLoc
}