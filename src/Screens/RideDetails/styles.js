import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
const MIN_HEADER_HEIGHT = y(96.5);

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    header: {
        zIndex: 3,
    },
    body: {
        width: width,
    },
    spaceout: {
        width: x(313),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rating: {
        position: 'absolute',
        width: width,
        height: height - MIN_HEADER_HEIGHT,
        top: MIN_HEADER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainBackground: {
        position: 'absolute',
        //zIndex: 1,
        backgroundColor: colors.WHITE,
        height: height,
        width: width
    },
    mapGroup: {
        height: y(dimensionAssert() ? 300 : 280),
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
        marginBottom: 20,

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
        marginBottom: 20,
        alignItems: 'center',
    },
    contactUsContainer: {
        flexDirection: 'row',
        zIndex: 2,
        width: x(313),
        justifyContent: 'space-between',
    },
    travel: {
        flexDirection: 'row',
        position: 'absolute',
        left: x(16),
    },
    calendar: {
        flexDirection: 'row',
        position: 'absolute',
        top: y(dimensionAssert() ? 17 : 22),
        right: x(23.4)
    },
    LtoD_Divider: {
        left: x(dimensionAssert() ? 20 : 21.5),
        top: y(dimensionAssert() ? 69 : 71),
        position: 'absolute'
    },
    maps: {
        height: y(123),
        width: x(312),
        position: 'absolute',
        bottom: x(15),
        left: x(16),
    },
    tripContainer: {
        zIndex: 1,
        width: width,
        alignItems: 'center',
        position: 'absolute',
        //backgroundColor:colors.WHITE,
        //top:y(0),
    },
    listofPerchers: {
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
        marginBottom: 20,
        alignItems: 'center',

    },
    background: {
        backgroundColor: colors.WHITE,
        width: width,
        height: 1150,
        position: 'absolute',
        top: y(20),
    },


    tripTitle: {
        fontFamily: 'Gilroy-ExtraBold',
        color: colors.BLACK,
        fontSize: y(20),
        zIndex: 2,
    },
    firstLayer: {
        fontFamily: 'Gilroy-Medium',
        color: colors.BLACK,

        fontSize: y(15),
        zIndex: 2,
    },
    divider: {
        zIndex: 2,
        width: x(343),
        alignItems: 'center',
        opacity: 0.25,

    },
    total: {
        fontFamily: 'Gilroy-ExtraBold',
        color: colors.BLACK,
        fontSize: y(22),
        zIndex: 2,
        color: colors.BLUE
    },
    payment: {
        zIndex: 2,
        width: x(313),
    },
    cardNumber: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
        bottom: -x(15)
    },
    visa: {
        height: y(33.13),
        width: x(42.2),
        bottom: -x(8),
        left: -x(12),
    },
    visa_: {
        height: y(33.13),
        width: x(25.2),
        bottom: -x(8),
        left: -x(5),
    },
    dropdown: {
        width: x(40),
        height: x(40),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        alignItems: 'center',
        width: x(343),
    },
    listSpace: {
        justifyContent: 'center',
        width: x(343),
        flexDirection: 'row',
    },
    zoomIcon: {
        //position: 'absolute',
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
    goUp: {
        position: 'absolute',
        right: x(10),
        top: y(dimensionAssert() ? 690 : 720),
        zIndex: 0,
        elevation: 0,
    },
});