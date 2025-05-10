import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();
 
  // Hàm gửi yêu cầu quên mật khẩu
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Thông báo", "Vui lòng nhập email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "myapp://ResetPasswordScreen"  // Deep link tới màn hình reset-password
    });

    if (error) {
      Alert.alert("Lỗi", error.message);
    } else {
      Alert.alert("Thành công", "Email đặt lại mật khẩu đã được gửi.");
      router.push('/login'); // Chuyển hướng đến màn hình đăng nhập nếu cần
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <Button title="Quên mật khẩu" onPress={handleForgotPassword} />
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
});
