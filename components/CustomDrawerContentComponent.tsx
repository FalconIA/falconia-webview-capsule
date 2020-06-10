import React, { useContext, useEffect, useState } from "react";
import { BackHandler, DeviceEventEmitter, SafeAreaView, ScrollView, Text } from "react-native";
import { NavigationDrawerState } from "react-navigation-drawer";
import { DrawerNavigatorItemsProps, ThemedColor } from "react-navigation-drawer/lib/typescript/src/types";
import AndroidOpenSettings from 'react-native-android-open-settings'
import { Button, InputItem, List } from "@ant-design/react-native";
import { ThemeContext } from "react-navigation";
import config from "../config/config";

const CustomDrawerContentComponent: React.FC<DrawerNavigatorItemsProps & { navigation: { state: NavigationDrawerState } }> = (props) => {

  const {
    items,
    activeItemKey,
    getLabel,
    renderIcon,
    onItemPress,
    itemsContainerStyle,
    itemStyle,
    labelStyle,
    activeLabelStyle,
    inactiveLabelStyle,
    iconContainerStyle,
    drawerPosition,
    activeTintColor = {
      light: '#2196f3',
      dark: '#fff',
    },
    activeBackgroundColor = {
      light: 'rgba(0, 0, 0, .04)',
      dark: 'rgba(255, 255, 255, .04)',
    },
    inactiveTintColor = {
      light: 'rgba(0, 0, 0, .87)',
      dark: 'rgba(255, 255, 255, .87)',
    },
    inactiveBackgroundColor = {
      light: 'transparent',
      dark: 'transparent',
    },
    navigation: { state: { isDrawerOpen } },
  } = props;

  const [ match, setMatch ] = useState(false);
  const [ password, setPassword ] = useState<string>();
  const context = useContext(ThemeContext);

  const getColor = (color?: string | ThemedColor) => {
    if (!color) {
      return;
    } else if (typeof color === 'string') {
      return color;
    }
    return color[context];
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setMatch(false);
      setPassword(undefined);
    }
  });

  return (
    <ScrollView>
      <SafeAreaView>
        {match ? (
          <List renderHeader={'管理面板'}>
            {[...(items.map((route, index: number) => {
              const focused = activeItemKey === route.key;
              const color = focused ? getColor(activeTintColor) : getColor(inactiveTintColor);
              const backgroundColor = focused
                ? getColor(activeBackgroundColor)
                : getColor(inactiveBackgroundColor);
              const scene = {route, index, focused, tintColor: color};
              const icon = renderIcon(scene);
              const label = getLabel(scene);
              const accessibilityLabel =
                typeof label === 'string' ? label : undefined;
              const extraLabelStyle = focused
                ? activeLabelStyle
                : inactiveLabelStyle;

              return (
                <List.Item
                  key={route.key}
                  style={[{backgroundColor}, itemStyle]}
                  arrow="horizontal"
                  onPress={() => {
                    onItemPress({route, focused});
                  }}
                  delayLongPress={0}
                >
                  {typeof label === 'string' ? (
                    <Text
                      style={[
                        { color },
                        labelStyle,
                        extraLabelStyle,
                      ]}
                    >
                      {label}
                    </Text>
                  ) : (
                    label
                  )}
                </List.Item>
              );
            })), (
              <List.Item
                key={'refresh'}
                style={[{ backgroundColor: getColor(inactiveBackgroundColor) }, itemStyle]}
                arrow="horizontal"
                onPress={() => {
                  DeviceEventEmitter.emit("WebViewRefresh");
                }}
                delayLongPress={0}
              >
                <Text
                  style={[
                    { color: getColor(inactiveTintColor) },
                    labelStyle,
                    inactiveLabelStyle,
                  ]}
                >
                  刷新
                </Text>
              </List.Item>
            ), (
              <List.Item
                key={'app_settings'}
                style={[{ backgroundColor: getColor(inactiveBackgroundColor) }, itemStyle]}
                arrow="horizontal"
                onPress={() => {
                  AndroidOpenSettings.appDetailsSettings()
                }}
                delayLongPress={0}
              >
                <Text
                  style={[
                    { color: getColor(inactiveTintColor) },
                    labelStyle,
                    inactiveLabelStyle,
                  ]}
                >
                  应用信息设置
                </Text>
              </List.Item>
            ), (
              <List.Item
                key={'system_settings'}
                style={[{ backgroundColor: getColor(inactiveBackgroundColor) }, itemStyle]}
                arrow="horizontal"
                onPress={() => {
                  AndroidOpenSettings.generalSettings();
                }}
                delayLongPress={0}
              >
                <Text
                  style={[
                    { color: getColor(inactiveTintColor) },
                    labelStyle,
                    inactiveLabelStyle,
                  ]}
                >
                  系统设置
                </Text>
              </List.Item>
            ), (
              <List.Item
                key={'exit'}
                style={[{ backgroundColor: getColor(inactiveBackgroundColor) }, itemStyle]}
                arrow="horizontal"
                onPress={() => {
                  BackHandler.exitApp();
                }}
                delayLongPress={0}
              >
                <Text
                  style={[
                    { color: getColor(inactiveTintColor) },
                    labelStyle,
                    inactiveLabelStyle,
                  ]}
                >
                  退出
                </Text>
              </List.Item>
            )]}
          </List>
        ) : (
          <List renderHeader={'管理面板'}>
            <InputItem
              clear
              type="password"
              value={password}
              onChange={value => {
                setPassword(value);
              }}
              placeholder="管理密码"
            >
              管理密码
            </InputItem>
            <List.Item>
              <Button
                onPress={() => {
                  setMatch(config.adminPassword === password);
                }}
                type="primary"
              >
                确{'　'}定
              </Button>
            </List.Item>
          </List>
        )}
        {/*<DrawerItems {...props} />*/}
      </SafeAreaView>
    </ScrollView>
  )
};

export default CustomDrawerContentComponent;
