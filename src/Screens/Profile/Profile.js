import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { permissionLocation, Notifications, dimensionAssert, OfflineNotice, x, y, colors, height, width } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import { Avatar } from '../../Images/svgimages/vectors';
import Divider from '../../Components/Divider/Divider';
import storage from '@react-native-firebase/storage';

export default class Privacy extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            firstName: this.props.route.params.userDetails.firstName,
            lastName: this.props.route.params.userDetails.lastName,
            email: this.props.route.params.userDetails.email,
            phoneNumber: this.props.route.params.userDetails.phoneNumber,
            loading: false,
            errorMessage: '',
            userDetails: this.props.route.params.userDetails,
            originalemail: this.props.route.params.userDetails.email,
            originalphoneNumber: this.props.route.params.userDetails.phoneNumber, //CHANGE THESE ORIGINAL VALUES WHEN YOU VERIFY AN EMAIL
            url: null,
            photoRef: this.props.route.params.userDetails.photoRef,

        };
        this.setImage();
    }
    setImage = () => {
        storage().ref(`${this.state.photoRef}`).getDownloadURL()
            .then(result => {
                this.setState({ url: result })
            }).catch(error => { console.log(error.message) })
    };
    updateName = () => {
        Alert.alert(
            'We cannot update this field',
            'To update this field you need to contact us with the name you want to update it to',
            [
                {
                    text: 'Cancel',
                    //onPress: () => console.log('Cancel Pressed'),
                    style: 'default'
                },
                {
                    text: 'Contact Us',
                    onPress: () => {
                        this.props.navigation.navigate('ContactUs');
                    },
                    style: 'cancel'
                }
            ],
            { cancelable: false }
        );

    }
    render() {
        let phoneVerified = this.state.userDetails.phoneVerified && this.state.originalphoneNumber === this.state.phoneNumber ? true : false;
        let emailVerified = this.state.userDetails.emailVerified && this.state.originalemail === this.state.email ? true : false;


        return (
            <TouchableWithoutFeedback
                onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <View style={styles.header}>
                        <Header name={'Profile'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
                    </View>

                    <KeyboardAvoidingView behavior={'position'}>
                        <View style={styles.secondaryContainer}>
                        <View style={[styles.avatarContainer,this.state.url?{}:{ backgroundColor: '#85A4F7',}]}>
                                <TouchableOpacity>
                                    {this.state.url ?
                                        <Image
                                            source={{ uri: this.state.url }}
                                            resizeMode={'contain'}
                                            style={{
                                                flex: 1,
                                                width: x(113),
                                                height: x(113),
                                            }} /> :
                                        <View style={styles.avatar}>
                                            <Avatar />
                                        </View>}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.optionContainer}>
                                <View style={styles.option}>
                                    <Text style={styles.tag}>FIRST NAME</Text>

                                    <View style={styles.textInputContainer}>
                                        <TouchableOpacity onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.textInput, { opacity: 0.6 }]}>{this.state.firstName}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.tag, { color: colors.BLUE, }]}>EDIT</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                                <View style={styles.option}>
                                    <Text style={styles.tag}>LAST NAME</Text>

                                    <View style={styles.textInputContainer}>
                                        <TouchableOpacity onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.textInput, { opacity: 0.6 }]}>{this.state.lastName}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.tag, { color: colors.BLUE }]}>EDIT</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                                <View style={styles.option}>
                                    <Text style={styles.tag}>EMAIL</Text>

                                    <View style={styles.textInputContainer}>
                                        <TextInput
                                            placeholder={'Enter your email...'}
                                            style={styles.textInput}
                                            placeholderTextColor={colors.GREY_OPAQUE(0.85)}
                                            onChangeText={(value) => { this.setState({ email: value }) }}
                                            value={this.state.email}
                                            keyboardType={'email-address'}
                                        />

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} disabled={emailVerified}
                                            onPress={() => {
                                                //SEND THE VERIFICATION CODE HERE
                                                Keyboard.dismiss();
                                                this.props.navigation.navigate('VerifyDetails', {
                                                    type: 'Email'
                                                });
                                            }}>
                                            <Text style={[styles.tag, { top: y(dimensionAssert() ? -16 : 0), color: emailVerified ? colors.BLUE : colors.RED }]}>{emailVerified ? `VERIFIED` : `VERIFY`}</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                                <View style={styles.option}>
                                    <Text style={styles.tag}>PHONE NUMBER</Text>

                                    <View style={styles.textInputContainer}>
                                        <TextInput
                                            placeholder={'Enter your phone number...'}
                                            style={styles.textInput}
                                            placeholderTextColor={colors.GREY_OPAQUE(0.85)}
                                            onChangeText={(value) => { this.setState({ phoneNumber: value }) }}
                                            value={this.state.phoneNumber}
                                            keyboardType={'number-pad'}
                                        />

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} disabled={phoneVerified}
                                            onPress={() => {
                                                //SEND THE VERIFICATION CODE HERE
                                                Keyboard.dismiss();
                                                this.props.navigation.navigate('VerifyDetails', {
                                                    type: 'Phone Number'
                                                });
                                            }}>
                                            <Text style={[styles.tag, { top: y(dimensionAssert() ? -16 : 0), color: phoneVerified ? colors.BLUE : colors.RED }]}>{phoneVerified ? `VERIFIED` : `VERIFY`}</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                    <View style={[styles.option,/* { top: x(dimensionAssert() ? -9 : 0) } */]}>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                this.props.navigation.navigate('ChangePassword')
                            }}
                            style={styles.changePassword}>
                            <Text style={[styles.delete,]}>Change Password</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: width, alignItems: 'center', top: x(dimensionAssert() ? -55 : -10), paddingHorizontal: x(12.5) }}>
                        <Text numberOfLines={2} style={styles.errorMessage}>{this.state.errorMessage}</Text>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        )
    }
}

