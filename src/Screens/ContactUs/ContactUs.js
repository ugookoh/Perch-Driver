import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, Alert, TextInput, Button, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import { Picker } from '@react-native-community/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sendFeedback, OfflineNotice, x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import { CustomerService, CustomerServiceOnTable } from '../../Images/svgimages/vectors';
import Button_ from '../../Components/Button/Button';

export default class ContactUs extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            form: '',
            issue: 'choice',
            choice: 'hidden',
            messageSent: false,
            loading: false,
        }
        this.pickerPosition = new Animated.Value(-y(310))
    }

    hidePicker = () => {
        Keyboard.dismiss();
        this.setState({ choice: 'hidden' });
        Animated.spring(this.pickerPosition, {
            toValue: dimensionAssert() ? -y(310) : -y(290),
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    }
    showPicker = () => {
        Keyboard.dismiss();
        this.setState({ choice: 'shown' });
        Animated.spring(this.pickerPosition, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    }
    render() {
        let text = '';
        switch (this.state.issue) {
            case 'choice': { text = 'Please explain what you would like discussed, we love to read ;)' } break;
            case 'Give feedback about our services': { text = `We appreciate the feedback! Remember to leave us a rating on the ${Platform.OS == 'ios' ? 'App Store' : 'Play Store'} :)` } break;
            case 'Report a rider': { text = `Note if reporting a rider , please include the name of the person if you remember for a faster processing time.` } break;
            case 'Missing Item': { text = `Please explain the item as accurately as you can and we would get back to you as soon as we get some information.` } break;
            case 'Change your name': { text = `Please enter the name you would like to change it to in the format (first name-last name)` } break;
            case 'Other': { text = `Please explain what you would like discussed, we love to read ;)` } break;
        };
        const form = this.state.messageSent == false ? true : false;//THIS CONTROLS BEFORE AND AFTER THE MESSAGE IS SENT
        const iconRotation = this.pickerPosition.interpolate({
            inputRange: [dimensionAssert() ? -y(310) : -y(290), 0],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });
        if (form)
            return (
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        //this.hidePicker();
                    }}
                >
                    <View style={styles.container}>
                        <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                        <View style={{ zIndex: 3 }}>
                            <Header scrollY={this.state.scrollY} name={'Contact Us'} onPress={() => { this.props.navigation.goBack() }} />
                        </View>
                        <KeyboardAvoidingView behavior={'position'}>
                            <View style={styles.formContainer}>

                                <Text style={styles.feedbackTitle}>Feedback Form</Text>
                                <View style={styles.picker}>
                                    <TouchableOpacity onPress={() => {
                                        if (this.state.choice === 'hidden')
                                            this.showPicker();
                                        else if (this.state.choice === 'shown')
                                            this.hidePicker();
                                    }}>
                                        {this.state.issue === 'choice' ? <Text style={[styles.issueChoice, { color: colors.GREY_BACKGROUND }]}>Select a topic</Text> : <Text style={styles.issueChoice}>{this.state.issue}</Text>}
                                    </TouchableOpacity>
                                    <Animated.View style={[styles.dropDown, { transform: [{ rotate: iconRotation }] }]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (this.state.choice === 'hidden')
                                                    this.showPicker();
                                                else if (this.state.choice === 'shown')
                                                    this.hidePicker();
                                            }}
                                        >
                                            <Ionicons name={'ios-chevron-down'} size={y(20)} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                                <View style={styles.textInputView}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={text}

                                        onChangeText={(value) => { this.setState({ form: value }) }}
                                        value={this.state.form}
                                        multiline={true}
                                        textAlignVertical={'top'}
                                    />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                        <View style={[styles.button, {}]}>
                            <Button_ text={'Send feedback'} width={x(343)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.loading} onPress={() => {
                                if (this.state.form.length != 0)
                                    sendFeedback.call(this);
                                else
                                    Alert.alert(
                                        'Body is empty',
                                        'Please enter a message for us to process'
                                    );
                            }} />
                        </View>
                        <Text style={styles.pM}>Previous messages</Text>
                        <TouchableOpacity
                            style={styles.pMView}
                            onPress={() => { this.props.navigation.navigate('PreviousMessages') }}>
                            <Text style={styles.pM_}>See all previous support messages</Text>
                        </TouchableOpacity>
                        {/* <View style={styles.image}>
                            <CustomerServiceOnTable />
                        </View> */}

                        <Animated.View style={[styles.pickerView, { bottom: this.pickerPosition, }]}>
                            <View style={styles.pickerChoice}>
                                <View style={{ marginRight: x(20) }}>
                                    <Button
                                        onPress={this.hidePicker}
                                        title="Choose"

                                    />
                                </View>
                            </View>
                            <Picker
                                style={styles.picker_}
                                selectedValue={this.state.issue}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({ issue: itemValue });
                                    if (Platform.OS === 'android')
                                        this.hidePicker();
                                }}>
                                <Picker.Item label="---Select a topic---" value="choice" color={colors.GREY_BACKGROUND} />
                                <Picker.Item label="Give feedback about our services" value="Give feedback about our services" />
                                <Picker.Item label="Missing Item" value="Missing Item" />
                                <Picker.Item label="Change your name" value="Change your name" />
                                <Picker.Item label="Report a rider" value="Report a rider" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            );
        else
            return (
                <View style={styles.container}>
                    <View style={{ zIndex: 2 }}>
                        <Header scrollY={this.state.scrollY} name={'Contact Us'} />
                    </View>

                    <View style={[styles.formContainer, { justifyContent: 'center' }]}>
                        <Text style={[styles.issueChoice, { textAlign: 'center', fontSize: y(18), }]}>{'Thank you for contacting us!\nWe would get back to you as soon as possible.'}</Text>
                    </View>
                    <View style={styles.button}><Button_ text={'Home'} width={x(343)} height={y(48)} top={0} left={0} zIndex={2} onPress={() => { this.props.navigation.navigate('Main') }} /></View>
                    <Text style={styles.pM}>Previous messages</Text>
                    <TouchableOpacity
                        style={styles.pMView}
                        onPress={() => { this.props.navigation.navigate('PreviousMessages') }}>
                        <Text style={styles.pM_}>See all previous support messages</Text>
                    </TouchableOpacity>
                    {/* <View style={styles.image}>
                        <CustomerServiceOnTable />
                    </View> */}
                </View>
            );

    }
}

