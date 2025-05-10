import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { fetchNotifications } from '../../services/notificationService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useRouter } from 'expo-router';
import NotificationItem from '../../components/NotificationItem'
import Header from '../../components/Header';


const Notifications = () => {
  const [notificaions, setNotifications] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotification();
  }, []);

  const getNotification = async () => {
    let res = await fetchNotifications(user.id);
    if (res.success) setNotifications(res.data);
  }


  return (
    <ScreenWrapper style={styles.container}>
      <Header title="Thông Báo"/>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
        {
          notificaions.map(item => {
            return (
              <NotificationItem
                item={item}
                key={item?.id}
                router={router}
              />
            )
          })
        }
        {
          notificaions.length ==0 && (
            <Text style={styles.noData}>No notifications yet</Text>
          )
        }
      </ScrollView>
    </ScreenWrapper>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20)
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center'
  }
})