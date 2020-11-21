import React from 'react';
import styles from './styles';
import { Animated, Text, View, KeyboardAvoidingView, StatusBar, TextInput, Dimensions, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, AppState, PanResponder, Pressable, Button } from 'react-native';
import { Picker } from '@react-native-community/picker';
import AsyncStorage from '@react-native-community/async-storage';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { permissionLocation, Notifications, handleLogin, OfflineNotice, x, y, colors, height, width, dimensionAssert, monthNames, polylineLenght } from '../../Functions/Functions'
import Header from '../../Components/Header/Header';
import Divider from '../../Components/Divider/Divider';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { MaterialIndicator, PacmanIndicator } from 'react-native-indicators';
import HistoryComponent from '../../Components/HistoryComponents/HistoryComponents';
import { NoResultCatcus } from '../../Images/svgimages/vectors';
import database from '@react-native-firebase/database';
const BOTTOM_POSITION = -y(dimensionAssert() ? 185 : 110);


export default class History extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            result: null,
            summary: null,
            summaryShown: false,
            userDetails: this.props.route.params.userDetails,
            month: monthNames[new Date().getMonth()],
            year: new Date().getFullYear(),
            limitTo: 20,
        };
        this.bottom = new Animated.Value(BOTTOM_POSITION);
        this.pickerPosition = new Animated.Value(-y(310))
        this.movable = true;
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dy) >= 4;
            },
            onPanResponderGrant: (evt, gestureState) => {

            },
            onPanResponderMove: (evt, gestureState) => {

                if (this.movable) {
                    if (Math.sign(gestureState.vy) == -1) {//UP
                        this.movable = false;
                        Animated.spring(this.bottom, {
                            toValue: 0,
                            useNativeDriver: false,
                        }).start(() => {
                            this.movable = true;
                        });
                        this.setState({ summaryShown: true });
                    }
                    else if (Math.sign(gestureState.vy) == 1) {
                        this.movable = false;
                        Animated.spring(this.bottom, {
                            toValue: BOTTOM_POSITION,
                            useNativeDriver: false,
                        }).start(() => {
                            this.movable = true;
                        });
                        this.setState({ summaryShown: false });
                    }
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
            },
        })
    };
    componentDidMount() {
        this.loadResults();
    };
    loadResults = () => {
        this.setState({ result: null, summary: null }, () => {
            database().ref(`driverHistory/${this.state.userDetails.userID}/carpool/${this.state.year}/${this.state.month}`).once('value', data => {
                this.setState({ result: data.val() ? data.val() : 'NORESULTS' });

                let passengerNo = 0, distance = 0, totalM = '$279.90';

                for (let k in data.val()) {
                    const d = data.val()[k].trips;


                    for (let key in d) {
                        passengerNo += d[key].details.tripDetails.seatNumber;
                        distance += polylineLenght(JSON.parse(d[key].details.tripDetails.leg)) * d[key].details.tripDetails.seatNumber;
                        //work on cash here

                    };
                };
                distance > 100 ?
                    distance = `${(distance / 1000).toFixed(1)} KM` :
                    distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} M`;

                this.setState({
                    summary: {
                        distance: distance.toLowerCase(),
                        passengerNo: `${passengerNo} ${passengerNo == 1 ? 'person' : 'people'}`,
                        totalM: totalM,
                    },
                })
            });
        });
    };
    sorter(a, b) {
        function numbergetter(time) {
            let slash1 = 0, slash2 = 0, slash3 = 0;
            for (let k = 0; k < time.length; k++) {
                if (time.charAt(k) == '-')
                    slash1 == 0 ? slash1 = k : slash2 == 0 ? slash2 = k : slash3 = k;
            };

            const DAY = Number(time.substring(0, slash1)) * 86400;
            const HOUR = Number(time.substring(slash1 + 1, slash2)) * 3600;
            const MINS = Number(time.substring(slash2 + 1, slash3)) * 60;
            const SECS = Number(time.substring(slash3 + 1, time.length));

            return (DAY + HOUR + MINS + SECS)
        };

        let a_time = numbergetter(a)
        let b_time = numbergetter(b)

        if (a_time > b_time)
            return -1;
        else
            return 1
    };
    dateText = (t) => {
        let slash1;
        for (let k = 0; k < t.length; k++)
            if (t.charAt(k) == '-') {
                slash1 = k;
                break;
            };

        return (`${t.substring(0, slash1)}/${monthNames.indexOf(this.state.month) + 1}/${this.state.year}`);

    };
    hidePicker = () => {
        this.loadResults();
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
        const opacity = this.bottom.interpolate({
            inputRange: [BOTTOM_POSITION, 0],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        })
        return (
            <View style={styles.container}>
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'History'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
                <View style={[styles.spaceView, { marginTop: y(28), alignItems: 'baseline' }]}>
                    <Text style={[styles.title,]}>Carpool history</Text>

                    <TouchableOpacity style={styles.dateView} onPress={this.showPicker}>
                        <Text style={styles.dateText}>{`${this.state.month} ${this.state.year}`}</Text>
                        <SimpleLineIcons size={y(15)} color={colors.BLUE} name={'calendar'} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                <View style={styles.list}>
                    {this.state.result ?
                        this.state.result !== 'NORESULTS' ?
                            <FlatList
                                ref={ref => this.flatList = ref}
                                data={Object.keys(this.state.result).sort(this.sorter).slice(0, this.state.limitTo)}
                                renderItem={({ item, index }) => {
                                    const data = this.state.result[item];
                                    return (
                                        <View style={styles.listCont}>
                                            <HistoryComponent
                                                date={this.dateText(item)}
                                                data={data}
                                                itemKey={item}
                                                navigation={this.props.navigation}
                                                userDetails={this.state.userDetails}
                                                mainAppend={`driverHistory/${this.state.userDetails.userID}/carpool/${this.state.year}/${this.state.month}/${item}/trips`}
                                            />
                                        </View>
                                    );
                                }}
                                keyExtractor={item => JSON.stringify(item)}
                                onEndReached={() => {
                                    this.setState({ limitTo: this.state.limitTo + 10 })
                                }}
                                onEndReachedThreshold={0.7}
                            /> :
                            <View style={{ alignItems: 'center', top: -y(20) }}>
                                <View style={styles.noresult}>
                                    <NoResultCatcus />
                                </View>
                                <Text style={[styles.loadingText, { fontSize: y(17), marginTop: y(10), }]}>No trips have been made today.</Text>
                            </View>
                        : <MaterialIndicator size={y(100)} color={colors.BLUE} />}
                </View>

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
                            selectedValue={this.state.month}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ month: itemValue })
                                //this.hidePicker();
                            }}>
                            <Picker.Item label="January" value="January" />
                            <Picker.Item label="Febuary" value="Febuary" />
                            <Picker.Item label="March" value="March" />
                            <Picker.Item label="April" value="April" />
                            <Picker.Item label="May" value="May" />
                            <Picker.Item label="June" value="June" />
                            <Picker.Item label="July" value="July" />
                            <Picker.Item label="August" value="August" />
                            <Picker.Item label="September" value="September" />
                            <Picker.Item label="October" value="October" />
                            <Picker.Item label="November" value="November" />
                            <Picker.Item label="December" value="December" />
                        </Picker>
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

                <Animated.View style={[styles.tabCont, { bottom: this.bottom, }]} {...this.panResponder.panHandlers}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            if (!this.state.summaryShown) {
                                this.movable = false;
                                Animated.spring(this.bottom, {
                                    toValue: 0,
                                    useNativeDriver: false,
                                }).start(() => {
                                    this.movable = true;
                                });
                                this.setState({ summaryShown: true });
                            }
                        }}>
                        <View style={styles.subView}>
                            <View style={styles.tab}></View>

                            <Text style={[styles.title, { marginTop: y(28), width: x(343), }]}>Summary</Text>
                            <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                            {this.state.result ?
                                this.state.result.length !== 'NORESULTS' ?
                                    <Animated.View style={{ opacity: opacity }}>
                                        <View style={[styles.spaceView, { marginTop: y(25) }]}>
                                            <Text style={[styles.text]}>{`Total passengers`}</Text>
                                            <ShimmerPlaceHolder autoRun={true} visible={this.state.summary ? true : false} style={{ width: x(120), height: y(16) }}>
                                                <Text style={[styles.text]}>{this.state.summary ? this.state.summary.passengerNo : ''}</Text>
                                            </ShimmerPlaceHolder>
                                        </View>
                                        <View style={[styles.spaceView, { marginTop: y(9) }]}>
                                            <Text style={[styles.text]}>{`Total kilometers provided`}</Text>
                                            <ShimmerPlaceHolder autoRun={true} visible={this.state.summary ? true : false} style={{ width: x(80), height: y(16) }}>
                                                <Text style={[styles.text]}>{this.state.summary ? this.state.summary.distance : ''}</Text>
                                            </ShimmerPlaceHolder>
                                        </View>
                                        <View style={[styles.spaceView, { marginTop: y(11), marginBottom: y(40) }]}>
                                            <Text style={[styles.bigText, { color: colors.BLUE_FONT }]}>{`TOTAL`}</Text>
                                            <ShimmerPlaceHolder autoRun={true} visible={this.state.summary ? true : false} style={{ width: x(80), height: y(26) }} colorShimmer={['#03cc00', '#82ff80', '#03cc00']}>
                                                <Text style={[styles.bigText, { color: colors.GREEN }]}>{this.state.summary ? this.state.summary.totalM : ''}</Text>
                                            </ShimmerPlaceHolder>
                                        </View>
                                    </Animated.View > :
                                    <Animated.View style={[styles.noResultLoad, { opacity: opacity }]}>
                                        <Text style={[styles.loadingText, { fontSize: y(24) }]}>You have not made any trips today...strange.</Text>
                                    </Animated.View>
                                : <Animated.View style={[styles.noResultLoad, { opacity: opacity }]}>
                                    <PacmanIndicator color={colors.BLUE} size={y(90)} />
                                    <Text style={[styles.loadingText, { top: -y(10) }]}>{`Loading results`}</Text>
                                </Animated.View>}
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </View>
        )
    }
};