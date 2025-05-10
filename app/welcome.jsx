import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import ScreenWrapper from '../components/ScreenWrapper'
import Button from '../components/Button'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import { useRouter } from 'expo-router'

const Welcome = () => {
    const router = useRouter();
    return (
       
        <ScreenWrapper bg="white">
            <StatusBar />
            <View style={styles.container}>
                <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/welcome.png')} />
                <View style={{ gap: 20 }}>
                    <Text style={styles.title}>MEWMEW!</Text>
                    <Text style={styles.punchline}>
                    Nơi mà mọi suy nghĩ đều tìm được chỗ đứng và mọi hình ảnh đều kể về một ngày...
                    </Text>

                </View>
                {/* footer */}
                <View style={styles.footer}>
                    <Button
                        title='Bắt đầu'
                        buttonStyle={{ marginHorizontal: wp(13) }}
                        onPress={() => router.push('signUp')}
                    />


                    <View style={styles.bottomTextContainer} y>
                        <Text sytle={styles.loginText}>
                           Bạn đã có tài khoản!
                        </Text>
                        <Pressable onPress={() => router.push('login')}>
                            <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.extraBold}]}>
                                Đăng Nhập
                            </Text>
                        </Pressable>

                        {/* <Pressable onPress={() => router.push('forForgotPassword')}>
                            <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.extraBold}]}>
                            Quên Mật Khẩu
                            </Text>
                        </Pressable> */}
                    </View>

                </View>



            </View>

        </ScreenWrapper>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        paddingHorizontal: wp(4)

    },
    welcomeImage: {
        height: hp(30),
        width: wp(100),
        alignSelf: 'center'
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(4),
        textAlign: 'center',
        fontWeight: theme.fonts.extraBold

    },
    footer: {
        gap: 30,
        width: '110%'
    },
    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6)
    }
})