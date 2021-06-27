import React from 'react';
import { Animated, Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { } from '../Functions/Functions';
import auth from '@react-native-firebase/auth';

import SignIn from '../Screens/SignIn/SignIn';
import OnBoarding from '../Screens/OnBoarding/OnBoarding';
import ProcessingApplication from '../Screens/ProcessingApplication/ProcessingApplication';
import Main from '../Screens/Main/Main';
import History from '../Screens/History/History';
import SeeDetails from '../Screens/SeeDetails/SeeDetails';
import RideDetails from '../Screens/RideDetails/RideDetails';
import Vehicles from '../Screens/Vehicles/Vehicles';
import AddAVehicle from '../Screens/AddAVehicle/AddAVehicle';
import ContactUs from '../Screens/ContactUs/ContactUs';
import Settings from '../Screens/Settings/Settings';
import Profile from '../Screens/Profile/Profile';
import Privacy from '../Screens/Privacy/Privacy';
import SavedPlaces from '../Screens/SavedPlaces/SavedPlaces';
import ChangePassword from '../Screens/ChangePassword/ChangePassword';
import TripBreakdown from '../Screens/TripBreakdown/TripBreakdown';
import TripStarted from '../Screens/TripStarted/TripStarted';
import VerifyDetails from '../Screens/VerifyDetails/VerifyDetails';
import Preferences from '../Screens/Preferences/Preferences';
import Chat from '../Screens/Chat/Chat';
import PayoutInformation from '../Screens/PayoutInformation/PayoutInformations';
import PreviousMessages from '../Screens/PreviousMessages/PreviousMessages';
import SupportMessage from '../Screens/SupportMessage/SupportMessage';
import ScheduledTrips from '../Screens/ScheduledTrips/ScheduledTrips';

const Stack = createStackNavigator();
let initialRouteName;

auth().onAuthStateChanged(user => {
  if (user)
    initialRouteName = 'Main';
  else
    initialRouteName = 'SignIn';
});



export default class MyStack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    if (this.props.isFirstLaunch)
      this.initialRouteName = 'OnBoarding';
    else if (initialRouteName == 'SignIn')
      this.initialRouteName = 'SignIn';
    else if (this.props.isDriverVerified == true)
      this.initialRouteName = 'Main';
    else if (this.props.isDriverVerified == false)
      this.initialRouteName = 'ProcessingApplication';

  };
  componentDidMount() {
  }
  render() {
    return (
      <Stack.Navigator
        initialRouteName={this.initialRouteName}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false
        }}
      >
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="OnBoarding" component={OnBoarding} />
        <Stack.Screen name="ProcessingApplication" component={ProcessingApplication} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="SeeDetails" component={SeeDetails} />
        <Stack.Screen name="RideDetails" component={RideDetails} />
        <Stack.Screen name="Vehicles" component={Vehicles} />
        <Stack.Screen name="AddAVehicle" component={AddAVehicle} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="SavedPlaces" component={SavedPlaces} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="TripBreakdown" component={TripBreakdown} />
        <Stack.Screen name="TripStarted" component={TripStarted} />
        <Stack.Screen name="VerifyDetails" component={VerifyDetails} />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="PayoutInformation" component={PayoutInformation} />
        <Stack.Screen name="PreviousMessages" component={PreviousMessages} />
        <Stack.Screen name="SupportMessage" component={SupportMessage} />
        <Stack.Screen name="ScheduledTrips" component={ScheduledTrips} />
      </Stack.Navigator>
    );
  }
}
const fadeIn = (sceneProps) => {
  const { current } = sceneProps;

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  })

  return {
    cardStyle: {
      opacity: opacity
    },
  }
}
const fasterFadeIn = (sceneProps) => {
  const { current } = sceneProps;

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  })

  return {
    cardStyle: {
      opacity: opacity
    },
  }
}
const translateY = (sceneProps) => {
  const { current, layouts } = sceneProps;
  const height = layouts.screen.height;

  const translateY = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height, height / 2, 0]
  })
  return {
    cardStyle: {
      transform: [{ translateY }]
    },
  }
}
const fasterTranslateY = (sceneProps) => {
  const { current, layouts } = sceneProps;
  const height = layouts.screen.height;

  const translateY = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height, 0, 0]
  })
  return {
    cardStyle: {
      transform: [{ translateY }]
    },
  }
}