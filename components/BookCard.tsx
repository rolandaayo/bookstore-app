import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Book } from '../types';
import { Colors } from '../constants/Colors';

interface Props {
  book: Book;
  style?: object;
}

export default function BookCard({ book, style }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}
      onPress={() => router.push(`/book/${book._id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.cover}>
        {book.coverImage ? (
          <Image
            source={{ uri: `http://localhost:3000${book.coverImage}` }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: Colors.primaryLight }]}>
            <Text style={styles.coverEmoji}>📖</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: c.subtext }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.genre, { color: c.subtext }]}>{book.genre}</Text>
          {book.rating.count > 0 && (
            <Text style={[styles.rating, { color: Colors.accent }]}>
              ★ {book.rating.average.toFixed(1)}
            </Text>
          )}
        </View>
        <Text style={[styles.price, { color: Colors.primary }]}>
          {book.isFree ? 'Free' : `$${book.price.toFixed(2)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
  },
  cover: {
    width: '100%',
    height: 120,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 40,
  },
  info: {
    padding: 10,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  genre: {
    fontSize: 10,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
