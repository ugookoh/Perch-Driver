import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, FlatList, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { permissionLocation, Notifications, polylineLenght, OfflineNotice, x, y, colors, height, width, makeid, dimensionAssert } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DashedDivider from '../../Components/DashedDivider/DashedDivider';
import Divider from '../../Components/Divider/Divider';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline } from 'react-native-maps';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import { SeeDetails } from '../../Components/RiderComponents/RiderComponents';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { DestinationPin } from '../../Images/svgimages/vectors';
const polyline = require('@mapbox/polyline');// for decoding polylines

const X_CONSTANT = 0;
const Y_START = y(20);

export default class RideDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userDetails: this.props.route.params.userDetails,
            date: this.props.route.params.date,
            data: this.props.route.params.data,
            details: this.props.route.params.details,
            mainAppend: this.props.route.params.mainAppend,
        };

        this.TOP_OF_TRIPS = 0;
        this.height = new Animated.Value(10)
        this.value;
        this.direction;
        this.headerInverse = new Animated.Value(-Y_START);
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
        this.position.y.addListener(({ value }) => {


            this.headerInverse.setValue(-value);

            if ((value >= Y_START && this.direction === 'downwards')) {
                this.position.stopAnimation(() => {
                    if (value >= Y_START && this.direction === 'downwards')
                        this.direction = 'upwards';


                    const Y_POSITION = Number(JSON.stringify(this.position.y));
                    if (Y_POSITION > Y_START && this.direction === 'upwards')
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START },
                            useNativeDriver: false,
                        }).start();
                });
            }
            else if ((value <= this.TOP_OF_TRIPS) && this.direction === 'upwards') {
                this.direction = 'downwards';
                this.position.stopAnimation(() => {
                    if (value < this.TOP_OF_TRIPS)
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: (this.TOP_OF_TRIPS + 1) },
                            useNativeDriver: false,
                        }).start();
                })
            }
        });

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 4 || Math.abs(gestureState.dy) >= 4;

            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.stopAnimation();
                this.position.setOffset({ x: X_CONSTANT, y: this.position.y._value });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
                this.value = Number(JSON.stringify(this.position.y));
            },
            onPanResponderMove: (evt, gestureState) => {
                this.position.stopAnimation();
                const Y_POSITION = (this.value + gestureState.dy);
                if (Y_POSITION <= Y_START && Y_POSITION >= this.TOP_OF_TRIPS)
                    this.position.setValue({ x: X_CONSTANT, y: (gestureState.dy) });


                if (Math.sign(gestureState.vy) == 1) //going down
                    this.direction = 'downwards';
                else if (Math.sign(gestureState.vy) == -1)//going upwards
                    this.direction = 'upwards';



            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                const Y_POSITION = Number(JSON.stringify(this.position.y));
                if (Y_POSITION < Y_START) {
                    Animated.decay(this.position, {
                        velocity: { x: 0, y: gestureState.vy }, // velocity from gesture release
                        useNativeDriver: false,
                    }).start();

                    if (Math.sign(gestureState.vy) == 1) //going down
                        this.direction = 'downwards';
                    else if (Math.sign(gestureState.vy) == -1)//going upwards
                        this.direction = 'upwards';

                }
                else if (Y_POSITION > Y_START) {
                    this.direction = 'upwards';
                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_START }, // velocity from gesture release
                        useNativeDriver: false,
                    }).start();
                }
            },
        });
    };
    componentDidMount() {

    };
    sorter(a, b) {
        function numbergetter(time) {
            let slash1 = 0, slash2 = 0, slash3 = 0;
            for (let k = 0; k < time.length; k++) {
                if (time.charAt(k) == '-')
                    slash1 == 0 ? slash1 = k : slash2 == 0 ? slash2 = k : slash3 = k;
            };

            const DAY = Number(time.substring(0, slash1)) * 86400;
            const HOUR = Number(time.substring(slash1 + 1, slash2)) * 3600;
            const MINS = Number(time.substring(slash2 + 1, slash3)) * 60;
            const SECS = Number(time.substring(slash3 + 1, time.length));

            return (DAY + HOUR + MINS + SECS)
        };

        let a_time = numbergetter(a)
        let b_time = numbergetter(b)

        if (a_time > b_time)
            return -1;
        else
            return 1
    };
    render() {
        const opacity = this.position.y.interpolate({
            inputRange: [-y(dimensionAssert() ? 710 : 600), -y(dimensionAssert() ? 690 : 580)],
            outputRange: [2, 0],
            extrapolate: 'clamp',
        });

        let distance = polylineLenght(polyline.decode(this.state.data.polyline))
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;
        distance = distance.toLowerCase();

        const trips = this.state.data.trips;

        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.header}>
                    <Header name={'Ride Details'} scrollY={this.headerInverse} onPress={() => { this.props.navigation.goBack() }} />
                </View>
                <Animated.View style={[styles.goUp, { zIndex: opacity, elevation: opacity, opacity: opacity }]}>
                    <TouchableOpacity style={[styles.zoomIcon, {}]} onPress={() => {
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START },
                            useNativeDriver: false,
                        }).start();
                    }}>
                        <FontAwesome5 name={'level-up-alt'} size={y(25)} color={colors.BLUE} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[this.position.getLayout(), { position: 'relative', }]} {...this.panResponder.panHandlers}>
                    <View style={styles.tripContainer}
                        onLayout={(event) => {
                            this.TOP_OF_TRIPS = -event.nativeEvent.layout.height + (height / 1.5);
                        }}>

                        <View style={styles.mapGroup}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313), alignSelf: 'center' }]}>Trip Details</Text>
                            <View style={[styles.travel, { top: y(dimensionAssert() ? 55 : 58) }]}>
                                <Feather name={'map-pin'} size={y(10)} color={colors.BLUE} />
                                <Text numberOfLines={3} style={[styles.firstLayer, { color: colors.BLACK, fontSize: y(12, true), marginLeft: x(5), width: x(300), }]}>{this.state.data.locationAddress}</Text>
                            </View>
                            <View style={styles.LtoD_Divider}><DashedDivider borderColor={colors.BLUE} height={y(dimensionAssert() ? 28 : 21)} width={0} borderWidth={0.5} borderRadius={0} /></View>
                            <View style={[styles.travel, { top: y(dimensionAssert() ? 103 : 94) }]}>
                                <Feather name={'map-pin'} size={y(10)} color={colors.BLUE} />
                                <Text numberOfLines={3} style={[styles.firstLayer, { color: colors.BLACK, fontSize: y(12, true), marginLeft: x(5), width: x(300), }]}>{this.state.data.destinationAddress}</Text>
                            </View>


                            <View style={[styles.calendar]}>
                                <Text style={[styles.firstLayer, { color: colors.BLUE, fontSize: y(14, true), marginRight: x(5), }]}>{this.state.date}</Text>
                                <Feather name={'calendar'} size={y(13)} color={colors.BLUE} />
                            </View>

                            <MapView
                                ref={(ref) => this.map = ref}
                                onMapReady={() => {
                                    //this.map.fitToElements(true)
                                    this.map.fitToCoordinates([
                                        { latitude: this.state.data.location.latitude, longitude: this.state.data.location.longitude },
                                        ...polyline.decode(this.state.data.polyline).map(v => { return { latitude: v[0], longitude: v[1] } }),
                                        { latitude: this.state.data.destination.latitude, longitude: this.state.data.destination.longitude }],
                                        {
                                            edgePadding: {
                                                top: y(20),
                                                bottom: y(20),
                                                left: x(50),
                                                right: x(50),
                                            },
                                        })
                                }}
                                provider={PROVIDER_GOOGLE}
                                style={[styles.maps,]}
                                customMapStyle={MapStyle}
                                //liteMode={true}
                                showsUserLocation={false}
                                //zoomEnabled={false}
                                pitchEnabled={false}
                                showsCompass={false}
                                showsScale={false}
                                scrollEnabled={false}
                                rotateEnabled={false}
                            >

                                <Marker coordinate={{ latitude: this.state.data.location.latitude, longitude: this.state.data.location.longitude }} style={{ zIndex: 1 }}>
                                    <FontAwesome name={'circle'} color={colors.BLUE_FONT} size={y(15)} />
                                </Marker>
                                <Polyline
                                    coordinates={polyline.decode(this.state.data.polyline).map(v => { return { latitude: v[0], longitude: v[1] } })}
                                    strokeColor={colors.BLUE}
                                    strokeWidth={3}
                                />
                                <Marker coordinate={{ latitude: this.state.data.destination.latitude, longitude: this.state.data.destination.longitude }} style={{ zIndex: 1 }}>
                                    <DestinationPin color={colors.BLUE_DARK} />
                                </Marker>
                            </MapView>
                        </View>

                        <View style={styles.listofPerchers}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313) }]}>Summary</Text>
                            <View style={[styles.spaceout, { marginTop: y(19) }]}>
                                <Text style={[styles.firstLayer, {}]}>Trip distance</Text>
                                <Text style={[styles.firstLayer, {}]}>{distance}</Text>
                            </View>

                            <View style={[styles.spaceout, { marginTop: y(11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Number of passengers</Text>
                                <Text style={[styles.firstLayer, {}]}>{this.state.details.passNo}</Text>
                            </View>

                            <View style={[styles.spaceout, { marginTop: y(11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Total kilometers provided</Text>
                                <Text style={[styles.firstLayer, {}]}>{this.state.details.distance}</Text>
                            </View>

                            <View style={[styles.divider, { marginTop: y(16.8) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                            <View style={[styles.spaceout, { marginVertical: y(10) }]}>
                                <Text style={[styles.total, {}]}>Total</Text>
                                <Text style={[styles.total, {}]}>+ {this.state.details.totalPay}</Text>
                            </View>

                        </View>


                        <View style={styles.help}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313) }]}>Help</Text>

                            <TouchableOpacity style={[styles.contactUsContainer, { marginTop: y(20), marginBottom: y(16) }]} onPress={() => { this.props.navigation.navigate('ContactUs') }}>
                                <Text style={[styles.firstLayer,]}>Contact Us</Text>
                                <Ionicons name={'chevron-forward'} color={colors.GREY_TAB} size={y(20)} />
                            </TouchableOpacity>
                        </View>

                        {trips ?
                            <View style={styles.listofPerchers}>
                                <View style={[styles.spaceout, { alignItems: 'center', marginTop: y(14), }]}>
                                    <Text style={[styles.tripTitle,]}>List of Perchers</Text>
                                </View>

                                <Animated.View style={[styles.list, { marginTop: y(10) }]}>
                                    <FlatList //new one is always make when h1 changes, so store it in state or somewhere it wont change
                                        scrollEnabled={false}
                                        ref={ref => this.flatList = ref}
                                        data={Object.keys(trips).sort(this.sorter)}
                                        renderItem={({ item, index }) => {
                                            return (<>
                                                <View style={styles.listSpace}>
                                                    <SeeDetails
                                                        data={trips[item]}
                                                        dataKey={item}
                                                        polyline={polyline.decode(this.state.data.polyline)}
                                                        navigation={this.props.navigation}
                                                        userDetails={this.state.userDetails}
                                                        mainAppend={`${this.state.mainAppend}/${item}`}
                                                    />
                                                </View>
                                                {Object.keys(trips).sort(this.sorter).lastIndex !== index ?
                                                    <View style={[styles.divider, {}]}><Divider height={0.5} width={x(300)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                                    : <></>}
                                            </>)
                                        }}
                                        keyExtractor={item => JSON.stringify(item)}
                                    />
                                </Animated.View>
                            </View> : <></>}

                    </View>
                </Animated.View>
            </View>
        )
    }
}

