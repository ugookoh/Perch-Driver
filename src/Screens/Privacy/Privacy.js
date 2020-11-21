import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, Linking, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import AndroidOpenSettings from 'react-native-android-open-settings';
import Icon from 'react-native-vector-icons/Ionicons';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import Divider from '../../Components/Divider/Divider';
import {Vault  } from '../../Images/svgimages/vectors';

export default class Privacy extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
        };
    }
    render() {
        return (
            <View style={styles.container}>
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Privacy'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />

                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'ios')
                            Linking.openURL('app-settings:');
                        else if (Platform.OS === 'android')
                            AndroidOpenSettings.appNotificationSettings()

                    }}>
                    <View style={styles.option}>
                        <Text style={styles.text}>Notifications</Text>

                        <Icon name={'ios-chevron-forward'} size={y(18)} />
                    </View>
                </TouchableOpacity>
                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'ios')
                            Linking.openURL('app-settings:');
                        else if (Platform.OS === 'android')
                            AndroidOpenSettings.locationSourceSettings()

                    }}>
                    <View style={styles.option}>
                        <Text style={styles.text}>Location</Text>

                        <Icon name={'ios-chevron-forward'} size={y(18)} />
                    </View>
                </TouchableOpacity>
                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                <TouchableOpacity
                    onPress={() => {
                        //openBrowser('https://www.google.com')
                    }}>
                    <View style={styles.option}>
                        <Text style={styles.delete}>Delete Account</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.v}>
                    <Vault />
                </View>
            </View>
        )
    }
}
