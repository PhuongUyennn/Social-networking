import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase'; // Thư viện Supabase của bạn
import ScreenWrapper from '../../components/ScreenWrapper'; // Nếu có
import Avatar from '../../components/Avatar';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import RenderHTML from 'react-native-render-html';
import Header from '../../components/Header';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        body: '',
        file: '',
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    // Lấy danh sách bài đăng
    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('id, created_at, body, file, userId')
            .order('created_at', { ascending: false }); // Sắp xếp bài đăng theo thời gian tạo

        if (error) {
            console.log("Lỗi khi lấy dữ liệu bài đăng:", error.message);
            Alert.alert("Lỗi", "Không thể lấy danh sách bài đăng.");
        } else {
            setPosts(data);
        }
    };

    // Tạo bài đăng mới
    const createPost = async () => {
        const { error } = await supabase.from('posts').insert([{
            ...newPost,
            userId: supabase.auth.user().id,  // Lấy ID người dùng hiện tại
        }]);

        if (error) {
            console.log(error.message);
            Alert.alert("Lỗi", "Không thể tạo bài đăng.");
        } else {
            setNewPost({ body: '', file: '' });
            fetchPosts(); // Tải lại danh sách bài đăng sau khi tạo mới
            Alert.alert("Thông báo", "Tạo bài đăng mới thành công");
        }
    };

    // Cập nhật bài đăng
    const updatePost = async (postId, updatedInfo) => {
        const { error } = await supabase.from('posts').update(updatedInfo).eq('id', postId);
        if (error) {
            console.log(error.message);
            Alert.alert("Lỗi", "Không thể cập nhật bài đăng.");
        } else {
            fetchPosts(); // Tải lại danh sách sau khi cập nhật
            Alert.alert("Thông báo", "Cập nhật bài đăng thành công");
        }
    };

   // Xóa bài đăng với xác nhận
const deletePost = async (postId) => {
    Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa bài đăng này không?",
        [
            {
                text: "Không", // Nút "Không" sẽ không làm gì
                onPress: () => console.log("Không xóa bài đăng"),
                style: "cancel",
            },
            {
                text: "Có", // Nút "Có" sẽ thực hiện xóa bài đăng
                onPress: async () => {
                    const { error } = await supabase.from('posts').delete().eq('id', postId);
                    if (error) {
                        console.log(error.message);
                        Alert.alert("Lỗi", "Không thể xóa bài đăng.");
                    } else {
                        setPosts(posts.filter(post => post.id !== postId)); // Cập nhật danh sách bài đăng
                        Alert.alert("Thông báo", "Xóa bài đăng thành công");
                    }
                },
            },
        ]
    );
};


    return (
        <ScreenWrapper>
            <Header title="Danh sách các bài Post"/>
            <View style={styles.container}>
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.postCard}>
                            <RenderHTML
                                contentWidth={wp(100)}
                                source={{ html: item?.body }}
                                style={styles.postBody}
                            />
                            <Text style={styles.postDate}>{`Ngày tạo: ${new Date(item.created_at).toLocaleString()}`}</Text>
                            {item.file && <Avatar
                                uri={item?.file}
                                size={hp(20)}
                                rounded={theme.radius.xxl * 1.5}
                                style={{ borderWidth: 2 }}
                            />}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => deletePost(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Xóa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => updatePost(item.id, { body: 'Nội dung cập nhật' })} style={styles.editButton}>
                                    <Text style={styles.editButtonText}>Cập nhật</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(5),
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: wp(6),
        fontWeight: 'bold',
        marginBottom: hp(3),
        color: theme.colors.primary,
    },
    postCard: {
        backgroundColor: '#fff',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: hp(3),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    postBody: {
        fontSize: wp(4),
        color: '#333',
        marginBottom: hp(1),
    },
    postDate: {
        fontSize: wp(3.5),
        color: '#777',
        marginBottom: hp(2),
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp(2),
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginTop: hp(4),
        marginBottom: hp(2),
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: wp(3),
        marginBottom: hp(2),
        borderRadius: wp(2),
        backgroundColor: '#fff',
        fontSize: wp(4),
    },
});

export default PostManagement;
