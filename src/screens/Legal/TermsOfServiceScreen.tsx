import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { textBody } from '../../constant/Color';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import Header from '../../components/Header/Header';
import { TERMS_OF_SERVICE, TERMS_OF_SERVICE_BODY } from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.TERMS_OF_SERVICE>;

const TermsOfServiceScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <Header title={TERMS_OF_SERVICE} onBackPress={navigation.goBack} />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.body}>{TERMS_OF_SERVICE_BODY}</Text>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    ...BaseStyle.surfaceGradientBg,
  },
  content: {
    padding: spacings.large,
  },
  body: {
    color: textBody,
    ...fontStyle.fontSizeNormal1x,
    lineHeight: 22,
  },
});

export default TermsOfServiceScreen;
