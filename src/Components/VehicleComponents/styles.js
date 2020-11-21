import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width,dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    cont1: {
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        width: x(313),

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 2,
        


    },
    topcont1: {
        flexDirection: 'row',
        width: x(313),
    },
    pic1: {
        // height: y(144),
        width: x(144),
        backgroundColor: colors.GREY_BACKGROUND,
        borderTopLeftRadius: 10,

        justifyContent: 'center',
        alignItems: 'center',
        overflow:'hidden',

    },
    pic2: {
        // height: y(120),
        width: x(144),
        backgroundColor: colors.GREY_BACKGROUND,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow:'hidden',

    },

    text1: {
        fontFamily: 'Gilroy-SemiBold',
        color: colors.BLUE_FONT,
        fontSize: y(15),
        width: x(150),
    },
    pN1: {
        color: colors.BLUE_FONT,
        fontFamily: 'Gilroy-Bold',
        fontSize: y(18),
        position: 'absolute',
        top: y(10),
        right: x(10),
    },
    subCont1: {
        flexDirection: 'row',
        width: x(169),
    },
    verify: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(12),
        alignSelf: 'flex-end',
        bottom: x(10)
    },
    addVehicle: {
        marginLeft: x(13),
        marginVertical: y(10),
        height: y(dimensionAssert() ? 106 : 82),
        width: x(170),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    addVehicleText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
        color: colors.BLUE_FONT,
    },
});