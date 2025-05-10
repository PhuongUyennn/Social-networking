import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Button, TextInput, View, StyleSheet, FlatList, Text } from 'react-native';
import PostCard from '../../components/PostCard';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import { theme } from '../../constants/theme';
const SearchScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState([]);
    const { user } = useAuth();
    const router = useRouter();

    const handleSearch = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`*,
                    user: users (id, name, image),
                    postLikes (*),
                    comments (count)`)
                .order('created_at', { ascending: false })
                .ilike('body', `%${searchText}%`);

            if (error) {
                console.error(error);
                return;
            }
            setResults(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ScreenWrapper>
            <Header title='Tìm kiềm bài viết'/>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập từ khóa bài viết"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <Button title="Tìm kiếm" onPress={handleSearch} color= {theme.colors.primary} />

                <View style={styles.resultsContainer}>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <PostCard item={item} router={router} currentUser={user} />
                        )}
                        ListEmptyComponent={
                            <Text style={styles.noResults}>Không tìm thấy bài viết</Text>
                        }
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f7f7f7',
        flex: 1,
    },
    input: {
        height: 45,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    resultsContainer: {
        marginTop: 20,
        flex: 1,
    },
    noResults: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default SearchScreen;
