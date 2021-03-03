import React from 'react';
import { Linking, Alert, Platform, Dimensions, StatusBar, Animated, View, Text, LayoutAnimation } from 'react-native';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Keyboard } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn'
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import * as turf from '@turf/turf';//for encoding polylines
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import AndroidOpenSettings from 'react-native-android-open-settings'
import database from '@react-native-firebase/database';
import NetInfo from "@react-native-community/netinfo";
import _ from 'lodash';
import moment from 'moment';
import Button from '../Components/Button/Button';
import { LocationNotGranted } from '../Images/svgimages/vectors'
const GOOGLE_KEY = 'AIzaSyCBmmCb6Lkhbj6LR5eCi2Lz2ocbpyW6kb4';
const polyline = require('@mapbox/polyline');// for decoding polylines
const [WHITE, RED, GREEN, LIGHT_BLUE] = ['#FFFFFF', '#FF0000', '#4DB748', '#4767B9'];

export const [height, width] = [Dimensions.get('window').height - (Platform.OS === 'android' ? (Dimensions.get('screen').height == Dimensions.get('window').height ? StatusBar.currentHeight : 0) : 0), Dimensions.get('window').width];


//GET TOKEN AND SEND IT TO THE DATABASE
export function getFirebaseMessagingToken() {
    AsyncStorage.getItem('USER_DETAILS')
        .then(result => {
            const userID = JSON.parse(result).userID;
            messaging().getToken()
                .then(fcmToken => {
                    if (fcmToken) {
                        database().ref(`deviceID/${userID}`).set({
                            os: Platform.OS,
                            token: fcmToken,
                        })
                            .catch(error => { console.log(error.message) })
                    }
                    else {
                        database().ref(`deviceID/${userID}`).set({
                            os: Platform.OS,
                            token: 'NOTOKEN',
                        })
                            .catch(error => { console.log(error.message) })
                    }
                }).catch(error => { console.log(error.message) })
        }).catch(error => { console.log(error.message) })
};
//CLASS FOR GRANTING THE NOTIFICATION
export class Notifications extends React.Component {
    componentDidMount() {
        PushNotification.configure({
            // (required) Called when a remote or local notification is opened or received
            onNotification: function (notification) {
                // required on iOS only 
                if (notification.userInteraction)
                    console.log(notification.userInteraction)
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            // Android only
            senderID: "89897349326",
            userInfo: { id: '123' },
            // iOS only
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            popInitialNotification: true,
            requestPermissions: true
        });

    }
    render() {
        return (
            <></>
        )
    }
};
//FOR ONLINE OFFLINE NOTICE
export class OfflineNotice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        this.Y_START = y(55);
        this.Y_END = -y(100);
        this.Y_START_ = y(dimensionAssert() ? 30 : 55);
        this.Y_END_ = -y(750);
        this.position = new Animated.ValueXY({ x: 0, y: this.Y_END });//This is the value we are animating to.
        this.position_ = new Animated.ValueXY({ x: 0, y: this.Y_END_ });//This is the value we are animating to.

    };
    componentDidMount() {
        NetInfo.addEventListener(this.handleConnectivityChange);
        this.watchID = setInterval(() => {
            permissionLocation()
                .then(result => {
                    if (result == 'LOCATIONGRANTED')//hide it
                        Animated.spring(this.position_, {
                            toValue: { x: 0, y: this.Y_END_ },
                            bounciness: 0,
                            useNativeDriver: false,
                        }).start();
                    else if (result == 'NOLOCATION')//show it
                        Animated.spring(this.position_, {
                            toValue: { x: 0, y: this.Y_START_ },
                            bounciness: 0,
                            useNativeDriver: false,
                        }).start();
                })
                .catch(error => { console.log(error.message) })
        }, 3000);
        const navigation = this.props.navigation;
        messaging().onNotificationOpenedApp(remoteMessage => {
            if (remoteMessage.data.navigateTo == 'SupportMessage')
                navigation.navigate('SupportMessage', remoteMessage.data);
            else
                AsyncStorage.getItem('USER_DETAILS')
                    .then(result => {
                        const driverID = JSON.parse(result).driverID;
                        if (remoteMessage.data.navigateTo == 'ScheduledTrips') {
                            database().ref(`scheduledCarpoolRequests/${driverID}/requestStatus`).once('value', snapshot => {
                                if (snapshot.val())
                                    navigation.navigate('ScheduledTrips');
                            })
                        }
                        else
                            database().ref(`carpoolRequests/${driverID}/requestStatus`).once('value', snapshot => {
                                if (snapshot.val()) {
                                    if (remoteMessage.data.navigateTo == 'TripStarted')
                                        navigation.navigate('TripStarted');
                                    else if (remoteMessage.data.navigateTo == 'Chat')
                                        navigation.navigate('Chat', remoteMessage.data);
                                }
                                else
                                    database().ref(`scheduledCarpoolRequests/${driverID}/requestStatus`).once('value', snapshot_ => {
                                        if (snapshot_.val() && remoteMessage.data.navigateTo == 'Chat')
                                            navigation.navigate('Chat', remoteMessage.data);
                                    }).catch(error => { console.log(error.message) })
                            }).catch(error => { console.log(error.message) })
                    }).catch(error => { console.log(error.message) })
        });
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    if (remoteMessage.data.navigateTo == 'SupportMessage')
                        navigation.navigate('SupportMessage', remoteMessage.data);
                    else
                        AsyncStorage.getItem('USER_DETAILS')
                            .then(result => {
                                const driverID = JSON.parse(result).driverID;
                                if (remoteMessage.data.navigateTo == 'ScheduledTrips') {
                                    database().ref(`scheduledCarpoolRequests/${driverID}/requestStatus`).once('value', snapshot => {
                                        if (snapshot.val())
                                            navigation.navigate('ScheduledTrips');
                                    })
                                }
                                else
                                    database().ref(`carpoolRequests/${driverID}/requestStatus`).once('value', snapshot => {
                                        if (snapshot.val()) {
                                            if (remoteMessage.data.navigateTo == 'TripStarted')
                                                navigation.navigate('TripStarted');
                                            else if (remoteMessage.data.navigateTo == 'Chat')
                                                navigation.navigate('Chat', remoteMessage.data);
                                        }
                                        else
                                            database().ref(`scheduledCarpoolRequests/${driverID}/requestStatus`).once('value', snapshot_ => {
                                                if (snapshot_.val() && remoteMessage.data.navigateTo == 'Chat')
                                                    navigation.navigate('Chat', remoteMessage.data);
                                            }).catch(error => { console.log(error.message) })
                                    }).catch(error => { console.log(error.message) })
                            }).catch(error => { console.log(error.message) })
                };
            })
            .catch(error => { console.log(error.message) })

        this.unsubscribe = messaging().onMessage(remoteMessage => {
            if (navigation.isFocused()) {
                PushNotification.configure({
                    onNotification: function (notification) {
                        const n = Platform.OS == 'ios' ? (notification.alert == undefined) : notification.userInteraction;
                        if (n) {
                            if (remoteMessage.data.navigateTo == 'SupportMessage')
                                navigation.navigate('SupportMessage', remoteMessage.data);
                            else
                                AsyncStorage.getItem('USER_DETAILS')
                                    .then(result => {
                                        const driverID = JSON.parse(result).driverID;

                                        if (remoteMessage.data.navigateTo == 'ScheduledTrips') {
                                            database().ref(`scheduledCarpoolRequests/${driverID}/requestStatus`).once('value', snapshot => {
                                                if (snapshot.val())
                                                    navigation.navigate('ScheduledTrips');
                                            })
                                        }
                                        else
                                            database().ref(`carpoolRequests/${driverID}/requestStatus`).once('value', snapshot => {
                                                if (snapshot.val()) {
                                                    if (remoteMessage.data.navigateTo == 'TripStarted')
                                                        navigation.navigate('TripStarted');
                                                    else if (remoteMessage.data.navigateTo == 'Chat')
                                                        navigation.navigate('Chat', remoteMessage.data);
                                                }
                                                else
                                                    database().ref(`scheduledCarpoolRequests/${driverID}/requestStatus`).once('value', snapshot_ => {
                                                        if (snapshot_.val() && remoteMessage.data.navigateTo == 'Chat')
                                                            navigation.navigate('Chat', remoteMessage.data);
                                                    }).catch(error => { console.log(error.message) })
                                            }).catch(error => { console.log(error.message) })
                                    }).catch(error => { console.log(error.message) })
                        }
                        notification.finish(PushNotificationIOS.FetchResult.NoData);
                    },
                    // Android only
                    senderID: "89897349326",
                    userInfo: { id: '123' },
                    // iOS only
                    permissions: {
                        alert: true,
                        badge: true,
                        sound: true
                    },
                    popInitialNotification: true,
                    requestPermissions: true
                });
                if ((remoteMessage.data.navigateTo != this.props.screenName && this.props.screenName !== undefined) || remoteMessage.data.navigateTo == 'TripStarted') {
                    PushNotification.localNotification({
                        //... You can use all the options from localNotifications
                        title: remoteMessage.notification.title,
                        message: remoteMessage.notification.body,
                    });
                }
            }
        });
    }
    componentWillUnmount() {
        this.unsubscribe();
        clearInterval(this.watchID);
        // NetInfo.removeEventListener(this.handleConnectivityChange);
    }
    handleConnectivityChange = (state) => {
        if (state.isConnected) {
            Animated.spring(this.position, {
                toValue: { x: 0, y: this.Y_END },
                bounciness: 0,
                useNativeDriver: false,
            }).start();
            // })

        } else {//OUTRIGHTLY NO CONNECTION
            Animated.spring(this.position, {
                toValue: { x: 0, y: this.Y_START },
                bounciness: 0,
                useNativeDriver: false,
            }).start();
        }
    };

    render() {
        return (
            <>
                <Animated.View style={[{ width: width, alignItems: 'center', position: 'absolute', zIndex: 10, elevation: 10 }, this.position.getLayout()]}>
                    <View style={{ height: y(100), borderRadius: 10, width: x(313), backgroundColor: RED, justifyContent: 'space-around', alignItems: 'center', paddingVertical: y(20) }}>
                        <Text style={{ fontFamily: 'Gilroy-ExtraBold', fontSize: y(18), color: WHITE }}>There is no internet connection</Text>
                        <Text style={{ fontFamily: 'Gilroy-SemiBold', fontSize: y(14), color: WHITE }}>Your device is currently offline</Text>
                    </View>
                </Animated.View>

                {this.props.doNotCheckLocation ?
                    <></> :
                    <Animated.View style={[{ width: width, alignItems: 'center', position: 'absolute', zIndex: 11, elevation: 11 }, this.position_.getLayout()]}>
                        <View style={{ height: y(dimensionAssert() ? 740 : 700), borderRadius: 10, width: x(343), backgroundColor: LIGHT_BLUE, alignItems: 'center', }}>
                            <Text style={{ fontFamily: 'Gilroy-ExtraBold', fontSize: y(18), color: WHITE, marginTop: y(37) }}>You did not provide location access</Text>
                            <Text style={{ fontFamily: 'Gilroy-Regular', lineHeight: y(22), fontSize: y(14), color: WHITE, width: '100%', paddingHorizontal: x(10), textAlign: 'center', marginTop: y(24) }}>
                                {`As a Perch driver , it is required that we know your location, at least when you are using the app . This is so that we can effectively plan trips and update riders with your location. To use the app to make a trip, we need you to provide us with access to your location and you can do so with the button below.`}
                            </Text>
                            <View style={{ marginTop: y(34) }}>
                                <Button
                                    text={'Provide Location access'}
                                    onPress={() => {
                                        if (Platform.OS === 'ios')
                                            Linking.openURL('app-settings:');
                                        else if (Platform.OS === 'android')
                                            AndroidOpenSettings.appNotificationSettings()
                                    }}
                                    height={y(48)}
                                    width={x(313)}
                                />
                            </View>
                            <View style={{ width: x(343), height: y(dimensionAssert() ? 281 : 224.29), marginTop: y(dimensionAssert() ? 40 : 70), }}>
                                <LocationNotGranted />
                            </View>
                        </View>
                    </Animated.View>}
            </>
        );
    }
};
//CHECK IF THIS IS THE FIRST LAUNCH
export async function checkIfFirstLaunch() {
    try {
        const hasLaunched = await AsyncStorage.getItem('HAS_LAUNCHED');
        if (hasLaunched === null) {//This means it has not been launched before
            AsyncStorage.setItem('HAS_LAUNCHED', 'true')
                .then(() => {
                    return false;
                }).catch(error => {
                    console.log(error.message)
                });
        }
        else
            return true;
    } catch (error) {
        return false;
    }
};
//CHECK IF THE PERMISSION FOR LOCATION IS GRANTED
export function permissionLocation() {
    return new Promise(resolve => {
        let permission_;
        if (Platform.OS === 'ios')
            permission_ = PERMISSIONS.IOS.LOCATION_ALWAYS;
        else if (Platform.OS === 'android')
            permission_ = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION
        check(permission_)
            .then(result => {//STORE THE RESULT IN ASYNC STORAGE AND SO WE CHECK WHENEVR WE WANT TO USE IT.
                switch (result) {
                    case RESULTS.UNAVAILABLE: {
                        AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('FALSE_UNAVAILABLE'))
                            .then(() => { resolve('NOLOCATION') })
                            .catch(error => { console.log(error.message) });
                    }
                        break;
                    case RESULTS.DENIED: {
                        request(permission_).then(result => {
                            console.log(result);
                        });
                        AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('FALSE_DENIED'))
                            .then(() => { resolve('NOLOCATION') })
                            .catch(error => { console.log(error.message) });
                        Geolocation.requestAuthorization();
                    }
                        break;
                    case RESULTS.GRANTED:
                        {
                            AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('TRUE'))
                                .then(() => { resolve('LOCATIONGRANTED') })
                                .catch(error => { console.log(error.message) });
                        }
                        break;
                    case RESULTS.BLOCKED:
                        AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('FALSE_BLOCKED'))
                            .then(() => { resolve('NOLOCATION') })
                            .catch(error => { console.log(error.message) });
                        break;
                }
            })
            .catch(error => {
                console.log(error.message)
            });
    })
};
//HANDLE DRIVER LOGINS
export function handleLogin() {
    const { email, password } = this.state;

    auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            const userID = auth().currentUser.uid;
            database().ref(`users/${userID}`).once('value', data => {
                if (data.val().driverVerified) {
                    AsyncStorage.setItem('USER_DETAILS', JSON.stringify(data.val()))
                        .then(() => {
                            if (this.props.route.params)
                                if (this.props.route.params.forceUpdate)
                                    this.props.route.params.forceUpdate(data.val());

                            if (data.val().driverVerified == 'PENDING')
                                this.props.navigation.navigate("ProcessingApplication", { userDetails: data.val() });
                            else if (data.val().driverVerified == 'VERIFIED')
                                this.props.navigation.navigate("Main", { userDetails: data.val() });
                        })
                        .then(() => setTimeout(() => {
                            this.setState({ password: "", errorMessage: "", loading: false })
                        }, 1000))
                        .catch(error => { console.log(error.message) });
                }
                else {
                    auth().signOut()
                        .then(() => {
                            this.setState({ password: "", errorMessage: `You have not applied to become a driver, please create a driver account with the "Create a driver account" button below`, loading: false });
                        }).catch(e => { console.log(e.message) })
                }
            }).catch(error => console.log(error.message))
        })
        .catch(error => this.setState({ errorMessage: error.message, loading: false }));
};
//HANDLE LOGOUTS
export function signOut(forceUpdate) {
    auth().signOut()
        .then(() => {
            AsyncStorage.removeItem("USER_DETAILS")
                .then(() => {
                    this.props.navigation.navigate("SignIn", {
                        forceUpdate: (value) => { forceUpdate(value); }
                    })
                })
                .catch(error => { console.log(error.message) })
        })
        .catch(error => { console.log(error.message) })
};
export function sendPasswordResetLink(email) {
    auth().sendPasswordResetEmail(email)
        .then(() => {
            Alert.alert('Email sent', 'Your password reset email has been successfully send',
                [{ text: 'Ok', onPress: () => { this.props.navigation.goBack() } }])
        }).catch(error => {
            Alert.alert(`Error`, error.message);
            this.setState({ loading: false })
        })
};
//SEND VERIFICATION CODES
export function sendVerification(userID, type, action, code, phoneNumber, email, name, screenName) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendVerificationCode`,
        {
            userID: userID,
            type: type,
            action: action,
            code: code,
            phoneNumber: phoneNumber,
            email: email,
            name: name
        })
        .then((r) => {
            const result = r.data;
            if (action == 'check') {
                if (result) {
                    this.setState({ loading: false });
                    if (screenName = 'VerifyPhoneNumber')
                        this.props.navigation.navigate('Main')
                }
                else {
                    this.setState({ loading: false })
                    Alert.alert('Error', 'The verification code was not correct. Please check again or click resend.',);
                }
            }
        })
        .catch(error => {
            Alert.alert('Error', `${error.message}, please resend code`);
            this.setState({ loading: false });
        })
};
//REVERSE GEOCODING
export function reverseGeocoding(region, input, screen) {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${GOOGLE_KEY}`)
        .then(result => {
            if (screen == 'MAIN') {
                //console.log(JSON.stringify(result.data.results[0]));
                const mainAddress = result.data.results[0].address_components[0].short_name + ' ' + result.data.results[0].address_components[1].long_name;
                const secondaryAddress = result.data.results[0].formatted_address;
                if (input == 'location')
                    this.setState({
                        location: mainAddress, latitude: region.latitude, longitude: region.longitude, suggestion: 'springDown',
                        regionMovedData: { mainText: mainAddress, description: secondaryAddress, place_id: result.data.results[0].place_id, input: input },
                    });
                else if (input == 'destination')
                    this.setState({
                        destination: mainAddress, latitude1: region.latitude, longitude1: region.longitude, suggestion: 'springDown',
                        regionMovedData: { mainText: mainAddress, description: secondaryAddress, place_id: result.data.results[0].place_id, input: input },
                    });
            }
            else if (screen == 'RIDESHARECHOICE') {
                const mainAddress = result.data.results[0].address_components[0].short_name + ' ' + result.data.results[0].address_components[1].long_name;
                if (input == 'location') {
                    axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${[region.latitude, region.longitude]}&destination=${[this.state.destination.latitude, this.state.destination.longitude]}&key=${GOOGLE_KEY}`)
                        .then(result => {
                            this.setState({
                                location: {
                                    latitude: region.latitude,
                                    longitude: region.longitude,
                                    description: mainAddress,
                                },
                                finalLoading: false,
                                polyline: polyline.decode(result.data.routes[0].overview_polyline.points),
                            });
                        }).catch(error => { console.log(error.message) })
                }
            }
        })
        .catch(error => { console.log(error.message) });
};
//DEBOUNCER
export var debouncer = _.debounce(loadResults, 1000);
//LOAD SEARCH RESULTS
export function loadResults(text, screen) {
    switch (screen) {
        case 'Main': {
            //this.setState({destination:text})
            if (text == '') {
                this.setState({ predictionsLoaded: false, predictions: [] })
            }
            else {
                axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}${this.state.currentLocation}&key=${GOOGLE_KEY}`)
                    .then(result => {//You return everythimg you wanna use from the queries
                        this.setState({ predictionsLoaded: true, predictions: (result.data.predictions.map((data) => { return { mainText: data.structured_formatting.main_text, description: data.description, place_id: data.place_id } })) })
                    })
                    .catch(error => console.log(error.message));
            }
        } break;
        case 'SavedPlaces': {
            //this.setState({destination:text})
            if (text == '') {
                this.setState({ predictions: [] })
            }
            else {
                axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}${this.state.currentLocation}&key=${GOOGLE_KEY}`)
                    .then(result => {//You return everythimg you wanna use from the queries
                        this.setState({ predictionsLoaded: true, predictions: (result.data.predictions.map((data) => { return { mainText: data.structured_formatting.main_text, description: data.description, place_id: data.place_id } })) })
                    })
                    .catch(error => console.log(error.message));
            }
        } break;
    }
};
//HISTORY INSERTER
export function searchHistoryInsert(search) {//WE WOULD ALWAYS HAVE A MAX OF 5 ENTRIES
    const place_id = search.place_id;
    let countID = -1;
    AsyncStorage.getItem('HISTORY')
        .then(result => {
            if (result) {
                let listOfPlaces = JSON.parse(result);
                for (let i = 0; i < listOfPlaces.length; i++)
                    if (place_id === listOfPlaces[i].place_id)
                        countID = i;

                if (countID !== -1)//THE ENTRY EXISTS
                {
                    listOfPlaces.splice(countID, 1);
                    listOfPlaces.unshift(search);

                }
                else {
                    if (listOfPlaces.length >= 5)
                        listOfPlaces.pop();
                    listOfPlaces.unshift(search);
                }
                AsyncStorage.setItem('HISTORY', JSON.stringify(listOfPlaces))
                    .then(() => {
                        this.setState({ history: listOfPlaces })
                    })
                    .catch(error => console.log(error.message))
            }
            else {
                let toInsert = JSON.stringify([search]);
                AsyncStorage.setItem('HISTORY', toInsert)
                    .then(() => {
                        this.setState({ history: [search] })
                    })
                    .catch(error => console.log(error.message))
            }
        })
        .catch(error => console.log(error.message))

};
//LIST OF RECENTLY SEARCHED.
export var searchHistoryList = new Promise((resolve, reject) => {
    AsyncStorage.getItem('HISTORY')
        .then((result) => {
            resolve(JSON.parse(result))
        })
        .catch(error => console.log(error.message))
});
//MAKE A RANDOM ID
export function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${result}${new Date().getTime()}`;
};
//CHECK IF USER IS LOGGED IN
export function isUserLoggedIn() {
    auth().onAuthStateChanged(user => {
        if (user) { }
        else
            this.props.navigation.navigate('SignIn');
    })
};
//CANCEL FUNCTION
export function cancelTrip(toSend) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/cancelTrip`, toSend)
        .then(() => {
            Alert.alert(
                'The trip has been cancelled',
                'We would reach out to you shortly regarding refunds and compensation. Contact us for further information.',
                [{
                    text: 'Done',
                    style: 'cancel',
                    onPress: () => {
                        this.props.navigation.goBack();
                    },
                },
                ])
        })
        .catch(() => {
            Alert.alert(
                'Cancel request failed',
                'We failed to cancel this trip due to unknown reasons, please try again. Contact us for further help.',
                [{
                    text: 'Close',
                    style: 'cancel',
                },
                ])
        })

};
//GET LOCATION COORDINATES
export function getLocation(mainText, description, id, fieldID, screen) {
    switch (screen) {
        case 'Main': {
            Keyboard.dismiss();
            if (this.state.destinationFocused || (this.state.locationFocused && this.state.destination != ''))
                this.setState({ loading: true });


            axios.get('https://maps.googleapis.com/maps/api/place/details/json?place_id=' + id + '&fields=geometry&key=' + GOOGLE_KEY)
                .then(result => {
                    const lat = (result.data.result.geometry.location).lat;
                    const lng = (result.data.result.geometry.location).lng;
                    searchHistoryInsert.call(this, { latitude: Number(lat), longitude: Number(lng), description: description, place_id: id, mainText })
                    return { lat: Number(lat), lng: Number(lng) }
                })
                .then((results) => {
                    if (fieldID === 'location') {
                        this.setState({ latitude: results.lat, longitude: results.lng, location: mainText, });

                        if (this.state.destination == '')
                            this.destinationInput.focus();
                        else
                            Keyboard.dismiss();
                    }
                    else if (fieldID === 'destination') {
                        this.setState({ latitude1: results.lat, longitude1: results.lng, destination: mainText, });
                        Keyboard.dismiss();
                    }
                })
                .then(() => {
                    this.setState({ predictionsLoaded: false, predictions: [] })
                })
                .then(() => {

                    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.currentLocationLatitude},${this.state.currentLocationLongitude}&key=${GOOGLE_KEY}`)
                        .then(result_ => {
                            let location_ = this.state.location != '' ?
                                {
                                    description: this.state.location,
                                    latitude: this.state.latitude,
                                    longitude: this.state.longitude
                                } :
                                {
                                    description: result_.data.results[0].address_components[0].short_name + ' ' + result_.data.results[0].address_components[1].long_name,
                                    latitude: this.state.currentLocationLatitude,
                                    longitude: this.state.currentLocationLongitude,
                                };

                            if (this.state.destination != '') {

                                if (this.state.carpool) {
                                    axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${[location_.latitude, location_.longitude]}&destination=${[this.state.latitude1, this.state.longitude1]}&key=${GOOGLE_KEY}`)
                                        .then(result => {
                                            this.props.navigation.navigate('TripBreakdown', {
                                                location: {
                                                    description: location_.description,
                                                    latitude: location_.latitude,
                                                    longitude: location_.longitude,
                                                },
                                                destination: {
                                                    description: this.state.destination,
                                                    latitude: this.state.latitude1,
                                                    longitude: this.state.longitude1
                                                },
                                                legs: result.data.routes[0].legs[0],
                                                polyline: polyline.decode(result.data.routes[0].overview_polyline.points),
                                                onReturn: (val_) => {
                                                    this.onReturn.call(this, val_)
                                                },
                                            })
                                            setTimeout(() => {
                                                this.setState({ loading: false });
                                            }, 2000)
                                        }).catch(error => { console.log(error.message) })
                                }

                            }
                        }).catch(error => { console.log(error.message) })

                }
                )
                .catch(error => (console.log(error.message)))
        } break;
        case 'SavedPlaces': {
            axios.get('https://maps.googleapis.com/maps/api/place/details/json?place_id=' + id + '&fields=geometry&key=' + GOOGLE_KEY)
                .then(result => {
                    const lat = (result.data.result.geometry.location).lat;
                    const lng = (result.data.result.geometry.location).lng;

                    AsyncStorage.getItem('USER_DETAILS')
                        .then(result => {
                            let userDetails = JSON.parse(result);

                            if (fieldID == 'home') {
                                userDetails.homeAddress = {
                                    latitude: lat,
                                    longitude: lng,
                                    mainText: mainText,
                                    description: description,
                                    place_id: id,
                                };
                                this.setState({ homeAddress: userDetails.homeAddress, home: userDetails.homeAddress.mainText });
                            }
                            else if (fieldID == 'work') {
                                userDetails.workAddress = {
                                    latitude: lat,
                                    longitude: lng,
                                    mainText: mainText,
                                    description: description,
                                    place_id: id,
                                }
                                this.setState({ workAddress: userDetails.workAddress, work: userDetails.workAddress.mainText });
                            }

                            AsyncStorage.setItem('USER_DETAILS', JSON.stringify(userDetails))
                                .catch(error => { console.log(error.message) })

                            database().ref(`users/${[userDetails.userID]}`).update({
                                ...userDetails
                            }).catch(error => { console.log(error.message) })

                        }).catch(error => { console.log(error.message) })
                })
                .catch(error => { console.log(error.message) })
        } break;
    }
};
//TO CREATE A DRIVER CARPOOL REQUEST
export function createCarpoolRequest(requestObject) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/createCarpoolRequest`, requestObject)
        .then(() => {
            this.props.navigation.navigate('TripStarted');
            setTimeout(() => {
                this.setState({ loading: false })
            }, 2000)
        })
        .catch(error => { console.log(error.message) })
};
//TO CREATE A DRIVER CARPOOL REQUEST
export function createScheduledCarpoolRequest(requestObject) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/createScheduledCarpoolRequest`, requestObject)
        .then(() => {
            Alert.alert(
                `Trip successfully scheduled`,
                `You have scheduled your trip for ${moment(requestObject.rawDate).format('LLL')}`,
                [
                    {
                        text: 'Ok',
                        onPress: () => {
                            this.props.navigation.navigate('Main')
                            setTimeout(() => {
                                this.setState({ loading: false })
                            }, 2000)
                        },
                        style: 'cancel'

                    }
                ],
                { cancelable: false }
            )
        })
        .catch(error => { console.log(error.message) })
};
//TO END A DRIVER CARPOOL I.E TO DROP OFF
export function dropOffCarpooler(data, userDetails, historyRef) {
    axios.post('https://us-central1-perch-01.cloudfunctions.net/dropOffCarpooler', {
        data: data,
        userDetails: userDetails,
        historyRef: historyRef,
    }).catch(error => { console.log(error.message) })
}
//CANCEL SCHEDULED REQUEST FROM USER
export function scheduledCarpoolRequestCanceller(userID, driverID, driverName) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/scheduledCarpoolRequestCanceller`, {
        userID: userID,
        driverID: driverID,
        from: 'driver',
        driverName: driverName,
    }).catch(error => { console.log(error.message) })
};
//START SCHEDULED TRIP
export function startScheduledDriverTrip(driverID) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/startScheduledDriverTrip`, { driverID: driverID })
        .then(() => { this.props.navigation.navigate('TripStarted') })
        .catch(error => { console.log(error.message) })
};
//CHANGE PASSWORD
export function changePassword(oldPassword, newPassword) {
    this.setState({ loading: true }, () => {
        AsyncStorage.getItem('USER_DETAILS')
            .then(r => {
                const email = JSON.parse(r).email;
                const password = oldPassword;

                auth().signInWithEmailAndPassword(email, password)
                    .then(() => {
                        auth().currentUser.updatePassword(newPassword)
                            .then(() => {
                                Alert.alert('Password changed',
                                    'Your password has been changed successfully',
                                    [
                                        {
                                            text: 'Ok',
                                            onPress: () => { this.props.navigation.goBack() },
                                            style: 'cancel'
                                        },
                                    ],
                                    { cancelable: false })
                            })
                            .catch(error => this.setState({ errorMessage: error.message, loading: false }));
                    })
                    .catch(error => this.setState({ errorMessage: error.message, loading: false }));
            }).catch(error => { console.log(error.message) })
    })
};
//OPEN BROWSER 
export async function openBrowser(URL) {
    try {
        const url = URL;//'https://www.perchrides.com'
        await InAppBrowser.isAvailable()
        InAppBrowser.open(url, {
            // iOS Properties
            dismissButtonStyle: 'close',
            preferredBarTintColor: 'rgb(64, 64, 64)',
            preferredControlTintColor: 'white',
            modalPresentationStyle: 'fullScreen',
            // Android Properties
            showTitle: true,
            toolbarColor: 'rgb(64, 64, 64)',
            secondaryToolbarColor: WHITE,
            enableUrlBarHiding: true,
            enableDefaultShare: true,
            forceCloseOnRedirection: true,
        }).then((result) => {
            //Alert.alert(JSON.stringify(result))
        })
    } catch (error) {
        Alert.alert('Error opening browser',
            'Please open the browser manually and go to our website to delete your account')
    }
};
//SEND FEEDBACK
export function sendFeedback() {
    if (this.state.issue == 'choice')
        Alert.alert('Topic needed', 'Please pick a topic to contact us about. If you do not have one, please pick "Other"')
    else {
        this.setState({ loading: true }, () => {
            AsyncStorage.getItem('USER_DETAILS')
                .then(result => {
                    const userDetails = JSON.parse(result);

                    database().ref(`driverFeedback/${userDetails.driverID}`).update({
                        [new Date().getTime()]: {
                            body: this.state.form,
                            subject: this.state.issue,
                            status: 'UNPROCESSED',
                            date: getDate(),
                        }
                    }).then(() => {
                        this.setState({ messageSent: true, form: '', }, () => {
                            this.setState({ loading: false })
                        })
                    })
                        .catch(error => { console.log(error.message) })
                }).catch(error => { console.log(error.message) })
        })
    }
};
//SEND RATING
export function carpoolRatingHandler(data) {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/carpoolDriverRatingHandler`, data)
        .catch(error => console.log(error.message))
};
//TO CALL A RIDER
export const callNumber = phone => {
    console.log('callNumber ----> ', phone);
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
        phoneNumber = `telprompt:${phone}`;
    }
    else {
        phoneNumber = `tel:${phone}`;
    }
    Linking.canOpenURL(phoneNumber)
        .then(supported => {
            if (!supported) {
                Alert.alert('Phone number is not available');
            } else {
                return Linking.openURL(phoneNumber);
            }
        })
        .catch(err => console.log(err));
};

