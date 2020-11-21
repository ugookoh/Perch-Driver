import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
import Divider from '../Divider/Divider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
const polyline = require('@mapbox/polyline');// for decoding polylines
import { polylineLenght } from '../../Functions/Functions';
export default class HistoryComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            details: null,
        };
    };
    componentDidMount() {
        const data = this.props.data;

        if (data.trips) {
            let passNo = 0;
            let distance = 0;

            for (let key in data.trips) {
                passNo += data.trips[key].details.tripDetails.seatNumber;
                distance += (polylineLenght(JSON.parse(data.trips[key].details.tripDetails.leg))*data.trips[key].details.tripDetails.seatNumber);//seat no * distance
            };
            //distance = distance * passNo;
            distance > 100 ?
                distance = `${(distance / 1000).toFixed(1)} KM` :
                distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;
            this.setState({
                details: {
                    distance: distance.toLowerCase(),
                    passNo: `${passNo} ${passNo == 1 ? 'person' : 'people'}`,
                    total: '$213.00',
                },
                loaded: true,
            });
        } else
            this.setState({
                details: {
                    distance: '0.0 m',
                    passNo: '0 people',
                    total: '$0.00',
                },
                loaded: true,
            });
    };
    render() {
        const data = this.props.data;

        return (
            <TouchableOpacity style={styles.container} onPress={() => {
                if (this.state.details)
                    this.props.navigation.navigate('RideDetails', {
                        userDetails: this.props.userDetails,
                        data: data,
                        date: this.props.date,
                        details: this.state.details,
                        mainAppend:this.props.mainAppend,
                    });
            }}>
                <View style={[styles.fromTo]}>
                    <Text style={[styles.fromToText]}>FROM</Text>
                    <Ionicons name={'caret-down'} size={y(12)} style={{ marginVertical: x(3) }} />
                    <Text style={[styles.fromToText]}>TO</Text>
                </View>
                <View style={styles.address}>
                    <Text style={[styles.addressText, { marginVertical: y(dimensionAssert() ? 1 : 5) }]}>{data.locationAddress}</Text>
                    <View style={[styles.divider, {}]}><Divider height={0.5} width={x(214)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <Text style={[styles.addressText, { marginVertical: y(dimensionAssert() ? 1 : 5) }]}>{data.destinationAddress}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={[styles.text]}>{this.props.date}</Text>
                    <ShimmerPlaceHolder autoRun={true} visible={this.state.loaded} style={{ width: x(40), height: y(11), marginTop: y(1) }}>
                        <Text style={[styles.text]}>{this.state.details ? this.state.details.distance : ''}</Text>
                    </ShimmerPlaceHolder>

                    <ShimmerPlaceHolder autoRun={true} visible={this.state.loaded} style={{ width: x(60), height: y(11), marginTop: y(1) }}>
                        <Text style={[styles.text]}>{this.state.details ? this.state.details.passNo : ''}</Text>
                    </ShimmerPlaceHolder>

                    <ShimmerPlaceHolder autoRun={true} visible={this.state.loaded} style={{ width: x(50), height: y(17), marginTop: y(1) }} colorShimmer={['#03cc00', '#82ff80', '#03cc00']}>
                        <Text style={[styles.cash]}>{this.state.details ? this.state.details.total : ''}</Text>
                    </ShimmerPlaceHolder>
                </View>
            </TouchableOpacity>
        )
    }
}

