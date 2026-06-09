// utils/toastService.js
import Toast, { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#137A3A', backgroundColor: '#E8F5E9' }} // green accent + light background
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: '#137A3A' }}
      text2Style={{ fontSize: 14, color: '#2c3e50' }}
    />
  ),
  danger: (props) => (
    <BaseToast
      {...props}
      style={{ width: '95%', borderLeftColor: '#e74c3c', backgroundColor: '#fdecea' }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: '#e74c3c' }}
      text2Style={{ fontSize: 14, color: '#c0392b' }}
    />
  ),
};

export const showToast = (type = 'info', title = '', message = '') => {
  Toast.show({
    type,       // 'success', 'error', 'info', or your custom type
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000, // auto hide after 3s
  });
};
