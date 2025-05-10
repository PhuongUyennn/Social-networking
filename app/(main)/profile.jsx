import { Alert, StyleSheet, Text, TouchableOpacity, View, Pressable, FlatList } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import Header from '../../components/Header'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'

var limit = 0;
const Profile = () => {
    const { user, setAuth } = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    const [hasMore, setHaseMore] = useState(true);



    const getPosts = async () => {
        // call the api here
        if (!hasMore) return null;
        limit = limit + 10;
        // console.log("áddd", limit)
        let res = await fetchPosts(limit, user.id);
        if (res.success) {
            if (posts.length == res.data.length) setHaseMore(false);
            setPosts(res.data);
        }

    }


    const onLogOut = async () => {
        // setAuth(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('sign Out', 'error siging out');
        }

    }

    const handleLogout = async () => {
        Alert.alert('Đăng Xuất', 'Bạn có chắc muốn đăng xuất không?', [
            {
                text: 'Không',
                onPress: () => console.log('modal cancelled'),
                style: 'cancel'
            },
            {
                text: 'Đăng Xuất',
                onPress: () => onLogOut(),
                style: 'destructive'
            }
        ])
    }
    return (
        <ScreenWrapper bg='white'>
            <FlatList
                data={posts}
                ListHeaderComponent={<UserHeader user={user} router={router} handleLogout={handleLogout} />}
                ListHeaderComponentStyle={{ marginBottom: 30 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listStyle}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <PostCard
                    item={item}
                    currentUser={user}
                    router={router}
                />
                }
                onEndReached={() => {
                    getPosts();
                }}
                onEndReachedThreshold={0}
                ListFooterComponent={hasMore ? (
                    <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                        <Loading />
                    </View>
                ) : (
                    <View style={{ marginVertical: 30 }}>
                        <Text style={styles.noPosts}>Không có bài viết nào</Text>
                    </View>
                )}

            />


        </ScreenWrapper>
    )
}

const UserHeader = ({ user, router, handleLogout }) => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) }}>
            <View>
                <Header title='Trang Cá Nhân' mp={30} style={styles.header} />
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" color={theme.colors.rose} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={{ gap: 15 }}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            uri={user?.image}
                            size={hp(12)}
                            rounded={theme.radius.xxl * 1.5}
                            style={{ borderWidth: 2 }}
                        />
                        <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
                            <Icon name="edit" size={22} strokeWidth={2.5} />
                        </Pressable>
                    </View>

                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text style={styles.userName}>{user && user.name}</Text>
                        <Text style={styles.infoText}>{user && user.address}</Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        <View style={styles.info}>
                            <Icon name="mail" size={20} color={theme.colors.textLight} ></Icon>
                            <Text style={styles.infoText}>
                                {user && user.email}
                            </Text>
                        </View>
                        {
                            user && user.phoneNumber && (
                                <View style={styles.info}>
                                    <Icon name="call" size={20} color={theme.colors.textLight} ></Icon>
                                    <Text style={styles.infoText}>
                                        {user && user.phoneNumber}
                                    </Text>
                                </View>
                            )
                        }
                        {
                            user && user.bio && (
                                <Text style={styles.infoText}>{user.bio}</Text>
                            )
                        }
                    </View>

                </View>
            </View>
        </View>
    )
}
export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        marginHorizontal: wp(4),
        marginBottom: 20
    },
    headerShape: {
        width: wp(100),
        height: hp(20)
    },
    avatarContainer: {
        height: hp(12),
        width: wp(12),
        alignSelf: 'center',
        marginLeft: -40
    },
    editIcon: {
        position: 'absolute',
        bottom: -5,
        right: -58,
        padding: 7,
        borderRadius: 50,
        backgroundColor: 'white',
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        opacity: 0.9,
        shadowRadius: 5,
        elevation: 7
    },
    userName: {
        fontWeight: '500',
        color: theme.colors.textDark,
        fontSize: hp(3),
        left: 10
    },

    info: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    infoText: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textLight,

    },
    logoutButton: {
        position: 'absolute',
        right: 0,
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: '#fee2e2',
    },
    listStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text
    },

})