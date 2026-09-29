import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { borderColor, dangerColor, textDark, textFaint } from '../../constant/Color';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

interface ProfileListItemProps {
  iconName: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({
  iconName,
  label,
  onPress,
  danger = false,
  showChevron = true,
}) => {
  const color = danger ? dangerColor : textDark;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.container}>
      <View style={[BaseStyle.flexDirectionRow, BaseStyle.alignItemsCenter]}>
        <Icon name={iconName} size={wp(5.5)} color={color} style={styles.icon} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      {showChevron && <Icon name="chevron-right" size={wp(5.5)} color={textFaint} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    ...BaseStyle.justifyContentSpaceBetween,
    height: hp(7),
    paddingHorizontal: spacings.large,
    ...BaseStyle.surfaceGradientBg,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  icon: {
    marginRight: spacings.normalx,
  },
  label: {
    ...fontStyle.fontSizeNormal2x,
    ...fontStyle.fontWeightThin1x,
  },
});

export default ProfileListItem;
