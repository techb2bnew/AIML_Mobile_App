import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentColor,
  accentSoft,
  borderColor,
  cardBg,
  cardBgSoft,
  onAccent,
  scrim,
  shadowColor,
  textBody,
  textDark,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { CANCEL } from '../../constants/text/en';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  iconName?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
  iconName = 'help-circle-outline',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.haloOuter, { backgroundColor: accentSoft }]}>
            <View style={[styles.haloInner, { backgroundColor: accentSoft }]}>
              <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
                <Icon name={iconName} size={wp(8)} color={onAccent} />
              </View>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{CANCEL}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.confirmButton, { backgroundColor: accentColor }]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={onAccent} />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: scrim,
    ...BaseStyle.alignJustifyCenter,
    paddingHorizontal: spacings.xLarge,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: cardBg,
    borderRadius: 28,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xxLarge,
    paddingBottom: spacings.xLarge,
    shadowColor,
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  haloOuter: {
    ...BaseStyle.alignJustifyCenter,
    padding: spacings.small,
    borderRadius: 999,
    opacity: 0.55,
    marginBottom: spacings.large,
  },
  haloInner: {
    ...BaseStyle.alignJustifyCenter,
    padding: spacings.small,
    borderRadius: 999,
  },
  iconCircle: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(17),
    height: wp(17),
    borderRadius: wp(8.5),
  },
  title: {
    color: textDark,
    ...fontStyle.fontSizeMedium2x,
    ...fontStyle.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacings.small,
  },
  message: {
    color: textBody,
    ...fontStyle.fontSizeNormal2x,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacings.xLarge,
  },
  buttons: {
    ...BaseStyle.flexDirectionRow,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: wp(13),
    borderRadius: 16,
    borderWidth: 1,
    borderColor,
    backgroundColor: cardBgSoft,
    ...BaseStyle.alignJustifyCenter,
    marginRight: spacings.normalx,
  },
  cancelText: {
    color: textDark,
    ...fontStyle.fontSizeNormal2x,
    ...fontStyle.fontWeightMedium,
  },
  confirmButton: {
    flex: 1,
    height: wp(13),
    borderRadius: 16,
    ...BaseStyle.alignJustifyCenter,
  },
  confirmText: {
    color: onAccent,
    ...fontStyle.fontSizeNormal2x,
    ...fontStyle.fontWeightMedium,
  },
});

export default ConfirmModal;
