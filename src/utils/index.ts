import { Dimensions, PixelRatio } from 'react-native';


export const widthPercentageToDP = (widthPercent: number | string): number => {
  const screenWidth = Dimensions.get('window').width;
  const elemWidth = parseFloat(String(widthPercent));
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

export const heightPercentageToDP = (heightPercent: number | string): number => {
  const screenHeight = Dimensions.get('window').height;
  const elemHeight = parseFloat(String(heightPercent));
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};
