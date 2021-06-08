import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, dimensionAssert, height, width } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        backgroundColor: colors.WHITE,
        flex: 1,
        alignItems: 'center'
    },
    logo: {
        position: 'absolute',
        left: x(162.02),
        top: y(63.71),
        height: y(81),
        width: x(51.53),
    },
    signIn: {
        alignItems: 'center',
        position: 'absolute',
        top: y(164),
        width: width,
    },
    text1: {
        position: 'absolute',
        top: y(253),
        width: width,
        alignItems: 'center',
        paddingHorizontal: x(12.5),
    },
    sinUpText: {
        fontSize: y(30, true),
        lineHeight: y(36),
        textAlign: 'center',
        fontFamily: 'Gilroy-SemiBold',
    },
    regularText: {
        fontSize: y(15, true),
        lineHeight: y(20),
        textAlign: 'center',
        fontFamily: 'Gilroy-Medium',
    },
    button: {
        position: 'absolute',
        height: y(48),
        width: x(322)
    },
    logout: {
        top: y(480),
        position: 'absolute'
    },
    logoutText: {
        textDecorationLine: 'underline',
        color: colors.RED,
        fontSize: y(15, true),
        fontFamily: 'Gilroy-Bold',
    },
    image: {
        width: width,
        height: y(276.87),
        position: 'absolute',
        bottom: x(dimensionAssert() ? 10 : 25),
    },

});



