import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, useColorScheme, TextInput, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { bookService } from '../../services/bookService';
import { orderService } from '../../services/orderService';
import { Book, Review } from '../../types';
import { Colors } from '../../constants/Colors';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await bookService.getBook(id);
      setBook(res.book);
      setReviews(res.reviews);
      if (user) {
        setIsSeller(
          typeof res.book.seller === 'object'
            ? res.book.seller._id === user._id
            : res.book.seller === user._id,
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to load book details.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  // Check if user already owns this book
  useEffect(() => {
    if (!user || !book) return;
    (async () => {
      try {
        const res = await orderService.getMyPurchases();
        const owned = res.orders.some((o) => {
          const b = typeof o.book === 'object' ? o.book : null;
          return b && b._id === book._id;
        });
        setHasPurchased(owned);
      } catch { /* silent */ }
    })();
  }, [user, book]);

  const handleBuy = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!book) return;
    Alert.alert(
      'Confirm Purchase',
      book.isFree
        ? `Get "${book.title}" for free?`
        : `Purchase "${book.title}" for $${book.price.toFixed(2)}?\nYour balance: $${user.balance.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: book.isFree ? 'Get Free' : 'Buy Now',
          onPress: async () => {
            setBuying(true);
            try {
              await orderService.buyBook(book._id);
              await refreshUser();
              setHasPurchased(true);
              Alert.alert('Success', `You now own "${book.title}"!`);
            } catch (err: unknown) {
              Alert.alert('Purchase failed', err instanceof Error ? err.message : 'Something went wrong');
            } finally {
              setBuying(false);
            }
          },
        },
      ],
    );
  };

  const handleReview = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (reviewRating === 0) { Alert.alert('Rating required', 'Please select a star rating.'); return; }
    setSubmittingReview(true);
    try {
      const res = await bookService.addReview(book!._id, reviewRating, reviewComment);
      setReviews((prev) => [res.review, ...prev]);
      setReviewRating(0);
      setReviewComment('');
      Alert.alert('Review submitted', 'Thanks for your feedback!');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !book) return <LoadingScreen message="Loading book…" />;

  const sellerName = typeof book.seller === 'object' ? book.seller.name : 'Unknown';
  const coverUri = book.coverImage ? `http://localhost:3000${book.coverImage}` : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: Colors.primary }]}>← Back</Text>
      </TouchableOpacity>

      {/* Cover */}
      <View style={styles.coverWrap}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: Colors.primaryLight }]}>
            <Text style={{ fontSize: 72 }}>📖</Text>
          </View>
        )}
      </View>

      {/* Title / meta */}
      <View style={styles.meta}>
        <Text style={[styles.title, { color: c.text }]}>{book.title}</Text>
        <Text style={[styles.author, { color: c.subtext }]}>by {book.author}</Text>

        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: Colors.primary }]}>{book.genre}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.badgeText, { color: Colors.success }]}>{book.language}</Text>
          </View>
          {book.pages && (
            <View style={[styles.badge, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border }]}>
              <Text style={[styles.badgeText, { color: c.subtext }]}>{book.pages} pages</Text>
            </View>
          )}
        </View>

        {book.rating.count > 0 && (
          <View style={styles.ratingRow}>
            <StarRating value={Math.round(book.rating.average)} readonly size={18} />
            <Text style={[styles.ratingText, { color: c.subtext }]}>
              {book.rating.average.toFixed(1)} ({book.rating.count} reviews)
            </Text>
          </View>
        )}

        <View style={styles.sellerRow}>
          <Text style={[styles.sellerLabel, { color: c.subtext }]}>Sold by </Text>
          <Text style={[styles.sellerName, { color: Colors.primary }]}>{sellerName}</Text>
        </View>

        <Text style={[styles.salesText, { color: c.subtext }]}>
          {book.salesCount} {book.salesCount === 1 ? 'copy' : 'copies'} sold
        </Text>
      </View>

      {/* Price & CTA */}
      <View style={[styles.priceCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.price, { color: Colors.primary }]}>
          {book.isFree ? 'Free' : `$${book.price.toFixed(2)}`}
        </Text>
        {isSeller ? (
          <View style={[styles.ownedBadge, { backgroundColor: '#F0FDF4' }]}>
            <Text style={{ color: Colors.success, fontWeight: '600' }}>Your listing</Text>
          </View>
        ) : hasPurchased ? (
          <View style={[styles.ownedBadge, { backgroundColor: '#F0FDF4' }]}>
            <Text style={{ color: Colors.success, fontWeight: '600' }}>✓ Owned — in your library</Text>
          </View>
        ) : (
          <Button
            title={book.isFree ? 'Get for Free' : `Buy for $${book.price.toFixed(2)}`}
            onPress={handleBuy}
            loading={buying}
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>About this book</Text>
        <Text style={[styles.description, { color: c.subtext }]}>{book.description}</Text>
      </View>

      {/* Review form — only for buyers */}
      {hasPurchased && !isSeller && (
        <View style={[styles.section, styles.reviewForm, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Write a Review</Text>
          <StarRating value={reviewRating} onChange={setReviewRating} size={32} />
          <TextInput
            style={[styles.reviewInput, { color: c.text, borderColor: c.border, backgroundColor: c.background }]}
            placeholder="Share your thoughts (optional)"
            placeholderTextColor={c.placeholder}
            value={reviewComment}
            onChangeText={setReviewComment}
            multiline
            numberOfLines={3}
          />
          <Button
            title="Submit Review"
            onPress={handleReview}
            loading={submittingReview}
            size="sm"
            style={{ alignSelf: 'flex-end' }}
          />
        </View>
      )}

      {/* Reviews list */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
        </Text>
        {reviews.length === 0 ? (
          <Text style={[styles.noReviews, { color: c.subtext }]}>No reviews yet. Be the first!</Text>
        ) : (
          reviews.map((r) => (
            <View key={r._id} style={[styles.reviewCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.reviewHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                    {r.reviewer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reviewerName, { color: c.text }]}>{r.reviewer.name}</Text>
                  <StarRating value={r.rating} readonly size={14} />
                </View>
                <Text style={[styles.reviewDate, { color: c.subtext }]}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {r.comment ? (
                <Text style={[styles.reviewComment, { color: c.subtext }]}>{r.comment}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { fontSize: 16, fontWeight: '600' },
  coverWrap: { alignItems: 'center', paddingVertical: 16 },
  cover: { width: 180, height: 250, borderRadius: 12 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 32 },
  author: { fontSize: 15 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 13 },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerLabel: { fontSize: 13 },
  sellerName: { fontSize: 13, fontWeight: '600' },
  salesText: { fontSize: 12 },
  priceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, padding: 16, borderRadius: 14, borderWidth: 1, gap: 12,
  },
  price: { fontSize: 26, fontWeight: '800' },
  ownedBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },
  reviewForm: {
    borderRadius: 14, borderWidth: 1, padding: 16, gap: 12,
    marginHorizontal: 20,
  },
  reviewInput: {
    borderWidth: 1.5, borderRadius: 10, padding: 10,
    fontSize: 14, minHeight: 72, textAlignVertical: 'top',
  },
  noReviews: { fontSize: 14 },
  reviewCard: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewerName: { fontSize: 13, fontWeight: '600' },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 13, lineHeight: 19 },
});
