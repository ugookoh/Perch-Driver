import React, { Component } from 'react';
import styles from './styles';
import { Text, View, Dimensions, StatusBar, Platform, TouchableOpacity, LogBox } from 'react-native';
import Swiper from 'react-native-swiper';
import SplashScreen from 'react-native-splash-screen';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import { OnBoardingLogo, OnBoardingVector1, OnBoardingVector2, OnBoardingVector3, } from '../../Images/svgimages/vectors';
const [CREAM, BROWN_LIGHT, GREY_DARKER] = [`#FDFCF7`, `#BDA76F`, `#DFE3DF`];


export default class OnBoarding extends React.Component {
    constructor() {
        super();
        this.state = {
            index: 0,
        }
    }
    componentDidMount() {
        SplashScreen.hide();
    };

    render() {
        let statusbar = <></>;
        let activeDotColor= `#3E3D38`;
        // switch (this.state.index) {
        //     case 0: { activeDotColor = `#3E3D38` } break;
        //     case 1: { activeDotColor = `#725919` } break;
        //     case 2: { activeDotColor = `#424D4C` } break;

        // }
        if (Platform.OS == 'android')
            statusbar = <StatusBar barStyle={'light-content'} backgroundColor={'#000000'} />;
        else if (Platform.OS == 'ios')
            statusbar = <StatusBar barStyle={'dark-content'} />
        return (
            <>
                {statusbar}
                <Swiper style={styles.wrapper} showsButtons={true} loop={false} onIndexChanged={(index) => {
                    this.setState({ index: index })
                }}
                    activeDotColor={activeDotColor}
                    activeDot={<View style={{ backgroundColor: activeDotColor, width: 12, height: 12, borderRadius: 12, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                    showsButtons={false}

                >
                    <View style={[styles.slide, { backgroundColor: CREAM }]}>
                            <View style={[styles.oB1,]}><OnBoardingVector1 /></View>
                        <Text style={[styles.title, { marginTop: y(20) }]}>
                            {`No schedule, no commitment`}
                        </Text>
                        <Text style={[styles.subtext, { marginTop: y(dimensionAssert() ? 10 : 10) }]}>
                            {`Earn anytime driving anywhere with Perch . With our advanced routing algorithm, you only get paired with people going in the same direction as you, this way you earn as you go about your daily activities.`}
                        </Text>
                    </View>

                    <View style={[styles.slide, { backgroundColor: CREAM }]}>
                            <View style={[styles.oB2,]}><OnBoardingVector2 /></View>
                        <Text style={[styles.title, { marginTop: y(23) }]}>
                            {`Earn for every passenger and for every kilometre you take them.`}
                        </Text>
                        <Text style={[styles.subtext, { marginTop: y(dimensionAssert() ? 10 : 10) }]}>
                            {`Since you are already have a destination for yourself, for anyone who shares your vehicle, they pay based on the kilometres you drive them. This means that the more people you carry and the more kilometres you carry them, the more you earn.`}
                        </Text>
                    </View>
                    <View style={[styles.slide, { backgroundColor: GREY_DARKER }]}>
                            <View style={[styles.oB3,]}><OnBoardingVector3 /></View>
                        <Text style={[styles.title, { marginTop: y(-20) }]}>
                            {`Join the party now`}
                        </Text>
                        <Text style={[styles.subtext, { marginTop: y(dimensionAssert() ? 10 : 10) }]}>
                            {`Earn as you go about your day, meet people in your vicinity and reduce the carbon emission by sharing your ride today`}
                        </Text>
                        <TouchableOpacity onPress={() => { this.props.navigation.navigate('SignIn') }} style={[styles.button, { marginTop: y(30) }]}>
                            <Text style={styles.buttonText}>Get started</Text>
                        </TouchableOpacity>
                    </View>
                </Swiper>
            </>
        )
    }
};
LogBox.ignoreLogs([
    'No stops in gradient'
]);