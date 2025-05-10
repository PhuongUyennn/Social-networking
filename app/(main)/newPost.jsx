import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../../components/Avatar'
import RichTextEditor from '../../components/RichTextEditor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Icon from '../../assets/icons'
import { TouchableOpacity } from 'react-native'
import Button from '../../components/Button'
import * as ImagePicker from 'expo-image-picker'
import { getSupabaseFileUrl } from '../../services/imageService'
import {Video} from 'expo-av'
import { createOrUpdatePost } from '../../services/postService'

const NewPost = () => {
  const post = useLocalSearchParams();
  console.log('post: ', post);
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(file);

  useEffect(()=>{
    if(post && post.id){
      bodyRef.current = post.body;
      setFile(post.file || null);
      setTimeout(()=>{
        editorRef?.current?.setContentHTML(post.body);
      },300);
      
    }
  },[]);

  const onPick = async (isImage) => {
    let mediaCofig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    }
    if (!isImage) {
      mediaCofig = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync(mediaCofig);
    // console.log('file: ', result.assets[0]);
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  }

  const isLocalFile = file => {
    if (!file) return null;
    if (typeof file == 'object') return true;

    return false;
  }

  const getTypeFile = file => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }

    //check image or video for remote  file
    if (file.includes('postImages')) {
      return 'image';
    }
    return 'video';
  }

  const getFileUri = file => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }

    return getSupabaseFileUrl(file)?.uri;
  }
  
  const onSubmit = async () => {
    if(!bodyRef.current && !file){
      Alert.alert('Post', 'please choose an image or add post body');
      return;
    }
    let data ={
      file,
      body: bodyRef.current,
      userId: user?.id,

    }

    if(post && post.id) data.id = post.id;
    //create post
    setLoading(true)
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if(res.success){
      setFile(null);
      bodyRef.current = '';
      editorRef.current?.setContentHTML('');
      router.back();
    }
    else {
      Alert.alert('Post', res.msg);
    }

  }


  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Tạo Bài Viết"></Header>
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>
                {user && user.name}
              </Text>
              <Text style={styles.publicText}>
                Công khai
              </Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor editorRef={editorRef} onChange={body => bodyRef.current = body} />
          </View>


          {
            file && (
              <View style={styles.file}>
                {
                  getTypeFile(file) == 'video' ? (
                    <Video
                    style={{flex: 1}}
                    source={
                    {  uri: getFileUri(file)}
                    }
                    useNativeControls
                    resizeMode='cover'
                    isLooping

                    />
                  ) : (
                    <Image source={{ uri: getFileUri(file) }} resizeMode='cover' style={{ flex: 1 }} />

                  )

                }
                <Pressable style={styles.closeIcon}>
                  <Icon name="delete" size={25} color="white" onPress={()=>setFile(null)}></Icon>
                </Pressable>
              </View>
            )
          }

          <View style={styles.media}>

            <Text style={styles.addImageText}>Thêm ảnh vào bài viết của bạn</Text>

            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.textDark} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="camera" size={30} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Cập Nhật": "Đăng"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />

      </View>
    </ScreenWrapper>
  )
}

export default NewPost

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: 'center'
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text
  },
  avatar: {
    height: hp(6.5),
    width: wp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.demium,
    color: theme.colors.textLight
  },
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.darkLight,
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  addImageText: {
    fontWeight: theme.fonts.semibold,
    fontSize: hp(1.9),
    color: theme.colors.text
  },
  file: {
    height: hp(30),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous'
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 0, 0, 0.6)'
  }
})