import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './routes';

// Lets code outside a screen (e.g. AuthContext when a session expires)
// navigate without needing the `navigation` prop.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
