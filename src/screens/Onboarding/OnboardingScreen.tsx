import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentColor,
  authMutedColor,
  dotInactiveColor,
  splashBgColor,
  whiteColor,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { markOnboardingSeen } from '../../services/storage/onboardingStorage';
import { ILLUSTRATIONS } from './illustrations';
import Button from '../../components/Button/Button';
import {
  ONBOARDING_GET_STARTED,
  ONBOARDING_NEXT,
  ONBOARDING_SKIP,
  ONBOARDING_SLIDES,
} from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.ONBOARDING>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const finish = async () => {
    await markOnboardingSeen();
    navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
  };

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topBar}>
        {!isLast && (
          <TouchableOpacity onPress={finish} hitSlop={styles.hitSlop}>
            <Text style={styles.skip}>{ONBOARDING_SKIP}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={item => item.title}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        // Width and colour can't run on the native driver; with three slides
        // the JS-driven scroll event is plenty.
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        renderItem={({ item }: { item: (typeof ONBOARDING_SLIDES)[number] }) => (
          <View style={[styles.slide, { width }]}>
            {React.createElement(ILLUSTRATIONS[item.illustration])}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((slide, i) => {
            const range = [(i - 1) * width, i * width, (i + 1) * width];
            return (
              <Animated.View
                key={slide.title}
                style={[
                  styles.dot,
                  {
                    width: scrollX.interpolate({
                      inputRange: range,
                      outputRange: [8, 24, 8],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: scrollX.interpolate({
                      inputRange: range,
                      outputRange: [dotInactiveColor, accentColor, dotInactiveColor],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          label={isLast ? ONBOARDING_GET_STARTED : ONBOARDING_NEXT}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    backgroundColor: splashBgColor,
  },
  topBar: {
    height: wp(12),
    ...BaseStyle.alignItemsFlexEnd,
    justifyContent: 'center',
    paddingHorizontal: spacings.xLarge,
  },
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  skip: {
    color: authMutedColor,
    ...fontStyle.fontSizeNormal1x,
  },
  slide: {
    ...BaseStyle.alignJustifyCenter,
    paddingHorizontal: spacings.xxLarge,
    paddingBottom: spacings.large,
  },
  title: {
    color: whiteColor,
    ...fontStyle.fontSizeLarge,
    ...fontStyle.fontWeightBold,
    textAlign: 'center',
    marginTop: spacings.large,
  },
  body: {
    color: authMutedColor,
    ...fontStyle.fontSizeNormal2x,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: spacings.normalx,
  },
  footer: {
    paddingHorizontal: spacings.xLarge,
    paddingBottom: spacings.xLarge,
  },
  dots: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignJustifyCenter,
    marginBottom: spacings.xLarge,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    width: '100%',
  },
});

export default OnboardingScreen;
