/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import MyStack from './src/Navigation/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import auth from '@react-native-firebase/auth';
import { checkIfFirstLaunch } from './src/Functions/Functions';
import LoadingScreen from './src/Components/LoadingScreen/LoadingScreen';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      initializing: true,
      user: null,
      firstLaunch: false,
      checkFirstLaunch: false,
      isVerified: null,
      checkIfVerifed: false
    };
  };
  componentDidMount() {
    SplashScreen.hide();
    this.subscriber = auth().onAuthStateChanged(this.onAuthStateChanged);

    AsyncStorage.getItem('USER_DETAILS')
      .then((result) => {
        if (result) {
          const userDetails = JSON.parse(result);
          this.setState({ checkIfVerifed: true, isVerified: userDetails.driverVerified == 'VERIFIED' ? true : false })
        }
        else
          this.setState({ checkIfVerifed: true, isVerified: false })
      })
      .catch((error => {
        console.log(error.message);
        this.setState({ checkIfVerifed: true, isVerified: false });
      }))
    checkIfFirstLaunch()
      .then(isFirstLaunch => {
        if (isFirstLaunch) {//HAS LAUNCHED BEFORE
          this.setState({ firstLaunch: false, checkFirstLaunch: true });
        }
        else {//FIRST LAUNCH
          this.setState({ firstLaunch: true, checkFirstLaunch: true });
        }
      });


      messaging().setBackgroundMessageHandler(async remoteMessage => {
      });
  };
  componentWillUnmount() {
    return this.subscriber;
  }
  onAuthStateChanged = (user) => {
    this.setState({ user: user })
    if (this.state.initializing)
      this.setState({ initializing: false });
  }
  render() {
    if (this.state.initializing == true || this.state.checkFirstLaunch == false || this.state.checkIfVerifed == false)
      return <LoadingScreen />;
    else
      return (
        <NavigationContainer>
          <MyStack isFirstLaunch={this.state.firstLaunch} isDriverVerified={this.state.isVerified} />
        </NavigationContainer>
      );
  }
};