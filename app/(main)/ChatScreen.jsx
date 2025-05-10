import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { fetchMessages, sendImage, sendMessage } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import Avatar from '../../components/Avatar';
import { hp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { getSupabaseFileUrl } from '../../services/imageService';
import { createNotification } from '../../services/notificationService';

const ChatScreen = () => {
    const { user } = useAuth();
    const { receiverId, receiverName, imageReceiver } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const flatListRef = useRef(null); // Tham chiếu FlatList


    const loadMessages = async () => {
        const data = await fetchMessages(user.id, receiverId);
        setMessages(data);
    };

    useEffect(() => {
        loadMessages();

        const messageSubscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMessage = payload.new;
                if ((newMessage.sender_id === user.id && newMessage.receiver_id === receiverId) ||
                    (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id)) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messageSubscription);
        };
    }, [receiverId, user.id]);

    useEffect(() => {
        // Cuộn đến tin nhắn mới nhất khi danh sách `messages` thay đổi
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = async () => {
        if (newMessage.trim()) {
            await sendMessage(user.id, receiverId, newMessage);
            if (user.id != receiverId) {
                //send notification
                let notify = {
                    senderId: user.id,
                    receiverId: receiverId,
                    title: 'Đã gửi tin nhắn cho bạn',
                    // data: JSON.stringify({ postId: post.id, commentId: res?.data?.id })
                }
                createNotification(notify);
            }
            setNewMessage('');
        }
        if (file) {
            await sendImage(user.id, receiverId, newMessage, file);
            setFile(null); // Reset after sending
        }
    };

    const onPick = async (isImage) => {
        let mediaConfig = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        };
        if (!isImage) {
            mediaConfig = {
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true
            };
        }
        let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);
        if (!result.canceled) {
            setFile(result.assets[0]);
        }
    };

    const getFileUri = (file) => {
        if (!file) return null;
        return file.uri;
    };

    return (
        <ScreenWrapper>
            <Header title="Chat với bạn bè" />
            <View style={styles.container}>
                <Text style={styles.title}>{receiverName}</Text>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={item.sender_id === user.id ? styles.myMessageContainer : styles.theirMessageContainer}>
                            {item.sender_id !== user.id && (
                                <Avatar
                                    size={hp(5)}
                                    uri={imageReceiver}
                                    rounded={theme.radius.md}
                                />
                            )}
                            <View style={item.sender_id === user.id ? styles.myMessage : styles.theirMessage}>
                                {/* Hiển thị nội dung tin nhắn */}
                                {item.content && <Text>{item.content}</Text>}

                                {/* Kiểm tra xem tin nhắn có phải là ảnh không */}
                                {item?.file && item?.file?.includes('messagesImages') && (
                                    <Image
                                        style={styles.previewImage}
                                        source={getSupabaseFileUrl(item?.file)}
                                    />
                                )}

                                {/* Kiểm tra xem tin nhắn có phải là video không */}
                                {item?.file && item?.file?.includes('messagesVideos') && (
                                    <Video
                                        style={styles.previewVideo}
                                        source={getSupabaseFileUrl(item?.file)}
                                        useNativeControls
                                        resizeMode="cover"
                                        isLooping
                                    />
                                )}
                            </View>
                            {item.sender_id === user.id && (
                                <Avatar
                                    size={hp(5)}
                                    uri={user.image}
                                    rounded={theme.radius.md}
                                />
                            )}
                        </View>
                    )}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }} // Thêm flexGrow để có thể cuộn được
                    showsVerticalScrollIndicator={true} // Hiển thị thanh cuộn
                />


                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Nhập tin nhắn..."
                    />
                    {file && (
                        <View style={styles.filePreview}>
                            {file.type === 'image' ? (
                                <Image source={{ uri: getFileUri(file) }} style={styles.previewImage} />
                            ) : (
                                <Video
                                    style={styles.previewVideo}
                                    source={{ uri: getFileUri(file) }}
                                    useNativeControls
                                    resizeMode="cover"
                                    isLooping
                                />
                            )}
                        </View>
                    )}
                    <TouchableOpacity onPress={() => onPick(true)} style={styles.imagePicker}>
                        <Icon name="image" size={30} color={theme.colors.textDark} />
                    </TouchableOpacity>
                    <Button title="Gửi" onPress={handleSend} />
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
        padding: 12,
        borderRadius: 20,
        marginVertical: 6,
        maxWidth: '70%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E1E1E1',
        padding: 12,
        borderRadius: 20,
        marginVertical: 6,
        maxWidth: '70%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#333',
    },
    imagePicker: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filePreview: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginLeft: 10,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    myMessageContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginVertical: 6,
    },
    theirMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },


    previewImage: {
        width: 150,          // Tăng kích thước cho hình ảnh hiển thị rõ hơn
        height: 100,         // Giữ tỷ lệ vuông để dễ dàng canh chỉnh
        marginRight: 10,
        borderRadius: 15,    // Bo góc mượt mà
        borderWidth: 1,      // Thêm viền nhẹ để nổi bật hình ảnh
        borderColor: '#ddd',
        shadowColor: '#000', // Thêm bóng đổ cho hiệu ứng nổi khối
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },

    previewVideo: {
        width: 150,          // Tương tự với video
        height: 100,
        marginRight: 10,
        borderRadius: 15,    // Bo góc video
        overflow: 'hidden',  // Cắt góc video để theo bo góc đã thiết lập
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        paddingRight: 30,
    },

    filePreview: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
