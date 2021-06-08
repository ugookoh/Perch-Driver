import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        backgroundColor: colors.WHITE,
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(20, true),
        color: colors.BLUE_FONT,
        width: x(343),
    },
    divider: {
        alignItems: 'center',
        opacity: 0.25,
    },
    list: {
        width: width,
        maxHeight: y(dimensionAssert() ? 180 : 243),
        //backgroundColor:'red',
        alignItems: 'center',
    },
    listView: {
        width: width,
        alignItems: 'center',
        marginVertical: y(5),
    },
    loader: {
        height: y(190),
    },
    addVehicle: {
        marginTop: y(5),
        zIndex: 1,
        elevation: 1
    },
    manOnCar: {
        height: y(279.46),
        width: width,
        position: 'absolute',
        bottom: x(10),
    },
    icon: {
        position: 'absolute',
        zIndex: 2,
        elevation: 2,
        top: x(20),
        right: x(30),
    },
});