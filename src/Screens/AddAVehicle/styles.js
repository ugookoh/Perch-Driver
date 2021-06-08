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
    view: {
        height: y(48),
        borderWidth: 1,
        borderColor: colors.GREY_OPAQUE(0.7),
        borderRadius: 6,
        justifyContent: 'center',

    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15, true),
        marginLeft: x(12),
    },
    spaceView: {
        width: x(343),
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    plateNumber: {
        width: x(343),
        height: y(48),
        borderColor: colors.GREY_OPAQUE(0.7),
        borderRadius: 6,
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15, true),
        paddingLeft: x(12),
        marginTop: y(10),
        borderWidth: 1,
    },
    upload: {
        width: x(343),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: y(15),

    },
    tO: {
        flexDirection: 'row',
        width: x(200),
        justifyContent: 'space-between',
    },
    list: {
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingVertical: y(10),
    },
    uploadText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(14, true),
    },
    image: {
        backgroundColor: colors.GREY_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        height: y(dimensionAssert() ? 90 : 80),
        width: x(130),
    },
    manOnCar: {
        height: y(279.46),
        width: width,
        position: 'absolute',
        bottom: x(10),
        zIndex: -1,
    },
    car: {
        height: y(239.46),
        width: width,
        position: 'absolute',
        bottom: -x(10),
        zIndex: -1,
    },
    pickerView: {
        position: 'absolute',
        zIndex: 4,
        elevation: 13,
        backgroundColor: '#DBD4D4'
    },
    pickerChoice: {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        flexDirection: 'row-reverse',
        borderColor: '#B2ACAC',
    },
    picker_: {
        width: width,
        height: y(250),
    },
    smallText: {
        fontSize: y(10, true),
        fontFamily: 'Gilroy-ExtraBold',
        textAlign: 'center'
    },
});