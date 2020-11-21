import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, LogBox, Easing } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import * as turf from '@turf/turf';//for encoding polylines
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Signs } from '../../Images/svgimages/vectors';
import Feather from 'react-native-vector-icons/Feather';
import { pointIsInsidePolygon, middlePoint, distanceCalculator, x, y, colors, height, width, dimensionAssert, makeid } from '../../Functions/Functions';
import Tts from 'react-native-tts';
const circleToPolygon = require('circle-to-polygon');

export default class Navigator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            steps: this.props.steps,
            arrayOfPositions: [],
            index: 0,
            distance: 0,
            position: null,
            endAddress: this.props.endAddress,
            messages: [],
            speakerChoice: null,
        };
        this.timeout = true;

        this.top = new Animated.Value(y(-300))
    };

    componentDidMount() {
        setTimeout(() => {
            Animated.spring(this.top, {
                toValue: y(dimensionAssert() ? 29 : 45),
                useNativeDriver: false,
                easing: Easing.ease(),

            }).start();
        }, 300)
        let a = [];
        for (let i = 0; i < this.state.steps.length; i++) {
            if (i == 0)
                a.push(Object.values(this.state.steps[i].start_location));
            a.push(Object.values(this.state.steps[i].end_location));
        }
        this.setState({ arrayOfPositions: a });
        this.watchID = Geolocation.watchPosition(position => {
            this.setState({ position: position });
            this.calculateCircle(position);
        },
            error => (console.log(error.message)),
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        );

        Geolocation.getCurrentPosition(
            (position) => {
                this.calculateCircle(position);
                const end_coords = this.state.steps[this.state.index].end_location;
                const distance = distanceCalculator(position.coords.latitude, position.coords.longitude, end_coords.lat, end_coords.lng);
                this.setState({ distance: distance, position: position });
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
    calculateCircle = (position) => {
        if (this.timeout) {
            this.timeout = false;
            //this is where the position goes
            const p = [position.coords.latitude, position.coords.longitude];
            const aP = this.state.arrayOfPositions;
            for (let i = 1; i < aP.length; i++) {
                let distance = distanceCalculator(aP[i - 1][0], aP[i - 1][1], aP[i][0], aP[i][1]);
                let midPoint = middlePoint(aP[i - 1][0], aP[i - 1][1], aP[i][0], aP[i][1]);
                let polygon = circleToPolygon([midPoint.y, midPoint.x], (distance / 2), 32).coordinates[0]
                    .map(v => { return [v[1], v[0]] });//LONG AND LAT ARE INVERTED SO TURN IT BACK AROUND
                const isInside = pointIsInsidePolygon(p, polygon);

                if (isInside && this.state.index != i - 1) {
                    this.setState({ index: i - 1, /*messages: []*/ });
                }
            };

            const end_coords = this.state.steps[this.state.index].end_location;
            const distance = distanceCalculator(position.coords.latitude, position.coords.longitude, end_coords.lat, end_coords.lng);
            this.setState({ distance: distance });
            this.timeout = true;
        }
    }
    speaker = (text, text_id) => {
        /**
         * The speaker works like this.for every circle, we first read out the main instruction for that circle, then we read out the instruction for the next circle.
         * so we might say turn left, then we read the next one like turn right in 300 meters. The  when we get to the turn right, we read it again and say turn right. every circle has 2 readings except the last
         * WE store the texts and DISTANCEtext so that we never resay any one
         */
        if (this.props.speaker && (this.state.messages.indexOf(text_id) == -1) && (this.state.speakerChoice == 'NAVIGATION_ONLY' || this.state.speakerChoice == 'ALL')) {
            this.state.messages.push(text_id)
            Tts.getInitStatus().then(() => {
                Tts.speak(text, {
                    iosVoiceId: "com.apple.ttsbundle.Samantha-compact",
                    KEY_PARAM_VOLUME: 1,
                });
            });
        }
    }
    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    };
    render() {
        if (this.props.speaker == false)
            Tts.stop();
        let circle;
        const circle1 = this.state.steps[this.state.index];
        const circle2 = this.state.steps.length > this.state.index + 1 ? this.state.steps[this.state.index + 1] : this.state.steps[this.state.index];
        let cc1;//circle is equal to circle 1
        if (this.state.position) {
            const p = this.state.position.coords;
            const start = this.state.steps[this.state.index].start_location;
            if (distanceCalculator(p.latitude, p.longitude, start.lat, start.lng) >= 20)//the position is 20 m away from starting, change decription
            {
                circle = circle2;
                cc1 = false;
            }
            else {
                circle = circle1;
                cc1 = true;
            }
        }
        else
            circle = circle1;
        let text = removeTags(circle.html_instructions);
        let icon = <></>
        switch (circle.maneuver) {
            case 'turn-sharp-left': { icon = <Feather name={'corner-up-left'} color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} /> } break;
            case 'uturn-right': { icon = <View style={styles.icon}><Signs.UTurnRight color={colors.BLUE} /></View> } break;
            case 'turn-slight-right': { icon = <View style={styles.icon}><Signs.SlightRight color={colors.BLUE} /></View> } break;
            case 'merge': { icon = <View style={[styles.icon]}><Signs.Merged color={colors.BLUE} /></View> } break;
            case 'roundabout-left': { icon = <View style={styles.icon_}><Signs.RoundaboutLeft color={colors.BLUE} /></View> } break;
            case 'roundabout-right': { icon = <View style={styles.icon_}><Signs.RoundaboutLeft color={colors.BLUE} /></View> } break;
            case 'uturn-left': { icon = <View style={styles.icon}><Signs.UTurnLeft color={colors.BLUE} /></View> } break;
            case 'turn-slight-left': { icon = <View style={styles.icon}><Signs.SlightLeft color={colors.BLUE} /></View> } break;
            case 'turn-left': { icon = <Feather name='corner-up-left' color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} /> } break;
            case 'ramp-right': { icon = <Feather name='corner-up-right' color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} /> } break;
            case 'turn-right': { icon = <Feather name='corner-up-right' color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} /> } break;
            case 'fork-right': { icon = <View style={styles.icon}><Signs.ForkRight color={colors.BLUE} /></View> } break;
            case 'straight': { icon = <FontAwesome name='long-arrow-up' color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} /> } break;
            case 'fork-left': { icon = <View style={styles.icon}><Signs.ForkLeft color={colors.BLUE} /></View> } break;
            //case 'ferry-train': { } break;
            case 'turn-sharp-right': { icon = <Feather name='corner-up-right' color={colors.BLUE} size={y(26)} /> } break;
            case 'ramp-left': { icon = <Feather name='corner-up-left' color={colors.BLUE} size={y(26)} /> } break;
            //case 'ferry': { } break;
            default: { icon = <FontAwesome name='long-arrow-up' color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} /> } break;
        };
        if (this.state.index == this.state.steps.length - 1) {
            text = this.state.endAddress;
            icon = <Ionicons name={'md-planet-outline'} color={colors.BLUE} size={y(26)} style={{ marginBottom: x(6) }} />
        }
        else {
            if (cc1 && this.state.index == 0) {
                this.speaker(text, text);
            }
            else if (this.state.position && cc1 == false) {
                const p = this.state.position.coords;
                const end = this.state.steps[this.state.index].end_location;
                const distanceToEnd = distanceCalculator(p.latitude, p.longitude, end.lat, end.lng);

                if (distanceToEnd <= 50)//in 50 meters to end say the direction
                {
                    this.speaker(text, text);
                }
                else {
                    let distanceText = rounder(distanceToEnd)
                    this.speaker(`In ${distanceText} , ${text}`, `DISTANCE${text}`);//in **300 meters** turn right
                }
            }


        }
        let distance = this.state.distance;
        distance > 500 ?
            distance = `${(distance / 1000).toFixed(1)} KM` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;



        return (
            <Animated.View style={[styles.container, { top: this.top }]}>
                <View style={[styles.subContainer, { flexDirection: this.props.display ? 'column' : 'row' }]}>
                    {this.props.display ?
                        <>
                            <Text numberOfLines={2} style={[styles.text, { fontSize: y(20) }]}>{`${this.props.display.details.firstName} ${this.props.display.details.lastName}`}</Text>
                            {
                                this.props.display.status == 'CURRENTLOCATION' ?
                                    <>
                                        <Text numberOfLines={4} style={styles.text}>{`Current Location`}</Text>
                                    </> :
                                    <>
                                        <Text numberOfLines={1} style={[styles.text]}>
                                            {this.props.display.status == 'STARTED' ?
                                                `Dropoff at ${this.props.display.details.tripDetails.arrivalTime}` :
                                                `Pickup at ${this.props.display.details.tripDetails.depatureTime}`}
                                        </Text>
                                        <Text numberOfLines={1} style={styles.text}>
                                            {`${this.props.display.details.tripDetails.seatNumber} ${this.props.display.details.tripDetails.seatNumber == 1 ? 'passenger' : 'passengers'}`}
                                        </Text>
                                    </>}
                        </> :
                        <>
                            <Text numberOfLines={4} style={styles.text}>{text}</Text>
                            <View style={styles.iconContainer}>
                                {icon}
                                <Text style={styles.distanceText}>{distance}</Text>
                            </View>
                        </>}
                </View>
            </Animated.View>
        )
    }
};

function removeTags(txt) {
    let rex_ = /></ig;
    let txt_ = txt.replace(rex_, ">. <");
    let rex = /(<([^>]+)>)/ig;
    return (txt_.replace(rex, ""));
};
function rounder(v) {
    let x;
    if (v <= 9) // round x to an integer
        x = `${Math.round(v)} meters`;
    else if (v <= 99)     // round X to tenths
        x = `${Math.round(v / 10) * 10} meters`;
    else if (v <= 999) // round X to hundredths
        x = `${Math.round(v / 100) * 100} meters`;
    else // round X to thousandths
        x = `${Math.round(v / 1000)} kilometers`;

    return x;
};

LogBox.ignoreLogs([
    "Sending `tts-progress` with no listeners registered",
    "Sending `tts-start` with no listeners registered",
    "Sending `tts-finish` with no listeners registered",
    "Sending `tts-cancel` with no listeners registered",
])

