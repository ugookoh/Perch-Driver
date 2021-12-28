import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        position: 'absolute',
        width: x(313),
        //height: y(100),
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        //top: y(dimensionAssert() ? 29 : 45),

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.30,
        shadowRadius: 8,

        elevation: 1,
        zIndex: 1,
        paddingBottom: x(10),
        paddingHorizontal: x(10)
    },
    subContainer: {
        marginTop: y(42),
        //flexDirection: 'row',
        justifyContent: 'space-around',
    },
    text: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(14, true),
        width: x(220),
        color: colors.BLUE_FONT,
    },
    icon: {
        height: y(26),
        width: y(26),
        marginBottom: x(4)
    },
    icon_: {
        height: y(30),
        width: y(30),
        marginBottom: x(3)
    },
    iconContainer: {
        //backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    distanceText: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(19, true),
    },
});