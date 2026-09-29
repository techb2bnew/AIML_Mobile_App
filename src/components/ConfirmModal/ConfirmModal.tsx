import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  borderColor,
  dangerColor,
  scrim,
  textBody,
  textDark,
  textMuted,
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
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={[BaseStyle.flexDirectionRow, BaseStyle.justifyContentSpaceBetween]}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={loading}>
            <Text style={styles.cancelText}>{CANCEL}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} disabled={loading}>
            <Text style={styles.confirmText}>{loading ? '...' : confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: scrim,
    ...BaseStyle.alignJustifyCenter,
    paddingHorizontal: spacings.ExtraLarge,
  },
  card: {
    width: '100%',
    ...BaseStyle.surfaceGradientBg,
    borderRadius: 16,
    padding: spacings.xLarge,
  },
  title: {
    color: textDark,
    ...fontStyle.fontSizeMedium1x,
    ...fontStyle.fontWeightMedium,
    marginBottom: spacings.normalx,
  },
  message: {
    color: textBody,
    ...fontStyle.fontSizeNormal1x,
    marginBottom: spacings.xLarge,
  },
  cancelButton: {
    flex: 1,
    height: wp(11),
    borderRadius: 10,
    borderWidth: 1,
    borderColor,
    ...BaseStyle.alignJustifyCenter,
    marginRight: spacings.normalx,
  },
  cancelText: {
    color: textMuted,
    ...fontStyle.fontSizeNormal1x,
    ...fontStyle.fontWeightThin1x,
  },
  confirmButton: {
    flex: 1,
    height: wp(11),
    borderRadius: 10,
    backgroundColor: dangerColor,
    ...BaseStyle.alignJustifyCenter,
  },
  confirmText: {
    color: '#fff',
    ...fontStyle.fontSizeNormal1x,
    ...fontStyle.fontWeightMedium,
  },
});

export default ConfirmModal;
