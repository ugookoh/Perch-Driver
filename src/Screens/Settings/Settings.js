import React from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import { OfflineNotice, openBrowser, signOut, x, y } from '../../Functions/Functions';
import { CarInCity } from '../../Images/svgimages/vectors';
import styles from './styles';

export default class Settings extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
        };
    }

    componentDidMount() {
    }
    render() {
        return (
            <View style={styles.container}>
                <Header name={'Settings'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={{ marginTop: y(25) }}>
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.navigate('Profile', {
                                    userDetails: this.props.route.params.userDetails,
                                });
                            }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Profile</Text>
                                <Ionicons name={'ios-chevron-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('SavedPlaces', {
                                userDetails: this.props.route.params.userDetails,
                                onReturn: () => { this.props.route.params.onReturnFromSavedPlaces(); },
                            });
                        }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Saved Places</Text>
                                <Ionicons name={'ios-chevron-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity
                            onPress={() => {
                                openBrowser(`https://perchrides.com/s/db/ddash`);
                            }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Documents</Text>
                                <Ionicons name={'ios-chevron-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.navigate('Preferences', {
                                    userDetails: this.props.route.params.userDetails,
                                });
                            }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Preferences</Text>
                                <Ionicons name={'ios-chevron-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.navigate('Privacy', {
                                    userDetails: this.props.route.params.userDetails,
                                });
                            }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Privacy</Text>
                                <Ionicons name={'ios-chevron-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity onPress={() => {
                            Alert.alert(
                                'Perch',
                                'Are you sure you want to log out of Perch?',
                                [
                                    {
                                        text: 'Cancel',
                                        //onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Log out',
                                        onPress: () => {
                                            signOut.call(this, () => { });
                                        },
                                        style: 'destructive'
                                    }
                                ],
                                { cancelable: false },
                            );

                        }}
                        >
                            <View style={styles.optionChoice}>
                                <Text style={styles.signOut}>Sign Out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cIC}>
                    <CarInCity />
                </View>

            </View>
        );
    }
}

