import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Switch, TouchableOpacity, Button as Button_, Keyboard, Platform, Alert, UIManager, AppState, BackHandler, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Divider from '../../Components/Divider/Divider';
import * as turf from '@turf/turf';//for encoding polylines
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const polyline = require('@mapbox/polyline');// for decoding polylines
import { permissionLocation, createScheduledCarpoolRequest, createCarpoolRequest, OfflineNotice, x, y, colors, height, width, dimensionAssert, openBrowser } from '../../Functions/Functions';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline, Polygon } from 'react-native-maps';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import AnimatedPolyline from '../../Components/AnimatedPolyline/AnimatedPolyline';
import { ChangeVehicle } from '../../Components/VehicleComponents/VehicleComponents';
import Button from '../../Components/Button/Button';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { DestinationPin } from '../../Images/svgimages/vectors';
import { Picker } from '@react-native-community/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
const Y_START = -x(12);
const X_CONSTANT = 0;
const _1DAY_MILLI_SECS = 86400000;//ms
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class TripBreakdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            location: this.props.route.params.location,
            destination: this.props.route.params.destination,
            polyline: this.props.route.params.polyline,
            legs: this.props.route.params.legs,
            userDetails: null,
            vehicle: false,
            showPassenger: false,
            seatNumber: null,
            loading: false,

            getTime: false,
            now: true,

            date: new Date(),
            tomorrow: true,
            alreadyScheduled: false,
        };

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
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 5 || Math.abs(gestureState.dy) >= 5;
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
        })
    };
    componentDidMount() {

        AsyncStorage.getItem('USER_DETAILS')
            .then((result) => {
                const userDetails = JSON.parse(result);
                this.setState({ userDetails: userDetails });

                database().ref(`scheduledCarpoolRequests/${userDetails.driverID}`).once('value', snapshot => {
                    this.setState({ alreadyScheduled: snapshot.val() ? true : false });
                }).catch(error => { console.log(error.message) })

                database().ref(`vehicles/${userDetails.userID}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        if (Object.keys(snapshot.val()).length == 1) {//only one vehicle
                            const key = Object.keys(snapshot.val())[0];
                            this.setState({ vehicle: snapshot.val()[key], seatNumber: snapshot.val()[key].maxSeatNumber });
                        }
                        else {//several vehicles,pick the selected one or provide the first one
                            const keys = Object.keys(snapshot.val());
                            if (snapshot.val().selected) {
                                const selected = snapshot.val().selected;
                                this.setState({ vehicle: snapshot.val()[selected], seatNumber: snapshot.val()[selected].maxSeatNumber });
                            }
                            else //no results, send first one
                            {
                                for (let i = 0; i < keys.length; i++)
                                    if (snapshot.val()[keys[i]].verifyStatus != 'PENDING') {
                                        this.setState({ vehicle: snapshot.val()[keys[i]], seatNumber: snapshot.val()[keys[i]].maxSeatNumber });
                                        break;
                                    }
                            }
                        }
                    }
                })


            })
            .catch(error => { console.log(error.message) })
    };

    passengers = (sign) => {
        switch (sign) {
            case 'plus': {
                if (this.state.seatNumber < this.state.vehicle.maxSeatNumber)
                    this.setState({ seatNumber: this.state.seatNumber + 1 });
            } break;
            case 'minus': {
                if (this.state.seatNumber > 1)
                    this.setState({ seatNumber: this.state.seatNumber - 1 });
            } break;
        }
    };

    render() {
        let distance = this.state.legs.distance.value;//IN METRES
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;
        const s = { fontFamily: 'Gilroy-Bold', color: colors.BLUE };

        return (
            <View style={styles.container}>
                <StatusBar backgroundColor={colors.BLACK} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.status}>
                    <Text style={styles.statusText}>{`OFFLINE`}</Text>
                </View>

                <TouchableOpacity style={[styles.menu,]} onPress={() => {
                    this.props.route.params.onReturn('D');
                    this.props.navigation.goBack();
                }}>
                    <View>
                        <Ionicons name={'chevron-back'} color={colors.WHITE} size={x(28)} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: y(dimensionAssert() ? 300 : 310) }]}
                    onPress={() => {
                        const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude]]);
                        let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));

                        if (this.mapReady) {
                            this.map.fitToCoordinates(bboxPolygon, {
                                edgePadding:
                                {
                                    top: y(100),
                                    right: x(80),
                                    bottom: y(50),
                                    left: x(25)
                                },
                            })
                        }
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
                        const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude]]);
                        let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));

                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: y(100),
                                right: x(80),
                                bottom: y(50),
                                left: x(25),
                            },
                        });
                    }}
                >
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
                </MapView>
                <Animated.View style={[styles.lowerSection, this.position.getLayout()]} {...this.panResponder.panHandlers}
                    onLayout={(event) => {
                        this.TAB_HEIGHT = -event.nativeEvent.layout.height + (height / 2.13);
                    }}>
                    <View style={styles.tab}></View>
                    <View style={styles.bubble}>
                        <Text numberOfLines={1} style={styles.bubbleText}>{distance}</Text>
                    </View>
                    <Text style={[styles.title, { marginTop: y(28) }]}>Trip breakdown</Text>
                    <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <View style={[styles.spaceView, { marginTop: y(14.5) }]}>
                        <Text style={[styles.text]}>Start</Text>
                        <Text numberOfLines={4} style={[styles.textAddress]}>{this.state.location.description}</Text>
                    </View>
                    <View style={[styles.spaceView, { marginTop: y(8) }]}>
                        <Text style={[styles.text]}>End</Text>
                        <Text numberOfLines={4} style={[styles.textAddress]}>{this.state.destination.description}</Text>
                    </View>
                    <View style={[styles.spaceView, { marginTop: y(8) }]}>
                        <Text style={[styles.text]}>Trip Distance</Text>
                        <Text style={[styles.textAddress]}>{distance.toLowerCase()}</Text>
                    </View>
                    <Text style={[styles.title, { marginTop: y(20) }]}>Timing</Text>
                    <View style={[styles.divider, { marginTop: y(9) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <View style={[styles.spaceView, { marginTop: y(8), alignItems: 'center' }]}>
                        <Text style={[styles.text]}>Start trip</Text>
                        <View style={{ flexDirection: 'row', right: x(14), alignItems: 'center' }}
                        //onPress={() => { this.setState({ getTime: true }) }}
                        >
                            <Text style={[
                                styles.textAddress,
                                { right: x(5) },
                                this.state.now ? s : { color: colors.GREY_BACKGROUND },
                            ]}>{'Right now'}</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.BLUE_OPAQUE(0.8) }}
                                thumbColor={!this.state.now ? "#FFFFFF" : colors.BLUE}
                                onValueChange={(value) => {
                                    if (this.state.alreadyScheduled)
                                        Alert.alert(
                                            'Cannot schedule two rides at a time',
                                            'You already have a ride scheduled for some time in the future. Scheduled rides can be found on the menu tab from the home screen. Please complete or cancel that ride in order to schedule another one.',
                                            [{ text: 'Ok', style: 'cancel' }]
                                        )
                                    else {
                                        this.setState({ now: value })
                                        if (value == false)
                                            this.setState({ getTime: true })
                                        else
                                            this.setState({ getTime: false, })
                                    }
                                }}
                                value={this.state.now}
                            />
                        </View>
                    </View>
                    {
                        this.state.now ?
                            <></> :
                            <>
                                <View style={[styles.spaceView, { marginTop: y(8) }]}>
                                    <Text style={[styles.text]}>Pick time</Text>
                                    <TouchableOpacity onPress={() => { this.setState({ getTime: true }) }}>
                                        <Text style={[styles.textAddress, this.state.now ? {} : s]}>{`${moment(this.state.date).format('hh:mm a')} ${this.state.tomorrow ? 'tomorrow' : 'today'}`}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.semiBold, { fontSize: y(10) }]}>{`You can schedule trips from 15 minutes to 24 hours in advance. Any time prior to 15 minutes in advance would be treated as the next day`}</Text>
                            </>
                    }


                    <Text style={[styles.title, { marginTop: y(20) }]}>Trip options</Text>
                    <View style={[styles.divider, { marginTop: y(9) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <Text style={[styles.semiBold, { color: colors.BLUE_FONT, fontSize: y(16), width: x(313), marginTop: y(17.5) }]}>Vehicle</Text>
                    <View style={{ marginTop: y(8) }}>
                        <ChangeVehicle vehicle={this.state.vehicle}
                            changeVehicle={(value) => {
                                this.setState({ vehicle: value, seatNumber: value.maxSeatNumber });
                            }}
                            navigation={this.props.navigation} />
                    </View>
                    <Text style={[styles.semiBold, { color: colors.BLUE_FONT, fontSize: y(16), width: x(313), marginTop: y(23) }]}>Passengers</Text>

                    <View style={[styles.spaceViewLower, { marginTop: y(8) }]}>
                        <View>
                            <Text style={[styles.text, { width: x(255) }]}>Max number of passengers in vehicle at a time</Text>
                            <TouchableOpacity onPress={() => {
                                openBrowser(`https://perchrides.com/s/articles/starting_a_driver_trip`);
                            }}>
                                <Text style={[styles.needHelp, { marginTop: y(5) }]}>Need help?</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.borderTO} onPress={() => { this.setState({ showPassenger: true }) }} disabled={this.state.vehicle ? false : true}>
                            <Text style={styles.number}>{this.state.vehicle ? this.state.seatNumber : ''}</Text>
                        </TouchableOpacity>
                    </View>


                </Animated.View>
                <View style={styles.button}>
                    <Button height={y(48)} width={x(313)} text={`${this.state.now ? 'Start' : 'Schedule'} trip`}
                        loading={this.state.loading}
                        onPress={() => {
                            if (this.state.getTime == false) {
                                if (this.state.vehicle)
                                    this.setState({ loading: true }, () => {
                                        if (this.state.now)
                                            createCarpoolRequest.call(this, {
                                                location: this.state.location,
                                                destination: this.state.destination,
                                                driverDetails: this.state.userDetails,
                                                vehicle: this.state.vehicle,
                                                seatNumber: this.state.seatNumber,
                                                polyline: polyline.encode(this.state.polyline),
                                                endAddress: this.state.legs.end_address,
                                                steps: this.state.legs.steps,
                                                year: new Date().getFullYear(),
                                                month: new Date().getMonth(),
                                                day: new Date().getDate(),
                                                hour: new Date().getHours(),
                                                min: new Date().getMinutes(),
                                                seconds: new Date().getSeconds(),
                                            });
                                        else {
                                            const date = this.state.tomorrow ?
                                                this.state.date + _1DAY_MILLI_SECS :
                                                this.state.date;

                                            createScheduledCarpoolRequest.call(this, {
                                                location: this.state.location,
                                                destination: this.state.destination,
                                                driverDetails: this.state.userDetails,
                                                vehicle: this.state.vehicle,
                                                seatNumber: this.state.seatNumber,
                                                polyline: polyline.encode(this.state.polyline),
                                                endAddress: this.state.legs.end_address,
                                                steps: this.state.legs.steps,
                                                year: new Date(date).getFullYear(),
                                                month: new Date(date).getMonth(),
                                                day: new Date(date).getDate(),
                                                hour: new Date(date).getHours(),
                                                min: new Date(date).getMinutes(),
                                                seconds: new Date(date).getSeconds(),
                                                startTime: { hour: new Date(date).getHours(), min: new Date(date).getMinutes() },
                                                rawDate: date,
                                                nowDate: new Date().getTime(),
                                            });
                                        }
                                    })
                                else
                                    Alert.alert(
                                        'Select a vehicle',
                                        'You need to select a vehicle to proceed . If you currently do not have any vehicles on file, please submit a vehicle to the Perch website to accept rides',
                                        [{
                                            text: 'OK',
                                            style: 'cancel',
                                        }],
                                        { cancelable: false }
                                    );
                            }


                        }} />
                </View>
                {
                    this.state.showPassenger ?
                        <View style={[styles.container_,]}>
                            <View style={styles.passengerContainer}>
                                <Text style={styles.counterText}>Number of passengers</Text>
                                <View style={styles.counterContainer}>
                                    <TouchableOpacity onPress={() => { this.passengers('minus') }} style={styles.plus_minus}>
                                        <Feather name={'minus-circle'} size={y(30)} color={colors.BLUE} />
                                    </TouchableOpacity>
                                    <View style={styles.seatNumberView}>
                                        <Text style={styles.seatNumberText}>{this.state.seatNumber ? this.state.seatNumber : ''}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => { this.passengers('plus') }} style={styles.plus_minus}>
                                        <Feather name={'plus-circle'} size={y(30)} color={colors.BLUE} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.doneButton} onPress={() => { this.setState({ showPassenger: false }) }} >
                                    <Text style={styles.doneText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        : <></>
                }
                {this.state.getTime ?
                    Platform.OS === 'ios' ?
                        <View style={styles.iosSpinnerView}>
                            <DateTimePicker
                                value={this.state.date}
                                mode={'time'}
                                is24Hour={false}
                                display={'spinner'}
                                style={{ width: x(320), backgroundColor: '#403D3D', top: y(40) }}
                                onChange={(event, date) => {
                                    const d = event.nativeEvent.timestamp;
                                    if (date) {
                                        const advance15mins = new Date().getTime() + (15 * 60000);//15 mins in advance

                                        this.setState({ date: d, tomorrow: d > advance15mins ? false : true })
                                    }
                                }}
                            />
                            <View style={styles.iosSpinner}>
                                <Button_
                                    title={'Cancel'}
                                    onPress={() => { this.setState({ getTime: false, }) }}
                                />
                                <Button_
                                    title={'Confirm'}
                                    onPress={() => {
                                        this.setState({ getTime: false });
                                    }}
                                />
                            </View>
                        </View>
                        :
                        <DateTimePicker
                            value={this.state.date}
                            mode={'time'}
                            is24Hour={false}
                            //display={"spinner"}
                            onChange={(event, date) => {
                                this.setState({ getTime: false })
                                const d = event.nativeEvent.timestamp;
                                if (date) {
                                    const advance15mins = new Date().getTime() + (15 * 60000);//15 mins in advance

                                    this.setState({ date: d, tomorrow: d > advance15mins ? false : true })
                                }
                            }}
                        /> : <></>}
            </View>
        )
    };
};