import React from 'react';
import styles from './styles';
import { Text, View, StatusBar, Dimensions, TouchableOpacity, KeyboardAvoidingView, SafeAreaView, Keyboard, Platform, Animated, Alert } from 'react-native';
import Header from '../../Components/Header/Header';
import Button from '../../Components/Button/Button';
import VerifyInputForm from '../../Components/VerifyInputForm/VerifyInputForm';
import OnScreenKeyboard from '../../Components/OnScreenKeyboard/OnScreenKeyboard';
import { handleLogin, OfflineNotice, x, y, colors, height, width, dimensionAssert, makeid } from '../../Functions/Functions';
import Divider from '../../Components/Divider/Divider';

/**
 * WE COME HERE WHEN THE USER OPENS THE APP AND HAS LOGGED IN BUT HAS NOT CONFIMED HIS EMAIL/PHONE NUMBER 
 * SO WE SHOW THIS SCREEN CAUSE THE NUMBER MUST AT LEAST BE VERIFIED  AND WE HAVE A SIGN OUT SCREEN AT THE BOTTOM TO GO BACK HOME IS YOU DONT WANT 
 * TO KEEP USING THAT ACCOUNT
 */
export default class VerifyDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.route.params.type,
            one_: '',
            two_: '',
            three_: '',
            four_: '',
            string: '',
            loading: false,
            scrollY: new Animated.Value(0),
        }

        this.deleteFunction = this.deleteFunction.bind(this);
        this.updateFunction = this.updateFunction.bind(this);
    }

    deleteFunction() {
        if (this.state.string.length === 0)
            return;
        else {
            const length = this.state.string.length;
            switch (length) {
                case 1: {
                    this.setState({ one_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 2: {
                    this.setState({ two_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 3: {
                    this.setState({ three_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 4: {
                    this.setState({ four_: '', string: this.state.string.substring(0, length - 1) });
                } break;
            }
        }
    }
    updateFunction(data) {
        if (this.state.string.length === 4)
            return;
        else {
            const length = this.state.string.length;
            switch (length) {
                case 0: {
                    this.setState({ one_: data, string: (this.state.string + data) });
                } break;
                case 1: {
                    this.setState({ two_: data, string: (this.state.string + data) });
                } break;
                case 2: {
                    this.setState({ three_: data, string: (this.state.string + data) });
                } break;
                case 3: {
                    this.setState({ four_: data, string: (this.state.string + data) });
                } break;
            }
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.header}>
                    <Header name={`Verify ${this.state.type}`} scrollY={this.state.scrollY} onPress={() => {
                        if (this.state.type !== 'Main')
                            this.props.navigation.goBack()
                    }} />
                </View>

                <View style={styles.text1}>
                    <Text style={[styles.regularText, { fontSize: y(17) }]}>{`Enter the 4 digit verification code\n sent to your device.`}</Text>
                </View>
                <View style={styles.form}>
                    <VerifyInputForm text={this.state.one_} />
                    <VerifyInputForm text={this.state.two_} />
                    <VerifyInputForm text={this.state.three_} />
                    <VerifyInputForm text={this.state.four_} />
                </View>
                <OnScreenKeyboard top={y(371)} left={x(56)} deleteFunction={this.deleteFunction} updateFunction={this.updateFunction} />
                <View style={styles.button}>
                    <Button text={'Verify'} height={y(48)} width={x(322)} onPress={() => {
                        Alert.alert('Verified',
                            `Your ${this.state.type} has been successfully verified`,
                            [
                                {
                                    text: 'Ok',
                                    onPress: () => {
                                        if (this.state.type !== 'Main') {  //verify and change all the userdetails and then work on updating state for the profile screen at the goback()
                                            this.props.navigation.goBack()
                                        }
                                        else
                                            this.props.navigation.navigate('Main')
                                    },
                                    style: 'cancel'
                                },
                            ],
                            { cancelable: false }
                        )
                    }} loading={this.state.loading} />
                </View>
                <View style={[styles.messageView, { top: y(729) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Didn't recieve a code?</Text></View>
                <View style={[styles.messageView, { top: y(767) }]}>
                    <View style={{ flexDirection: 'row', justifyContent: this.state.type == 'Main' ? 'space-between' : 'center', width: x(150) }}>
                        <TouchableOpacity ><Text style={[styles.messageText, { color: colors.BLUE, fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Resend</Text></TouchableOpacity>
                        {
                            this.state.type == 'Main' ?
                                <TouchableOpacity
                                    onPress={() => {
                                        //signOut.call(this);
                                    }}><Text style={[styles.messageText, { color: colors.RED, fontFamily: 'Gilroy-SemiBold', }]}>Sign Out</Text>
                                </TouchableOpacity> :
                                <></>
                        }
                    </View>
                </View>
            </View>
        );
    }
};
