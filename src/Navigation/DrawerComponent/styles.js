import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, colors,dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        height: height,
        width: x(325),
        position: 'absolute',
        elevation: 3,
        zIndex: 3,
        backgroundColor: colors.BLUE,
    },
    profile: {
        height: y(197),
        width: x(325),
        backgroundColor: colors.BLUE,
    },
    menu: {
        height: y(dimensionAssert() ? 594 : 567),
        width: x(325),
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-around'
    },
    menuList: {
        flexDirection: 'row',
        alignItems: 'center',
        //height: y(81),   <-
        width: x(325),
    },
    carIcon: {
        width: x(20.87),
        height: y(16.2),
        marginLeft: x(32.5),

    },
    menuText: {
        fontSize: y(16, true),
        fontFamily: 'Gilroy-Medium',
        paddingLeft: x(14.1),
    },
    divider: {
        width: x(325),
        alignItems: 'center',
        opacity: 0.25,
    },
    icons: {
        paddingLeft: x(32.5)
    },
    profilePic: {
        //backgroundColor:'#9B9696',
        justifyContent: 'center',
        alignItems: 'center',
        height: x(73),
        width: x(73),
        position: 'absolute',
        top: y(dimensionAssert() ? 35 : 55),
        left: x(32),
        borderRadius: 5,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        overflow:'hidden',
    },
    name: {
        position: 'absolute',
        top: y(138),
        left: x(32),
        fontFamily: 'Gilroy-Bold',
        fontSize: y(20, true),
        color: '#FFF',
    },
    tripNo: {
        position: 'absolute',
        top: y(dimensionAssert() ? 167 : 160),
        left: x(32),
        fontFamily: 'Gilroy-Medium',
        fontSize: y(15, true),
        color: '#FFF',
    },
    rating: {
        flexDirection: 'row',
        position: 'absolute',
        top: y(dimensionAssert() ? 165 : 160),
        left: x(274),
    },
    ratingText: {
        fontFamily: 'Gilroy-Medium',
        fontSize: y(15, true),
        color: '#FFF',
    },
})
