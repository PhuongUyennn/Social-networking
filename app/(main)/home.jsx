import { Alert, Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';
import Avatar from '../../components/Avatar';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import { getUserData } from '../../services/userService';

let limit = 0;

const Home = () => {
  const router = useRouter();
  const { user, setAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const handlePostEvent = async (payload) => {
    console.log('payload: ', payload);
    if (payload.eventType === 'INSERT' && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    if (payload.eventType === 'DELETE' && payload.old.id) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== payload.old.id));
    }
    if (payload.eventType === 'UPDATE' && payload?.new?.id) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === payload.new.id
            ? { ...post, body: payload.new.body, file: payload.new.file }
            : post
        )
      );
    }
  };

  const handleNewNotification = async (payload) => {
    console.log('got new notification: ', payload);
    if (payload.eventType == 'INSERT' && payload.new.id) {
      setNotificationCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    const postChannel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
      .subscribe();

    const notificationChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user.id}` },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  const getPosts = async () => {
    if (!hasMore) return;
    limit += 10;
    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    limit = 10;
    let res = await fetchPosts(limit);
    if (res.success) {
      setPosts(res.data);
      setHasMore(true);
    }
    setRefreshing(false);
  };

  const onLogOut = () => {
    supabase.auth.signOut();
    setAuth(null);
    router.push('login');
  };

  return (
    <ScreenWrapper bg='white'>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MEWMEW</Text>
          <View style={styles.icons}>

            <Pressable onPress={() => router.push('user')}>
              <Icon name="user" size={hp(3.4)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => {
              setNotificationCount(0)
              router.push('notifications')
            }}>
              <Icon name="heart" size={hp(3.4)} strokeWidth={2} color={theme.colors.text} />
              {
                notificationCount > 0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{notificationCount}</Text>
                  </View>
                )
              }
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="plus" size={hp(3.4)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('search')}>
              <Icon name="search" size={hp(3.4)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar uri={user?.image} size={hp(4.3)} rounded={theme.radius.sm} style={{ borderWidth: 2 }} />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
          onEndReached={getPosts}
          onEndReachedThreshold={0}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>Không còn bài viết nào</Text>
              </View>
            )
          }
        />


      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontWeight: theme.fonts.bold,
    fontSize: hp(3.2),
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.rosrLight
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold
  }
});
