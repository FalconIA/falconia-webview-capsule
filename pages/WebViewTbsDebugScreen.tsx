import React, { useEffect, useRef } from 'react';
import { DeviceEventEmitter, DrawerLayoutAndroid, SafeAreaView, } from 'react-native';
import { NavigationInjectedProps } from "react-navigation";
import WebView from "react-native-webview";

const WebViewTbsDebugScreen: React.FC<NavigationInjectedProps & { navigation: DrawerLayoutAndroid }> = ({ navigation }) => {

  const refWebView = useRef<WebView>(null);

  useEffect(() => {
    DeviceEventEmitter.addListener("WebViewRefresh", () => {
      if (refWebView.current) {
        refWebView.current.reload();
      }
    });

    return () => {
      DeviceEventEmitter.removeAllListeners("WebViewRefresh");
    };
  }, []);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          ref={refWebView}
          style={{ flex: 1 }}
          source={{ uri: 'http://debugtbs.qq.com/' }}
          cacheEnabled={false}
          overScrollMode="content"
          scalesPageToFit={true}
          saveFormDataDisabled
          textZoom={100}
        >
        </WebView>
      </SafeAreaView>
    </>
  );
};

export default WebViewTbsDebugScreen;
