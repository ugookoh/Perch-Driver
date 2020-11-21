import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    slide: {
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
        width: width,
    },
    logo: {
        height: y(65.42),
        width: x(41.61),
        marginTop: y(50),
        zIndex: 1,
        top: x(40),
    },
    oB1: {
        width: width,
        height: y(481.5),
        marginTop: y(40),
        //position: 'absolute',
        //bottom: 0,
    },
    oB2: {
        width: dimensionAssert() ? width + x(50) : width,
        height: y(dimensionAssert() ? 534 : 425.06),
        marginTop: y(dimensionAssert() ? -20 : 94),
    },
    oB3: {
        marginTop: y(-3),
        width: x(dimensionAssert() ? 520 : 484.12),
        height: y(dimensionAssert() ? 550 : 517.84),
    },
    title: {
        fontSize: y(22),
        fontFamily: 'Gilroy-SemiBold',
        textAlign: 'center',
        maxWidth: x(343),
    },
    subtext: {
        fontSize: y(13),
        fontFamily: 'Gilroy-Regular',
        textAlign: 'center',
        maxWidth: x(343),
        lineHeight: y(20),
    },
    box: {
        height: y(350),
        width: width,
        alignItems: 'center',

    },
    button: {
        width: x(343),
        height: y(48),
        backgroundColor: '#658280',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: y(15),
        fontFamily: 'Gilroy-Bold',
    },

});


