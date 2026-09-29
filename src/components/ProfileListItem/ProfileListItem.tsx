import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentSoft,
  borderColor,
  dangerColor,
  dangerSoft,
  textDark,
  textFaint,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';

interface ProfileListItemProps {
  iconName: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({
  iconName,
  label,
  onPress,
  danger = false,
  showChevron = true,
  isLast = false,
}) => {
  const color = danger ? dangerColor : textDark;

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={[styles.container, !isLast && styles.divider]}
    >
      <View style={[BaseStyle.flexDirectionRow, BaseStyle.alignItemsCenter]}>
        <View style={[styles.iconWrap, { backgroundColor: danger ? dangerSoft : accentSoft }]}>
          <Icon name={iconName} size={wp(5)} color={color} />
        </View>
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
    minHeight: wp(15),
    paddingHorizontal: spacings.normalx,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColor,
  },
  iconWrap: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(9.5),
    height: wp(9.5),
    borderRadius: wp(3),
    marginRight: spacings.normalx,
  },
  label: {
    ...fontStyle.fontSizeNormal2x,
    ...fontStyle.fontWeightThin1x,
  },
});

export default ProfileListItem;
