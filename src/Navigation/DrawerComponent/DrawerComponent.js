import React from 'react';
import styles from './styles';
import AsyncStorage from '@react-native-community/async-storage';
import { Animated, View, Text, TouchableOpacity, Dimensions, Image, TouchableWithoutFeedback, PanResponder, StatusBar, Platform, Alert } from 'react-native';
import { signOut, x, y, height, width, colors, openBrowser } from '../../Functions/Functions';
import Divider from '../../Components/Divider/Divider';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { CarIcon } from '../../Images/svgimages/vectors';
import storage from '@react-native-firebase/storage';



export default class DrawerComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            userDetails: null,
            url: null,
        };
    }
    componentDidMount() {
        AsyncStorage.getItem('USER_DETAILS')
            .then(result => {
                if (result) {
                    const userDetails = JSON.parse(result);
                    this.setState({
                        userDetails: userDetails,
                    }, () => { this.setImage() })
                }
                else {
                    this.watchID = setInterval(() => {
                        AsyncStorage.getItem('USER_DETAILS')
                            .then((result_) => {
                                clearInterval(this.watchID);
                                const userDetails_ = JSON.parse(result_);
                                this.setState({
                                    userDetails: userDetails_,
                                }, () => { this.setImage() })
                            }).catch(error => { console.log(error.message) })
                    }, 300)
                }
            }).catch(error => { console.log(error.message) })
    };
    // componentDidUpdate() {
    //     AsyncStorage.getItem('USER_DETAILS')
    //         .then(r => {
    //             if (r) {
    //                 if (r !== JSON.stringify(this.state.userDetails ? this.state.userDetails : '')) {
    //                     AsyncStorage.getItem('USER_DETAILS')
    //                         .then(result => {
    //                             if (result) {
    //                                 const userDetails = JSON.parse(result);
    //                                 this.setState({
    //                                     userDetails: userDetails,
    //                                 }, () => { this.setImage() })
    //                             }
    //                             else {
    //                                 this.watchID = setInterval(() => {
    //                                     AsyncStorage.getItem('USER_DETAILS')
    //                                         .then((result_) => {
    //                                             clearInterval(this.watchID);
    //                                             const userDetails_ = JSON.parse(result_);
    //                                             this.setState({
    //                                                 userDetails: userDetails_,
    //                                             }, () => { this.setImage() })
    //                                         }).catch(error => { console.log(error.message) })
    //                                 }, 300)
    //                             }
    //                         }).catch(error => { console.log(error.message) })
    //                 }

    //             }
    //         }).catch(error => { console.log(error.message) })
    // };
    setImage = () => {
        storage().ref(`${this.props.userDetails ? this.props.userDetails.photoRef : this.state.userDetails.photoRef}`).getDownloadURL()
            .then(result => {
                this.setState({ url: result })
            }).catch(error => { console.log(error.message) })
    };
    render() {
        const pad = y(10);
        return (
            <View style={styles.container}>
                <View style={styles.profile}>
                    <View style={[styles.profilePic, this.state.url ? { borderWidth: 0 } : {}]}>
                        {this.state.url ?
                            <Image
                                source={{ uri: this.state.url }}
                                resizeMode={'contain'}
                                style={{
                                    flex: 1,
                                    height: x(73),
                                    width: x(73),
                                }} />
                            : <></>}
                    </View>
                    <Text style={styles.name}>{this.props.userDetails ? this.props.userDetails.firstName + ' ' + this.props.userDetails.lastName : ''}</Text>
                    <Text style={styles.tripNo}>{`${this.props.userDetails ? this.props.choice == 'rideshare' ? this.props.userDetails.driverSummarizedHistory.rideshare.tripNumber : this.props.userDetails.driverSummarizedHistory.carpool.tripNumber : ''} Trips`}</Text>
                    <View style={[styles.rating, { alignItems: 'center' }]}>
                        <Text style={styles.ratingText}>{`${this.props.userDetails ? this.props.choice == 'rideshare' ? Number(this.props.userDetails.driverSummarizedHistory.rideshare.rating).toFixed(1) : Number(this.props.userDetails.driverSummarizedHistory.carpool.rating).toFixed(1) : ''} `}</Text>
                        <FontAwesome name={'star'} size={y(15)} color={'#FFC107'} />
                    </View>
                </View>

                <View style={styles.menu}>


                    <TouchableOpacity onPress={() => { this.props.hideMenu(); }}>
                        <View style={[styles.menuList, { paddingTop: pad }]}>
                            <AntDesign name={'home'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Home</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('ScheduledTrips', { userDetails: this.props.userDetails })
                    }}>
                        <View style={styles.menuList}>
                            <AntDesign name={'calendar'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Scheduled trips</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('PayoutInformation');
                    }}>
                        <View style={styles.menuList}>
                            <SimpleLineIcons name={'wallet'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>{`Payout Information`}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('History', { userDetails: this.props.userDetails })
                    }}>
                        <View style={styles.menuList}>
                            <MaterialCommunityIcons name={'history'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>History</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


                    <TouchableOpacity onPress={() => {
                        //this.props.hideMenu();
                        openBrowser(`https://perchrides.com/s/articles/help_and_frequently_asked_questions`);
                        //this.props.navigation.navigate('GetFreeRides', { userDetails: this.props.userDetails });
                    }}>
                        <View style={styles.menuList}>
                            <Ionicons name={'clipboard-outline'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>{'Tutorials & Help'}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('Vehicles', {
                            userDetails: this.props.userDetails,
                            changeVehicle: () => { },
                        });
                    }}>
                        <View style={styles.menuList}>
                            <View style={styles.carIcon}>
                                <CarIcon />
                            </View>
                            <Text style={styles.menuText}>Vehicles</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('Settings', {
                            userDetails: this.props.userDetails,
                            onReturnFromSavedPlaces: () => { this.props.onReturnFromSavedPlaces(); }
                        });
                    }}>
                        <View style={styles.menuList}>
                            <SimpleLineIcons name={'settings'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Settings</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('ContactUs');
                    }}>
                        <View style={styles.menuList}>
                            <Feather name={'headphones'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Contact Us</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


                    <TouchableOpacity
                        onPress={() => {
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
                                            signOut.call(this, this.props.forceUpdate);
                                            this.props.hideMenu();
                                        },
                                        style: 'destructive'
                                    }
                                ],
                                { cancelable: false }
                            );

                        }}
                    >
                        <View style={[styles.menuList, { paddingBottom: pad }]}>
                            <SimpleLineIcons name={'logout'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Log Out</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </View>
        );
    }
}

