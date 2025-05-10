import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchAllUsers } from '../../services/postService';
import { FlatList } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Avatar from '../../components/Avatar';
import { theme } from '../../constants/theme';
import { hp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const User = () => {
    const { user } = useAuth();
    const [allUser, setAllUser] = useState(null);
    const router = useRouter();
    
    useEffect(() => {
        getAllUser();
    }, []);

    const getAllUser = async () => {
        let res = await fetchAllUsers(user.id);
        if (res.success) {
            setAllUser(res.data);
        }
    }

    const openChatScreen = (userId, userName, image) => {
        router.push({
            pathname: 'ChatScreen',
            params: { receiverId: userId, receiverName: userName, imageReceiver: image }
        });
    };

    const openProfileScreen = (userId, userName, image, email, address, phoneNumber, bio) => {
        router.push({
            pathname: 'profileFriend',
            params: { userId: userId, userName: userName, image: image, email: email, address: address, phoneNumber: phoneNumber, bio: bio}
        });
    };

    return (
        <ScreenWrapper bg="white">
            <Header title="Danh sách bạn bè" />
            <View style={styles.container}>
                <FlatList
                    data={allUser}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Avatar
                                    size={hp(5)}
                                    uri={item.image}
                                    rounded={theme.radius.md}
                                />
                                <View style={styles.userNameContainer}>
                                    <Text style={styles.userName}>{item.name}</Text>
                                    {/* Chấm xanh lá cây */}
                                    <View style={styles.onlineIndicator} />
                                </View>
                            </View>
                            <View style={styles.iconContainer}>
                                <TouchableOpacity onPress={() => openProfileScreen(item.id, item.name, item.image, item.email, item.address, item.phoneNumber, item.bio)} style={styles.icon}>
                                    <FontAwesome name="user" size={24} color="#555" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openChatScreen(item.id, item.name, item.image)} style={styles.icon}>
                                    <FontAwesome name="envelope" size={24} color="#555" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
}

export default User;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        backgroundColor: '#f5f5f5',
        paddingTop: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15,
        color: '#333',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userNameContainer: {
        marginLeft: 15,
        alignItems: 'flex-start',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#28a745',  // Màu xanh lá cây
        marginTop: 5,  // Đặt chấm dưới tên người dùng
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    icon: {
        marginLeft: 15,
    },
});
