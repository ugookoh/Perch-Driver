import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        backgroundColor: colors.WHITE,
        flex: 1,
    },
    maps: {
        width: width,
    },
    zoomIcon: {
        position: 'absolute',
        backgroundColor: colors.WHITE,
        height: y(dimensionAssert() ? 55 : 45),
        width: y(dimensionAssert() ? 55 : 45),
        borderRadius: y(60),
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 13.84,

        elevation: 1,

        justifyContent: 'center',
        alignItems: 'center',
    },
    lowerContainer: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: colors.WHITE,
        width: width,
        top: -y(10),
        // position:'absolute',
        // bottom:0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 13.84,
        elevation: 7,
        alignItems: 'center',
        paddingBottom: y(200),
    },
    bubble: {
        backgroundColor: colors.BLUE,
        borderRadius: y(72),

        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.30,
        shadowRadius: 8,

        elevation: 2,
        zIndex: 2,
        height: y(dimensionAssert() ? 80 : 70),
        width: y(dimensionAssert() ? 80 : 70),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: - y(dimensionAssert() ? 90 : 80) / 2,
        right: x(24),
    },
    bubbleText: {
        color: colors.WHITE,
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(14, true),
        maxHeight: x(60),
    },
    spaceView: {
        width: x(343),
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    cancelTrip: {
        width: x(343),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.RED,
        height: y(dimensionAssert() ? 50 : 55),
        borderRadius: 8,
    },
    text: {
        fontSize: y(15, true),
        fontFamily: 'Gilroy-Regular',
    },
    textAddress: {
        fontSize: y(15, true),
        fontFamily: 'Gilroy-Medium',
        width: x(190),
        textAlign: 'right'
    },
    title: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(20, true),
        color: colors.BLUE_FONT,
    },
    divider: {
        alignItems: 'center',
        opacity: 0.25,
    },
    total: {
        fontSize: y(21, true),
        fontFamily: 'Gilroy-SemiBold',
    },
    cash: {
        color: colors.GREEN,
        fontFamily: 'Gilroy-Bold',
        fontSize: y(21, true),
    },
    button: {
        height: y(dimensionAssert() ? 50 : 55),
        width: x(150),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: colors.WHITE,
        fontSize: y(15, true),
        fontFamily: 'Gilroy-ExtraBold',
    },
    help: {
        width: x(343),
        backgroundColor: colors.WHITE,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: y(20),
        marginBottom: y(60)
    },
    contactUsContainer: {
        flexDirection: 'row',
        zIndex: 2,
        width: x(313),
        justifyContent: 'space-between',
    },
    tripTitle: {
        fontFamily: 'Gilroy-ExtraBold',
        color: colors.BLACK,
        fontSize: y(20, true),
        zIndex: 2,
    },
    firstLayer: {
        fontFamily: 'Gilroy-Medium',
        color: colors.BLACK,

        fontSize: y(15, true),
        zIndex: 2,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'flex-end'

    },
    ratingText: {
        fontSize: y(10, true),
        fontFamily: 'Gilroy-Bold',
        color: colors.GOLD,
        marginRight: x(5),

    },
});