import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
    try {

        if (post.file && typeof post.file == 'object') {
            let isImage = post?.file?.type == 'image';
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
            if (fileResult.success) post.file = fileResult.data;
            else {
                return fileResult;
            }
        }
        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single();

        if (error) {
            console.log('createPost error: ', error);
            return { success: false, msg: 'Could not create your post' };
        }
        return { success: true, data: data };
    }
    catch (error) {
        console.log('createPost error: ', error);
        return { success: false, msg: 'Could not create your post' };
    }
}

export const fetchPosts = async (limit = 10, userId) => {
    try {
        if (userId) {
            const { data, error } = await supabase
                .from('posts')
                .select(`
            *,
            user: users (id, name, image),
            postLikes (*),
            comments (count)
        `)
                .order('created_at', { ascending: false })
                .eq('userId', userId)
                .limit(limit);

            if (error) {
                console.log('fetchPosts error: ', error);
                return { success: false, msg: 'Could not fetch the posts' };
            }

            return { success: true, data: data };
        }
        else {
            const { data, error } = await supabase
                .from('posts')
                .select(`
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (count)
    `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.log('fetchPosts error: ', error);
                return { success: false, msg: 'Could not fetch the posts' };
            }

            return { success: true, data: data };
        }

    }
    catch (error) {
        console.log('fetchPosts error: ', error);
        return { success: false, msg: 'Could not fetch the posts' };
    }
}


export const fetchPostDetails = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
            *,
            user: users (id, name, image),
            postLikes (*),
            comments (*, user: users(id, name, image))
            `)
            .eq('id', postId)
            .order("created_at", { ascending: false, foreignTable: 'comments' })
            .single();

        if (error) {
            console.log('fetchPostDetails error: ', error);
            return { success: false, msg: 'Could not fetch the posts' };
        }

        return { success: true, data: data };

    }
    catch (error) {
        console.log('fetchPostDetails error: ', error);
        return { success: false, msg: 'Could not fetch the posts' };
    }
}

export const createPostLike = async (postLike) => {
    try {

        const { data, error } = await supabase
            .from('postLikes')
            .insert(postLike)
            .select()
            .single();

        if (error) {
            console.log('postLike error: ', error);
            return { success: false, msg: 'Could not like the post' };
        }

        return { success: true, data: data };

    }
    catch (error) {
        console.log('postLike error: ', error);
        return { success: false, msg: 'Could not like the post' };
    }
}



export const removePostLike = async (postId, userId) => {
    try {

        const { error } = await supabase
            .from('postLikes')
            .delete()
            .eq('userId', userId)
            .eq('postId', postId);

        if (error) {
            console.log('postLike error: ', error);
            return { success: false, msg: 'Could not remove the post like' };
        }

        return { success: true };

    }
    catch (error) {
        console.log('postLike error: ', error);
        return { success: false, msg: 'Could not remove the post like' };
    }
}

export const createComment = async (comment) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert(comment)
            .select()
            .single();

        if (error) {
            console.log('comment error: ', error);
            return { success: false, msg: 'Could not create your comment' };
        }

        return { success: true, data: data };

    }
    catch (error) {
        console.log('comment error: ', error);
        return { success: false, msg: 'Could not create your comment' };
    }
}


export const removeComment = async (commentId) => {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)


        if (error) {
            console.log('removeComment error: ', error);
            return { success: false, msg: 'Could not remove the comment' };
        }

        return { success: true, data: { commentId } };

    }
    catch (error) {
        console.log('removeComment error: ', error);
        return { success: false, msg: 'Could not remove the comment' };
    }
}


export const removePost = async (postId) => {
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)


        if (error) {
            console.log('removePost error: ', error);
            return { success: false, msg: 'Could not remove the post' };
        }

        return { success: true, data: { postId } };

    }
    catch (error) {
        console.log('removePost error: ', error);
        return { success: false, msg: 'Could not remove the post' };
    }
}


export const fetchAllUsers = async (currentUserId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, image, bio, email, address, phoneNumber')
            .neq('id', currentUserId); // Lấy tất cả người dùng trừ bạn

        if (error) {
            console.log('fetchUsersExcludingCurrent error: ', error);
            return { success: false, msg: 'Could not fetch users' };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log('fetchUsersExcludingCurrent error: ', error);
        return { success: false, msg: 'Could not fetch users' };
    }
}

// postService.js
export const fetchMessages = async (senderId, receiverId) => {
    try {
        // Truy vấn tin nhắn gửi từ người dùng đến người nhận
        const { data: sentMessages, error: sentError } = await supabase
            .from('messages')
            .select('*')
            .eq('sender_id', senderId)
            .eq('receiver_id', receiverId);

        // Truy vấn tin nhắn gửi từ người nhận đến người dùng
        const { data: receivedMessages, error: receivedError } = await supabase
            .from('messages')
            .select('*')
            .eq('sender_id', receiverId)
            .eq('receiver_id', senderId);

        // Kiểm tra lỗi
        if (sentError || receivedError) throw sentError || receivedError;

        // Kết hợp và sắp xếp tin nhắn theo thời gian
        const allMessages = [...sentMessages, ...receivedMessages];
        allMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return allMessages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};


// Hàm gửi tin nhắn mới
export const sendMessage = async (senderId, receiverId, content) => {

    const { data, error } = await supabase
        .from('messages')
        .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
    if (error) console.error('Lỗi gửi tin nhắn:', error);
    return data;
};

export const sendImage = async (senderId, receiverId, content, file) => {
    try {

        if (file && typeof file == 'object') {
            let isImage = file?.type == 'image';
            let folderName = isImage ? 'messagesImages' : 'messagesVideos';
            let fileResult = await uploadFile(folderName, file?.uri, isImage);
            if (fileResult.success) file = fileResult.data;
            else {
                return fileResult;
            }
        }
        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender_id: senderId, receiver_id: receiverId, content, file }]);

        if (error) {
            console.log('sendImage error: ', error);
            return { success: false, msg: 'Could not create your sendImage' };
        }
        return { success: true, data: data };
    }
    catch (error) {
        console.log('sendImage error: ', error);
        return { success: false, msg: 'Could not create your sendImage' };
    }
}