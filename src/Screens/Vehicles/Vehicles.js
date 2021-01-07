import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, Alert, FlatList, } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width, openBrowser, CustomLayoutLinear } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import Divider from '../../Components/Divider/Divider';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';

import { ChooseVehicle, AddVehicle } from '../../Components/VehicleComponents/VehicleComponents';
import { ManOnCar } from '../../Images/svgimages/vectors';
import { MaterialIndicator } from "react-native-indicators";

export default class Vehicles extends React.Component {
    constructor(props) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            scrollY: new Animated.Value(0),
            result: null,
            selected: 0,//index of selected
            userDetails: null,
            vehicleLenght: null,
            keys: null,
        };
    };
    componentDidMount() {
        AsyncStorage.getItem('USER_DETAILS')
            .then((result) => {
                const userDetails = JSON.parse(result);
                this.setState({ userDetails: userDetails });

                database().ref(`vehicles/${userDetails.userID}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        const keys = Object.keys(snapshot.val());
                        if (snapshot.val().selected) {
                            let newKeys = [...keys];
                            newKeys.splice(keys.indexOf(snapshot.val().selected), 1);
                            newKeys.unshift(snapshot.val().selected);

                            this.setState({ selected: 0, result: snapshot.val(), userDetails: userDetails, vehicleLenght: keys.length - 1, keys: newKeys });
                        }
                        else//no selected tags
                            for (let i = 0; i < keys.length; i++) {

                                if (snapshot.val()[keys[i]].verifyStatus != 'PENDING') {
                                    let newKeys = [...keys];
                                    newKeys.splice(i, 1);
                                    newKeys.unshift(keys[i]);
                                    this.setState({ selected: 0, result: snapshot.val(), userDetails: userDetails, vehicleLenght: keys.length, keys: newKeys });
                                    break;
                                }
                            }
                    }
                });
            });
    };
    render() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Vehicles'} scrollY={this.state.scrollY} onPress={() => {
                    this.props.route.params.changeVehicle(this.state.result[this.state.keys[this.state.selected]])
                    this.props.navigation.goBack();
                }} />
                <Text style={[styles.title, { marginTop: y(28) }]}>{`List of vehicles ${this.state.vehicleLenght ? `(${this.state.vehicleLenght})` : ``}`}</Text>
                <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                {this.state.result ?
                    <View style={styles.list}>
                        <FlatList //new one is always make when h1 changes, so store it in state or somewhere it wont change
                            ref={ref => this.flatList = ref}
                            data={this.state.keys}
                            renderItem={({ item, index }) => {
                                const value = this.state.result[item];
                                if (item !== 'selected')
                                    return (<>
                                        <TouchableWithoutFeedback onPress={() => {
                                            if (value.verifyStatus == 'PENDING')
                                                Alert.alert(
                                                    'Pending Verification',
                                                    'We are currently reviewing this vehicle to verify if it meets our standards. As such, you cannot use this vehicle at this time',
                                                    [
                                                        {
                                                            text: 'OK',
                                                            style: 'cancel'
                                                        }
                                                    ],
                                                    { cancelable: false })
                                            else {
                                                this.setState({ selected: index })
                                                database().ref(`vehicles/${this.state.userDetails.userID}`).update({ selected: item })
                                            }
                                        }}>
                                            <View style={styles.listView}>
                                                {this.state.selected == index ?
                                                    <Feather name={'check-circle'} color={colors.BLUE} size={y(18)} style={styles.icon} /> :
                                                    <></>}
                                                <ChooseVehicle vehicle={value} />
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </>)
                            }}
                            keyExtractor={item => JSON.stringify(item)}
                        />
                    </View> :
                    <View style={styles.loader}>
                        <MaterialIndicator size={y(100)} color={colors.BLUE} />
                    </View>
                }
                <View style={[styles.divider, { marginTop: y(5) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                <View style={styles.addVehicle}>
                    <AddVehicle onPress={() => {
                        openBrowser(`https://perchrides.com/s/db/ddash`);
                    }} />
                </View>

                <View style={styles.manOnCar}>
                    <ManOnCar />
                </View>

            </View>
        )
    }
}

