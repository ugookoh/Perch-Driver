import React from 'react';
import { View, Animated } from 'react-native';
import styles from './styles';
import Header from '../../Components/Header/Header';
import { OfflineNotice } from '../../Functions/Functions';
export default class PayoutInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
        };
    };
    componentDidMount() {
    };
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Payout Information'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
            </View>
        )
    }
}

