import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        backgroundColor: colors.WHITE,
        flex: 1,
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
        top: y(223),
        width: width,
        alignItems: 'center',
    },
    sinUpText: {
        fontSize: y(30),
        lineHeight: y(36),
        textAlign: 'center',
        fontFamily: 'Gilroy-SemiBold',
    },
    regularText: {
        fontSize: y(15),
        lineHeight: y(25),
        textAlign: 'center',
        fontFamily: 'Gilroy-Medium',
    },
    searchSection: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(149,149,149,0.25)',
        flexDirection: 'row',
        height: y(48),
        width: x(322),
    },
    envelope: {
        height: y(9.93),
        width: x(13.24),
        position: 'relative',
        top: y(13),
        left: (20.7 / 322) * x(322),
    },
    padlock: {
        height: y(14.87),
        width: x(11.15),
        position: 'relative',
        top: y(13),
        left: (20.7 / 322) * x(322),
    },
    textInput: {
        color: '#424242',
        position: 'relative',
        left: x(25),
        paddingLeft: x(14),
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
        width: x(270),

    },
    error: {
        paddingHorizontal: x(12),
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(10),
        color: colors.RED,
        textAlign: 'center'
    },
    messageText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
    },
    messageView: {
        position: 'absolute',
        left: x(0),
        width: width,
        alignItems: 'center'
    },
    button: {
        top: y(470),
        left: x(27),
        position: 'absolute',
        width: x(322),
        height: y(48),
    },
    or: {
        top: y(598),
        alignSelf: 'center',
        fontFamily: 'Gilroy-Bold',
        fontSize: y(23),
        position: 'absolute',
    },
});



