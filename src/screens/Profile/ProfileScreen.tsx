import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentSoft,
  appBg,
  borderColor,
  cardBg,
  dangerColor,
  dangerSoft,
  textBody,
  textDark,
  shadowColor,
  textMuted,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount } from '../../services/api/accountApi';
import { ApiError, CurrentUserDetails, getMe } from '../../services/api/authApi';
import Header from '../../components/Header/Header';
import ProfileListItem from '../../components/ProfileListItem/ProfileListItem';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import {
  DELETE_ACCOUNT,
  DELETE_ACCOUNT_CONFIRM,
  DELETE_ACCOUNT_MESSAGE,
  DELETE_ACCOUNT_TITLE,
  ERROR_GENERIC,
  LOGOUT,
  LOGOUT_CONFIRM,
  LOGOUT_MESSAGE,
  LOGOUT_TITLE,
  PRIVACY_POLICY,
  PROFILE_TITLE,
  TERMS_OF_SERVICE,
} from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.PROFILE>;

const roleLabel = (role?: string) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { session, logout } = useAuth();
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileDetails, setProfileDetails] = useState<CurrentUserDetails | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token) {
      return;
    }
    setProfileError(null);
    getMe(session.token)
      .then(setProfileDetails)
      .catch(err => {
        // Still show the session's own user details underneath the error.
        setProfileError(err instanceof ApiError ? err.message : ERROR_GENERIC);
      });
  }, [session?.token]);

  const displayName = profileDetails?.name ?? session?.user.name;
  const displayEmail = profileDetails?.email ?? session?.user.email;
  const displayRole = profileDetails?.role ?? session?.user.role;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutVisible(false);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount(session.user.id);
      await logout();
      setIsDeleteVisible(false);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={PROFILE_TITLE} onBackPress={navigation.goBack} />

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        {!!profileError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{profileError}</Text>
          </View>
        )}

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{displayName?.charAt(0) ?? ''}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel(displayRole)}</Text>
          </View>
        </View>

        <View style={styles.listGroup}>
          <ProfileListItem
            iconName="shield-check-outline"
            label={PRIVACY_POLICY}
            onPress={() => navigation.navigate(ROUTES.PRIVACY_POLICY)}
          />
          <ProfileListItem
            iconName="file-document-outline"
            label={TERMS_OF_SERVICE}
            onPress={() => navigation.navigate(ROUTES.TERMS_OF_SERVICE)}
          />
          <ProfileListItem
            iconName="logout"
            label={LOGOUT}
            isLast
            onPress={() => setIsLogoutVisible(true)}
          />
        </View>

        <View style={styles.listGroup}>
          <ProfileListItem
            iconName="trash-can-outline"
            label={DELETE_ACCOUNT}
            danger
            showChevron={false}
            isLast
            onPress={() => setIsDeleteVisible(true)}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={isDeleteVisible}
        title={DELETE_ACCOUNT_TITLE}
        message={DELETE_ACCOUNT_MESSAGE}
        confirmLabel={DELETE_ACCOUNT_CONFIRM}
        loading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteVisible(false)}
      />

      <ConfirmModal
        visible={isLogoutVisible}
        title={LOGOUT_TITLE}
        message={LOGOUT_MESSAGE}
        confirmLabel={LOGOUT_CONFIRM}
        loading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    // Matches the Header's background so the status-bar area reads as one
    // continuous bar instead of a grey strip sitting above a white one.
    ...BaseStyle.surfaceGradientBg,
  },
  body: {
    ...BaseStyle.flex,
    backgroundColor: appBg,
  },
  scrollContent: {
    paddingHorizontal: spacings.large,
    paddingTop: spacings.large,
    paddingBottom: spacings.xxLarge,
  },
  errorBanner: {
    marginBottom: spacings.large,
    backgroundColor: dangerSoft,
    borderRadius: 10,
    padding: spacings.normalx,
  },
  errorText: {
    color: dangerColor,
    ...fontStyle.fontSizeSmall2x,
    textAlign: 'center',
  },
  avatarSection: {
    ...BaseStyle.alignJustifyCenter,
    backgroundColor: cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor,
    paddingVertical: spacings.xLarge,
    marginBottom: spacings.large,
    shadowColor,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: accentSoft,
    marginBottom: spacings.normalx,
  },
  avatarInitial: {
    color: textDark,
    ...fontStyle.fontSizeLargeXX,
    ...fontStyle.fontWeightMedium,
  },
  name: {
    color: textDark,
    ...fontStyle.fontSizeMedium2x,
    ...fontStyle.fontWeightMedium,
  },
  email: {
    color: textMuted,
    ...fontStyle.fontSizeNormal1x,
    marginTop: spacings.xxsmall,
  },
  roleBadge: {
    marginTop: spacings.normalx,
    paddingHorizontal: spacings.normalx,
    paddingVertical: spacings.xxsmall,
    borderRadius: 20,
    backgroundColor: accentSoft,
  },
  roleText: {
    color: textBody,
    ...fontStyle.fontSizeSmall1x,
    ...fontStyle.fontWeightThin1x,
  },
  listGroup: {
    backgroundColor: cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor,
    overflow: 'hidden',
    marginBottom: spacings.large,
  },
});

export default ProfileScreen;
