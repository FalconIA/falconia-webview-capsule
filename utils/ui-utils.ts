import { Dimensions, Platform, StatusBar } from 'react-native';
import { NavigationActions, NavigationDispatch, NavigationParams, StackActions } from "react-navigation";
import { Component } from "react";

const dimensions = Dimensions.get('window');
export const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT
} = dimensions;
const UI_WITH_PX = 1920;

const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;

export const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 44 : 20) : StatusBar.currentHeight;
export const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 88 : 64) : 64;

export function pxToDp(uiElementPx: number = UI_WITH_PX): number {
  let dp;
  if (uiElementPx === UI_WITH_PX) {
    dp = SCREEN_WIDTH;
  } else {
    dp = SCREEN_WIDTH * uiElementPx / UI_WITH_PX;
  }
  return dp;
}

export function resetNavStack(navigation: { dispatch: NavigationDispatch }, routeName: string, params?: NavigationParams): boolean {
  return navigation.dispatch(StackActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName, params })] }));
}

export function resetToLogin(navigation: { dispatch: NavigationDispatch }, backRouteName?: string): boolean {
  return resetNavStack(navigation, 'Login', { backRouteName });
}

export function bindLoadingState(promise: Promise<any>, component?: Component | null, key: string = 'loading'): Promise<any> {
  if (!component) {
    return promise;
  }

  const setLoadingState = (value: boolean) => {
    let state: { [k: string]: any } = {};
    state[key] = value;
    component.setState(state);
  };

  const always = (data: any) => {
    setLoadingState(false);

    return data;
  };

  setLoadingState(true);

  return promise.then(always, (error) => {
    return Promise.reject(always(error));
  });
}

export default {};
