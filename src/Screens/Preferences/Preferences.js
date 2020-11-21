import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, Linking, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import Divider from '../../Components/Divider/Divider';
import { } from '../../Images/svgimages/vectors';
import AsyncStorage from '@react-native-community/async-storage';

export default class Preferences extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            speaker: null,
            speakerChoice: null,
        };
    };
    componentDidMount() {
        AsyncStorage.getItem('SPEAKER_CHOICE')
            .then((result) => {
                if (result)
                    this.setState({ speakerChoice: result });
                else
                    AsyncStorage.setItem('SPEAKER_CHOICE', 'ALL')
                        .then(() => {
                            this.setState({ speakerChoice: 'ALL' });
                        }).catch(error => { console.log(error.message) })
            })
            .catch(error => { console.log(error.message) });

        AsyncStorage.getItem('SPEAKER')
            .then(result => {
                if (result) {
                    this.setState({ speaker: result });
                }
                else
                    AsyncStorage.setItem('SPEAKER', 'TRUE')
                        .then(() => { this.setState({ speaker: 'TRUE' }); })
                        .catch(error => { console.log(error.message) })
            })
            .catch((error) => { console.log(error.message) });
    };
    render() {
        return (
            <View style={styles.container}>
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Preferences'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
                <Text style={[styles.title, { marginTop: y(28) }]}>Navigation alerts</Text>
                <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                <TouchableOpacity style={[styles.smallerSpaceView,]}
                    onPress={() => {
                        AsyncStorage.setItem('SPEAKER', 'TRUE')
                            .then(() => { this.setState({ speaker: 'TRUE' }) })
                            .catch(error => { console.log(error.message) });
                        AsyncStorage.setItem('SPEAKER_CHOICE', 'NAVIGATION_ONLY')
                            .then(() => { this.setState({ speakerChoice: 'NAVIGATION_ONLY' }) })
                            .catch(error => { console.log(error.message) });
                    }}>
                    <Text style={styles.text}>Navigation alerts only</Text>
                    {this.state.speakerChoice == 'NAVIGATION_ONLY' ?
                        <FontAwesome5 color={colors.BLUE} size={y(17)} name={'check-circle'} /> :
                        <></>}
                </TouchableOpacity>
                <View style={[styles.divider, {}]}><Divider height={0.5} width={x(323)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                <TouchableOpacity style={[styles.smallerSpaceView,]}
                    onPress={() => {
                        AsyncStorage.setItem('SPEAKER', 'TRUE')
                            .then(() => { this.setState({ speaker: 'TRUE' }) })
                            .catch(error => { console.log(error.message) });
                        AsyncStorage.setItem('SPEAKER_CHOICE', 'PICKUP_DROPOFF_ONLY')
                            .then(() => { this.setState({ speakerChoice: 'PICKUP_DROPOFF_ONLY' }) })
                            .catch(error => { console.log(error.message) });
                    }}>
                    <Text style={styles.text}>Pickup and dropoff alerts only</Text>
                    {this.state.speakerChoice == 'PICKUP_DROPOFF_ONLY' ?
                        <FontAwesome5 color={colors.BLUE} size={y(17)} name={'check-circle'} /> :
                        <></>}
                </TouchableOpacity>
                <View style={[styles.divider, {}]}><Divider height={0.5} width={x(323)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                <TouchableOpacity style={[styles.smallerSpaceView,]}
                    onPress={() => {
                        AsyncStorage.setItem('SPEAKER', 'TRUE')
                            .then(() => { this.setState({ speaker: 'TRUE' }) })
                            .catch(error => { console.log(error.message) });
                        AsyncStorage.setItem('SPEAKER_CHOICE', 'ALL')
                            .then(() => { this.setState({ speakerChoice: 'ALL' }) })
                            .catch(error => { console.log(error.message) });
                    }}>
                    <Text style={styles.text}>All alerts</Text>
                    {this.state.speakerChoice == 'ALL' && this.state.speaker == 'TRUE' ?
                        <FontAwesome5 color={colors.BLUE} size={y(17)} name={'check-circle'} /> :
                        <></>}
                </TouchableOpacity>
                <View style={[styles.divider, {}]}><Divider height={0.5} width={x(323)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                <TouchableOpacity style={[styles.smallerSpaceView,]}
                    onPress={() => {
                        AsyncStorage.setItem('SPEAKER', 'FALSE')
                            .then(() => { this.setState({ speaker: 'FALSE' }) })
                            .catch(error => { console.log(error.message) });
                        AsyncStorage.setItem('SPEAKER_CHOICE', 'ALL')
                            .then(() => { this.setState({ speakerChoice: 'ALL' }) })
                            .catch(error => { console.log(error.message) });
                    }}>
                    <Text style={styles.text}>No alerts</Text>
                    {this.state.speakerChoice == 'ALL' && this.state.speaker == 'FALSE' ?
                        <FontAwesome5 color={colors.BLUE} size={y(17)} name={'check-circle'} /> :
                        <></>}
                </TouchableOpacity>
                <View style={[styles.divider, {}]}><Divider height={0.5} width={x(323)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


            </View>
        )
    }
}
