import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BaseStyle } from '../../constant/Style';
import { accentColor } from '../../constant/Color';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'small', color = accentColor }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.alignJustifyCenter,
  },
});

export default Loader;
