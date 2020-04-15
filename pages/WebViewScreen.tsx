import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  DeviceEventEmitter,
  DrawerLayoutAndroid,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationInjectedProps } from "react-navigation";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { Icon } from "@ant-design/react-native";
import createInvoke, { IMessager } from 'react-native-webview-invoke/native'
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import { RNCamera } from 'react-native-camera';
import storage from "../utils/storage";
import config from "../config/config";
import { pxToDp } from "../utils/ui-utils";
import FaceCamera from "../components/FaceCamera";

interface DOMRect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const WebViewScreen: React.FC<NavigationInjectedProps & { navigation: DrawerLayoutAndroid }> = ({ navigation }) => {

  const [ webViewUrl, setWebViewUrl ] = useState<string>();
  const [ error, setError ] = useState<string>();
  const [ cameraRect, setCameraRect ] = useState<DOMRect>({});
  const [ showCamera, setShowCamera ] = useState<boolean>();
  const [ showAuthModal, setShowAuthModal ] = useState<boolean>();
  const [ fadeAnim, setFadeAnim ] = useState(new Animated.Value(0));
  const refWebView = useRef<WebView>(null);
  const refInvoke = useRef<IMessager>();
  const refOpenModal = useRef<(type: string) => void>();
  const refOpenModalType = useRef<string>();

  const openCamera = (rect: DOMRect = {}) => {
    console.log("openCamera()", rect);
    setCameraRect(rect || {});
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  const openAuthModal = (cbType: string) => {
    switch (cbType) {
      default:
        refOpenModalType.current = cbType;
        break;
    }
    const anim = new Animated.Value(0);
    setFadeAnim(anim);
    setShowAuthModal(true);
    Animated.timing(
      anim,
      {
        toValue: 1,
        duration: 500,
      }
    ).start();
  };

  const closeAuthModal = () => {
    refOpenModalType.current = undefined;
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 500,
      }
    ).start(() => {
      setShowAuthModal(false);
    });
  };

  const onError = (event: WebViewErrorEvent | WebViewHttpErrorEvent) => {
    console.log("Failed to load page:", event.nativeEvent);
    setError(event.nativeEvent.description);
    setTimeout(() => {
      if (refWebView.current) {
        refWebView.current.reload();
      }
    }, 10000);
  };

  const onLoad = (event: WebViewNavigationEvent) => {
    console.log("Loaded page:", event.nativeEvent);
  };

  const onLoadStart = (event: WebViewNavigationEvent) => {
    setError(undefined);
  };

  useEffect(() => {

    storage.load({
      key: 'webViewUrl',
      autoSync: false,
    }).catch(() => config.defaultWebViewUrl).then((url) => {
      console.log('setWebViewUrl:', url);
      setWebViewUrl(url);
    });

    refInvoke.current = createInvoke(() => {
      console.log("refWebView", refWebView.current);
      return refWebView.current;
    });
    refInvoke.current.define("openCamera", openCamera);
    refInvoke.current.define("closeCamera", closeCamera);
    refInvoke.current.define("openAuthModal", openAuthModal);
    refOpenModal.current = refInvoke.current.bind("openModal");

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
        {webViewUrl ? (
          <WebView
            ref={refWebView}
            style={{ flex: 1 }}
            source={{ uri: webViewUrl }}
            renderError={(errorDomain: string | undefined, errorCode: number, errorDesc: string) => (
              <Text style={[styles.webViewCoverText, { color: 'red' }]}>ERROR({errorCode}): {errorDesc}</Text>
            )}
            renderLoading={() => <Text style={styles.webViewCoverText}>LOADING...</Text>}
            onLoad={onLoad}
            onLoadStart={onLoadStart}
            onError={onError}
            onHttpError={onError}
            mediaPlaybackRequiresUserAction={false}
            cacheEnabled={false}
            overScrollMode="content"
            scalesPageToFit={true}
            geolocationEnabled
            saveFormDataDisabled
            domStorageEnabled
            textZoom={100}
            allowsFullscreenVideo
            onMessage={(event: WebViewMessageEvent) => {
              console.log("Page onMessage:", event.nativeEvent);
              if (refInvoke.current) {
                refInvoke.current.listener(event);
              }
            }}
          >
          </WebView>
        ) : null}
        {error ? (
          <Text style={[styles.webViewCoverText, { color: 'red' }]}>ERROR: {error}</Text>
        ) : null}
        {showCamera ? (
          <View style={{
            position: 'absolute',
            left: cameraRect.x || 0,
            top: cameraRect.y || 0,
            width: cameraRect.width || 400,
            height: cameraRect.height || 300,
            backgroundColor: 'black',
          }}>
            <>
              <RNCamera
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
                type={RNCamera.Constants.Type.front}
                captureAudio={false}
                // faceDetectionMode="accurate"
              />
            </>
          </View>
        ) : null}
        {showAuthModal? (
          <Animated.View
            style={[styles.authModalBackdrop, { opacity: fadeAnim, }]}
          >
            <View style={styles.authModal}>
              <View style={{marginRight: pxToDp(10)}}>
                <View style={styles.authBox}>
                  <FaceCamera
                    style={{width: "100%", height: "100%"}}
                    boxFlipHorizontally
                    onDetected={() => {
                      console.log("onDetected", refOpenModal.current, refOpenModalType.current);
                      refOpenModal.current && refOpenModalType.current && refOpenModal.current(refOpenModalType.current);
                      closeAuthModal();
                    }}
                  />
                </View>
                <Text style={styles.authBoxLabel}>人脸识别</Text>
              </View>
              <View>
                <View style={styles.authBox}>
                  <Image style={{width: "100%", height: "100%"}} source={require('../assets/img/qrcode.png')} resizeMode="cover" />
                </View>
                <Text style={styles.authBoxLabel}>扫码登录</Text>
              </View>
              <View style={styles.authRight}>
                <Text style={{ color: '#bbbbbb', fontSize: pxToDp(60), }}>请认证身份，以获取权限</Text>
                <Icon
                  style={{position: "absolute", right: 0, top: 0}}
                  name='close-circle'
                  size={pxToDp(50)}
                  color='#bbbbbb'
                  onPress={() => {
                    closeAuthModal();
                  }}
                />
              </View>
            </View>
          </Animated.View>
        ) : null}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  webViewCoverText: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingLeft: 5,
  },
  authModalBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  authModal: {
    backgroundColor: 'rgba(60,63,65,0.9)',
    flexDirection: 'row',
    position: 'absolute',
    top: pxToDp(1080-300-30*2-70),
    left: pxToDp(40),
    right: pxToDp(40),
    paddingHorizontal: pxToDp(60),
    paddingTop: pxToDp(30),
    paddingBottom: pxToDp(30+70),
    borderRadius: pxToDp(10),
  },
  authBox: {
    width: pxToDp(260),
    height: pxToDp(260),
    backgroundColor: 'white',
    padding: pxToDp(10),
    borderRadius: pxToDp(10),
  },
  authBoxLabel: {
    color: '#bbbbbb',
    textAlign: 'center',
    fontSize: pxToDp(36),
    lineHeight: pxToDp(40)
  },
  authRight: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: pxToDp(300),
  }
});

export default WebViewScreen;
