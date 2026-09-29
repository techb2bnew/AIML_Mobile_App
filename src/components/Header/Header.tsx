import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { borderColor, textDark, textMuted } from '../../constant/Color';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightIconName?: string;
  onRightPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onBackPress, rightIconName, onRightPress }) => (
  <View style={styles.container}>
    <View style={styles.side}>
      {onBackPress ? (
        <TouchableOpacity onPress={onBackPress} hitSlop={styles.hitSlop}>
          <Icon name="chevron-left" size={wp(7)} color={textDark} />
        </TouchableOpacity>
      ) : null}
    </View>

    <View style={[BaseStyle.alignItemsCenter, styles.center]}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>

    <View style={[styles.side, BaseStyle.alignItemsFlexEnd]}>
      {rightIconName ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={styles.hitSlop}>
          <Icon name={rightIconName} size={wp(6.5)} color={textDark} />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    height: hp(7),
    paddingHorizontal: spacings.large,
    ...BaseStyle.surfaceGradientBg,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  side: {
    width: wp(10),
  },
  center: {
    flex: 1,
  },
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  title: {
    color: textDark,
    ...fontStyle.fontSizeMedium1x,
    ...fontStyle.fontWeightMedium,
  },
  subtitle: {
    color: textMuted,
    ...fontStyle.fontSizeSmall1x,
    marginTop: 2,
  },
});

export default Header;
