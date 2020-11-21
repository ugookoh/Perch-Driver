import React from 'react';
import styles from './styles';
import { TouchableWithoutFeedback, Animated, Text, View, TextInput, Dimensions, TouchableOpacity, ScrollView, Keyboard, KeyboardAvoidingView, Button, StatusBar, Platform, Alert } from 'react-native';
import { OfflineNotice, dateformat, x, y, height, width, dimensionAssert,colors } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';

export default class SupportMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            body: this.props.route.params.body,
            date: this.props.route.params.date,
            response: this.props.route.params.response,
            responseDate: this.props.route.params.responseDate,
        };
    };
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={{ zIndex: 3 }}>
                    <Header scrollY={this.state.scrollY} name={'Support Message'} onPress={() => { this.props.navigation.goBack() }} />
                </View>
                <ScrollView style={{ width: width }}>
                    <View style={[styles.box, { flexDirection: 'row-reverse', marginTop: y(20) }]}>
                        <View>
                            <View style={styles.userBox}>
                                <Text style={[styles.userText, { color: '#FFFFFF' }]}>{this.state.body}</Text>
                            </View>
                            <Text style={[styles.date, { alignSelf: 'flex-end' }]}>{dateformat(this.state.date)}</Text>
                        </View>
                    </View>

                    {this.state.response ?
                        <View style={[styles.box, { marginTop: y(12) }]}>
                            <View style={styles.responseBox}>
                                <Text style={[styles.userText, {}]}>{this.state.response}</Text>
                            </View>
                            <Text style={[styles.date, { alignSelf: 'flex-start' }]}>{dateformat(this.state.responseDate)}</Text>
                        </View>
                        : <></>}
                </ScrollView>
            </View>
        )
    };
};