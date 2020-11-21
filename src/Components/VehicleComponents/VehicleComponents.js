import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, Image, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width } from '../../Functions/Functions';
import Button from '../Button/Button';
import Divider from '../Divider/Divider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import storage from '@react-native-firebase/storage';


export class ChangeVehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: null,
            vehicle: this.props.vehicle,
        };
    };

    componentDidMount() {
        //this.setImage();
    };
    setImage = () => {
        if (this.props.vehicle)
            storage().ref(`${this.props.vehicle.displayImage}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result, })
                }).catch(error => { console.log(error.message) })
    };

    render() {
        if (!this.state.url || this.state.vehicle.displayImage !== this.props.vehicle.displayImage) {
            if (this.state.vehicle.displayImage !== this.props.vehicle.displayImage)
                this.setState({ url: null, vehicle: this.props.vehicle })
            this.setImage();
        }
        const vehicle = this.props.vehicle;


        return (
            <View style={[styles.cont1, { alignItems: 'center', }]}>
                <View style={styles.topcont1}>
                    <View style={[styles.pic1]}>
                        {
                            this.state.url ?
                                <Image
                                    source={{ uri: this.state.url }}
                                    resizeMode={'cover'}
                                    style={{
                                        flex: 1,
                                        //height: x(73),
                                        width: x(144),
                                    }} /> :
                                <FontAwesome name={`file-picture-o`} size={y(34.28)} />
                        }
                    </View>

                    <View>
                        <View style={styles.subCont1}>
                            <View style={{ marginLeft: x(13), marginVertical: y(10), }}>
                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(50), height: y(15) }}>
                                    <Text style={styles.text1}>{vehicle ? vehicle.color : ''}</Text>
                                </ShimmerPlaceHolder>

                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(40), height: y(15), marginTop: x(3) }}>
                                    <Text style={styles.text1}>{vehicle ? vehicle.year : ''}</Text>
                                </ShimmerPlaceHolder>

                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(65), height: y(15), marginTop: x(3) }}>
                                    <Text numberOfLines={2} style={styles.text1}>{vehicle ? vehicle.make : ''}</Text>
                                </ShimmerPlaceHolder>

                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(65), height: y(15), marginTop: x(3) }}>
                                    <Text numberOfLines={2} style={styles.text1}>{vehicle ? vehicle.model : ''}</Text>
                                </ShimmerPlaceHolder>
                            </View>
                            <Text style={[styles.pN1, { marginLeft: x(13) }]}>{vehicle ? vehicle.plateNumber : ''}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ opacity: 0.80, top: -x(1) }}><Divider height={0.5} width={x(313)} borderRadius={0} borderColor={colors.GREY_BACKGROUND} borderWidth={0.5} /></View>
                <View style={{ marginVertical: y(10) }}>
                    <Button height={y(40)} width={x(284)} text={'Change'}
                        onPress={() => {
                            this.props.navigation.navigate('Vehicles', {
                                changeVehicle: (value) => { this.props.changeVehicle(value) },
                            });
                        }}
                    />
                </View>
            </View>
        )
    }
};

export class ViewVehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: null,
        };
    };

    componentDidMount() {
    };
    setImage = () => {
        if (this.props.vehicle)
            storage().ref(`${this.props.vehicle.displayImage}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result, })
                }).catch(error => { console.log(error.message) })
    };
    render() {
        const vehicle = this.props.vehicle;
        if (!this.state.url)
            this.setImage();

        return (
            <View style={[styles.cont1, { alignItems: 'center', }]}>
                <View style={styles.topcont1}>
                    <View style={[styles.pic2]}>
                        {
                            this.state.url ?
                                <Image
                                    source={{ uri: this.state.url }}
                                    resizeMode={'cover'}
                                    style={{
                                        flex: 1,
                                        //height: x(73),
                                        width: x(144),
                                    }} /> :
                                <FontAwesome name={`file-picture-o`} size={y(34.28)} />}
                    </View>

                    <View>
                        <View style={styles.subCont1}>
                            <View style={{ marginLeft: x(13), marginVertical: y(10), }}>
                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(50), height: y(15) }}>
                                    <Text style={styles.text1}>{vehicle ? vehicle.color : ''}</Text>
                                </ShimmerPlaceHolder>

                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(40), height: y(15), marginTop: x(3) }}>
                                    <Text style={styles.text1}>{vehicle ? vehicle.year : ''}</Text>
                                </ShimmerPlaceHolder>

                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(65), height: y(15), marginTop: x(3) }}>
                                    <Text numberOfLines={2} style={styles.text1}>{vehicle ? vehicle.make : ''}</Text>
                                </ShimmerPlaceHolder>

                                <ShimmerPlaceHolder autoRun={true} visible={vehicle ? true : false} style={{ width: x(65), height: y(15), marginTop: x(3) }}>
                                    <Text numberOfLines={2} style={styles.text1}>{vehicle ? vehicle.model : ''}</Text>
                                </ShimmerPlaceHolder>
                            </View>
                            <Text style={[styles.pN1, { marginLeft: x(13) }]}>{vehicle ? vehicle.plateNumber : ''}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
};

export class ChooseVehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            verified: this.props.vehicle.verifyStatus == 'VERIFIED',
            url: null,
        };
    };

    componentDidMount() {
    };
    setImage = () => {
        if (this.props.vehicle)
            storage().ref(`${this.props.vehicle.displayImage}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) })
    };
    render() {
        const vehicle = this.props.vehicle;
        if (!this.state.url)
            this.setImage();
        return (
            <View style={[styles.cont1, { width: x(343), }]}>
                <View style={styles.topcont1}>

                    <View style={[styles.pic2]}>
                        {
                            this.state.url ?
                                <Image
                                    source={{ uri: this.state.url }}
                                    resizeMode={'cover'}
                                    style={{
                                        flex: 1,
                                        //height: x(73),
                                        width: x(144),
                                    }} /> :
                                <FontAwesome name={`file-picture-o`} size={y(34.28)} />}
                    </View>

                    <View style={{}}>
                        <View style={styles.subCont1}>
                            <View style={{ marginLeft: x(13), marginVertical: y(10), }}>
                                <Text style={styles.text1}>{vehicle.color}</Text>
                                <Text style={styles.text1}>{vehicle.year}</Text>
                                <Text numberOfLines={2} style={styles.text1}>{vehicle.make}</Text>
                                <Text numberOfLines={2} style={styles.text1}>{vehicle.model}</Text>
                            </View>
                            <Text style={[styles.pN1, { marginLeft: x(13) }]}>{vehicle.plateNumber}</Text>
                        </View>
                        {this.state.verified ?
                            <Text style={[styles.verify, { color: colors.GREEN }]}>{'VERIFIED'}</Text>
                            : <Text style={[styles.verify, { color: colors.RED }]}>{'NOT VERIFIED'}</Text>}
                    </View>
                </View>
            </View>
        )
    }
};

export class AddVehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    };

    componentDidMount() {

    };

    render() {
        return (
            <TouchableOpacity style={[styles.cont1, { width: x(343) }]}
                onPress={() => { this.props.onPress() }}>
                <View style={styles.topcont1}>
                    <View style={[styles.pic2, { width: x(130) }]}>
                        <FontAwesome name={`file-picture-o`} size={y(34.28)} />
                    </View>

                    <View style={[styles.addVehicle, {}]}>
                        <Text style={styles.addVehicleText}>Add a vehicle</Text>
                        <Entypo name={'chevron-right'} size={y(23)} />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
};