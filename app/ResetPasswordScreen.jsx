import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter, useSearchParams } from 'expo-router';

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const { access_token } = useSearchParams();  // Lấy access token từ query params
  console.log("tesstt", 'adfdf');
  // Kiểm tra và thiết lập session với access_token khi có
  useEffect(() => {
    console.log("Access Token:", access_token); 
    if (access_token) {
      supabase.auth.setSession(access_token);  // Thiết lập session với token từ deep link
    }
  }, [access_token]);

  const handleResetPassword = async () => {
    // Kiểm tra mật khẩu
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp.");
      return;
    }

    // Cập nhật mật khẩu cho người dùng
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      Alert.alert("Lỗi", error.message);
    } else {
      Alert.alert("Thành công", "Mật khẩu đã được cập nhật.");
      router.push('/login');  // Chuyển hướng đến màn hình đăng nhập sau khi cập nhật mật khẩu
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Cập nhật mật khẩu" onPress={handleResetPassword} />
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});
