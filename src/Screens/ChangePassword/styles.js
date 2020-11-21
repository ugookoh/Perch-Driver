import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width ,dimensionAssert} from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        //alignItems: 'center'
    },
    header: {
        zIndex: 1,
    },
    secondaryContainer: {
        marginTop: y(10),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        width: width,
        //height:dimensionAssert()?y(510):y(420),
        zIndex: 0,
    },
    textInput: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),

        height: y(48),
        width: x(322),
        borderRadius: 5,
        borderColor: '#959595',
        borderWidth: 1,
        marginVertical: y(8),
        paddingHorizontal: x(10),
    },
    fP: {
        fontFamily: 'Gilroy-Medium',
        fontSize: y(15),
        bottom: x(-3)
    },
    vE: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(15),
        textDecorationLine: 'underline',
        color: colors.BLUE,
        marginLeft: x(5),
    },
    error: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
        color: colors.RED,
        textAlign:'center',

    },
    choices: {
        flexDirection: 'row',
        alignItems: 'flex-end',

    },
    button: {
        marginTop: y(25),
        width: x(322),
        height: y(48),
    },

});