/**
 * Deccan Origin Universal Cross-Platform Alert Helper
 * Bridges React Native Alert and Web Browsers ensuring callbacks (onPress)
 * always execute seamlessly without being dropped.
 */

import { Alert as RNAlert, Platform } from 'react-native';

// Global listener for the active AlertModal component
let alertListener = null;

export const registerAlertListener = (listener) => {
  alertListener = listener;
  return () => {
    alertListener = null;
  };
};

/**
 * Universal showAlert function
 * @param {string} title
 * @param {string} message
 * @param {Array<{text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive'}>} [buttons]
 * @param {Object} [options]
 */
export const showAlert = (title, message, buttons = [{ text: 'OK' }], options = {}) => {
  if (alertListener) {
    alertListener({
      title,
      message,
      buttons: buttons.length ? buttons : [{ text: 'OK' }],
      options,
    });
    return;
  }

  // Fallback for native if listener is not mounted yet
  if (Platform.OS !== 'web') {
    RNAlert.alert(title, message, buttons, options);
  } else {
    // Basic web fallback
    const msg = message ? `${title}\n\n${message}` : title;
    window.alert(msg);
    if (buttons && buttons.length > 0 && buttons[0].onPress) {
      buttons[0].onPress();
    }
  }
};

// Polyfill Alert.alert on Web safely so existing calls use the custom modal
if (Platform.OS === 'web') {
  RNAlert.alert = showAlert;
}

export default showAlert;
