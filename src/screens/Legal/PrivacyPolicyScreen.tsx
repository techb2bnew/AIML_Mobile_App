import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { spacings } from '../../constant/Fonts';
import { appBg } from '../../constant/Color';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import Header from '../../components/Header/Header';
import LegalDocument from '../../components/LegalDocument/LegalDocument';
import { PRIVACY_POLICY_CONTENT } from '../../constants/text/legal';
import { PRIVACY_POLICY } from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.PRIVACY_POLICY>;

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <Header title={PRIVACY_POLICY} onBackPress={navigation.goBack} />
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LegalDocument content={PRIVACY_POLICY_CONTENT} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    ...BaseStyle.surfaceGradientBg,
  },
  scroll: {
    ...BaseStyle.flex,
    backgroundColor: appBg,
  },
  content: {
    padding: spacings.large,
    paddingBottom: spacings.xxLarge,
  },
});

export default PrivacyPolicyScreen;
