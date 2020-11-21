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
        height: y(425),
    },
    menu: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: y(57),
        left: x(16),
        height: x(52),
        width: x(52),
        backgroundColor: colors.BLUE,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 2,
        zIndex: 2
    },
    lowerSection: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.30,
        shadowRadius: 8,

        elevation: 3,
        zIndex: 3,

        width: width,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: 'center',
        paddingBottom: y(150),
    },
    title: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(20),
        color: colors.BLUE_FONT,
        width: x(343),
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
        width: x(250),
        textAlign: 'right',
    },
    semiBold: {
        fontFamily: 'Gilroy-SemiBold',
        width: x(343),
    },
    spaceViewLower: {
        flexDirection: 'row',
        width: x(313),
        justifyContent: 'space-between',
        //alignItems: 'center',
    },
    needHelp: {
        fontSize: y(13),
        fontFamily: 'Gilroy-ExtraBold',
        textDecorationLine: 'underline',
    },
    number: {
        color: colors.BLUE_FONT,
        fontSize: y(17),
        fontFamily: 'Gilroy-ExtraBold',
    },
    borderTO: {
        borderColor: 'rgba(112, 112, 112, 0.25)',
        borderRadius: 8,
        height: y(30),
        width: x(46),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
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
        top: y(63),
        borderRadius: 4,
    },
    statusText: {
        color: colors.WHITE,
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(15),
        paddingVertical: x(4),
        paddingHorizontal: x(8),
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
    container_: {
        height: height,
        width: width,
        backgroundColor: colors.GREY_OPAQUE(0.6),
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        elevation: 15,
    },
    passengerContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: x(10),
        //top: -y(20),
        height: y(dimensionAssert() ? 210 : 180),
        width: x(225),
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 2,
    },
    counterText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(18),
        textAlign: 'center',
    },
    counterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignItems: 'center'
    },
    seatNumberView: {
        height: y(40),
        width: y(40),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        borderColor: 'rgba(180, 179, 179, 0.50)',
        borderWidth: 1,
    },
    seatNumberText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(20),
    },
    doneButton: {
        width: '100%',
        height: y(50),
        backgroundColor: colors.BLUE,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneText: {
        color: colors.WHITE,
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
    },
    plus_minus: {
        //backgroundColor:'red',
        height: y(50),
        width: y(50),
        justifyContent: 'center',
        alignItems: 'center',
    },


    pickerView: {
        position: 'absolute',
        zIndex: 6,
        elevation: 16,
        backgroundColor: '#DBD4D4'
    },
    pickerChoice: {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        flexDirection: 'row-reverse',
        borderColor: '#B2ACAC'
    },
    picker_: {
        width: width / 2,
        height: y(250),
    },
    iosSpinnerView: {
        backgroundColor: '#403D3D',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        top: y(130),
        zIndex: 8,
        position:'absolute',
    },
    iosSpinner: {
        //position:'absolute',
        paddingHorizontal: x(40),
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: x(320),
        height: y(40),
        backgroundColor: '#403D3D',
        top: y(40),
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
});