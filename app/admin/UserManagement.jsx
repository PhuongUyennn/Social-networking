import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import ScreenWrapper from '../../components/ScreenWrapper';
import Avatar from '../../components/Avatar';
import { hp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Header from '../../components/Header';
import { useRouter } from 'expo-router';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);  // Trạng thái làm mới
    const router = useRouter();
    
    useEffect(() => {
        fetchUsers();
    }, []);

    // Lấy danh sách người dùng trừ bạn
    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*').neq('name', 'admin');
        if (error) {
            console.log("Lỗi khi lấy dữ liệu:", error.message);
            Alert.alert("Lỗi", "Không thể lấy danh sách người dùng.");
        } else {
            setUsers(data);  // Cập nhật state với dữ liệu nhận được
        }
    };

    // Hàm gọi khi kéo để làm mới
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();  // Gọi lại hàm fetchUsers để lấy dữ liệu mới
        setRefreshing(false);  // Đặt trạng thái refreshing về false khi xong
    };

   // Xóa người dùng
const deleteUser = async (userId) => {
    Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa người dùng này không?",
        [
            {
                text: "Hủy",
                onPress: () => console.log("Hủy bỏ xóa"),
                style: "cancel",
            },
            {
                text: "Xóa",
                onPress: async () => {
                    const { error } = await supabase.from('users').delete().eq('id', userId);
                    if (error) {
                        console.log(error.message);
                    } else {
                        setUsers(users.filter(user => user.id !== userId));
                        Alert.alert("Thông báo", "Xóa người dùng thành công");
                    }
                },
            },
        ],
        { cancelable: false }
    );
};


    // Cập nhật thông tin người dùng
    const updateUser = (userId, userName, image, email, address, phoneNumber, bio) => {
        router.push({
            pathname: '/admin/editProfileAdmin',
            params: { userId, userName, image, email, address, phoneNumber, bio }
        });
    };

    return (
        <ScreenWrapper>
            <Header title='Danh Sách Người Dùng'/>
            <View style={styles.container}>
                <Text style={styles.totalUsers}>Tổng số người dùng: {users.length}</Text>

                <FlatList
                    style={{ flex: 1 }}
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.userCard}>
                            {/* Hiển thị số thứ tự của người dùng */}
                            <Text style={styles.indexText}>Số thứ tự: {index + 1}</Text>

                            <View style={styles.avatarContainer}>
                                <Avatar
                                    uri={item?.image}
                                    size={hp(12)}
                                    rounded={theme.radius.xxl * 1.5}
                                    style={styles.avatar}
                                />
                            </View>

                            <Text style={styles.userName}>Tên: {item.name}</Text>
                            <Text style={styles.userInfo}>Email: {item.email}</Text>
                            <Text style={styles.userInfo}>Số điện thoại: {item.phoneNumber}</Text>
                            <Text style={styles.userInfo}>Địa chỉ: {item.address}</Text>
                            <Text style={styles.userInfo}>Bio: {item.bio}</Text>

                            <View style={styles.buttonsContainer}>
                                <TouchableOpacity onPress={() => deleteUser(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Xóa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => updateUser(item.id, item.name, item.image, item.email, item.address, item.phoneNumber, item.bio)} style={styles.editButton}>
                                    <Text style={styles.editButtonText}>Cập nhật</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}  // Trạng thái refresh
                            onRefresh={onRefresh}   // Hàm được gọi khi kéo xuống
                        />
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    totalUsers: {
        fontSize: 23,
        marginBottom: 20,
        color: '#555',
        fontWeight: 'bold',  // Làm đậm văn bản
    },
    userCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    indexText: {
        fontSize: 16,
        color: '#888',
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    avatar: {
        borderWidth: 3,
        borderColor: '#ddd',
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    userInfo: {
        fontSize: 16,
        color: '#555',
        marginVertical: 2,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    deleteButton: {
        backgroundColor: '#ff5c5c',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
    },
    deleteButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    editButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
    },
    editButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default UserManagement;
