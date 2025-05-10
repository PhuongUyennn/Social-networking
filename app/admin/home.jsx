import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'; 
import { Link } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from '../../assets/icons';
import { theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const onLogOut = async () => {
    // setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
        Alert.alert('sign Out', 'error signing out');
    }
}

const handleLogout = async () => {
    Alert.alert('Đăng Xuất', 'Bạn có chắc là muốn đăng xuất không?', [
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

const AdminHome = () => {
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Logout button in top-right corner */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} >
                    <Icon name="logout"  color={theme.colors.rose}  />
                </TouchableOpacity>

                <Text style={styles.title}>Quản Trị Viên</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Link href="/admin/UserManagement" style={styles.link}>Quản lý người dùng</Link>
                    </View>
                    <View style={styles.gridItem}>
                        <Link href="/admin/PostManagement" style={styles.link}>Quản lý bài viết</Link>
                    </View>
                    <View style={styles.gridItem}>
                        <Link href="/admin/CommentManagement" style={styles.link}>Quản lý bình luận</Link>
                    </View>
                    {/* <View style={styles.gridItem}>
                        <Link href="/admin/MessageManagement" style={styles.link}>Quản lý tin nhắn</Link>
                    </View>
                    <View style={styles.gridItem}>
                        <Link href="/admin/NotificationManagement" style={styles.link}>Quản lý thông báo</Link>
                    </View> */}
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa', // Nền sáng cho toàn bộ trang
        position: 'relative', // This allows for absolute positioning of elements inside
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
        textTransform: 'uppercase', // Chữ in hoa đẹp hơn cho tiêu đề
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly', // Căn giữa và đều các ô
        gap: 20,
    },
    gridItem: {
        width: '45%', // Mỗi ô chiếm 45% chiều rộng màn hình để tạo khoảng cách đẹp
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12, // Bo góc mềm mại
        elevation: 5, // Thêm hiệu ứng bóng cho các ô
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        marginBottom: 20, // Khoảng cách dưới các ô
    },
    link: {
        fontSize: 18,
        color: '#007BFF', // Màu xanh nhẹ cho các liên kết
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase', // Chữ in hoa cho các liên kết
    },
    logoutButton: {
        position: 'absolute', // Absolute positioning
        top: 20, // Distance from the top of the screen
        right: 20, // Distance from the right of the screen
        backgroundColor: 'transparent', // Optional: Make background transparent
        padding: 10, // Padding for the button
    },
});

export default AdminHome;
