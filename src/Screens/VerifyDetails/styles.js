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
  logo: {
    position: 'absolute',
    left: x(162.02),
    top: y(63.71),
    height: y(81),
    width: x(51.53),
  },
  signUp: {
    alignItems: 'center',
    position: 'absolute',
    top: y(164),
    width: width,
  },
  sinUpText: {
    fontSize: y(30, true),
    lineHeight: y(36),
    textAlign: 'center',
    fontFamily: 'Gilroy-SemiBold',
  },
  text1: {
    position: 'absolute',
    top: y(203),
    width: width,
    alignItems: 'center',
  },
  regularText: {
    fontSize: y(15, true),
    lineHeight: y(25),
    textAlign: 'center',
    fontFamily: 'Gilroy-Medium',
  },
  messageText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15, true),
  },
  messageView: {
    position: 'absolute',
    left: x(0),
    width: width,
    alignItems: 'center'
  },
  form: {
    flexDirection: 'row',
    width: x(264),
    justifyContent: 'space-between',
    position: 'absolute',
    top: y(285),
    left: x(56),
  },
  button: {
    top: y(655),
    position: 'absolute',
    width: width,
    alignItems: 'center',
  },
});
