import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
        alignItems: 'center'
    },
    home: {
        width: x(22),
        height: y(20.25),
        marginHorizontal: x(15),
    },
    workChair: {
        height: y(23),
        width: x(14.3),
        marginHorizontal: x(15),
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width,
        height: y(58.5),
        marginTop: y(23),
        //backgroundColor:'red'
    },
    predictions: {
        width: x(350),
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(211, 211, 211, 0.7)',
    },
    predictionView: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'rgba(211, 211, 211, 0.7)',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: y(8),
    },
    predictionText: {
        fontSize: y(15, true),
        fontFamily: 'Gilroy-Regular',
    },
    predictionView_: {
        width: x(300),
    },
    icon: {
        marginHorizontal: x(12)
    },
    cIC: {
        zIndex: -1,
        position: 'absolute',
        width: width,
        height: y(dimensionAssert() ? 270 : 242.22),
        top: dimensionAssert() ? y(520) : y(500)
    },
    textInput: {
        fontSize: y(21, true),
        fontFamily: 'Gilroy-Regular',
        width: x(260),
        color: colors.BLACK,
    },
    edit: {
        fontSize: y(12, true),
        fontFamily: 'Gilroy-ExtraBold',
        color: colors.BLUE,
    },
    editPosition: {
        position: 'absolute',
        right: x(26),
    },
});