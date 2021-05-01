import React from 'react';
import styles from './styles';
import { Animated, Text, View, Alert, StatusBar, TextInput, Dimensions, TouchableOpacity, } from 'react-native';
import database from '@react-native-firebase/database';
import * as turf from '@turf/turf';//for encoding polylines
import { permissionLocation, scheduledCarpoolRequestCanceller, OfflineNotice, x, y, colors, height, width, dimensionAssert, polylineLenght, carpoolRatingHandler, cancelTrip, cancelScheduledTrip } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline, Polygon } from 'react-native-maps';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Divider from '../../Components/Divider/Divider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { DestinationPin, Speaker, SpeakerCancel } from '../../Images/svgimages/vectors';
import StarRating from 'react-native-star-rating';
import AsyncStorage from '@react-native-community/async-storage';

export default class SeeDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            navigation: this.props.route.params.navigation,// OR 'SeeDetails'    <<--use this to ocntrol what shows
            type: this.props.route.params.type,
            data: this.props.route.params.data,
            polyline: this.props.route.params.polyline,
            scheduled: this.props.route.params.scheduled,
            currenStarDisplay: null,
            alert: false,
        };
    };
    componentDidMount() {
        this.mainAppend = this.props.route.params.mainAppend;
        if (this.state.scheduled && this.state.type == 'PendingRequests')
            database().ref(`scheduledCarpoolRequestsFromUsers/${this.state.data.details.tripDetails.driverID}/${this.state.data.details.userID}/status`).on('value', (data) => {
                if (data.val() == null && this.state.alert === false) {
                    this.setState({ alert: true });
                    if (this.props.navigation.isFocused())
                        Alert.alert('Timeout',
                            'Time has run out for this request and it is no longer available',
                            [
                                {
                                    text: 'OK',
                                    style: 'cancel',
                                    onPress: () => {
                                        this.props.navigation.navigate('ScheduledTrips')
                                    },
                                }
                            ],
                            { cancelable: false }
                        )
                }
            })
        else if (this.state.type == 'PendingRequests')
            database().ref(`carpoolRequestsFromUsers/${this.state.data.details.tripDetails.driverID}/${this.state.data.details.userID}/status`).on('value', (data) => {
                if (data.val() == 'DECLINED' || data.val() == 'CANCELLED' || data.val() == null) {
                    if (this.state.type == 'PendingRequest' && this.state.alert === false) {
                        this.setState({ alert: true });
                        if (this.props.navigation.isFocused())
                            Alert.alert('Timeout',
                                'Time has run out for this request and it is no longer available',
                                [
                                    {
                                        text: 'OK',
                                        style: 'cancel',
                                        onPress: () => {
                                            this.props.route.params.onDecline();
                                            this.props.navigation.navigate('TripStarted');
                                        },
                                    }
                                ],
                                { cancelable: false })
                    }
                }
            });

        if (this.state.navigation == 'History')
            database().ref(`${this.mainAppend}/rating`).once('value', (data) => {
                if (data.val())
                    this.setState({ currenStarDisplay: data.val() })
                else
                    this.setState({ currenStarDisplay: 'NOTRATED' })
            })


    };
    onStarRatingPress = (rating) => {
        //database().ref(`${this.mainAppend}/rating`).on('value', (data) => { });
        this.setState({ currenStarDisplay: rating }, () => {
            carpoolRatingHandler({
                mainAppend: this.mainAppend,
                rating: rating,
                riderID: this.state.data.userID,
            });
        })
    };
    render() {
        let distance = polylineLenght(JSON.parse(this.state.data.details.tripDetails.leg));
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;
        const lL = JSON.parse(this.state.data.details.tripDetails.leg).length - 1
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Rider Trip Details'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: this.state.navigation == 'SeeDetails' ? y(dimensionAssert() ? 160 : 260) : y(dimensionAssert() ? 192 : 255) }]}
                    onPress={() => {
                        if (this.mapReady) {
                            const line = turf.lineString([...this.state.polyline]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));

                            this.map.fitToCoordinates(bboxPolygon, {
                                edgePadding:
                                {
                                    top: x(40),
                                    right: x(80),
                                    bottom: x(40),
                                    left: x(25),
                                },
                            });
                        }
                    }}
                >
                    <MaterialIcons name={'zoom-out-map'} size={y(21)} color={colors.BLUE} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: this.state.navigation == 'SeeDetails' ? y(dimensionAssert() ? 229 : 315) : y(dimensionAssert() ? 255 : 310) }]}
                    onPress={() => {
                        if (this.mapReady) {
                            const line = turf.lineString([...JSON.parse(this.state.data.details.tripDetails.leg)]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));

                            this.map.fitToCoordinates(bboxPolygon, {
                                edgePadding:
                                {
                                    top: x(40),
                                    right: x(80),
                                    bottom: x(40),
                                    left: x(25),
                                },
                            });
                        }
                    }}
                >
                    <MaterialIcons name={'my-location'} size={y(21)} color={colors.BLUE} />
                </TouchableOpacity>
                <MapView
                    ref={(ref) => this.map = ref}
                    provider={PROVIDER_GOOGLE}
                    style={[styles.maps, { height: this.state.navigation == 'SeeDetails' ? y(dimensionAssert() ? 185 : 260) : y(dimensionAssert() ? 175 : 230), }]}
                    customMapStyle={MapStyle}
                    showsUserLocation={true}
                    showsCompass={false}
                    scrollEnabled={true}
                    showsMyLocationButton={false}
                    onMapReady={() => {
                        this.mapReady = true;
                        const line = turf.lineString([...JSON.parse(this.state.data.details.tripDetails.leg),]);
                        let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));

                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25),
                            },
                        });
                    }}
                >
                    <Marker //LOCATION
                        coordinate={{ latitude: JSON.parse(this.state.data.details.tripDetails.leg)[0][0], longitude: JSON.parse(this.state.data.details.tripDetails.leg)[0][1] }}
                        identifier={'mkL'}
                        style={{ zIndex: 1, elevation: 1 }}
                    >
                        <FontAwesome name={'circle'} color={colors.BLUE_DARK} size={y(15)} />
                    </Marker>
                    <Polyline
                        coordinates={JSON.parse(this.state.data.details.tripDetails.leg).map(value => {
                            return { latitude: value[0], longitude: value[1] }
                        })}
                        strokeColor={colors.BLUE}
                        strokeWidth={4}
                    />
                    <Polyline
                        coordinates={this.state.polyline.map(value => {
                            return { latitude: value[0], longitude: value[1] }
                        })}
                        strokeColor={colors.BLUE_OPAQUE(0.6)}
                        strokeWidth={4}
                    />
                    <Marker //DESTINATION
                        coordinate={{ latitude: JSON.parse(this.state.data.details.tripDetails.leg)[lL][0], longitude: JSON.parse(this.state.data.details.tripDetails.leg)[lL][1] }}
                        identifier={'mkD'}
                        style={{ zIndex: 1, elevation: 1 }}
                    >
                        <DestinationPin color={colors.BLUE_DARK} />
                    </Marker>
                </MapView>
                <View style={styles.lowerContainer}>
                    {this.state.navigation == 'SeeDetails' ? <View style={styles.bubble}>
                        <Text numberOfLines={1} style={styles.bubbleText}>{distance}</Text>
                    </View> : <></>}
                    <View style={[styles.spaceView, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.title, { marginTop: y(25) }]}>{`Trip Breakdown`}</Text>

                        {this.state.navigation == 'History' ?
                            <View style={styles.rating}>
                                {this.state.data.status == 'CANCELLED' ?
                                    <Text style={[styles.ratingText, { color: colors.RED, fontSize: y(14) }]}>{'CANCELLED'}</Text> :
                                    <>
                                        <Text style={styles.ratingText}>{this.state.currenStarDisplay == 'NOTRATED' ? `PLEASE RATE` : 'RATED'}</Text>
                                        <StarRating
                                            disabled={!this.state.currenStarDisplay || typeof this.state.currenStarDisplay == 'number'}
                                            maxStars={5}
                                            rating={this.state.currenStarDisplay ? this.state.currenStarDisplay == 'NOTRATED' ? 0 : this.state.currenStarDisplay : 0}
                                            fullStarColor={colors.GOLD}
                                            emptyStarColor={colors.GOLD}
                                            starSize={y(23)}
                                            selectedStar={(rating) => this.onStarRatingPress(rating)}
                                        /></>}
                            </View>
                            : <></>}
                    </View>
                    <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <View style={[styles.spaceView, { marginTop: y(dimensionAssert() ? 8 : 14) }]}>
                        <Text style={[styles.text]}>Start</Text>
                        <Text numberOfLines={2} style={[styles.textAddress, { width: x(260), }]}>{this.state.data.details.tripDetails.stopA}</Text>
                    </View>
                    <View style={[styles.spaceView, { marginTop: y(8) }]}>
                        <Text style={[styles.text,]}>End</Text>
                        <Text numberOfLines={2} style={[styles.textAddress, { width: x(260), }]}>{this.state.data.details.tripDetails.stopB}</Text>
                    </View>
                    <View style={[styles.spaceView, { marginTop: y(8) }]}>
                        <Text style={[styles.text,]}>Pickup at</Text>
                        <Text style={[styles.textAddress]}>{this.state.data.details.tripDetails.depatureTime}</Text>
                    </View>
                    <View style={[styles.spaceView, { marginTop: y(8) }]}>
                        <Text style={[styles.text]}>Trip Duration</Text>
                        <Text style={[styles.textAddress]}>{distance.toLowerCase()}</Text>
                    </View>
                    <View style={[styles.spaceView, { marginTop: y(8) }]}>
                        <Text style={[styles.text]}>Number of passengers</Text>
                        <Text style={[styles.textAddress]}>{`${this.state.data.details.tripDetails.seatNumber} ${this.state.data.details.tripDetails.seatNumber == 1 ? 'person' : 'people'}`}</Text>
                    </View>
                    <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <View style={[styles.spaceView, { marginTop: y(15) }]}>
                        <Text style={[styles.total]}>Total</Text>
                        <Text style={[styles.cash]}>{'$ 12.98'}</Text>
                    </View>
                    <View style={[styles.divider, { marginTop: y(15) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    {this.state.navigation == 'SeeDetails' ?
                        (this.state.type == 'PendingRequests' ?
                            <View style={[styles.spaceView, { marginBottom: y(dimensionAssert() ? 20 : 66.5), marginTop: y(dimensionAssert() ? 20 : 15.5) }]}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: colors.BLUE }]}
                                    onPress={() => {
                                        this.setState({ alert: true }, () => {
                                            const ref = this.state.scheduled ? 'scheduledCarpoolRequestsFromUsers' : 'carpoolRequestsFromUsers';
                                            AsyncStorage.getItem('USER_DETAILS')
                                                .then(result => {
                                                    const userDetails = JSON.parse(result);
                                                    if (this.state.scheduled) {
                                                        const data = this.state.data;
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
                                                                database().ref(`${ref}/${this.state.data.details.tripDetails.driverID}/${this.state.data.details.userID}`).update({
                                                                    status: 'ACCEPTED',
                                                                }).then(() => {
                                                                    this.props.route.params.onAccept();
                                                                    this.props.navigation.navigate(this.state.scheduled ? 'ScheduledTrips' : 'TripStarted')
                                                                }).catch(error => { console.log(error.message) })
                                                            }
                                                            else {
                                                                Alert.alert(
                                                                    'Not enough seats',
                                                                    'We just calculated that you would not have enough seats for this rider for the distance you intend to carry them',
                                                                );
                                                                this.props.navigation.navigate('ScheduledTrips');
                                                                scheduledCarpoolRequestCanceller.call(this,
                                                                    this.state.data.details.userID,
                                                                    this.state.data.details.tripDetails.driverID,
                                                                    userDetails.firstName,
                                                                );
                                                            }
                                                        }).catch(error => { console.log(error.message) })

                                                    }
                                                    else {

                                                        const data = this.state.data;
                                                        database().ref(`carpoolRequests/${userDetails.driverID}/carDetails`).once('value', snapshot_ => {
                                                            const maxSeatCapacity = snapshot_.val().seatNumber;
                                                            const seats = JSON.parse(snapshot_.val().occupiedSeats);
                                                            const index_START = data.details.tripDetails.index_START
                                                            const index_END = data.details.tripDetails.index_END;
                                                            const seatNumber = data.details.tripDetails.seatNumber;
                                                            let seatIsEnough = true;
                                                            for (let c = index_START; c < index_END + 1; c++) {
                                                                if (seats[c] + seatNumber > maxSeatCapacity)
                                                                    seatIsEnough = false;
                                                            };

                                                            if (seatIsEnough) {
                                                                database().ref(`${ref}/${this.state.data.details.tripDetails.driverID}/${this.state.data.details.userID}`).update({
                                                                    status: 'ACCEPTED',
                                                                })
                                                                    .then(() => {
                                                                        this.props.route.params.onAccept();
                                                                        this.props.navigation.navigate(this.state.scheduled ? 'ScheduledTrips' : 'TripStarted')
                                                                    })
                                                                    .catch(error => { console.log(error.message) })
                                                            }
                                                            else {
                                                                Alert.alert(
                                                                    'Not enough seats',
                                                                    'We just calculated that you would not have enough seats for this rider for the distance you intend to carry them',
                                                                );
                                                                database().ref(`carpoolRequestsFromUsers/${this.state.data.details.tripDetails.driverID}/${this.state.data.details.userID}`).update({
                                                                    status: 'DECLINED',
                                                                }).then(() => {
                                                                    this.props.route.params.onDecline();
                                                                    this.props.navigation.navigate('TripStarted');
                                                                }).catch(error => { console.log(error.message) })
                                                            }

                                                        }).catch(error => { console.log(error.messages) })



                                                    }
                                                }).catch(error => { console.log(error.message) })


                                        });



                                    }}>
                                    <Text style={styles.buttonText}>{`Accept request`}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, { backgroundColor: colors.RED }]}
                                    onPress={() => {
                                        Alert.alert(
                                            'Decline trip',
                                            'Are you sure you want to decline this trip?',
                                            [{
                                                text: 'Cancel',
                                                style: 'cancel',
                                            },
                                            {
                                                text: 'Decline trip',
                                                style: 'destructive',
                                                onPress: () => {
                                                    this.setState({ alert: true }, () => {

                                                        if (this.state.scheduled) {
                                                            AsyncStorage.getItem('USER_DETAILS')
                                                                .then(result => {
                                                                    const driverName = JSON.parse(result).firstName;
                                                                    this.props.route.params.onDecline();
                                                                    this.props.navigation.navigate('ScheduledTrips');
                                                                    scheduledCarpoolRequestCanceller.call(this,
                                                                        this.state.data.details.userID,
                                                                        this.state.data.details.tripDetails.driverID,
                                                                        driverName
                                                                    );
                                                                }).catch(error => { console.log(error.message) })
                                                        }
                                                        else
                                                            database().ref(`carpoolRequestsFromUsers/${this.state.data.details.tripDetails.driverID}/${this.state.data.details.userID}`).update({
                                                                status: 'DECLINED',
                                                            })
                                                                .then(() => {
                                                                    this.props.route.params.onDecline();
                                                                    this.props.navigation.navigate('TripStarted')
                                                                })
                                                                .catch(error => { console.log(error.message) })
                                                    });
                                                },
                                            }], { cancelable: false })
                                    }}>
                                    <Text style={styles.buttonText}>{`Decline request`}</Text>
                                </TouchableOpacity>
                            </View> :
                            <TouchableOpacity
                                style={[styles.cancelTrip, { marginBottom: y(dimensionAssert() ? 20 : 66.5), marginTop: y(dimensionAssert() ? 20 : 15.5), height: y(55) }]}
                                onPress={() => {
                                    //REQUESTS THAT HAPPEN RN
                                    Alert.alert('Cancel this trip?',
                                        'Are you sure you would like to cancel this trip?',
                                        [{
                                            text: 'Back',
                                            style: 'cancel',
                                        }, {
                                            text: 'Cancel trip',
                                            style: 'destructive',
                                            onPress: () => {
                                                AsyncStorage.getItem('USER_DETAILS')
                                                    .then(result => {
                                                        const driverName = JSON.parse(result).firstName;
                                                        //NOW
                                                        if (this.state.scheduled)
                                                            cancelScheduledTrip.call(this,
                                                                {
                                                                    userID: this.state.data.details.userID,
                                                                    type: 'driver',
                                                                    time: new Date().getTime(),
                                                                    riderName: this.state.data.details.firstName,
                                                                    driverName: driverName,
                                                                    driverID_: this.state.data.details.tripDetails.driverID,
                                                                })
                                                        else
                                                            cancelTrip.call(this,
                                                                {
                                                                    userID: this.state.data.details.userID,
                                                                    type: 'driver',
                                                                    time: new Date().getTime(),
                                                                    riderName: this.state.data.details.firstName,
                                                                    driverName: driverName,
                                                                    driverID_: this.state.data.details.tripDetails.driverID,
                                                                })
                                                    }).catch(error => {
                                                        Alert.alert('Storage error', `Error, ${error.message}`)
                                                    })
                                            },
                                        }])

                                }}>
                                <Text style={styles.buttonText}>Cancel Trip</Text>
                            </TouchableOpacity>) :
                        <View style={styles.help}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313) }]}>Help</Text>
                            <TouchableOpacity style={[styles.contactUsContainer, { marginTop: y(10), marginBottom: y(10) }]} onPress={() => { this.props.navigation.navigate('ContactUs') }}>
                                <Text style={[styles.firstLayer,]}>Contact Us</Text>
                                <Ionicons name={'chevron-forward'} color={colors.GREY_TAB} size={y(20)} />
                            </TouchableOpacity>
                        </View>}
                </View>
            </View>
        )
    }
}

