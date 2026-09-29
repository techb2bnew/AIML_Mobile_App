/**
 * AIME — voice-first AI assistant app
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { AssistantProvider } from './src/context/AssistantContext';

enableScreens();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <AssistantProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AssistantProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
