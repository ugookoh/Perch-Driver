import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    cont: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        width: x(357),


        paddingVertical: y(10),
        marginVertical: y(5),//  <-
        justifyContent: 'space-around',
        borderRadius: 10,
    },
    name: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15, true),
    },
    button1: {
        width: x(81),
        height: y(dimensionAssert() ? 50 : 45),
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 13.84,

        elevation: 4,
    },
    buttonText: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(14, true),
    },
    buttonCont1: {
        width: x(170),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailCont1: {
        width: x(150),
    },
    riderDetails: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(13, true),
    },
    cash: {
        color: colors.GREEN,
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(dimensionAssert() ? 20 : 17, true),
    },
    timer1: {
        width: x(170),
        height: y(2),
        borderRadius: 10,
        backgroundColor: colors.GREY_OPAQUE(0.7),
        flexDirection: 'row',
    },
    lowerwidth: {
        width: x(170),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roundIcon: {
        height: y(dimensionAssert() ? 60 : 50),
        width: y(dimensionAssert() ? 60 : 50),
        borderRadius: y(dimensionAssert() ? 60 : 50),

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: colors.BLUE,
        fontFamily: 'Gilroy-Bold',
        fontSize: y(dimensionAssert() ? 11 : 12, true),
        textAlign: 'center',
    },
    distanceLeft: {
        backgroundColor: colors.WHITE,
        paddingVertical: y(dimensionAssert() ? 2 : 5),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    distanceLeftText: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(13, true),
        color: colors.BLUE,
    },
});