import React from 'react';
import styles from './styles';
import { Animated, Text, View, Pressable, FlatList, StatusBar, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, Alert, BackHandler, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from 'react-native-geolocation-service';
import KeepAwake from 'react-native-keep-awake';
import axios from 'axios';
import * as turf from '@turf/turf';//for encoding polylines
import database from '@react-native-firebase/database';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { indexFinder, polylineLenght, OfflineNotice, x, y, colors, height, width, dimensionAssert, makeid, distanceCalculator } from '../../Functions/Functions';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline, Polygon, Callout } from 'react-native-maps';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import AnimatedPolyline from '../../Components/AnimatedPolyline/AnimatedPolyline';
import { ViewVehicle } from '../../Components/VehicleComponents/VehicleComponents';
import Icon from 'react-native-vector-icons/Ionicons';
import { PendingRequest, AwaitingPickup, CurrentRiders } from '../../Components/RiderComponents/RiderComponents';
import { DestinationPin, Speaker, SpeakerCancel, NavigatorMarkers } from '../../Images/svgimages/vectors';
import Navigator from '../../Components/Navigator/Navigator';
const polyline = require('@mapbox/polyline');// for decoding polylines

const Y_START = -x(12);
const X_CONSTANT = 0;

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const HEIGHTOF_PENDINGREQUEST = y(5) + y(5) + y(dimensionAssert() ? 107 : 96);
const HEIGHTOF_AWAITINGPICKUP = y(5) + y(5) + y(dimensionAssert() ? 169 : 137);
const HEIGHTOF_CURRENTRIDERS = y(5) + y(5) + y(dimensionAssert() ? 140 : 110);

