import React from 'react';
import { createDrawerNavigator } from "react-navigation-drawer";
import { createAppContainer } from "react-navigation";
import CustomDrawerContentComponent from "./components/CustomDrawerContentComponent";
import WebViewScreen from "./pages/WebViewScreen";

const MyDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: WebViewScreen,
    navigationOptions: {
      title: '主屏幕',
    }
  },
}, {
  drawerType: "slide",
  drawerPosition: "right",
  drawerLockMode: "unlocked",
  edgeWidth: 100,
  contentComponent: (props) => <CustomDrawerContentComponent {...props} />
});

const App = createAppContainer(MyDrawerNavigator);

export default App;
