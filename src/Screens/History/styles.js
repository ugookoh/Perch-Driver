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

    },
    dateView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: x(5)
    },
    dateText: {
        fontFamily: 'Gilroy-Medium',
        fontSize: y(16, true),
        color: colors.BLUE,
        marginRight: x(10),
    },
    divider: {
        alignItems: 'center',
        opacity: 0.25,
    },
    list: {
        width: width,
        height: y(479),
        marginTop: y(13),
        //backgroundColor: 'red',
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listCont: {
        alignItems: 'center',
        width: width,
    },
    tabCont: {
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        width: width,
        height: y(dimensionAssert() ? 260 : 212),
        backgroundColor: Platform.OS == 'ios' ? colors.WHITE : colors.WHITE,

        shadowColor: "#000",
        shadowOffset: {
            width: 7,
            height: -10,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
        zIndex: 3,
        position: 'absolute',
        alignItems: 'center',
        padding: 0,
    },
    spaceView: {
        width: x(343),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(16, true),
    },
    bigText: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(26, true),
    },
    tab: {
        backgroundColor: colors.GREY_TAB,
        borderRadius: 9,
        height: y(dimensionAssert() ? 1 : 4),
        width: x(44),
        position: 'absolute',
        top: y(13),
    },
    subView: {
        width: '100%',
        alignItems: 'center'
    },
    noresult: {
        height: y(293.59),
        width: x(303.63),
    },
    noResultLoad: {
        width: width,
        height: y(dimensionAssert() ? 180 : 140),
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Gilroy-Medium',
        fontSize: y(22, true),
        color: colors.BLUE_FONT,
        textAlign: 'center',
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
        borderColor: '#B2ACAC'
    },
    picker_: {
        width: width / 2,
        height: y(250),
    },
});