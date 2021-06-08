import React from 'react';
import styles from './styles';
import { TouchableWithoutFeedback, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { y } from '../../Functions/Functions'

export default class Button extends React.Component {
    constructor() {
        super();
    }
    render() {
        let display = this.props.loading ? <ActivityIndicator size='small' color='#FFFFFF' /> : <Text style={[styles.text, { fontSize: y(15, true), }]}>{this.props.text}</Text>;
        return (
            <TouchableOpacity
                style={[styles.button, { height: this.props.height, width: this.props.width },]}
                onPress={() => {
                    this.props.onPress();
                }}
            >
                {display}
            </TouchableOpacity>
        );
    }
}
