import React from 'react';
import styles from './styles';
import axios from 'axios';
import { Animated, Text, View, ActivityIndicator, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
    getDate,
    polylineLenght, x, y, colors, height, width, dimensionAssert,
    distanceCalculator, indexFinder, callNumber, scheduledCarpoolRequestCanceller,dropOffCarpooler
} from '../../Functions/Functions';
import * as turf from '@turf/turf';//for encoding polylines
import database from '@react-native-firebase/database';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Geolocation from 'react-native-geolocation-service';
import Tts from 'react-native-tts';
import messaging from '@react-native-firebase/messaging';


export class PendingRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pending: false,
            disableButtons: false,
        };
        this.width = new Animated.Value(x(170));
        this.stopped = false;
    };

    componentDidMount() {
        const userDetails = this.props.userDetails;
        const data = this.props.data;

        if (this.props.now)
            database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}/${data.details.userID}/status`).on('value', (snapshot) => {
                if ((snapshot.val() == 'DECLINED' || snapshot.val() == 'ACCEPTED')) {
                    this.stopped = true;
                    this.width.stopAnimation();
                    this.setState({ disableButtons: true });
                }
            })

        if (this.props.now)
            Animated.timing(this.width, {
                duration: (2 * 60000),//2 mins in milliseconds
                toValue: 0,
                useNativeDriver: false,
            }).start(() => {
                //THIS IS WHERE THE TIMER GOES OFF, INCLUDE ONE IN THE RIDER APP
                if (data && this.stopped == false) {
                    database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}/${data.details.userID}`).update({
                        status: 'DECLINED',
                    });
                    this.setState({ disableButtons: true });
                }
            });
    };

    render() {
        const progressColor = this.width.interpolate({
            inputRange: [0, x(170)],
            outputRange: [colors.RED, colors.GREEN],
            extrapolate: 'clamp',
        });
        const userDetails = this.props.userDetails;
        const data = this.props.data;
        let distance = polylineLenght(JSON.parse(data.details.tripDetails.leg));
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;



        return (
            <View style={styles.cont}>
                <View style={styles.detailCont1}>
                    <Text numberOfLines={1} style={[styles.name]}>{`${data.details.firstName} ${data.details.lastName}`}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[styles.riderDetails]}>{`${distance.toLowerCase()} • ${data.details.tripDetails.seatNumber} ${data.details.tripDetails.seatNumber == 1 ? 'person' : 'people'} • ${Number(data.details.history.rating).toFixed(1)}`}</Text>
                        <FontAwesome name={'star'} color={colors.GOLD} size={y(13)} style={{ marginLeft: x(5) }} />
                    </View>
                    <Text style={[styles.cash]}>+ ${data.details.tripDetails.toPay.toFixed(2)}</Text>
                </View>
                <View>
                    {this.state.pending == false ?
                        <View style={styles.buttonCont1}>
                            <TouchableOpacity style={[styles.button1, { backgroundColor: colors.BLUE }]}
                                disabled={this.state.disableButtons}
                                onPress={() => {
                                    if (this.props.now) {
                                        //to check if the seats are truly enough for the rider
                                        //this.setState({ pending: true });
                                        //this.width.stopAnimation();

                                        database().ref(`carpoolRequests/${userDetails.driverID}/carDetails`).once('value', snapshot_ => {

                                            const seatNumber = data.details.tripDetails.seatNumber;
                                            const maxSeatCapacity = snapshot_.val().seatNumber;
                                            const seats = JSON.parse(snapshot_.val().occupiedSeats);
                                            const index_START = data.details.tripDetails.index_START
                                            const index_END = data.details.tripDetails.index_END
                                            let seatIsEnough = true;
                                            for (let c = index_START; c < index_END + 1; c++) {
                                                if (seats[c] + seatNumber > maxSeatCapacity)
                                                    seatIsEnough = false;
                                            };

                                            if (seatIsEnough) {
                                                database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}/${data.details.userID}`).update({
                                                    status: 'ACCEPTED',
                                                }).then(() => {
                                                    this.stopped = true;
                                                    this.width.stopAnimation();
                                                })
                                                this.setState({ pending: true, disableButtons: true })
                                            }
                                            else {
                                                Alert.alert(
                                                    'Not enough seats',
                                                    'We just calculated that you would not have enough seats for this rider for the distance you intend to carry them',
                                                );
                                                database().ref(`carpoolRequestsFromUsers/${userDetails.driverID}/${data.details.userID}`).update({
                                                    status: 'DECLINED',
                                                }).then(() => {
                                                    this.stopped = true;
                                                    this.width.stopAnimation();
                                                })
                                                this.setState({ disableButtons: true })
                                            }

                                        }).catch(error => { console.log(error.messages) })



                                    }
                                    else {
                                        this.setState({ disableButtons: true });
                                        database().ref(`scheduledCarpoolRequests/${userDetails.driverID}/carDetails`).once('value', snapshot_ => {
                                            const seatNumber = data.details.tripDetails.seatNumber;
                                            const maxSeatCapacity = snapshot_.val().seatNumber;
                                            const seats = JSON.parse(snapshot_.val().occupiedSeats);
                                            const index_START = data.details.tripDetails.index_START
                                            const index_END = data.details.tripDetails.index_END
                                            let seatIsEnough = true;
                                            for (let c = index_START; c < index_END + 1; c++) {
                                                if (seats[c] + seatNumber > maxSeatCapacity)
                                                    seatIsEnough = false;
                                            };

                                            if (seatIsEnough) {
                                                database().ref(`scheduledCarpoolRequestsFromUsers/${userDetails.driverID}/${data.details.userID}`).update({
                                                    status: 'ACCEPTED',
                                                }).then(() => {

                                                })
                                                this.setState({ pending: true })
                                            }
                                            else {
                                                Alert.alert(
                                                    'Not enough seats',
                                                    'We just calculated that you would not have enough seats for this rider for the distance you intend to carry them',
                                                );
                                                scheduledCarpoolRequestCanceller.call(this,
                                                    data.details.userID,
                                                    data.details.tripDetails.driverID,
                                                    userDetails.firstName
                                                );
                                            }
                                        }).catch(error => { console.log(error.message) })


                                    }
                                }}>
                                <Text style={[styles.buttonText, { color: colors.WHITE }]}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button1, { backgroundColor: colors.WHITE }]}
                                disabled={this.state.disableButtons}
                                onPress={() => {
                                    this.props.navigation.navigate('SeeDetails', {
                                        data: data,
                                        polyline: this.props.polyline,
                                        type: 'PendingRequests',
                                        navigation: 'SeeDetails',
                                        scheduled: this.props.now ? false : true,
                                        onAccept: () => { this.setState({ pending: true, disableButtons: true }) },
                                        onDecline: () => { this.setState({ disableButtons: true }) }
                                    })
                                }}>
                                <Text style={[styles.buttonText, { color: colors.BLUE }]}>See details</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={[styles.buttonCont1, { alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: colors.BLUE, height: y(dimensionAssert() ? 50 : 45), }]}>
                            <Text style={[styles.buttonText, { color: colors.WHITE }]}>Awaiting confirmation</Text>
                        </View>}
                    <View style={[styles.timer1, { marginTop: y(8), }]}>
                        <Animated.View style={[styles.timer1, { width: this.width, backgroundColor: progressColor }]}></Animated.View>
                    </View>
                </View>
            </View>
        )
    }
};

export class AwaitingPickup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: null,
            loading: false,
            speakerChoice: null,
        };
        this.alerted = false;
        this.usernotificationsent = false;
    };


    componentDidMount() {
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({ position: position });
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

        this.watchID = Geolocation.watchPosition(position => {
            this.setState({ position: position });
        },
            error => (console.log(error.message)),
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        );

        AsyncStorage.getItem('SPEAKER_CHOICE')
            .then(result => {
                if (result) {
                    this.setState({ speakerChoice: result });
                }
                else
                    AsyncStorage.setItem('SPEAKER_CHOICE', 'ALL')
                        .then(() => {
                            this.setState({ speakerChoice: 'ALL' });
                        }).catch(error => { console.log(error.message) })
            })
            .catch((error) => { console.log(error.message) });

        //tts setup
        Tts.setDucking(true);
        Tts.setIgnoreSilentSwitch("ignore");
    };
    speaker = (text) => {
        if (this.props.speaker && this.alerted == false && (this.state.speakerChoice == 'PICKUP_DROPOFF_ONLY' || this.state.speakerChoice == 'ALL')) {
            this.alerted = true;
            Tts.getInitStatus().then(() => {
                Tts.speak(text, {
                    iosVoiceId: "com.apple.ttsbundle.Samantha-compact",
                    KEY_PARAM_VOLUME: 1,
                });
            });
        };
    };
    notification = () => {
        const data = this.props.data;

        if (this.usernotificationsent == false && this.props.now) {
            this.usernotificationsent = true;
            const car = this.props.vehicle ?
                this.props.vehicle.color + ' ' + this.props.vehicle.year + ' ' + this.props.vehicle.make + ' ' + this.props.vehicle.model :
                '';
            axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendNotification`, {
                data: {
                    navigateTo: 'CarpoolTripDetails'
                },
                notification: {
                    title: 'Your Perch has arrived',
                    body: `Check for the following properties in the car before riding , the plate number (${this.props.vehicle ? this.props.vehicle.plateNumber : ''}) , the car details (a ${car}) and check if the driver's profile picture matches to ensure your safety`,
                },
                recieverID: data.userID,

            }).catch(error => { console.log(error.message) })
        }
    };
    render() {
        if (this.props.speaker == false)
            Tts.stop();

        const data = this.props.data;
        const userDetails = this.props.userDetails;
        let distance = polylineLenght(JSON.parse(data.details.tripDetails.leg));

        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;


        let leg = JSON.parse(data.details.tripDetails.leg);
        let firstCoords = leg[0];
        let i2 = indexFinder(this.props.polyline, firstCoords);

        let closestCoords = this.state.position ?
            turf.nearestPointOnLine(
                turf.lineString(this.props.polyline),
                turf.point([this.state.position.coords.latitude, this.state.position.coords.longitude])
            ).geometry.coordinates :
            leg[0];

        let i1 = indexFinder(this.props.polyline, closestCoords);

        let remainingDistance = this.state.position && i2 >= i1 ? polylineLenght(this.props.polyline.slice(i1, i2 + 1)) : '•••';

        if (remainingDistance !== '•••') {
            if (remainingDistance < 50 && this.props.now)
                this.notification();

            if (remainingDistance <= 150)
                this.speaker('Rider pickup in 150 meters');

            remainingDistance > 100 ?
                remainingDistance = `${(remainingDistance / 1000).toFixed(1)} KM` :
                remainingDistance = `${(remainingDistance).toFixed(remainingDistance != 0 ? 1 : 0)} M`;
        }


        return (
            <View style={[styles.cont, {}]} >
                <View style={styles.detailCont1}>
                    <Text numberOfLines={2} style={[styles.name, { fontSize: y(18), width: x(160), }]}>{`${data.details.firstName} ${data.details.lastName}`}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[styles.riderDetails]}>{`${distance.toLowerCase()} • ${data.details.tripDetails.seatNumber} ${data.details.tripDetails.seatNumber == 1 ? 'person' : 'people'} • ${Number(data.details.history.rating).toFixed(1)}`}</Text>
                        <FontAwesome name={'star'} color={colors.GOLD} size={y(13)} style={{ marginLeft: x(5) }} />
                    </View>
                    <View style={[styles.distanceLeft, { width: x(120), marginTop: x(5) }]}>
                        <Text style={styles.distanceLeftText}>{`${data.details.tripDetails.depatureTime} pickup`}</Text>
                    </View>
                    <Text style={[styles.cash, { marginTop: y(10), fontSize: y(25) }]}>+ ${data.details.tripDetails.toPay.toFixed(2)}</Text>
                </View>
                <View>
                    {
                        this.state.loading ?
                            <View style={[styles.buttonCont1, { alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: colors.BLUE, height: y(dimensionAssert() ? 50 : 45), }]}>
                                <ActivityIndicator color={colors.WHITE} size={'small'} />
                            </View> :
                            <View style={styles.buttonCont1}>
                                {this.props.now ?
                                    <TouchableOpacity
                                        style={[styles.button1, { backgroundColor: colors.BLUE }]}
                                        disabled={this.state.loading}
                                        onPress={() => {
                                            this.setState({ loading: true }, () => {
                                                database().ref(`currentCarpoolTrips/${userDetails.driverID}/${data.details.userID}`).update({
                                                    status: 'STARTED',
                                                }).catch(error => { console.log(error.message) })
                                            });
                                        }}
                                    >
                                        <Text style={[styles.buttonText, { color: colors.WHITE }]}>Start trip</Text>
                                    </TouchableOpacity> : <></>}
                                <TouchableOpacity style={[styles.button1, { backgroundColor: colors.WHITE, width: x(this.props.now ? 81 : 170) }]}
                                    disabled={this.state.loading}
                                    onPress={() => {
                                        this.props.navigation.navigate('SeeDetails', {
                                            data: data,
                                            polyline: this.props.polyline,
                                            type: 'AwaitingPickup',
                                            navigation: 'SeeDetails',
                                            scheduled: this.props.now ? false : true,
                                        });
                                    }}>
                                    <Text style={[styles.buttonText, { color: colors.BLUE }]}>See details</Text>
                                </TouchableOpacity>
                            </View>}
                    <View style={[styles.lowerwidth, { marginTop: y(8), }]}>
                        <View style={[styles.roundIcon, { backgroundColor: colors.WHITE }]}>
                            <Text style={styles.text}>{remainingDistance}</Text>
                        </View>
                        <TouchableOpacity style={[styles.roundIcon, { backgroundColor: colors.BLUE }]}
                            onPress={() => {
                                callNumber(Number(data.details.phoneNumber));
                            }}>
                            <Feather name={'phone'} color={colors.WHITE} size={y(16)} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roundIcon, { backgroundColor: colors.BLUE }]}
                            onPress={() => {
                                this.props.navigation.navigate('Chat', {
                                    riderID: data.userID,
                                    driverID: userDetails.driverID,
                                })
                            }}>
                            <Feather name={'mail'} color={colors.WHITE} size={y(16)} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
};

export class CurrentRiders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: null,
            loading: false,
            speakerChoice: null,
        };
        this.alerted = false;
        this.usernotificationsent = false;
    };

    componentDidMount() {
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({ position: position });
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

        this.watchID = Geolocation.watchPosition(position => {
            this.setState({ position: position });
        },
            error => (console.log(error.message)),
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        );

        AsyncStorage.getItem('SPEAKER_CHOICE')
            .then(result => {
                if (result) {
                    this.setState({ speakerChoice: result });
                }
                else
                    AsyncStorage.setItem('SPEAKER_CHOICE', 'ALL')
                        .then(() => {
                            this.setState({ speakerChoice: 'ALL' });
                        }).catch(error => { console.log(error.message) })
            })
            .catch((error) => { console.log(error.message) });


        //tts setup
        Tts.setDucking(true);
        Tts.setIgnoreSilentSwitch("ignore");
    };
    speaker = (text) => {
        if (this.props.speaker && this.alerted == false && (this.state.speakerChoice == 'PICKUP_DROPOFF_ONLY' || this.state.speakerChoice == 'ALL')) {
            this.alerted = true;
            Tts.getInitStatus().then(() => {
                Tts.speak(text, {
                    iosVoiceId: "com.apple.ttsbundle.Samantha-compact",
                    KEY_PARAM_VOLUME: 1,
                });
            });
        };
    };
    notification = () => {
        const data = this.props.data;

        if (this.usernotificationsent == false) {
            this.usernotificationsent = true;
            axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendNotification`, {
                data: {
                    navigateTo: 'CarpoolTripDetails'
                },
                notification: {
                    title: 'Get ready for dropoff',
                    body: `Your current destination is less than 50 meters away.`,
                },
                recieverID: data.userID,

            }).catch(error => { console.log(error.message) })
        }
    };
    render() {
        if (this.props.speaker == false)
            Tts.stop();

        const data = this.props.data;
        const userDetails = this.props.userDetails;

        let distance = polylineLenght(JSON.parse(data.details.tripDetails.leg));
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;


        let leg = JSON.parse(data.details.tripDetails.leg);
        let lastCoords = leg[leg.length - 1];
        let i2 = indexFinder(this.props.polyline, lastCoords);

        let closestCoords = this.state.position ?
            turf.nearestPointOnLine(
                turf.lineString(this.props.polyline),
                turf.point([this.state.position.coords.latitude, this.state.position.coords.longitude])
            ).geometry.coordinates :
            leg[0];

        let i1 = indexFinder(this.props.polyline, closestCoords);
        let remainingDistance = this.state.position && i2 >= i1 ? polylineLenght(this.props.polyline.slice(i1, i2 + 1)) : '•••';
        if (remainingDistance !== '•••') {
            if (remainingDistance <= 150)
                this.speaker('Rider dropoff in 150 meters');
            if (remainingDistance < 50)
                this.notification();
            remainingDistance > 100 ?
                remainingDistance = `${(remainingDistance / 1000).toFixed(1)} KM` :
                remainingDistance = `${(remainingDistance).toFixed(remainingDistance != 0 ? 1 : 0)} M`;
        }

        return (
            <View style={styles.cont}>
                <View style={styles.detailCont1}>
                    <Text numberOfLines={2} style={[styles.name, { fontSize: y(18), width: x(160), }]}>{`${data.details.firstName} ${data.details.lastName}`}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[styles.riderDetails]}>{`${distance.toLowerCase()} • ${data.details.tripDetails.seatNumber} ${data.details.tripDetails.seatNumber == 1 ? 'person' : 'people'} • ${Number(data.details.history.rating).toFixed(1)}`}</Text>
                        <FontAwesome name={'star'} color={colors.GOLD} size={y(13)} style={{ marginLeft: x(5) }} />
                    </View>
                    <Text style={[styles.cash]}>+ ${data.details.tripDetails.toPay.toFixed(2)}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={[styles.distanceLeft, { width: x(120) }]}>
                            <Text style={styles.distanceLeftText}>{`${data.details.tripDetails.arrivalTime} dropoff`}</Text>
                        </View>
                        <View style={[styles.distanceLeft, { marginLeft: x(10), width: x(150) }]}>
                            <Text style={styles.distanceLeftText}>{`${remainingDistance.toLowerCase()} left till dropoff`}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    {this.state.loading ?
                        <View style={[styles.buttonCont1, { alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: colors.BLUE, height: y(dimensionAssert() ? 50 : 45), }]}>
                            <ActivityIndicator color={colors.WHITE} size={'small'} />
                        </View> :
                        <View style={styles.buttonCont1}>
                            <TouchableOpacity style={[styles.button1, { backgroundColor: colors.BLUE }]}
                                disabled={this.state.loading}
                                onPress={() => {
                                    this.setState({ loading: true }, () => {
                                        dropOffCarpooler.call(this, data, userDetails, this.props.historyRef);
                                    });
                                }}>
                                <Text style={[styles.buttonText, { color: colors.WHITE }]}>Drop off</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button1, { backgroundColor: colors.WHITE }]}
                                disabled={this.state.loading}
                                onPress={() => {
                                    this.props.navigation.navigate('SeeDetails', {
                                        data: data,
                                        polyline: this.props.polyline,
                                        type: 'AwaitingPickup',
                                        navigation: 'SeeDetails',
                                    })
                                }}>
                                <Text style={[styles.buttonText, { color: colors.BLUE }]}>See details</Text>
                            </TouchableOpacity>
                        </View>}
                </View>
            </View>
        )
    }
};

export class SeeDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    };

    componentDidMount() {
    };

    render() {
        const data = this.props.data;

        let distance = polylineLenght(JSON.parse(data.details.tripDetails.leg));
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;
        return (
            <View style={[styles.cont, { width: x(313), }]}>
                <View style={[styles.detailCont1, {}]}>
                    <Text numberOfLines={2} style={[styles.name, { fontSize: y(18), width: x(150), }]}>{`${data.details.firstName} ${data.details.lastName}`}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[styles.riderDetails]}>{`${distance.toLowerCase()} • ${data.details.tripDetails.seatNumber} ${data.details.tripDetails.seatNumber == 1 ? 'person' : 'people'} • ${Number(data.details.history.rating).toFixed(1)}`}</Text>
                        <FontAwesome name={'star'} color={colors.GOLD} size={y(10)} style={{ marginLeft: x(3) }} />
                    </View>
                    <Text style={[styles.cash, { fontSize: y(24) }]}>+ ${data.details.tripDetails.toPay.toFixed(2)}</Text>

                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity style={[styles.button1, { backgroundColor: colors.BLUE, width: x(dimensionAssert() ? 140 : 150) }]}
                        onPress={() => {
                            this.props.navigation.navigate('SeeDetails', {
                                data: data,
                                polyline: this.props.polyline,
                                type: 'History',
                                navigation: 'History',
                                userDetails: this.props.userDetails,
                                mainAppend: this.props.mainAppend,
                            })
                        }}>
                        <Text style={[styles.buttonText, { color: colors.WHITE }]}>See Details</Text>
                    </TouchableOpacity>
                    <View style={[styles.distanceLeft, { marginTop: x(5), width: x(100), }]}>
                        <Text style={[styles.distanceLeftText, { fontSize: y(11) }]}>{`${data.details.tripDetails.depatureTime} pickup`}</Text>
                    </View>
                </View>
            </View>
        )
    }
};