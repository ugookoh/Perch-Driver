import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, AppState, BackHandler, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Picker } from '@react-native-community/picker';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width, dimensionAssert } from '../../Functions/Functions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../Components/Header/Header';
import { ManOnCar, Car } from '../../Images/svgimages/vectors';
import Button_ from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';

export default class AddAVehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            make: 'Vehicle make',
            model: 'Vehicle model',
            year: 'Vehicle year',
            color: 'Vehicle color',
            plateNumber: '',
        };

        this.pickerPosition = new Animated.Value(-y(310))

    };
    componentDidMount() {

    };
    hidePicker = () => {
        Animated.spring(this.pickerPosition, {
            toValue: dimensionAssert() ? -y(310) : -y(290),
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    showPicker = () => {
        Animated.spring(this.pickerPosition, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    render() {
        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                     <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <Header name={'Add a Vehicle'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />

                    <Text style={[styles.title, { marginTop: y(28) }]}>{`Add a vehice`}</Text>
                    <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <View style={{ backgroundColor: colors.WHITE }}>

                        <View style={[styles.spaceView, { marginTop: x(11.5) }]}>
                            <TouchableOpacity style={[styles.view, { width: x(164) }]} onPress={()=>{
                                this.showPicker();
                            }}>
                                <Text style={[styles.text, { color: this.state.make == 'Vehicle make' ? colors.GREY_BACKGROUND : colors.BLACK }]}>{this.state.make}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.view, { width: x(164) }]}>
                                <Text style={[styles.text, { color: this.state.model == 'Vehicle model' ? colors.GREY_BACKGROUND : colors.BLACK }]}>{this.state.model}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.spaceView, { marginTop: x(10) }]}>
                            <TouchableOpacity style={[styles.view, { width: x(164) }]}>
                                <Text style={[styles.text, { color: this.state.year == 'Vehicle year' ? colors.GREY_BACKGROUND : colors.BLACK }]}>{this.state.year}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.view, { width: x(164) }]}>
                                <Text style={[styles.text, { color: this.state.color == 'Vehicle color' ? colors.GREY_BACKGROUND : colors.BLACK }]}>{this.state.color}</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            ref={(input) => { this.plateNumber = input; }}
                            spellCheck={false}
                            style={styles.plateNumber}
                            autoCapitalize={'none'}
                            placeholderTextColor={colors.GREY_OPAQUE(0.9)}
                            placeholder={'Plate number'}
                            onChangeText={value => { this.setState({ plateNumber: value }) }}
                            value={this.state.plateNumber}
                        />

                        <View style={styles.upload}>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={styles.image}>
                                    <FontAwesome name={'file-image-o'} size={y(30)} />
                                    <Text style={[styles.smallText, { marginTop: x(3) }]}>{`UPLOAD VEHICLE\nIMAGE`}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Text style={[styles.smallText, { textDecorationLine: 'underline', marginTop: x(3) }]}>
                                        {`Image Requirements?`}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.list}>
                                <TouchableOpacity style={styles.tO}>
                                    <Text style={styles.uploadText}>Upload vehicle registeration</Text>
                                    <Feather name={'upload'} size={y(13)} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.tO}>
                                    <Text style={styles.uploadText}>Upload vehicle insurance</Text>
                                    <Feather name={'upload'} size={y(13)} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.tO}>
                                    <Text style={styles.uploadText}>Upload vehicle inspection</Text>
                                    <Feather name={'upload'} size={y(13)} />
                                </TouchableOpacity>
                            </View>

                        </View>
                        <View style={{ marginTop: y(15) }}>
                            <Button_ height={y(52)} width={x(343)} text={'Submit Vehicle'} onPress={() => { }} />
                        </View>

                    </View>
                    {dimensionAssert() ?
                        <View style={styles.car}>
                            <Car />
                        </View> :
                        <View style={styles.manOnCar}>
                            <ManOnCar />
                        </View>
                    }

                    <Animated.View style={[styles.pickerView, { bottom: this.pickerPosition, }]}>
                        <View style={styles.pickerChoice}>
                            <View style={{ marginRight: x(20) }}>
                                <Button
                                    onPress={this.hidePicker}
                                    title="Choose"

                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Picker
                                style={styles.picker_}
                                selectedValue={this.state.year}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({ year: itemValue })
                                    //this.hidePicker();
                                }}>
                                <Picker.Item label="2020" value="2020" />
                                <Picker.Item label="2021" value="2021" />
                                <Picker.Item label="2022" value="2022" />
                                <Picker.Item label="2023" value="2023" />
                                <Picker.Item label="2024" value="2024" />
                                <Picker.Item label="2025" value="2025" />
                                <Picker.Item label="2026" value="2026" />
                                <Picker.Item label="2027" value="2027" />
                                <Picker.Item label="2028" value="2028" />
                                <Picker.Item label="2029" value="2029" />
                                <Picker.Item label="2030" value="2030" />
                                <Picker.Item label="2031" value="2031" />
                                <Picker.Item label="2032" value="2032" />
                                <Picker.Item label="2033" value="2033" />
                                <Picker.Item label="2034" value="2034" />
                                <Picker.Item label="2035" value="2035" />
                                <Picker.Item label="2036" value="2036" />
                                <Picker.Item label="2037" value="2037" />
                                <Picker.Item label="2038" value="2038" />
                                <Picker.Item label="2039" value="2039" />
                                <Picker.Item label="2040" value="2040" />
                                <Picker.Item label="2041" value="2041" />
                            </Picker>
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

