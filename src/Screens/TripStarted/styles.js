import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        backgroundColor: colors.WHITE,
        flex: 1,
        alignItems: 'center',
    },
    maps: {
        width: width,
        height: y(dimensionAssert() ? 490 : 495),
    },
    lowerSection: {
        //height:y(1290),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.30,
        shadowRadius: 8,

        elevation: 2,
        zIndex: 2,

        width: width,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: 'center',
        paddingBottom: y(70),
    },
    title: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(20),
        color: colors.BLUE_FONT,
    },
    divider: {
        alignItems: 'center',
        opacity: 0.25,
    },
    spaceView: {
        width: x(343),
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    text: {
        fontSize: y(15),
        fontFamily: 'Gilroy-Regular',
    },
    textAddress: {
        fontSize: y(15),
        fontFamily: 'Gilroy-Medium',
    },
    semiBold: {
        fontFamily: 'Gilroy-SemiBold',
        width: x(343),
    },

    tab: {
        backgroundColor: colors.GREY_TAB,
        borderRadius: 9,
        height: y(dimensionAssert() ? 1 : 4),
        width: x(44),
        position: 'absolute',
        top: y(13),
    },
    status: {
        backgroundColor: colors.BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        elevation: 1,
        position: 'absolute',
        top: y(dimensionAssert() ? 35 : 53),
        borderRadius: 4,
    },
    statusText: {
        color: colors.WHITE,
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(15),
        paddingVertical: x(4),
        paddingHorizontal: x(8),
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
        fontSize: y(14),
        maxHeight: x(60),
    },
    cont1: {
        width: width,
        borderWidth: 1,
        borderColor: colors.GREY_BACKGROUND,
        overflow: 'hidden',
        alignItems: 'center',
        backgroundColor: colors.GREY_OPAQUE(0.5),
    },
    button: {
        zIndex: 4,
        elevation: 14,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FFFFFF',
        width: width,
        height: y(100),
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,

    },
    buttonCont: {
        flexDirection: 'row',
        width: x(343),
        justifyContent: 'space-between',
    },
    buttonView: {
        width: x(158),
        height: y(dimensionAssert() ? 52 : 48),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 4,
            height: 10,
        },
        shadowOpacity: 0.30,
        shadowRadius: 12,

        elevation: 2,
        zIndex: 2,
    },
    buttonText: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(15),
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
        flexDirection: 'row',

    },
    noResultView: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: x(10),
    },
    noResultText: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(20),
        color: colors.BLUE_FONT,
        textAlign: 'center',
    },
    recenterContainer: {
        width: x(110),
        position: 'absolute',
        backgroundColor: colors.WHITE,
        height: y(dimensionAssert() ? 45 : 35),

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

        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    recenter: {
        color: colors.BLUE_FONT,
        fontFamily: 'Gilroy-Bold',
        fontSize: y(12),
    },
    speaker: {
        height: y(20),
        width: y(20),
    },
    calloutView: {
        width: x(140),
        paddingVertical: y(2),
        paddingHorizontal: x(3),
    },
    calloutText: {
        fontFamily: 'Gilroy-SemiBold',
        color: colors.BLUE_FONT,
    },
    calloutText_: {
        fontFamily: 'Gilroy-Regular',
        color: colors.BLUE_FONT,
    },
});
