import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Book } from '../types';
import { Colors } from '../constants/Colors';

interface Props {
  book: Book;
  showSeller?: boolean;
}

export default function BookRow({ book, showSeller = true }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={() => router.push(`/book/${book._id}`)}
      activeOpacity={0.85}
    >
      {book.coverImage ? (
        <Image
          source={{ uri: `http://localhost:3000${book.coverImage}` }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: Colors.primaryLight }]}>
          <Text style={{ fontSize: 28 }}>📖</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: c.subtext }]}>{book.author}</Text>
        {showSeller && (
          <Text style={[styles.seller, { color: c.subtext }]}>
            by {typeof book.seller === 'object' ? book.seller.name : ''}
          </Text>
        )}
        <View style={styles.bottom}>
          <Text style={[styles.genre, { color: c.subtext }]}>{book.genre}</Text>
          <Text style={[styles.price, { color: Colors.primary }]}>
            {book.isFree ? 'Free' : `$${book.price.toFixed(2)}`}
          </Text>
        </View>
      </View>

      {book.rating.count > 0 && (
        <Text style={styles.ratingBadge}>★ {book.rating.average.toFixed(1)}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    padding: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  cover: {
    width: 64,
    height: 88,
    borderRadius: 6,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
  },
  seller: {
    fontSize: 11,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  genre: {
    fontSize: 11,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    alignSelf: 'flex-start',
  },
});
