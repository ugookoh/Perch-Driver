import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width,dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    option: {
        height: dimensionAssert() ? y(72) : y(62),
        width: x(340),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(21),
    },
    delete: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(21),
        color: colors.RED,
    },


    v: {
        width: width,
        height: y(298.79),

        position: 'absolute',
        bottom: x(25),
    },
});