export default class TripStarted extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            h1: false,
            h2: false,
            h3: false,
            speaker: true,

            result_pr: [],//this is where you store results from pending result....DO NOT CHANGE THIS, ONLY CHANGE THE DATA IT HOLDS AND FLATLIST BUT USE THE VARIABLE NAMES AND UPDATE FUNS
            result_ap: [],
            result_cr: [],
            markers: [],
            riderlocations: [],
            tripActive: false,
            userDetails: null,
            detailsLoaded: false,
            location: null,
            destination: null,
            polyline: [],
            indexes: [],
            followMap: true,
            remainingDistance: 0,
            endAddress: null,
            steps: null,
            vehicle: null,

            selected: null,
            display: null,
            historyRef: null,
        };
        this.movingUp = false;
        this.finalIndex = null;
        this.currentIndexCount = 0;
        this.fullH1 = y(3)
        this.fullH2 = y(3)
        this.fullH3 = y(3)
        this.height1 = new Animated.Value(this.fullH1);
        this.height2 = new Animated.Value(this.fullH2);
        this.height3 = new Animated.Value(this.fullH3); //USE LAYOUT TO SHOW THIS
        this.mapReady = false;

        this.sendLocationTrottle = true;
        this.direction = 'MOVABLE';
        this.TAB_HEIGHT = 0
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });
        this.position.y.addListener(({ value }) => {
            if ((value > Y_START || value < this.TAB_HEIGHT) && this.direction == 'MOVABLE') {
                this.direction = 'UNMOVABLE';
                this.position.stopAnimation(() => {
                    if (value > Y_START) {
                        Animated.spring(this.position,
                            {
                                toValue: { x: X_CONSTANT, y: Y_START },
                                useNativeDriver: false,
                            }).start(() => { this.direction = 'MOVABLE' });
                    }
                    else if (value < this.TAB_HEIGHT) {
                        // Animated.spring(this.position,
                        //     {
                        //         toValue: { x: X_CONSTANT, y: this.TAB_HEIGHT + 1 },
                        //         useNativeDriver: false,
                        //     }).start(() => { this.direction = 'MOVABLE' });
                        this.position.setValue({ x: X_CONSTANT, y: this.TAB_HEIGHT + 1 })
                        this.direction = 'MOVABLE';
                    }
                });
            }
        });
        this.value;
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => {
                return (!this.movingUp);
            },
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return (Math.abs(gestureState.dx) >= 10 && Math.abs(gestureState.dy) >= 10 && !this.movingUp);
            },

            onPanResponderGrant: (evt, gestureState) => {
                this.position.setOffset({ x: X_CONSTANT, y: this.position.y._value });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
                this.value = Number(JSON.stringify(this.position.y));
            },
            onPanResponderMove: (evt, gestureState) => {
                const Y_POSITION = (this.value + gestureState.dy);
                if (Y_POSITION <= Y_START && Y_POSITION >= this.TAB_HEIGHT)
                    this.position.setValue({ x: X_CONSTANT, y: (gestureState.dy) });
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();
                const Y_POSITION = Number(JSON.stringify(this.position.y));
                if (Y_POSITION < Y_START && this.direction == 'MOVABLE') {
                    Animated.decay(this.position, {
                        velocity: { x: 0, y: gestureState.vy }, // velocity from gesture release
                        useNativeDriver: false,
                    }).start();
                }
            },
        });
    };
    componentDidMount() {
        KeepAwake.activate();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        AsyncStorage.getItem('SPEAKER')
            .then(result => {
                if (result) {
                    if (result == 'TRUE')
                        this.setState({ speaker: true });
                    else if (result == 'FALSE')
                        this.setState({ speaker: false });
                }
                else
                    AsyncStorage.setItem('SPEAKER', 'TRUE')
                        .then(() => { this.setState({ speaker: true }); })
                        .catch(error => { console.log(error.message) })
            })
            .catch((error) => { console.log(error.message) });
        AsyncStorage.getItem(`USER_DETAILS`)
            .then((result) => {
                const userDetails = JSON.parse(result);
                this.setState({ userDetails: userDetails });
                database().ref(`carpoolRequests/${userDetails.driverID}/requestStatus`).on('value', data => {
                    if (data.val() == 'active')
                        this.setState({ tripActive: true })
                    else if (data.val() == 'inactive')
                        this.setState({ tripActive: false })
                });
                database().ref(`carpoolTripReserve/carpool/driver/${userDetails.driverID}`).once('value', data => {
                    if (data.val())
                        this.setState({ steps: JSON.parse(data.val().steps), endAddress: data.val().endAddress });
                });
                database().ref(`carpoolRequests/${userDetails.driverID}`).once('value', data => {
                    if (data.val()) {
                        let indexes = [];

                        for (let i = 0; i < polyline.decode(data.val().polyline).length; i++)//indexes work because when we scan, we use the indexes closest to driver and one ahead e.g if 4 is closest to driver we use 4 and 5 and 3.we always delete items
                            indexes.push({
                                index: i,
                                values: [],
                            });


                        this.setState({
                            location: data.val().initialLocation,
                            destination: data.val().destination,
                            polyline: polyline.decode(data.val().polyline),
                            detailsLoaded: true,
                            remainingDistance: polylineLenght(polyline.decode(data.val().polyline)),
                            vehicle: data.val().carDetails,
                            indexes: indexes,
                            historyRef: data.val().historyRef,

                        }, () => {
                            Geolocation.getCurrentPosition(
                                (position) => {
                                    let fullTripPoly = [[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude]];
                                    const totalDistance = polylineLenght(fullTripPoly);
                                    const currentNearestPoint = turf.nearestPointOnLine(turf.lineString(fullTripPoly), turf.point([position.coords.latitude, position.coords.longitude])).geometry.coordinates;
                                    const currentIndex = indexFinder(fullTripPoly, currentNearestPoint);
                                    const travelledPoly = fullTripPoly.slice(0, currentIndex + 1);
                                    const travelledDistance = polylineLenght(travelledPoly);
                                    this.setState({ remainingDistance: totalDistance - travelledDistance });
                                },
                                (error) => {
                                    console.log(error.code, error.message);
                                    Geolocation.requestAuthorization();
                                },
                                {
                                    distanceFilter: 10,
                                    enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                                }
                            ).catch((error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            });





                            database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}`).on('child_added', data => {//PENDING REQUEST LISTENER
                                if (data.val()) {
                                    if (data.val().status == 'PENDING') {
                                        this.updateResultsAdd('PR', data.val());
                                        let markers = this.state.markers;//if unpicked we show where the pickup is
                                        const leg = JSON.parse(data.val().details.tripDetails.leg);
                                        markers.push({
                                            userID: data.val().userID,
                                            type: 'PendingRequest',
                                            coordinates: {
                                                latitude: leg[0][0],
                                                longitude: leg[0][1],
                                            },
                                            name: `${data.val().details.firstName} ${data.val().details.lastName}`,
                                            text: `Pending request`,
                                        });
                                        this.setState({ markers: markers });
                                    }
                                    else if (data.val().status == 'CONFIRMED') {//delete if confirmed
                                        database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}/${data.val().details.userID}`).remove();
                                    }
                                }
                            });
                            database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}`).on('child_changed', data => {//PENDING REQUEST LISTENER TO REMOVE DATA BY UPDATING
                                if (data.val().status == 'CANCELLED' || data.val().status == 'CONFIRMED') {//delete if cancelled of confirmed
                                    database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}/${data.val().details.userID}`).remove();
                                    this.updateResultsRemove('PR', data.val());

                                    let markers = this.state.markers;//if picked we show where the dropoff is
                                    for (let i = 0; i < markers.length; i++)
                                        if (markers[i].userID == data.val().userID && markers[i].type == 'PendingRequest')
                                            markers.splice(i, 1);
                                    this.setState({ markers: markers });
                                }

                            });
                            database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}`).on('child_removed', data => {//PENDING REQUEST LISTENER TO REMOVE DATA
                                if (data.val()) {
                                    this.updateResultsRemove('PR', data.val());

                                    let markers = this.state.markers;//if picked we show where the dropoff is
                                    for (let i = 0; i < markers.length; i++)
                                        if (markers[i].userID == data.val().userID && markers[i].type == 'PendingRequest')
                                            markers.splice(i, 1);
                                    this.setState({ markers: markers })
                                }
                            });




                            database().ref(`currentCarpoolTrips/${userDetails.driverID}`).on('child_added', data => {//AWAITING PICKUP LISTENER
                                if (data.val().status == 'UNPICKED') {
                                    this.updateResultsAdd('AP', data.val());


                                    let markers = this.state.markers;//if unpicked we show where the pickup is
                                    const leg = JSON.parse(data.val().details.tripDetails.leg);
                                    markers.push({
                                        userID: data.val().userID,
                                        type: 'Location',
                                        coordinates: {
                                            latitude: leg[0][0],
                                            longitude: leg[0][1],
                                        },
                                        name: `${data.val().details.firstName} ${data.val().details.lastName}`,
                                        text: `Pickup at ${data.val().details.tripDetails.depatureTime}`
                                    });

                                    let indexes = this.state.indexes;
                                    const i = indexFinder(this.state.polyline, leg[0]);
                                    if (i != -1 && indexes[i])
                                        if (indexes[i].values)
                                            indexes[i].values.push({
                                                userID: data.val().userID,
                                                type: 'Location',
                                                coordinates: {
                                                    latitude: leg[0][0],
                                                    longitude: leg[0][1],
                                                },

                                            });

                                    this.setState({ markers: markers, indexes: indexes });
                                }
                                else if (data.val().status == 'STARTED') {
                                    this.updateResultsAdd('CR', data.val());


                                    let markers = this.state.markers;//if picked we show where the dropoff is
                                    const leg = JSON.parse(data.val().details.tripDetails.leg);
                                    markers.push({
                                        userID: data.val().userID,
                                        type: 'Destination',
                                        coordinates: {
                                            latitude: leg[leg.length - 1][0],
                                            longitude: leg[leg.length - 1][1],
                                        },
                                        name: `${data.val().details.firstName} ${data.val().details.lastName}`,
                                        text: `Dropoff at ${data.val().details.tripDetails.arrivalTime}`
                                    });

                                    let indexes = this.state.indexes;
                                    const i = indexFinder(this.state.polyline, leg[leg.length - 1]);
                                    if (i != -1 && indexes[i])
                                        if (indexes[i].values)
                                            indexes[i].values.push({
                                                userID: data.val().userID,
                                                type: 'Destination',
                                                coordinates: {
                                                    latitude: leg[leg.length - 1][0],
                                                    longitude: leg[leg.length - 1][1],
                                                },
                                            });

                                    this.setState({ markers: markers, indexes: indexes });
                                }
                            });

                            database().ref(`currentCarpoolTrips/${userDetails.driverID}`).on('child_changed', data => {//AWAITING PICKUP LISTENER
                                if (data.val().status == 'STARTED') {
                                    this.updateResultsRemove('AP', data.val());
                                    this.updateResultsAdd('CR', data.val());

                                    let markers = this.state.markers;//if picked we show where the dropoff is
                                    const leg = JSON.parse(data.val().details.tripDetails.leg);

                                    for (let i = 0; i < markers.length; i++)
                                        if (markers[i].userID == data.val().userID && markers[i].type == 'Location')
                                            markers.splice(i, 1);

                                    markers.push({
                                        userID: data.val().userID,
                                        type: 'Destination',
                                        coordinates: {
                                            latitude: leg[leg.length - 1][0],
                                            longitude: leg[leg.length - 1][1],
                                        },
                                        name: `${data.val().details.firstName} ${data.val().details.lastName}`,
                                        text: `Dropoff at ${data.val().details.tripDetails.arrivalTime}`
                                    });

                                    let rL = this.state.riderlocations;
                                    for (let i = 0; i < rL.length; i++)
                                        if (rL[i].userID == data.val().userID) {
                                            rL.splice(i, 1);
                                            break;
                                        }


                                    let indexes = this.state.indexes;//remove the location portion and add the destination portion
                                    const i_l = indexFinder(this.state.polyline, leg[0]);
                                    if (i_l != -1 && indexes[i_l])
                                        if (indexes[i_l].values)
                                            for (let i = 0; i < indexes[i_l].values.length; i++) {
                                                if (indexes[i_l].values[i].userID == data.val().userID && indexes[i_l].values[i].type == 'Location')
                                                    indexes[i_l].values.splice(i, 1);
                                            }

                                    const i = indexFinder(this.state.polyline, leg[leg.length - 1]);
                                    if (i != -1 && indexes[i])
                                        if (indexes[i].values)
                                            indexes[i].values.push({
                                                userID: data.val().userID,
                                                type: 'Destination',
                                                coordinates: {
                                                    latitude: leg[leg.length - 1][0],
                                                    longitude: leg[leg.length - 1][1],
                                                },
                                            });

                                    this.setState({ markers: markers, riderlocations: rL, indexes: indexes });

                                }
                                else if (data.val().status == 'FINISHED') {
                                    let markers = this.state.markers;
                                    const leg = JSON.parse(data.val().details.tripDetails.leg);
                                    this.updateResultsRemove('CR', data.val());
                                    for (let i = 0; i < markers.length; i++)
                                        if (markers[i].userID == data.val().userID && markers[i].type == 'Destination')
                                            markers.splice(i, 1);

                                    let indexes = this.state.indexes;//remove the destination portion
                                    const i_d = indexFinder(this.state.polyline, leg[leg.length - 1]);
                                    if (i_d != -1 && indexes[i_d])
                                        if (indexes[i_d].values)
                                            for (let i = 0; i < indexes[i_d].values.length; i++)
                                                if (indexes[i_d].values[i].userID == data.val().userID && indexes[i_d].values[i].type == 'Destination')
                                                    indexes[i_d].values.splice(i, 1);

                                    this.setState({ markers: markers, indexes: indexes });
                                }
                            });

                        });
                    }
                });


                this.watchID = Geolocation.watchPosition(position => {//THIS HAPPENS AS THE USER MOVES OR CHANGES LOCATION
                    if (this.state.tripActive && position)
                        this.updateLocation(userDetails.driverID, [position.coords.latitude, position.coords.longitude], position.coords.heading)
                    if (this.state.followMap)
                        this.animateMap(position);


                    if (this.state.detailsLoaded) {
                        let fullTripPoly = [[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude]];
                        const totalDistance = polylineLenght(fullTripPoly);
                        const currentNearestPoint = turf.nearestPointOnLine(turf.lineString(fullTripPoly), turf.point([position.coords.latitude, position.coords.longitude])).geometry.coordinates;
                        const currentIndex = indexFinder(fullTripPoly, currentNearestPoint);
                        const travelledPoly = fullTripPoly.slice(0, currentIndex + 1);
                        const travelledDistance = polylineLenght(travelledPoly);
                        this.setState({ remainingDistance: totalDistance - travelledDistance });
                    }

                },
                    error => (console.log(error.message)),
                    {
                        distanceFilter: 10,
                        enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                    }
                );

            })
            .catch(error => { console.log(error.message) });
    };
    updateLocation = (id, location, heading) => {
        if (this.sendLocationTrottle) {
            this.sendLocationTrottle = false;
            axios.post(`https://us-central1-perch-01.cloudfunctions.net/updateCarpoolerLocation`, {
                driverID: id,
                currentLocation: location,
            }).catch(error => { console.log(error.message) });

            setTimeout(() => {
                this.sendLocationTrottle = true
            },
                3000)//3 SECONDS, THROTTLE PERIOD
        }
    };
    animateMap = (position) => {
        if (this.mapReady) {
            this.map.animateCamera({
                center: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                pitch: 50,
                heading: position.coords.heading != -1 ? position.coords.heading : 0,

                // Only on iOS MapKit, in meters. The property is ignored by Google Maps.
                //altitude: number,

                // Only when using Google Maps.
                zoom: 17.5,
            });
        };
    };
    changeSpeaker = () => {
        this.setState({ speaker: !this.state.speaker }, () => {
            AsyncStorage.setItem('SPEAKER', this.state.speaker ? 'TRUE' : 'FALSE')
                .catch(error => { console.log(error.message) });
        })
    };
    correctHeight = (v) => {
        if (Number(this.position.y._value) < (this.TAB_HEIGHT + (y(v)))) {
            Animated.spring(this.position, {
                toValue: { x: X_CONSTANT, y: (this.TAB_HEIGHT + (y(v))) + 10 },
                useNativeDriver: false,
            }).start();
        };
    };
    animateHeight = (v) => {
        this.fullH1 = (this.state.result_pr.length != 0 ? this.state.result_pr.length : 1) * HEIGHTOF_PENDINGREQUEST; //thats how we update the height, as we get a request, we add it to the height
        this.fullH2 = (this.state.result_ap.length != 0 ? this.state.result_ap.length : 1) * HEIGHTOF_AWAITINGPICKUP;
        this.fullH3 = (this.state.result_cr.length != 0 ? this.state.result_cr.length : 1) * HEIGHTOF_CURRENTRIDERS;
        switch (v) {
            case 'PR': {
                const h1 = this.state.h1;
                this.setState({ h1: !this.state.h1 });

                if (h1) {
                    this.correctHeight(this.fullH1);
                    Animated.spring(this.height1, {
                        toValue: y(3),
                        useNativeDriver: false,
                    }).start();
                }
                else
                    Animated.spring(this.height1, {
                        toValue: this.fullH1,
                        useNativeDriver: false,
                    }).start();

            } break;
            case 'AP': {
                const h2 = this.state.h2;
                this.setState({ h2: !this.state.h2 });
                if (h2) {
                    this.correctHeight(this.fullH2);
                    Animated.spring(this.height2, {
                        toValue: y(3),
                        useNativeDriver: false,
                    }).start()
                }
                else
                    Animated.spring(this.height2, {
                        toValue: this.fullH2,
                        useNativeDriver: false,
                    }).start();
            } break;
            case 'CR': {
                const h3 = this.state.h3;
                this.setState({ h3: !this.state.h3 });
                if (h3) {
                    this.correctHeight(this.fullH3);
                    Animated.spring(this.height3, {
                        toValue: y(3),
                        useNativeDriver: false,
                    }).start();
                }
                else
                    Animated.spring(this.height3, {
                        toValue: this.fullH3,
                        useNativeDriver: false,
                    }).start();
            } break;
        };
    };
    changeStatus = () => {
        if (this.state.tripActive)
            Alert.alert(
                'Go offline',
                'Use this to go offline.You would stop recieving requests but must complete any pending trips if you have any.To continue recieving requests, come back online',

                [{
                    text: 'Cancel',
                    style: 'cancel',
                }, {
                    text: 'Go offline',
                    style: 'destructive',
                    onPress: () => {
                        database().ref(`carpoolRequests/${this.state.userDetails.driverID}`).update({ requestStatus: 'inactive' });

                    }
                }]);
        else
            database().ref(`carpoolRequests/${this.state.userDetails.driverID}`).update({ requestStatus: 'active' });
    };
    endTrip = () => {
        if (this.state.result_pr.length != 0)
            Alert.alert('Pending requests',
                'Please attend to the pending requests you currently have. To stop recieving new requests, you should use the "Go inactive" button',
                [
                    {
                        text: 'Ok',
                        style: 'cancel',
                    }
                ]);
        else if (this.state.result_ap.length != 0)
            Alert.alert('Riders awaiting pickup',
                'You have some riders awaiting pickup, so you have to complete their rides before you can end the trip. To stop recieving new requests, you should use the "Go inactive" button',
                [
                    {
                        text: 'Ok',
                        style: 'cancel',
                    }
                ]);
        else if (this.state.result_cr.length != 0)
            Alert.alert('Riders awaiting dropoff',
                'You have some riders who need to be dropped off, so you have to complete their rides before you can end the trip. To stop recieving new requests, you should use the "Go inactive" button',
                [
                    {
                        text: 'Ok',
                        style: 'cancel',
                    }
                ]);
        else
            Alert.alert('End trip?',
                'Ending the trip would remove you from the map and complete this current trip. Press "End trip" to end it',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'End trip',
                        style: 'destructive',
                        onPress: () => {
                            database().ref(`carpoolTripReserve/carpool/driver/${this.state.userDetails.driverID}`).remove()
                                .then(() => {
                                    database().ref(`carpoolRequests/${this.state.userDetails.driverID}`).remove()
                                        .then(() => { this.props.navigation.navigate('Main') })
                                        .catch(error => { console.log(error.message) })
                                })
                                .catch(error => { console.log(error.message) })
                        },
                    }
                ]);
    };
    updateResultsAdd = (v, data) => { //THIS IS USED TO UPDATE RESULTS, MAKE ANOTHER TO REMOVE
        switch (v) {
            case 'PR': {
                let updatedResult = this.state.result_pr;
                updatedResult.unshift(data);
                this.setState({ result_pr: updatedResult, h1: true });
                this.fullH1 = updatedResult.length * HEIGHTOF_PENDINGREQUEST;

                Animated.spring(this.height1, {
                    toValue: this.fullH1,
                    useNativeDriver: false,
                }).start();
            } break;
            case 'AP': {
                let updatedResult = this.state.result_ap;
                updatedResult.unshift(data);
                //WE ARE SORTING THE 'AP' HERE.
                const polyline = this.state.polyline;
                const compare = (a_, b_) => {
                    if (polyline.length !== 0) {
                        const firstCoords_a = JSON.parse(a_.details.tripDetails.leg)[0];
                        const firstCoords_b = JSON.parse(b_.details.tripDetails.leg)[0];

                        let a = indexFinder(polyline, firstCoords_a);
                        let b = indexFinder(polyline, firstCoords_b);

                        if (a > b) return 1;
                        if (b > a) return -1;
                    }
                    else
                        return 1;
                };

                updatedResult = updatedResult.sort(compare);
                let rL = [];
                for (let i = 0; i < updatedResult.length && i < 5; i++) {//only 5 on the closest riders
                    rL.push({
                        userID: updatedResult[i].details.userID,
                        name: `${updatedResult[i].details.firstName} ${updatedResult[i].details.lastName}`,
                    });
                };

                this.setState({ riderlocations: rL });


                this.setState({ result_ap: updatedResult, h2: true });
                this.fullH2 = updatedResult.length * HEIGHTOF_AWAITINGPICKUP;
                Animated.spring(this.height2, {
                    toValue: this.fullH2,
                    useNativeDriver: false,
                }).start();
            } break;
            case 'CR': {
                let updatedResult = this.state.result_cr;
                updatedResult.unshift(data);
                //WE ARE SORTING THE 'CR' HERE.
                const polyline = this.state.polyline;
                const compare = (a_, b_) => {
                    if (polyline.length !== 0) {
                        const a_leg = JSON.parse(a_.details.tripDetails.leg);
                        const b_leg = JSON.parse(b_.details.tripDetails.leg);

                        const lastCoords_a = a_leg[a_leg.length - 1];
                        const lastCoords_b = b_leg[b_leg.length - 1];

                        let a = indexFinder(polyline, lastCoords_a);
                        let b = indexFinder(polyline, lastCoords_b);

                        if (a > b) return 1;
                        if (b > a) return -1;
                    }
                    else
                        return 1;
                };
                this.setState({ result_cr: updatedResult.sort(compare), h3: true });
                this.fullH3 = updatedResult.length * HEIGHTOF_CURRENTRIDERS;
                Animated.spring(this.height3, {
                    toValue: this.fullH3,
                    useNativeDriver: false,
                }).start();
            } break;
        };
    };
    updateResultsRemove = (v, data) => {
        switch (v) {
            case 'PR': {
                let updatedResult = this.state.result_pr;
                for (let i = 0; i < updatedResult.length; i++) {
                    if (updatedResult[i].details.userID == data.details.userID)
                        updatedResult.splice(i, 1);
                }
                this.setState({ result_pr: updatedResult, });

                if (updatedResult.length !== 0) {
                    this.fullH1 = updatedResult.length * HEIGHTOF_PENDINGREQUEST;
                    Animated.spring(this.height1, {
                        toValue: this.fullH1,
                        useNativeDriver: false,
                    }).start();
                };

            } break;
            case 'AP': {
                let updatedResult = this.state.result_ap;
                for (let i = 0; i < updatedResult.length; i++) {
                    if (updatedResult[i].userID == data.userID)
                        updatedResult.splice(i, 1);
                }
                this.setState({ result_ap: updatedResult, });

                if (updatedResult.length !== 0) {
                    this.fullH2 = updatedResult.length * HEIGHTOF_AWAITINGPICKUP;
                    Animated.spring(this.height2, {
                        toValue: this.fullH2,
                        useNativeDriver: false,
                    }).start();
                };
            } break;
            case 'CR': {
                let updatedResult = this.state.result_cr;
                for (let i = 0; i < updatedResult.length; i++) {
                    if (updatedResult[i].userID == data.userID)
                        updatedResult.splice(i, 1);
                }
                this.setState({ result_cr: updatedResult, });

                if (updatedResult.length !== 0) {
                    this.fullH3 = updatedResult.length * HEIGHTOF_CURRENTRIDERS;
                    Animated.spring(this.height3, {
                        toValue: this.fullH3,
                        useNativeDriver: false,
                    }).start();
                };
            } break;
        };
    };
    handleBackButtonClick() {
        this.props.navigation.navigate('Main');
    };
    nextMove = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                function compare(a_, b_) {
                    const a = distanceCalculator(position.coords.latitude, position.coords.longitude, a_.coordinates.latitude, a_.coordinates.longitude);
                    const b = distanceCalculator(position.coords.latitude, position.coords.longitude, b_.coordinates.latitude, b_.coordinates.longitude);

                    if (a > b) return 1;
                    else return -1;
                };

                if (!this.state.selected) {
                    const cc = turf.nearestPointOnLine(
                        turf.lineString(this.state.polyline),
                        turf.point([position.coords.latitude, position.coords.longitude])
                    ).geometry.coordinates

                    const currentIndex = indexFinder(this.state.polyline, cc);

                    if (this.finalIndex) {
                        if (this.currentIndexCount == this.finalIndex.values.length) {//we are at the end of the current value,change it
                            const newInitialIndex = this.finalIndex.index + 1;
                            this.finalIndex = null;
                            this.currentIndexCount = 0;
                            for (let i = newInitialIndex; i < this.state.indexes.length; i++) {
                                let index = this.state.indexes[i];
                                if (index.values.length !== 0) {
                                    this.finalIndex = index;
                                    this.finalIndex.values = this.finalIndex.values.sort(compare);
                                    break;
                                };
                            }
                        }
                    }

                    if (this.finalIndex == null && currentIndex != -1) {
                        for (let i = currentIndex; i < this.state.indexes.length; i++) {
                            let index = this.state.indexes[i];
                            if (index.values.length !== 0) {
                                this.finalIndex = index;
                                this.finalIndex.values = this.finalIndex.values.sort(compare);
                                break;
                            };
                        };
                    }



                    if (this.finalIndex && this.mapReady && this.state.detailsLoaded) {
                        this.setState({ followMap: false });
                        if (this.finalIndex.values[this.currentIndexCount].type == 'Location') {
                            for (let i = 0; i < this.state.result_ap.length; i++)
                                if (this.state.result_ap[i].userID == this.finalIndex.values[this.currentIndexCount].userID)
                                    this.setState({ display: this.state.result_ap[i] })
                        }
                        else {
                            for (let i = 0; i < this.state.result_cr.length; i++)
                                if (this.state.result_cr[i].userID == this.finalIndex.values[this.currentIndexCount].userID)
                                    this.setState({ display: this.state.result_cr[i] })
                        }

                        this.map.animateCamera({
                            center: {
                                latitude: this.finalIndex.values[this.currentIndexCount].coordinates.latitude,
                                longitude: this.finalIndex.values[this.currentIndexCount].coordinates.longitude,
                            },
                            pitch: 0,
                            heading: 0,
                            zoom: 16,
                        });
                        this.currentIndexCount = this.currentIndexCount + 1;
                    }

                }
            },
            (error) => {
                console.log(error.code, error.message);
                Geolocation.requestAuthorization();
            },
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        ).catch((error) => {
            console.log(error.code, error.message);
            Geolocation.requestAuthorization();
        });
    };
    selectedMove = (item) => {
        this.movingUp = true;
        this.setState({ selected: item, followMap: false }, () => {
            Animated.spring(this.position,
                {
                    toValue: { x: X_CONSTANT, y: Y_START },
                    useNativeDriver: false,
                }).start(() => { this.movingUp = false });
        });
        const leg = JSON.parse(item.details.tripDetails.leg);

        const center = item.status == 'STARTED' ?
            { latitude: leg[leg.length - 1][0], longitude: leg[leg.length - 1][1] } :
            { latitude: leg[0][0], longitude: leg[0][1] };
        this.setState({ display: item });
        this.map.animateCamera({
            center: center,
            pitch: 0,
            heading: 0,
            zoom: 16,
        });

    };
    selectedNextMove = () => {
        let item = this.state.selected;
        let index = -1;
        for (let i = 0; i < this.state.riderlocations.length; i++)
            if (this.state.riderlocations[i].userID == item.userID) {
                index = i;
                break;
            }

        if (index == -1) {
            const leg = JSON.parse(item.details.tripDetails.leg);

            const center = item.status == 'STARTED' ?
                { latitude: leg[leg.length - 1][0], longitude: leg[leg.length - 1][1] } :
                { latitude: leg[0][0], longitude: leg[0][1] };
            this.setState({ display: item });
            this.map.animateCamera({
                center: center,
                pitch: 0,
                heading: 0,
                zoom: 16,
            });
        }
        else {
            if (item.status == 'UNPICKED') {
                database().ref(`userLocation/${item.userID}`).once('value', data => {
                    if (data.val()) {
                        if (data.val().shareLocation == true) {
                            this.map.animateCamera({
                                center: data.val().location,
                                pitch: 0,
                                heading: 0,
                                zoom: 16,
                            });

                            item.status = 'CURRENTLOCATION';
                            this.setState({ display: item });
                        }
                        else {
                            //user not sharing location
                        }
                    }
                })
            }
            else if (item.status == 'CURRENTLOCATION') {
                const leg = JSON.parse(item.details.tripDetails.leg);

                const center = { latitude: leg[0][0], longitude: leg[0][1] };
                this.map.animateCamera({
                    center: center,
                    pitch: 0,
                    heading: 0,
                    zoom: 16,
                });
                item.status = 'UNPICKED';
                this.setState({ display: item });
            }
        }
    };
    componentWillUnmount() {
        KeepAwake.deactivate();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Geolocation.clearWatch(this.watchID);
        //Geolocation.stopObserving();
    };
    render() {
        const iconRotation_pr = this.height1.interpolate({
            inputRange: [y(3), this.fullH1],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });
        const iconRotation_ap = this.height2.interpolate({
            inputRange: [y(3), this.fullH2],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });
        const iconRotation_cr = this.height3.interpolate({
            inputRange: [y(3), this.fullH3],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });

        let distance = this.state.remainingDistance;//IN METRES
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;

        const markers = this.state.markers.map((item) => {
            let type = <></>;

            if (item.type == 'Location')
                type = <NavigatorMarkers inner={'#EE3446'} outer={'#AD2943'} />;
            else if (item.type == 'Destination')
                type = <NavigatorMarkers inner={'#FFC107'} outer={'#81650D'} />;
            else
                type = <NavigatorMarkers inner={'#AE38D9'} outer={'#571071'} />;
            return (<Marker
                key={`${item.userID}_${item.type}`}
                coordinate={item.coordinates}
                style={{ zIndex: 2, elevation: 2 }}
            >
                <View style={{ height: y(36.85), width: x(21.6) }}>
                    {type}
                </View>
                <Callout>
                    <View style={styles.calloutView}>
                        <Text style={styles.calloutText}>{item.name}</Text>
                        <Text style={styles.calloutText_}>{item.text}</Text>
                    </View>
                </Callout>
            </Marker>)
        });

        const rL = this.state.riderlocations.map((item) => {
            return (<RiderLocation
                key={item.userID}
                item={item}
            />)
        });


        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={colors.BLACK} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                {this.state.steps ?
                    <Navigator speaker={this.state.speaker} endAddress={this.state.endAddress} steps={this.state.steps} display={this.state.display} />
                    : <></>}
                <View style={styles.status}>
                    <Text style={styles.statusText}>{`ONLINE - ${this.state.tripActive ? `ACTIVE` : `INACTIVE`}`}</Text>
                </View>
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: y(dimensionAssert() ? 165 : 225) }]}
                    onPress={this.changeSpeaker}>
                    <View style={styles.speaker}>
                        {this.state.speaker ?
                            <Speaker color={colors.BLUE} /> :
                            <SpeakerCancel color={colors.BLUE} />}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: y(dimensionAssert() ? 230 : 280) }, this.state.selected ? { backgroundColor: colors.BLUE } : {}]}
                    onPress={() => {
                        if (this.state.polyline) {
                            if (this.state.selected)
                                this.selectedNextMove();
                            else
                                this.nextMove();
                        }
                    }}
                >
                    <MaterialCommunityIcons name={'account-arrow-right-outline'} size={y(25)} color={this.state.selected ? colors.WHITE : colors.BLUE} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: y(dimensionAssert() ? 295 : 335) }]}
                    onPress={() => {
                        if (this.mapReady && this.state.detailsLoaded) {
                            this.setState({ followMap: false });
                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude]]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));

                            this.map.fitToCoordinates(bboxPolygon, {
                                edgePadding:
                                {
                                    top: x(170),
                                    right: x(80),
                                    bottom: x(90),
                                    left: x(20),
                                },
                            });
                        }
                    }}
                >
                    <MaterialIcons name={'my-location'} size={y(21)} color={colors.BLUE} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: y(dimensionAssert() ? 360 : 392) }]}
                    onPress={() => {

                        this.setState({ followMap: true, display: null, selected: null }, () => {
                            this.finalIndex = null;
                            this.currentIndexCount = 0;
                        })
                        Geolocation.getCurrentPosition(
                            (position) => {
                                this.animateMap(position);
                            },
                            (error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            },
                            {
                                distanceFilter: 10,
                                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                            }).catch((error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            });
                    }}
                >
                    <FontAwesome name={'location-arrow'} size={y(21)} color={colors.BLUE} />
                </TouchableOpacity>

                {this.state.followMap == false ?
                    <TouchableOpacity style={[styles.recenterContainer, { left: x(10), top: y(dimensionAssert() ? 420 : 430), }]}
                        onPress={() => {
                            this.setState({ followMap: true, display: null, selected: null }, () => {
                                this.finalIndex = null;
                                this.currentIndexCount = 0;
                            })
                            Geolocation.getCurrentPosition(
                                (position) => {
                                    this.animateMap(position);
                                },
                                (error) => {
                                    console.log(error.code, error.message);
                                    Geolocation.requestAuthorization();
                                },
                                {
                                    distanceFilter: 10,
                                    enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                                }).catch((error) => {
                                    console.log(error.code, error.message);
                                    Geolocation.requestAuthorization();
                                });
                        }}
                    >
                        <MaterialIcons name={'center-focus-strong'} size={y(21)} color={colors.BLUE} />
                        <Text style={styles.recenter}>RE-CENTER</Text>
                    </TouchableOpacity> : <></>}
                <MapView

                    ref={(ref) => this.map = ref}
                    provider={PROVIDER_GOOGLE}
                    style={[styles.maps,]}
                    customMapStyle={MapStyle}
                    showsUserLocation={true}
                    showsCompass={false}
                    scrollEnabled={true}
                    showsMyLocationButton={false}
                    onMapReady={() => {
                        this.mapReady = true;
                        Geolocation.getCurrentPosition(
                            (position) => {
                                this.animateMap(position);
                            },
                            (error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            }, {
                            distanceFilter: 10,
                            enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                        }).catch((error) => {
                            console.log(error.code, error.message);
                            Geolocation.requestAuthorization();
                        });
                    }}
                    onPanDrag={() => {
                        this.setState({ followMap: false })
                    }}
                >
                    {this.state.detailsLoaded ?
                        <>
                            <Marker //LOCATION
                                coordinate={{ latitude: this.state.location.latitude, longitude: this.state.location.longitude }}
                                identifier={'mkL'}
                                style={{ zIndex: 1, elevation: 1 }}
                            >
                                <FontAwesome name={'circle'} color={colors.BLUE_DARK} size={y(15)} />
                            </Marker>
                            <AnimatedPolyline
                                coordinates={this.state.polyline.map(value => {
                                    return { latitude: value[0], longitude: value[1] }
                                })}
                                strokeColorMove={colors.BLUE_LIGHT}
                                strokeColor={colors.BLUE}
                                strokeWidth={4}
                            />
                            <Marker //DESTINATION
                                coordinate={{ latitude: this.state.destination.latitude, longitude: this.state.destination.longitude }}
                                identifier={'mkD'}
                                style={{ zIndex: 1, elevation: 1 }}
                            >
                                <DestinationPin color={colors.BLUE_DARK} />
                            </Marker>
                        </> : <></>}
                    {markers}
                    {rL}
                </MapView>
                <Animated.View style={[styles.lowerSection, this.position.getLayout(),]} {...this.panResponder.panHandlers}
                    onLayout={(event) => {
                        this.TAB_HEIGHT = -event.nativeEvent.layout.height + (height / (dimensionAssert() ? 3.00 : 3.10));
                    }}
                >
                    <View style={styles.tab}></View>
                    <View style={styles.bubble}>
                        <Text numberOfLines={1} style={styles.bubbleText}>{distance}</Text>
                    </View>

                    <View style={[styles.spaceView, { marginTop: y(55) }]}>
                        <Text style={[styles.title, {}]}>{`Pending Requests (${this.state.result_pr.length})`}</Text>

                        <TouchableOpacity style={{ width: x(50), }}
                            onPress={() => {
                                if (this.state.result_pr.length == 0)
                                    this.animateHeight('PR');
                            }}>
                            <Animated.View style={[{ transform: [{ rotate: iconRotation_pr }] }]}>
                                <Icon name={'ios-chevron-down'} size={y(40)} />
                            </Animated.View>
                        </TouchableOpacity>

                    </View>
                    <Animated.View style={[styles.cont1, { height: this.height1 }]}

                    >
                        {this.state.h1 ?
                            this.state.result_pr.length !== 0 ?
                                <FlatList //new one is always make when h1 changes, so store it in state or somewhere it wont change..maybe it doesnt change cause h1 dont change
                                    scrollEnabled={false}
                                    ref={ref => this.flatList_pr = ref}
                                    data={this.state.result_pr}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <Pressable
                                                onPress={() => { this.selectedMove(item) }}>
                                                <PendingRequest
                                                    data={item}
                                                    navigation={this.props.navigation}
                                                    userDetails={this.state.userDetails}
                                                    polyline={this.state.polyline}
                                                    now={true} />
                                            </Pressable>
                                        );
                                    }}
                                    keyExtractor={item => JSON.stringify(item.details.userID)}
                                /> :
                                <View style={styles.noResultView}>
                                    <Text style={styles.noResultText}>{`No pending requests at the moment`}</Text>
                                </View>
                            : <></>}
                    </Animated.View>

                    <View style={[styles.spaceView, { marginTop: y(55) }]}>
                        <Text style={[styles.title, {}]}>{`Awaiting Pickup (${this.state.result_ap.length})`}</Text>
                        <TouchableOpacity style={{ width: x(50), }}
                            onPress={() => {
                                this.animateHeight('AP');
                            }}>
                            <Animated.View style={[{ transform: [{ rotate: iconRotation_ap }] }]}>
                                <Icon name={'ios-chevron-down'} size={y(40)} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.cont1, { height: this.height2 }]}>

                        {this.state.h2 ?
                            this.state.result_ap.length !== 0 ?
                                <FlatList
                                    scrollEnabled={false}
                                    ref={ref => this.flatList_ap = ref}
                                    data={this.state.result_ap}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <Pressable
                                                onPress={() => { this.selectedMove(item) }}>
                                                <AwaitingPickup
                                                    data={item}
                                                    navigation={this.props.navigation}
                                                    userDetails={this.state.userDetails}
                                                    polyline={this.state.polyline}
                                                    speaker={this.state.speaker}
                                                    vehicle={this.state.vehicle}
                                                    now={true} />
                                            </Pressable>
                                        );
                                    }}

                                    keyExtractor={item => item.userID}

                                /> :
                                <View style={styles.noResultView}>
                                    <Text style={styles.noResultText}>{`No perchers awaiting pickups at the moment`}</Text>
                                </View>
                            : <></>}
                    </Animated.View>

                    <View style={[styles.spaceView, { marginTop: y(55) }]}>
                        <Text style={[styles.title, {}]}>{`Current Riders (${this.state.result_cr.length})`}</Text>
                        <TouchableOpacity style={{ width: x(50), }}
                            onPress={() => {
                                this.animateHeight('CR');
                            }}>
                            <Animated.View style={[{ transform: [{ rotate: iconRotation_cr }] }]}>
                                <Icon name={'ios-chevron-down'} size={y(40)} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.cont1, { height: this.height3 }]}>
                        {this.state.h3 ?
                            this.state.result_cr.length !== 0 ?
                                <FlatList
                                    scrollEnabled={false}
                                    ref={ref => this.flatList_cr = ref}
                                    data={this.state.result_cr}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <Pressable
                                                onPress={() => { this.selectedMove(item) }}>
                                                <CurrentRiders
                                                    data={item}
                                                    navigation={this.props.navigation}
                                                    userDetails={this.state.userDetails}
                                                    polyline={this.state.polyline}
                                                    speaker={this.state.speaker}
                                                    historyRef={this.state.historyRef}
                                                    now={true} />
                                            </Pressable>
                                        );
                                    }}
                                    keyExtractor={item => item.userID}
                                /> :
                                <View style={styles.noResultView}>
                                    <Text style={styles.noResultText}>No riders in the vehicle at the moment</Text>
                                </View>
                            : <></>}
                    </Animated.View>


                    <Text style={[styles.semiBold, { color: colors.BLUE_FONT, fontSize: y(16), width: x(313), marginTop: y(17.5) }]}>Vehicle</Text>
                    <View style={{ marginTop: y(8) }}>
                        <ViewVehicle vehicle={this.state.vehicle} />
                    </View>

                </Animated.View>
                <View style={styles.button}>
                    <View style={styles.buttonCont}>
                        <TouchableOpacity style={[styles.buttonView, { backgroundColor: colors.BLUE }]} onPress={() => {
                            this.changeStatus();
                        }}>
                            <Text style={[styles.buttonText, { color: colors.WHITE }]}>{this.state.tripActive ? `Go inactive` : `Go active`}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.buttonView, { backgroundColor: colors.RED }]}
                            onPress={this.endTrip}>
                            <Text style={[styles.buttonText, { color: colors.WHITE }]}>End trip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View >
        )
    }
};

class RiderLocation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            coordinates: null,
            sharelocation: false,
        };
        this.userID = this.props.item.userID;
        this.name = this.props.item.name;

    };

    componentDidMount() {
        database().ref(`userLocation/${this.userID}`).on('value', data => {
            if (data.val()) {
                if (data.val().shareLocation == true)
                    this.setState({ sharelocation: true, coordinates: data.val().location })
                else
                    this.setState({ sharelocation: false, coordinates: null })
            }
        })
    };
    render() {
        if (this.state.sharelocation)
            return (
                <Marker
                    coordinate={this.state.coordinates}
                    style={{ zIndex: 3, elevation: 3 }}
                >
                    <View style={{ height: y(36.85), width: x(21.6) }}>
                        <NavigatorMarkers inner={'#4DB748'} outer={'#1F741B'} />
                    </View>

                    <Callout>
                        <View style={styles.calloutView}>
                            <Text style={styles.calloutText}>{this.name}</Text>
                            <Text style={styles.calloutText_}>{'Current Location'}</Text>
                        </View>
                    </Callout>
                </Marker>
            );
        else
            return <></>
    }
}