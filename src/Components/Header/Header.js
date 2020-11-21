import React from 'react';
import { TouchableOpacity, View, Text, StatusBar, Animated, Dimensions, Platform, } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { colors, height, width, x, y } from '../../Functions/Functions';

const MAX_HEADER_HEIGHT = y(156);
const MIN_HEADER_HEIGHT = y(105);

const MAX_X_HEADERTEXT = x(21);
const MIN_X_HEADERTEXT = x(72);
const MAX_Y_HEADERTEXT = y(103.4);
const MIN_Y_HEADERTEXT = y(57.4);

export default class Header extends React.Component {
  render() {
    const headerHeight = this.props.scrollY.interpolate({
      inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
      outputRange: [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
      extrapolate: 'clamp',
    });

    const left_ = this.props.scrollY.interpolate({
      inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
      outputRange: [MAX_X_HEADERTEXT, MIN_X_HEADERTEXT],
      extrapolate: 'clamp',
    });

    const top_ = this.props.scrollY.interpolate({
      inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
      outputRange: [MAX_Y_HEADERTEXT, MIN_Y_HEADERTEXT],
      extrapolate: 'clamp',
    });
    //const area=Platform.OS === 'android' ?{height:}

    return (
      <View>
        <StatusBar
          backgroundColor={colors.BLUE}
          barStyle="light-content" />

        <Animated.View style={{ ...styles.box, height: headerHeight }}>
          <TouchableOpacity style={styles.icon}
            onPress={this.props.onPress}
            disabled={this.props.disabled ? this.props.disabled : false}
          >
            <View style={styles.iconBox}>
              <Icon
                name="chevron-back"
                size={y(40)}
                color="white"
              //style={styles.icon}
              />
            </View>
          </TouchableOpacity>
          <Animated.View style={{ top: top_, left: left_ }}>
            <Text style={styles.text}>{this.props.name}</Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}
