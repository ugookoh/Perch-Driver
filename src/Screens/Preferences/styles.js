import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
        alignItems: 'center'
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
    smallerSpaceView: {
        width: x(313),
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: y(6),
    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(16, true),
        color: colors.BLUE_FONT,
    },

});