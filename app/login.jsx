import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import Icon from '../assets/icons'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () =>{
    if(!emailRef.current || !passwordRef.current) {
      Alert.alert('Đăng Nhập','Làm ơn điền đầy đủ thông tin!');
      return;
    }
    // if(emailRef.current=='admin' && passwordRef.current=='admin'){
    //   router.push('admin/home');
    //   return;
    // }
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    // console.log('errowww', error);
    if(error) {
      Alert.alert("Login", error.message);
    }
  }

  return (
    <ScreenWrapper bg = 'white'>
      <StatusBar style='dark' />
      <View style={styles.container}>
        <BackButton router={router} />
        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Chào bạn,</Text>
          <Text style={styles.welcomeText}>Mừng bạn quay trở lại</Text>
        </View>

        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Làm ơn đăng nhập để tiếp tục
          </Text>
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Nhập Email"
            onChangeText={value => emailRef.current = value}
          />

          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Nhập Mật Khẩu"
            secureTextEntry
            onChangeText={value => passwordRef.current = value}
          />

          <Text style={styles.forgotPassword}>
            Quên mật khẩu?
          </Text>
          <Button title={'Login'} loading = {loading} onPress = {onSubmit}/>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Chưa có tài khoản
          </Text>
          <Pressable onPress={()=>router.push('signUp')}>
            <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight:theme.fonts.bold}]}>Đăng Ký</Text>
          </Pressable>
        </View>
      </View>

    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text
  },
  form: {
    gap: 25
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6)
  }
})