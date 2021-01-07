import React from 'react';
import styles from './styles';
import { Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen';
import PushNotification from 'react-native-push-notification';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width, openBrowser } from '../../Functions/Functions'
import { OnBoardingLogo, SignInIcons } from '../../Images/svgimages/vectors';
import Button from '../../Components/Button/Button';


export default class SignIn extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            email: '',
            password: '',
            errorMessage: '',
            loading: false,
            connection_Status: ""
        }
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
    }

    componentDidMount() {
        SplashScreen.hide();
        permissionLocation()
            .catch(error => { console.log(error.message) });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.keyboardDidShowListener = Keyboard.addListener(('keyboardDidShow'), this._keyboardDidShow);
    }
    _keyboardDidShow(e) {
        if (Platform.OS === 'android') {
            AsyncStorage.getItem('ANDROID_KEYBOARD_HEIGHT')
                .then((value) => {
                    if (value == null) {
                        AsyncStorage.setItem('ANDROID_KEYBOARD_HEIGHT', JSON.stringify(e.endCoordinates.height))
                            .catch(error => { console.log(error.message) });
                    }
                })
                .catch((err) => { console.log(err.message) })
        }
    };
    handleBackButtonClick = () => {
        BackHandler.exitApp();
    };
    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };



    render() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container} >
                    <OfflineNotice doNotCheckLocation={true} />
                    <Notifications />
                    <StatusBar backgroundColor={colors.WHITE} barStyle="dark-content" />
                    <View style={styles.logo}>
                        <OnBoardingLogo color={colors.BLUE} />
                    </View>
                    <View style={styles.signIn}>
                        <Text style={styles.sinUpText}>Sign In</Text>
                    </View>
                    <View style={styles.text1}>
                        <Text style={styles.regularText}>{`Log into your driver account to\ncontinue`}</Text>
                    </View>

                    <View style={[styles.searchSection, { position: 'absolute', top: y(285), left: x(27) }]}>
                        <View style={styles.envelope}><SignInIcons margin={20.7} icon={'envelope'} /></View>
                        <TextInput
                            ref={(input) => { this.firstTextInput = input; }}
                            spellCheck={false}
                            keyboardType={'email-address'}
                            style={styles.textInput}
                            autoCapitalize={'none'}
                            placeholder={'Email Address'}
                            onChangeText={value => { this.setState({ email: value }) }}
                            value={this.state.email}
                            placeholderTextColor={colors.GREY_OPAQUE(0.9)}
                            onSubmitEditing={() => {
                                if (this.state.password == '')
                                    this.secondTextInput.focus();
                                else
                                    Keyboard.dismiss();

                            }}
                        />
                    </View>
                    <View style={[styles.searchSection, { position: 'absolute', top: y(348), left: x(27) }]}>
                        <View style={styles.padlock}><SignInIcons icon={'padlock'} /></View>
                        <TextInput
                            ref={(input) => { this.secondTextInput = input; }}
                            autoCapitalize={'none'}
                            spellCheck={false}
                            style={styles.textInput}
                            placeholder={'Password'}
                            onChangeText={value => { this.setState({ password: value }) }}
                            value={this.state.password}
                            placeholderTextColor={colors.GREY_OPAQUE(0.9)}
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                            }}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={[styles.messageView, { top: y(StatusBar.currentHeight ? 408 : 412) }]}><Text style={[styles.error,]}>{this.state.errorMessage}</Text></View>
                    <View style={styles.button}>
                        <Button text={'Log In'} width={x(322)} height={y(48)} loading={this.state.loading}
                            onPress={() => {
                                Keyboard.dismiss();
                                if (this.state.email == '')
                                    this.setState({ errorMessage: 'Email cannot be left empty' });
                                else if (this.state.password == '')
                                    this.setState({ errorMessage: 'Password cannot be left empty' });
                                else {
                                    this.setState({ loading: true })
                                    handleLogin.call(this);
                                }
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.messageView, { top: y(535) }]}
                        onPress={() => { openBrowser(`https://perchrides.com/s/auth/d_si_su`); }}
                    >
                        <Text style={[styles.messageText, { color: colors.BLACK }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <Text style={styles.or}>OR</Text>
                    <View style={[styles.messageView, { top: y(667) }]}><Text style={[styles.messageText, { color: colors.BLACK, opacity: 0.5 }]}>Don't have a driver account?</Text></View>
                    <View style={[styles.button, { top: y(705) }]}>
                        <Button text={'Create a driver account'} width={x(322)} height={y(48)}
                            onPress={() => {
                                openBrowser(`https://perchrides.com/s/auth/d_si_su`);
                                Keyboard.dismiss();

                            }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}


const CustomLayoutLinear = {
    duration: 300,
    create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.linear,
    },
    delete: {
        duration: 50,
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
};





