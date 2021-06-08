import React from 'react';
import styles from './styles';
import axios from 'axios';
import turf from '@turf/turf';
import { permissionLocation, getFirebaseMessagingToken, debouncer, getLocation, searchHistoryList, reverseGeocoding, OfflineNotice, makeid, x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
import SplashScreen from 'react-native-splash-screen';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import { Animated, View, Text, Dimensions, Easing, TouchableWithoutFeedback, TouchableOpacity, Keyboard, TextInput, PanResponder, LogBox, Platform, StatusBar, LayoutAnimation, UIManager, BackHandler } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
const polyline = require('@mapbox/polyline');// for decoding polylines
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { Menu, CarpoolIcon, RideshareIcon, Pin } from '../../Images/svgimages/vectors';
import Divider from '../../Components/Divider/Divider';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline, Polygon } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/FontAwesome';
import Drawer from '../../Navigation/DrawerComponent/DrawerComponent';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import { color } from 'react-native-reanimated';

const X_OUT = 0;
const X_IN = -x(325);
const Y_CONSTANT = 0;
const X_CONSTANT = 0;
const Y_TOP = y(229);
const Y_BOTTOM = y(706);
const Y_START = height;

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default class Main extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            currentLocation: '',
            location: '',
            destination: '',
            history: null,
            locationFocused: false,
            destinationFocused: false,
            suggestion: 'invisible',
            searchPosition: 'hidden',
            searchBar: 'hide',
            currentLocationLatitude: '',
            currentLocationLongitude: '',
            latitude: '',
            longitude: '',
            latitude1: '',
            longitude1: '',
            carpool: true,
            rideshare: false,
            predictions: [],
            predictionsLoaded: null,
            region: {
                latitude: 0,
                longitude: 0,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            regionMovedData: '',
            mapLoaded: false,
            mapMoved: false,
            loading: false,
            workAddress: null,
            homeAddress: null,

            rerender: '',
            status: 'LOADING...',

        };

        this.mapReady = false;
        this.forwardDirection = true;
        this.handleOnNavigateBack = this.handleOnNavigateBack.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.animateMenu = this.animateMenu.bind(this);
        this.animatedValue = new Animated.Value(height);
        this.animatedValueTop_ = new Animated.Value(height);
        this.down_zindex = new Animated.Value(1);
        this.animateFullScreen = this.animateFullScreen.bind(this);

        this.animatedValueTop_.addListener(({ value }) => {
            if (value <= (y(-7.5)) && this.forwardDirection === true) {
                this.setState({ suggestion: 'springUp', searchBar: 'show' });
                this.forwardDirection = false;
                if (this.state.destination == '') {
                    this.destinationInput.focus();
                }

            }

        });


        this.position = new Animated.ValueXY({ x: X_IN, y: Y_CONSTANT });
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 4 || Math.abs(gestureState.dy) >= 4;
            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.setOffset({ x: this.position.x._value, y: Y_CONSTANT });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dx < 1)
                    this.position.setValue({ x: gestureState.dx, y: Y_CONSTANT });
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                if (Math.sign(gestureState.dx) == 1) {//going out
                    Animated.spring(this.position, {
                        toValue: { x: X_OUT, y: Y_CONSTANT },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        useNativeDriver: false,
                    }).start();
                }
                else if (Math.sign(gestureState.dx) == -1) {//going in
                    Animated.spring(this.position, {
                        toValue: { x: X_IN, y: Y_CONSTANT },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        useNativeDriver: false,
                    }).start();
                }
            },
        });


    }
    componentDidMount() {
        getFirebaseMessagingToken();
        if (this.props.route.params) {
            if (this.props.route.params.userDetails) {
                const userDetails = this.props.route.params.userDetails;
                this.setState({
                    workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                    homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                });
                database().ref(`users/${userDetails.userID}/`).on('value', snapshot => { //ALL DATABASE CALLS ARE TO ALWAYS DOWNLOAD USER IN CASE WEB EDITS IT
                    AsyncStorage.setItem('USER_DETAILS', JSON.stringify(snapshot.val()))
                        .then(() => { this.setState({ userDetails: snapshot.val() }) })
                        .catch((e) => { console.log(e.message) })
                });
            }
        }
        else
            AsyncStorage.getItem('USER_DETAILS')
                .then(result => {
                    if (result) {
                        const userDetails = JSON.parse(result);
                        database().ref(`carpoolRequests/${userDetails.driverID}`).on('value', data => {
                            if (data.val()) {
                                if (data.val().requestStatus == 'active')
                                    this.setState({ status: 'ONLINE-ACTIVE' });
                                else if (data.val().requestStatus == 'inactive')
                                    this.setState({ status: 'ONLINE-INACTIVE' });
                                else
                                    database().ref(`carpoolRequests/${userDetails.driverID}`).remove()
                            }
                            else
                                this.setState({ status: 'OFFLINE' });
                        });
                        this.setState({
                            workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                            homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                        });

                        database().ref(`users/${userDetails.userID}/`).on('value', snapshot => {
                            AsyncStorage.setItem('USER_DETAILS', JSON.stringify(snapshot.val()))
                                .then(() => { this.setState({ userDetails: snapshot.val() }) })
                                .catch((e) => { console.log(e.message) })
                        });
                    }
                    else {
                        this.watchID_ = setInterval(() => {
                            AsyncStorage.getItem('USER_DETAILS')
                                .then((result_) => {
                                    clearInterval(this.watchID_);
                                    const userDetails_ = JSON.parse(result_);
                                    this.setState({
                                        workAddress: userDetails_.workAddress ? userDetails_.workAddress : 'NORESULTS',
                                        homeAddress: userDetails_.homeAddress ? userDetails_.homeAddress : 'NORESULTS',
                                    });

                                    database().ref(`users/${userDetails_.userID}/`).on('value', snapshot => {
                                        AsyncStorage.setItem('USER_DETAILS', JSON.stringify(snapshot.val()))
                                            .then(() => { this.setState({ userDetails: snapshot.val() }) })
                                            .catch((e) => { console.log(e.message) })
                                    });
                                }).catch(error => { console.log(error.message) })
                        }, 300)
                    }
                }).catch(error => { console.log(error.message) })
        SplashScreen.hide();
        //isUserLoggedIn.call(this);
        permissionLocation()
            .catch(error => { console.log(error.message) });
        searchHistoryList.then((results) => { this.setState({ history: results }) });

        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    currentLocation: `&location=${[position.coords.latitude, position.coords.longitude]}&radius=10000`,
                    region: {
                        latitude: position.coords.latitude - 0.001,
                        longitude: position.coords.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    },
                    mapLoaded: true,
                    currentLocationLatitude: position.coords.latitude,
                    currentLocationLongitude: position.coords.longitude,
                });
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

        this.watchID = Geolocation.watchPosition(
            position => {//THIS HAPPENS AS THE USER MOVES OR CHANGES LOCATION
                this.setState({
                    currentLocation: `&location=${[position.coords.latitude, position.coords.longitude]}&radius=30000`,
                    currentLocationLatitude: position.coords.latitude,
                    currentLocationLongitude: position.coords.longitude,
                });
            },
            error => (console.log(error.message)),
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        )

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        Animated.spring(this.animatedValue, {
            //toValue: y(538),
            toValue: y(510),
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        Animated.spring(this.animatedValueTop_, {
            toValue: y(510),
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();

    };
    forceUpdate(value) {
        const userDetails = value;
        this.setState({
            workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
            homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
        });
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Geolocation.clearWatch(this.watchID);
        //Geolocation.stopObserving();
    };

    home_workLocation(place) {
        switch (place) {
            case 'home': {
                if (this.state.homeAddress) {
                    if (this.state.homeAddress == 'NORESULTS')
                        this.props.navigation.navigate('SavedPlaces', {
                            onReturn: () => {
                                this.onReturnFromSavedPlaces.call(this);
                            }
                        });
                    else { //YOU HAVE FULL ADDRESS, USE IT
                        this.animateFullScreen();
                        getLocation.call(this, this.state.homeAddress.mainText, this.state.homeAddress.description, this.state.homeAddress.place_id, 'destination', 'Main');
                    };
                }
            } break;
            case 'work': {
                if (this.state.workAddress) {
                    if (this.state.workAddress == 'NORESULTS')
                        this.props.navigation.navigate('SavedPlaces', {
                            onReturn: () => {
                                this.onReturnFromSavedPlaces.call(this);
                            }
                        });
                    else {
                        this.animateFullScreen();
                        getLocation.call(this, this.state.workAddress.mainText, this.state.workAddress.description, this.state.workAddress.place_id, 'destination', 'Main');
                    };
                }
            } break;
        };
    };

    handleBackButtonClick() {
        BackHandler.exitApp();
    };

    onReturn(data) {
        if (data == 'L')
            this.setState({ locationFocused: true });
        else
            this.destinationInput.focus();

    };
    onReturnFromSavedPlaces() {
        if (this.props.route.params) {
            if (this.props.route.params.userDetails) {
                const userDetails = this.props.route.params.userDetails;
                this.setState({
                    workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                    homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                });
            }
        }
        else
            AsyncStorage.getItem('USER_DETAILS')
                .then(result => {
                    if (result) {
                        const userDetails = JSON.parse(result);
                        this.setState({
                            workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                            homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                            rerender: makeid(7),
                        });
                    }
                    else {
                        this.watchID = setInterval(() => {
                            AsyncStorage.getItem('USER_DETAILS')
                                .then((result_) => {
                                    clearInterval(this.watchID);
                                    const userDetails_ = JSON.parse(result_);
                                    this.setState({
                                        workAddress: userDetails_.workAddress ? userDetails_.workAddress : 'NORESULTS',
                                        homeAddress: userDetails_.homeAddress ? userDetails_.homeAddress : 'NORESULTS',
                                        rerender: makeid(7),
                                    });
                                }).catch(error => { console.log(error.message) })
                        }, 300)
                    }
                }).catch(error => { console.log(error.message) })
    };
    suggestionSetter(value) {
        if (this.state.suggestion != value) {
            this.setState({ suggestion: value });
        }
    };
    mapmovedSetter() {
        if (this.state.mapMoved)
            this.setState({ mapMoved: false })
    };

    handleOnNavigateBack() {
        this.animatedValueTop_.stopAnimation();
        //MAKE THIS FUNCTION SET THE REVERSE OF THE ANIMATIONS
        this.setState({ suggestion: 'invisible', searchPosition: 'hidden', searchBar: 'hide', locationFocused: false, destinationFocused: false });
        Keyboard.dismiss();

        Animated.spring(this.animatedValueTop_, {
            toValue: y(510),
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
    };

    animateFullScreen() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        this.hideMenu();
        this.forwardDirection = true;

        Animated.spring(this.animatedValueTop_, {
            toValue: -y(15),
            bounciness: 0,
            velocity: 30,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start(() => {
            this.setState({ searchPosition: 'shown' });
        });

        Animated.spring(this.down_zindex, {
            toValue: -1,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };

    animateMenu() {
        LayoutAnimation.configureNext(CustomLayoutLinear)
        Animated.spring(this.position, {
            toValue: { x: X_OUT, y: Y_CONSTANT },
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    hideMenu() {
        LayoutAnimation.configureNext(CustomLayoutLinear)
        Animated.spring(this.position, {
            toValue: { x: X_IN, y: Y_CONSTANT },
            useNativeDriver: false,
        }).start();
    };

    render() {
        const animatedValueWidth_ = this.animatedValueTop_.interpolate({
            inputRange: [0, y(538)],
            outputRange: [width + x(20), x(343)],
            extrapolate: 'clamp',
        });
        const animatedValueHeight_ = this.animatedValueTop_.interpolate({
            inputRange: [-y(15), y(538)],
            outputRange: [y(156) + y(15), y(61)],
            extrapolate: 'clamp',
        });
        const animatedValueOpacity = this.animatedValueTop_.interpolate({
            inputRange: [0, y(538)],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });
        const animatedZindexDown = this.animatedValueTop_.interpolate({
            inputRange: [0, y(538)],
            outputRange: [-1, 1],
            extrapolate: 'clamp',
        });
        const predictionResults = this.state.predictions.map((data) => {
            let input;
            if (this.state.locationFocused)
                input = 'location';
            else if (this.state.destinationFocused)
                input = 'destination';

            return (
                <LocationItem description={data.description} mainText={data.mainText}
                    key={data.place_id}
                    Press={() => {
                        getLocation.call(this,
                            data.mainText, data.description, data.place_id, input, 'Main');
                    }} />)
        });
        const zoomTop = this.state.searchPosition === 'shown' ?
            y(dimensionAssert() ? 545 : 570) :
            y(dimensionAssert() ? 425 : 440);
        let historyResults = this.state.history ? this.state.history.map((data) => {
            let input;
            if (this.state.locationFocused)
                input = 'location';
            else if (this.state.destinationFocused)
                input = 'destination';

            return (
                <LocationItem description={data.description} mainText={data.mainText}
                    key={data.place_id}
                    Press={() => {
                        getLocation.call(this,
                            data.mainText, data.description, data.place_id, input, 'Main');
                    }} />)
        }) : <></>;

        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    {this.state.loading ? <LoadingScreen zIndex={5} /> : <></>}
                    <StatusBar barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} backgroundColor={'#000000'} />

                    {this.state.searchPosition === 'shown' ?
                        <View style={styles.point}>
                            <Pin />
                        </View>
                        : <></>
                    }


                    <LowerSection
                        visibility={this.state.suggestion}
                        predictionResults={
                            (this.state.predictionsLoaded || (this.state.location != '' && this.state.destination != '')) ? predictionResults : historyResults
                        }
                        suggestionSetter={this.suggestionSetter.bind(this)}
                        mapmovedSetter={this.mapmovedSetter.bind(this)}
                    />


                    <TouchableOpacity style={[styles.zoomIcon, { top: zoomTop, right: x(10) }]}
                        onPress={() => {
                            if (this.mapReady) {
                                Geolocation.getCurrentPosition(
                                    (position) => {
                                        this.map.animateToRegion({
                                            latitude: position.coords.latitude - 0.001,
                                            longitude: position.coords.longitude,
                                            latitudeDelta: LATITUDE_DELTA,
                                            longitudeDelta: LONGITUDE_DELTA,
                                        });
                                    },
                                    (error) => {
                                        console.log(error.code, error.message);
                                        Geolocation.requestAuthorization();
                                    },
                                    {
                                        enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                                    },
                                ).catch((error) => {
                                    console.log(error.code, error.message);
                                    Geolocation.requestAuthorization();
                                });
                            }
                        }}
                    >
                        <Icon_ name={'location-arrow'} size={y(21)} color={colors.BLUE} />
                    </TouchableOpacity>


                    {this.state.searchBar === 'show' ?
                        <Animated.View style={[styles.searchBar, { zIndex: 3, elevation: 3 }]}>
                            <StatusBar barStyle={'light-content'} backgroundColor={colors.BLUE} />
                            <TouchableOpacity
                                style={styles.cancelIcon}
                                onPress={this.handleOnNavigateBack}
                            ><Icon name={'x'} size={y(25)} color={'#FFFFFF'} /></TouchableOpacity>
                            <View style={styles.canceldivider}><Divider width={x(0.5)} height={y(dimensionAssert() ? 85 : 72)} borderRadius={0} borderColor={'#FFFFFF'} borderWidth={1} /></View>
                            <Icon name={'map-pin'} size={y(25)} color={'#FFFFFF'} style={styles.icon1} />
                            <Icon name={'map-pin'} size={y(25)} color={'#FFFFFF'} style={styles.icon2} />
                            <View style={styles.textDivider}><Divider width={x(244)} height={(1)} borderRadius={0} borderColor={'#FFFFFF'} borderWidth={1} /></View>
                            {this.state.location === '' && this.state.locationFocused === false ?

                                <TouchableOpacity
                                    //disabled={true}
                                    onPress={() => {
                                        this.setState({ locationFocused: true });
                                    }}
                                    style={styles.currentLocation}
                                >
                                    <Text style={styles.currentLocationText}>Current Location</Text>
                                </TouchableOpacity>
                                :
                                <TextInput
                                    autoFocus={true}
                                    onFocus={() => { this.setState({ locationFocused: true, destinationFocused: false, suggestion: 'springUp' }) }}
                                    onChangeText={(value) => {
                                        this.setState({ location: value });
                                        debouncer.call(this, value, 'Main');
                                    }}
                                    //onEndEditing={()=>{}}
                                    style={styles.locationInput}
                                    value={this.state.location}
                                //placeholderTextColor={'#D3D3D3'}
                                />}
                            <TextInput
                                //onFocus={this.springUp}
                                placeholder={'Enter a destination'}
                                onFocus={() => { this.setState({ destinationFocused: true, locationFocused: false, suggestion: 'springUp' }) }}
                                ref={(input) => { this.destinationInput = input; }}
                                style={styles.destinationInput}
                                onChangeText={(value) => {
                                    this.setState({ destination: value });
                                    debouncer.call(this, value, 'Main');
                                }}
                                placeholderTextColor={'#D3D3D3'}
                                autoFocus={false}
                                value={this.state.destination}
                            />
                        </Animated.View> :
                        <></>
                    }

                    <TouchableOpacity
                        style={styles.menuTO}
                        onPress={this.animateMenu}>
                        <View style={styles.menu}>
                            <View style={styles.menu_}><Menu height={'100%'} width={'100%'} /></View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={this.state.status == 'LOADING...'}
                        style={styles.status} onPress={() => {
                            if (this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'ONLINE-ACTIVE') {
                                Keyboard.dismiss();
                                this.props.navigation.navigate('TripStarted');
                            }
                        }}>
                        <Text style={styles.statusText}>{this.state.status}</Text>
                    </TouchableOpacity>
                    {this.state.mapLoaded
                        ?
                        <MapView
                            initialRegion={this.state.region}
                            ref={(ref) => this.map = ref}
                            provider={PROVIDER_GOOGLE}
                            style={[styles.maps,]}
                            customMapStyle={MapStyle}
                            onMapReady={() => {
                                this.mapReady = true;
                            }}
                            onRegionChangeComplete={(region) => {
                                if (this.state.locationFocused)
                                    reverseGeocoding.call(this, region, 'location', 'MAIN');
                                else if (this.state.destinationFocused)
                                    reverseGeocoding.call(this, region, 'destination', 'MAIN');

                                if (this.state.locationFocused || this.state.destinationFocused)
                                    this.setState({ mapMoved: true, suggestion: 'springDown' });
                            }}
                            showsUserLocation={true}
                            showsCompass={false}
                            scrollEnabled={true}
                            showsMyLocationButton={false}
                        >
                        </MapView>
                        :
                        <></>
                    }



                    <Animated.View style={[styles.menuView, [Platform.OS === "ios" ? { elevation: 3, zIndex: 3 } : {}], this.position.getLayout()]} {...this.panResponder.panHandlers}>
                        <Drawer
                            navigation={this.props.navigation}
                            hideMenu={this.hideMenu}
                            userDetails={this.state.userDetails}
                            choice={this.state.rideshare ? 'rideshare' : `carpool`}
                            forceUpdate={(value) => { this.forceUpdate.call(this, value) }}
                            rerender={this.state.rerender}
                            onReturnFromSavedPlaces={() => { this.onReturnFromSavedPlaces.call(this); }} />
                    </Animated.View>


                    <Animated.View style={[styles.searchInverse, { width: animatedValueWidth_, height: animatedValueHeight_, top: this.animatedValueTop_, },]}>
                        <TouchableOpacity
                            onPress={() => {
                                if (this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'ONLINE-ACTIVE') {
                                    Keyboard.dismiss();
                                    this.props.navigation.navigate('TripStarted');
                                }
                                else
                                    this.animateFullScreen();
                            }}
                            style={styles.searchInverse_TO}>
                            <Animated.Text style={[styles.mainText, { opacity: animatedValueOpacity }]}>{this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'ONLINE-ACTIVE' ? 'Continue current trip?' : `Hello, where you headed?`}</Animated.Text>
                        </TouchableOpacity>
                    </Animated.View>



                    <Animated.View style={[styles.lowerSection, { top: this.animatedValue, opacity: animatedValueOpacity, [Platform.OS === 'android' ? 'elevation' : 'zIndex']: animatedZindexDown }]}>

                        <View style={[styles.voidSpace]}></View>

                        <View style={styles.history}>

                            <View style={styles.historyList}>
                                <View><Icon name={'home'} size={y(25)} color={'#000000'} style={styles.icon} /></View>
                                <View>
                                    <TouchableOpacity onPress={() => { this.home_workLocation.call(this, 'home') }} disabled={this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'LOADING...'}>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.homeAddress ? true : false} style={{ width: x(120), height: y(15) }}>
                                            <Text numberOfLines={1} style={styles.addressMain}>{this.state.homeAddress && this.state.homeAddress !== 'NORESULTS' ? this.state.homeAddress.mainText : `Add Home Address`}</Text>
                                        </ShimmerPlaceHolder>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.homeAddress ? true : false} style={{ marginTop: x(3), width: x(250), height: y(12) }}>
                                            <Text numberOfLines={2} style={styles.address2nd}>{this.state.homeAddress && this.state.homeAddress !== 'NORESULTS' ? this.state.homeAddress.description : `Home Address`}</Text>
                                        </ShimmerPlaceHolder>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.historyList}>
                                <View><Icon name={'briefcase'} size={y(25)} color={'#000000'} style={styles.icon} /></View>
                                <View>
                                    <TouchableOpacity onPress={() => { this.home_workLocation.call(this, 'work') }} disabled={this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'ONLINE-ACTIVE' || this.state.status == 'LOADING...'}>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.workAddress ? true : false} style={{ width: x(120), height: y(15) }}>
                                            <Text numberOfLines={1} style={styles.addressMain}>{this.state.workAddress && this.state.workAddress !== 'NORESULTS' ? this.state.workAddress.mainText : `Add Work Address`}</Text>
                                        </ShimmerPlaceHolder>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.workAddress ? true : false} style={{ marginTop: x(3), width: x(250), height: y(12) }}>
                                            <Text numberOfLines={2} style={styles.address2nd}>{this.state.workAddress && this.state.workAddress !== 'NORESULTS' ? this.state.workAddress.description : `Work Address`}</Text>
                                        </ShimmerPlaceHolder>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>

                        <View style={styles.choiceSplit}>

                        </View>
                    </Animated.View>


                    {this.state.suggestion !== 'invinsible' ?
                        <View style={styles.done}>
                            <TouchableOpacity
                                disabled={!this.state.mapMoved}
                                style={[styles.doneView, { backgroundColor: this.state.mapMoved ? colors.BLUE : colors.BLUE_OPAQUE(0.5) }]}
                                onPress={() => {
                                    this.setState({ suggestion: 'springUp', mapMoved: false });
                                    getLocation.call(this,
                                        this.state.regionMovedData.mainText, this.state.regionMovedData.description, this.state.regionMovedData.place_id, this.state.regionMovedData.input, 'Main');
                                }}
                            >
                                <Text style={styles.doneText}>Confirm Position</Text>
                            </TouchableOpacity>
                        </View> :
                        <></>
                    }
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

class LowerSection extends React.Component {
    constructor() {
        super();
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };
        this.state = {
        }

        this.springUp = this.springUp.bind(this);
        this.springDown = this.springDown.bind(this);
        this.value;
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 12 || Math.abs(gestureState.dy) >= 12;
            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.setOffset({ x: X_CONSTANT, y: this.position.y._value });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
                this.value = Number(JSON.stringify(this.position.y));
            },
            onPanResponderMove: (evt, gestureState) => {
                Keyboard.dismiss();
                const Y_POSITION = (this.value + gestureState.dy);

                if (Y_POSITION >= y(175))
                    this.position.setValue({ x: X_CONSTANT, y: gestureState.dy });


            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();


                if (Math.sign(gestureState.vy) == 1) {//going down

                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_BOTTOM },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        easing: Easing.bounce,
                        useNativeDriver: false,
                    }).start();


                }
                else if (Math.sign(gestureState.vy) == -1) {//going up

                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_TOP },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        easing: Easing.bounce,
                        useNativeDriver: false,
                    }).start();

                }
            },
        })
    }




    springUp() {
        //LayoutAnimation.configureNext(CustomLayoutLinear);
        Animated.spring(this.position, {
            toValue: { x: X_CONSTANT, y: Y_TOP },
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        this.props.suggestionSetter('springUp');
    }

    springDown() {
        //LayoutAnimation.configureNext(CustomLayoutLinear);
        Animated.spring(this.position, {
            toValue: { x: X_CONSTANT, y: Y_BOTTOM },
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        this.props.suggestionSetter('springDown');
    }

    invisible() {
        Animated.spring(this.position, {
            toValue: { x: X_CONSTANT, y: Y_START },
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        this.props.suggestionSetter('invinsible');
        this.props.mapmovedSetter();
    }



    render() {

        if (this.props.visibility === 'springUp')
            this.springUp();
        else if (this.props.visibility === 'springDown')
            this.springDown();
        else if (this.props.visibility === 'invisible')
            this.invisible();


        //LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <Animated.View style={[styles.suggestions, this.position.getLayout()]} {...this.panResponder.panHandlers}>
                <View style={styles.suggestionHeader}><Text style={styles.suggestionHeaderText}>SEARCH RESULTS</Text></View>
                {this.props.predictionResults}
            </Animated.View>

        );
    }
};

class LocationItem extends React.Component {
    constructor() {
        super();
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };
    }
    render() {
        return (
            <View>
                <View style={styles.resultView}>
                    <Icon name={'map-pin'} size={y(25)} color={colors.BLUE} style={styles.resultIcon} />
                    <TouchableOpacity
                        onPress={this.props.Press}
                    >
                        <View>
                            <Text style={styles.mainAddress}>{this.props.mainText}</Text>
                            <Text style={styles.secondaryAddress}>{this.props.description}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.resultDivider}><Divider width={x(343)} height={(1)} borderRadius={1} borderColor={'#78849E'} borderWidth={1} /></View>
            </View>
        );
    }
};


LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Cannot update during an existing state transition'
]);

const CustomLayoutLinear = {
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

const CustomLayoutLinear_ = {
    duration: 200,
    create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
};


