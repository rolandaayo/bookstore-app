import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl, useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { orderService } from '../../services/orderService';
import { Order, Book } from '../../types';
import { Colors } from '../../constants/Colors';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await orderService.getMyPurchases();
      setOrders(res.orders);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { if (user) load(); else setLoading(false); }, [user, load]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <EmptyState
          emoji="📚"
          title="Your library is empty"
          subtitle="Sign in to view your purchased ebooks."
          actionLabel="Sign In"
          onAction={() => router.push('/auth/login')}
        />
      </View>
    );
  }

  if (loading) return <LoadingScreen message="Loading your library…" />;

  const renderItem = ({ item }: { item: Order }) => {
    const book = typeof item.book === 'object' ? (item.book as Book) : null;
    if (!book) return null;
    const coverUri = book.coverImage ? `http://localhost:3000${book.coverImage}` : null;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => router.push(`/book/${book._id}`)}
        activeOpacity={0.85}
      >
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: Colors.primaryLight }]}>
            <Text style={{ fontSize: 30 }}>📖</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.bookTitle, { color: c.text }]} numberOfLines={2}>{book.title}</Text>
          <Text style={[styles.bookAuthor, { color: c.subtext }]}>{book.author}</Text>
          <View style={[styles.genreBadge, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.genreText, { color: Colors.primary }]}>{book.genre}</Text>
          </View>
          <Text style={[styles.purchaseDate, { color: c.subtext }]}>
            Purchased {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={{ color: c.subtext, fontSize: 20 }}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>My Library</Text>
        <Text style={[styles.headerSub, { color: c.subtext }]}>
          {orders.length} {orders.length === 1 ? 'book' : 'books'}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            emoji="📖"
            title="No books yet"
            subtitle="Browse the store and buy your first ebook!"
            actionLabel="Explore Books"
            onAction={() => router.replace('/(tabs)')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, padding: 12,
    marginBottom: 12, gap: 12,
  },
  cover: { width: 60, height: 82, borderRadius: 8 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  bookTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  bookAuthor: { fontSize: 12 },
  genreBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  genreText: { fontSize: 11, fontWeight: '600' },
  purchaseDate: { fontSize: 11, marginTop: 2 },
});
