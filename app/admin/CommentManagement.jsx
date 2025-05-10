import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import Avatar from '../../components/Avatar';
import Header from '../../components/Header';

const CommentManagement = () => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchComments();
    }, []);

    // Lấy danh sách bình luận
    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select(`*, 
                user: users (id, name, image)`)
            .order('created_at', { ascending: false });

        if (error) {
            console.log("Lỗi khi lấy dữ liệu bình luận:", error.message);
            Alert.alert("Lỗi", "Không thể lấy danh sách bình luận.");
        } else {
            setComments(data);
        }
    };

    // Xóa bình luận
    const deleteComment = (commentId) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa bình luận này không?",
            [
                { text: "Không", style: "cancel" },
                {
                    text: "Có", onPress: async () => {
                        const { error } = await supabase.from('comments').delete().eq('id', commentId);
                        if (error) {
                            console.log(error.message);
                            Alert.alert("Lỗi", "Không thể xóa bình luận.");
                        } else {
                            setComments(comments.filter(comment => comment.id !== commentId));
                            Alert.alert("Thông báo", "Xóa bình luận thành công");
                        }
                    }
                },
            ]
        );
    };

    return (
        <ScreenWrapper>
            <Header title='Quản lý bình luận'/>
            <View style={styles.container}>
                <Text style={styles.commentCount}>Số lượng bình luận: {comments.length}</Text>
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.commentCard}>
                            <View style={styles.userInfo}>
                                <Avatar
                                    uri={item?.user?.image}
                                    size={hp(10)}
                                    rounded={theme.radius.xxl}
                                    style={styles.avatar}
                                />
                                <Text style={styles.userName}>{item?.user?.name}</Text>
                                <TouchableOpacity onPress={() => deleteComment(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.commentBody}>{item.text}</Text>
                            <Text style={styles.commentDate}>{`Ngày tạo: ${new Date(item.created_at).toLocaleString()}`}</Text>
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
        backgroundColor: '#f4f7fb',
    },
    title: {
        fontSize: wp(6),
        fontWeight: 'bold',
        marginBottom: hp(3),
        color: theme.colors.primary,
    },
    commentCount: {
        fontSize: wp(4.5),
        color: '#555',
        marginBottom: hp(3),
    },
    commentCard: {
        backgroundColor: '#fff',
        padding: wp(5),
        borderRadius: wp(3),
        marginBottom: hp(3),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    userName: {
        fontSize: wp(5),
        fontWeight: '600',
        color: '#333',
        marginLeft: wp(3),
        flex: 1,
    },
    avatar: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    commentBody: {
        fontSize: wp(4),
        color: '#333',
        marginBottom: hp(1.5),
        lineHeight: hp(3),
    },
    commentDate: {
        fontSize: wp(3.5),
        color: '#999',
        marginBottom: hp(2),
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: wp(1),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        height: hp(5),
        // marginTop: hp(15), // Đặt marginTop để đẩy nút xuống dưới
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: wp(4),
    },
});



export default CommentManagement;
