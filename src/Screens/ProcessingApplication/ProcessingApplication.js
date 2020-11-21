import React from 'react';
import styles from './styles';
import { Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen';
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { OnBoardingLogo, ManOnTable } from '../../Images/svgimages/vectors';
import Button from '../../Components/Button/Button';
import { x, y, OfflineNotice, colors, height, width, signOut } from '../../Functions/Functions';


export default class ProcessingApplication extends React.Component {
    constructor(props) {
        super();

        this.state = {};
    };
    componentDidMount() {
        SplashScreen.hide();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick)
    };
    handleBackButtonClick = () => {
        BackHandler.exitApp();
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice doNotCheckLocation={true} />
                <StatusBar backgroundColor={colors.WHITE} barStyle="dark-content" />
                <View style={styles.logo}>
                    <OnBoardingLogo color={colors.BLUE} />
                </View>
                <View style={styles.signIn}>
                    <Text style={styles.sinUpText}>{`We're processing your application`}</Text>
                </View>
                <View style={styles.text1}>
                    <Text style={styles.regularText}>{`We're hard at work processing your application for you to become a Perch driver. You can check for your progress online with the button below. We also send emails regarding any updates to your application.`}</Text>
                </View>
                <View style={[styles.button, { top: y(410) }]}>
                    <Button text={'View Application'} width={x(322)} height={y(48)} loading={this.state.loading}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    />
                </View>
                <TouchableOpacity style={styles.logout}
                    onPress={() => {
                        signOut.call(this, () => { });
                    }}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
                <View style={styles.image}>
                    <ManOnTable />
                </View>
            </View>
        );
    }
}