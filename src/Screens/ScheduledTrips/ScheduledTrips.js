import React from 'react';
import styles from './styles';
import { Animated, Text, View, Pressable, FlatList, Switch, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, Alert, BackHandler, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from 'react-native-geolocation-service';
import Header from '../../Components/Header/Header';
import axios from 'axios';
import moment from 'moment';
import Divider from '../../Components/Divider/Divider';
import * as turf from '@turf/turf';//for encoding polylines
import database from '@react-native-firebase/database';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { indexFinder, polylineLenght, OfflineNotice, x, y, colors, height, width, dimensionAssert, makeid, distanceCalculator, startScheduledDriverTrip } from '../../Functions/Functions';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline, Polygon, Callout } from 'react-native-maps';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import AnimatedPolyline from '../../Components/AnimatedPolyline/AnimatedPolyline';
import { ViewVehicle } from '../../Components/VehicleComponents/VehicleComponents';
import Icon from 'react-native-vector-icons/Ionicons';
import { MaterialIndicator } from 'react-native-indicators';
import { PendingRequest, AwaitingPickup, CurrentRiders } from '../../Components/RiderComponents/RiderComponents';
import { DestinationPin, Speaker, SpeakerCancel, NavigatorMarkers, NoResultCatcus } from '../../Images/svgimages/vectors';
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
            speaker: false,//No need to hear anything

            result_pr: [],//this is where you store results from pending result....DO NOT CHANGE THIS, ONLY CHANGE THE DATA IT HOLDS AND FLATLIST BUT USE THE VARIABLE NAMES AND UPDATE FUNS
            result_ap: [],
            result_cr: [],
            markers: [],
            riderlocations: [],
            tripActive: false,
            tripStatus: '',
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
            finishLoading: false,

            locationAddress: null,
            destinationAddress: null,

            selected: null,
            display: null,
            historyRef: null,
            rawDate: null
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
        //KeepAwake.activate();
        AsyncStorage.getItem(`USER_DETAILS`)
            .then((result) => {
                const userDetails = JSON.parse(result);
                this.setState({ userDetails: userDetails });
                database().ref(`scheduledCarpoolRequests/${userDetails.driverID}/requestStatus`).on('value', data => {
                    if (data.val()) {
                        if (data.val() == 'active')
                            this.setState({ tripActive: true, tripStatus: data.val() })
                        else if (data.val() == 'inactive' || data.val() == 'INACTIVE')
                            this.setState({ tripActive: false, tripStatus: data.val() })
                    }
                });
                database().ref(`scheduledCarpoolTripReserve/carpool/driver/${userDetails.driverID}`).once('value', data => {
                    if (data.val())
                        this.setState({ steps: JSON.parse(data.val().steps), endAddress: data.val().endAddress });
                });
                database().ref(`scheduledCarpoolRequests/${userDetails.driverID}`).once('value', data => {
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
                            locationAddress: data.val().locationAddress,
                            destinationAddress: data.val().destinationAddress,
                            rawDate: data.val().rawDate,
                            finishLoading: true,

                        }, () => {
                            this.fitToCoordinates();
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





                            database().ref(`scheduledCarpoolRequestsFromUsers/${userDetails.driverID}`).on('child_added', data => {//PENDING REQUEST LISTENER
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
                                        database().ref(`scheduledCarpoolRequestsFromUsers/${userDetails.driverID}/${data.val().details.userID}`).remove();
                                    }
                                }
                            });
                            database().ref(`scheduledCarpoolRequestsFromUsers/${userDetails.driverID}`).on('child_changed', data => {//PENDING REQUEST LISTENER TO REMOVE DATA BY UPDATING
                                if (data.val().status == 'CANCELLED' || data.val().status == 'CONFIRMED') {//delete if cancelled of confirmed
                                    database().ref(`scheduledCarpoolRequestsFromUsers/${userDetails.driverID}/${data.val().details.userID}`).remove();
                                    this.updateResultsRemove('PR', data.val());

                                    let markers = this.state.markers;//if picked we show where the dropoff is
                                    for (let i = 0; i < markers.length; i++)
                                        if (markers[i].userID == data.val().userID && markers[i].type == 'PendingRequest')
                                            markers.splice(i, 1);
                                    this.setState({ markers: markers });
                                }

                            });
                            database().ref(`scheduledCarpoolRequestsFromUsers/${userDetails.driverID}`).on('child_removed', data => {//PENDING REQUEST LISTENER TO REMOVE DATA
                                if (data.val()) {
                                    this.updateResultsRemove('PR', data.val());

                                    let markers = this.state.markers;//if picked we show where the dropoff is
                                    for (let i = 0; i < markers.length; i++)
                                        if (markers[i].userID == data.val().userID && markers[i].type == 'PendingRequest')
                                            markers.splice(i, 1);
                                    this.setState({ markers: markers })
                                }
                            });




                            database().ref(`scheduledCarpoolTrips/${userDetails.driverID}`).on('child_added', data => {//AWAITING PICKUP LISTENER
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

                            database().ref(`scheduledCarpoolTrips/${userDetails.driverID}`).on('child_removed', data => {//AWAITING PICKUP LISTENER
                                this.updateResultsRemove('AP', data.val());
                            });

                        });
                    }
                    else {
                        this.setState({ finishLoading: 'NORESULTS' })
                    }
                });



            })
            .catch(error => { console.log(error.message) });
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
                'Use this to go offline.You would stop recieving requests.To continue recieving requests, come back online',

                [{
                    text: 'Cancel',
                    style: 'cancel',
                }, {
                    text: 'Go offline',
                    style: 'destructive',
                    onPress: () => {
                        if (this.state.tripStatus != 'INACTIVE')
                            database().ref(`scheduledCarpoolRequests/${this.state.userDetails.driverID}`).update({ requestStatus: 'inactive' });

                    }
                }]);
        else if (this.state.tripStatus == 'inactive')
            database().ref(`scheduledCarpoolRequests/${this.state.userDetails.driverID}`).update({ requestStatus: 'active' });
        else if (this.state.tripStatus == 'INACTIVE')
            Alert.alert(
                'Trip starting soon',
                'Your trip is scheduled to start in less than 5 minutes, you cannot recieve any new requests.',
                [{ text: 'Ok', style: 'cancel' }],
            )
    };
    cancelTrip = () => {
        if (this.state.result_pr.length != 0)
            Alert.alert('Pending requests',
                'Please attend to the pending requests you currently have. To stop recieving new requests, you should use the "Stay active" switch',
                [
                    {
                        text: 'Ok',
                        style: 'cancel',
                    }
                ]);
        else if (this.state.result_ap.length != 0)
            Alert.alert('Accepted Requests',
                'You have some accepted requests,so you have to cancel their rides before you can cancel the trip. To stop recieving new requests, you should use the "Stay active" switch',
                [
                    {
                        text: 'Ok',
                        style: 'cancel',
                    }
                ]);
        else
            Alert.alert('Cancel trip?',
                'Canceling the trip would remove you from the map and complete this scheduled trip. Press "End trip" to remove it',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'End trip',
                        style: 'destructive',
                        onPress: () => {
                            database().ref(`scheduledCarpoolTripReserve/carpool/driver/${this.state.userDetails.driverID}`).remove()
                                .then(() => {
                                    database().ref(`scheduledCarpoolRequests/${this.state.userDetails.driverID}`).remove()
                                        .then(() => { this.props.navigation.navigate('Main') })
                                        .catch(error => { console.log(error.message) })
                                })
                                .catch(error => { console.log(error.message) })
                        },
                    }
                ]);
    };
    startTrip = () => {

        if (this.state.rawDate) {
            if ((this.state.rawDate - new Date().getTime() <= (4.5 * 60000)) && this.state.tripStatus == 'INACTIVE')//4.5 mins in advance and also so that status is INACTIVE
                this.setState({ finishLoading: false }, () => {
                    startScheduledDriverTrip.call(this, this.state.userDetails.driverID);
                });
            else {//CALL THE STARTER FUNTION HERE
                Alert.alert(
                    'Too early to start trip',
                    `Your trip is scheduled to start at ${moment(this.state.rawDate).format('LLL')}.You can only start a maximum of 5 minutes in advance`,
                    [{
                        text: 'Ok',
                        style: 'cancel',
                    }]
                )
            }
        }

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
        };
    };
    fitToCoordinates = () => {
        if (this.state.detailsLoaded && this.mapReady) {
            this.setState({ followMap: true });
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

                    if (this.finalIndex == null) {
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
        //KeepAwake.deactivate();
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

        if (this.state.finishLoading == 'NORESULTS')
            return (
                <View style={[styles.container, {}]}>
                    <Header name={'Scheduled Trip'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <View style={{ justifyContent: 'center', top: -y(20), flex: 1, alignItems: 'center' }}>
                        <View style={styles.noresult}>
                            <NoResultCatcus />
                        </View>
                        <Text style={[styles.title, { fontSize: y(17, true), marginTop: y(10), width: x(343), textAlign: 'center' }]}>You have not scheduled any trips at the moment.</Text>
                    </View>
                </View>
            );
        else if (this.state.finishLoading == true)
            return (
                <View style={styles.container}>
                    <View style={{ zIndex: 3 }}>
                        <Header name={'Scheduled Trip'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                    </View>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />

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
                            this.fitToCoordinates()
                        }}
                    >
                        <MaterialIcons name={'my-location'} size={y(21)} color={colors.BLUE} />
                    </TouchableOpacity>

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
                            this.fitToCoordinates();
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
                        <Text style={[styles._title, { marginTop: y(30) }]}>Trip Details</Text>
                        <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                        <View style={[styles.spaceView, { marginTop: y(14.5) }]}>
                            <Text style={[styles.text]}>Start</Text>
                            <Text numberOfLines={4} style={[styles.textAddress]}>{this.state.locationAddress ? this.state.locationAddress : ''}</Text>
                        </View>
                        <View style={[styles.spaceView, { marginTop: y(8) }]}>
                            <Text style={[styles.text]}>End</Text>
                            <Text numberOfLines={4} style={[styles.textAddress]}>{this.state.destinationAddress ? this.state.destinationAddress : ''}</Text>
                        </View>
                        <View style={[styles.spaceView, { marginTop: y(8) }]}>
                            <Text style={[styles.text]}>Start trip</Text>
                            <Text style={[styles.textAddress]}>{this.state.rawDate ? moment(this.state.rawDate).format('LLL') : ''}</Text>
                        </View>
                        <Text style={[styles._title, { marginTop: y(30) }]}>List of requests</Text>
                        <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                        <View style={[styles.spaceView, { marginTop: y(28) }]}>
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
                                                        now={false}
                                                    />
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

                        <View style={[styles.spaceView, { marginTop: y(28) }]}>
                            <Text style={[styles.title, {}]}>{`Accepted Requests (${this.state.result_ap.length})`}</Text>
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
                                                        now={false}
                                                    />
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

                        <Text style={[styles._title, { marginTop: y(30) }]}>{`Status ( ${this.state.tripActive ? 'active' : 'inactive'} )`}</Text>
                        <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                        <View style={[styles.spaceView, { marginTop: y(8), }]}>
                            <Text style={[styles.text]}>Stay active</Text>

                            <Switch
                                trackColor={{ false: "#767577", true: colors.BLUE_OPAQUE(0.8) }}
                                thumbColor={!this.state.tripActive ? "#FFFFFF" : colors.BLUE}
                                onValueChange={(value) => {
                                    this.changeStatus();
                                }}
                                value={this.state.tripActive}
                            />
                        </View>
                        <Text style={[styles.semiBold, { color: colors.BLUE_FONT, fontSize: y(16, true), width: x(313), marginTop: y(17.5) }]}>Vehicle</Text>
                        <View style={{ marginTop: y(8) }}>
                            <ViewVehicle vehicle={this.state.vehicle} />
                        </View>
                    </Animated.View>



                    <View style={styles.button}>
                        <View style={styles.buttonCont}>
                            <TouchableOpacity style={[styles.buttonView, { backgroundColor: colors.RED }]}
                                onPress={this.cancelTrip}>
                                <Text style={[styles.buttonText, { color: colors.WHITE }]}>Cancel trip</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.buttonView, { backgroundColor: colors.BLUE }]} onPress={this.startTrip}>
                                <Text style={[styles.buttonText, { color: colors.WHITE }]}>{'Start trip'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View >
            );
        else
            return (
                <View style={styles.container}>
                    <Header name={'Scheduled Trip'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <MaterialIndicator color={colors.BLUE} size={y(100)} />
                </View>
            );
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
};