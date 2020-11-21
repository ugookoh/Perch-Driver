import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
        alignItems: 'center'
    },

    optionChoice: {
        flexDirection: 'row',
        width: x(340),
        justifyContent: 'space-between',
        marginBottom: y(11.5),
    },
    optionText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(20),
    },
    signOut: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(20),
        color: colors.RED,
    },
    cIC: {
        zIndex: -1,
        position: 'absolute',
        width: width,
        height: y(dimensionAssert() ? 270 : 242.22),
        top: dimensionAssert() ? y(520) : y(500)
    },
});