export function x(data) {
    return (data / 375) * width;
};
export function y(data) {
    // if (height < 800)
    //     return ((data / 812) * height) + 3;
    // else
    return ((data / 812) * height) + 3;
};
//COLORS USED IN THE APP
export const colors = {
    WHITE: '#FFFFFF',
    RED: '#FF0000',
    BLUE: '#132F79',
    BLACK: '#000000',
    BLUE_OPAQUE: (opacity) => { return `rgba(19, 47, 121, ${opacity})` },
    BLUE_FONT: '#222B45',
    GREY_BACKGROUND: '#CCCED3',
    GREY_OPAQUE: (opacity) => { return `rgba(204, 206, 211, ${opacity})` },
    GREY_TAB: '#ADACAC',
    GOLD: '#FFAA00',
    GREEN: '#4DB748',
    BLUE_LIGHT: '#4977EF',
    BLUE_DARK: '#021034',
};
//DIMENSION ASSERT
export function dimensionAssert() {
    return (height < 800);
};
export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function getDate() {
    const DAY = new Date().getDate();
    const MONTH = new Date().getMonth();
    const YEAR = new Date().getFullYear();
    const HOUR = new Date().getHours();
    const MIN = new Date().getMinutes();
    const SECOND = new Date().getSeconds();

    return (`${YEAR}-${MONTH}-${DAY}-${HOUR}-${MIN}-${SECOND}`);
};
export function dateformat(time) {
    let slash1 = 0, slash2 = 0, slash3 = 0;
    for (let k = 0; k < time.length; k++) {
        if (time.charAt(k) == '-')
            slash1 == 0 ? slash1 = k : slash2 == 0 ? slash2 = k : slash3 = k;

        if (slash3 != 0)
            break;
    };

    const y = time.substring(0, slash1);
    const m = time.substring(slash1 + 1, slash2);
    const d = time.substring(slash2 + 1, slash3);

    return `${d}/${m}/${y}`;
}
export const CustomLayoutLinear = {
    duration: 200,
    create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.linear,
    },
    delete: {
        duration: 50,
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
};
export function distanceCalculator(lat1, lon1, lat2, lon2) {
    let R = 6371 * 1000; // Radius of the earth in m
    let dLat = deg2rad(lat2 - lat1);  // deg2rad below
    let dLon = deg2rad(lon2 - lon1);
    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in m
    return d;
};
export function middlePoint(lat1, lon1, lat2, lon2) {
    const lat = (lat1 + lat2) / 2;
    const long = (lon1 + lon2) / 2;

    return ({ x: lat, y: long });
};
export function pointIsInsidePolygon(point, vs) {
    //Usage
    //let polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
    //pointIsInsidePolygon([ 1.5, 1.5 ], polygon);

    let x = point[0], y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];

        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
export function polylineLenght(data) {
    let distance = 0;
    for (let k = 0; k < data.length - 1; k++)
        distance += distanceCalculator(data[k][0], data[k][1], data[k + 1][0], data[k + 1][1])

    return (distance)
};
export function indexFinder(searchMe, value) {
    for (let j = 0; j < searchMe.length; j++)
        if (searchMe[j][0] === value[0] && searchMe[j][1] === value[1])
            return j;

    return -1;
};
function deg2rad(deg) {
    return deg * (Math.PI / 180)
};
