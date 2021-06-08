import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        borderRadius: 10,
        width: x(343),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,

        elevation: 4,
        marginVertical: y(5),
        alignItems: 'center',
    },
    fromTo: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: x(5),
        alignSelf: 'stretch',
    },
    fromToText: {
        fontFamily: 'Gilroy-Bold',
        color: colors.BLUE,
        fontSize: y(12, true),
    },
    divider: {
        alignItems: 'center',
        opacity: 0.25,
    },
    address: {
        //borderRightWidth: 0.5,
        borderColor: '#707070',
    },
    addressText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(14, true),
        color: colors.BLUE_FONT,
        width: x(210),
        paddingLeft: x(5),
    },
    details: {
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 0.5,
        borderColor: '#707070',
        paddingHorizontal: x(10),
        paddingVertical: y(dimensionAssert() ? 2 : 5),
        alignSelf: 'stretch',
    },
    text: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(13, true),
        color: colors.BLUE_FONT,
    },
    cash: {
        color: colors.GREEN,
        fontFamily: 'Gilroy-Bold',
        fontSize: y(17, true),
        marginTop: y(dimensionAssert() ? 1 : 4),
    },
});