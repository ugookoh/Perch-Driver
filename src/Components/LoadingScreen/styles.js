import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
const [BLUE, WHITE, GREY] = ['#132F79', '#FFFFFF', '#918686'];
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: 'rgba(180, 179, 179, 0.50)',
        alignItems: 'center',
        width: width,
        height: height,
        position: 'absolute',
    },
    box: {
        borderRadius: 20,
        width: x(100),
        height: x(100),
        backgroundColor: WHITE,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
    },

});
