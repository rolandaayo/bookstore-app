import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { bookService } from "../../services/bookService";
import { Book } from "../../types";
import { Colors } from "../../constants/Colors";
import BookCard from "../../components/BookCard";
import BookRow from "../../components/BookRow";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";

const GENRES = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Business",
  "Romance",
  "Mystery",
  "Fantasy",
  "Self-Help",
  "Other",
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const [featured, setFeatured] = useState<Book[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await bookService.getFeatured();
      setFeatured(res.books);
    } catch {
      /* silent */
    }
  }, []);

  const fetchBooks = useCallback(
    async (reset = false) => {
      try {
        const currentPage = reset ? 1 : page;
        const res = await bookService.getBooks({
          search: search.trim() || undefined,
          genre: genre === "All" ? undefined : genre,
          page: currentPage,
          limit: 20,
          sort: "newest",
        });
        if (reset) {
          setBooks(res.books);
          setPage(2);
        } else {
          setBooks((prev) => [...prev, ...res.books]);
          setPage((p) => p + 1);
        }
        setHasMore(currentPage < res.pages);
      } catch {
        /* silent */
      }
    },
    [search, genre, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchFeatured(), fetchBooks(true)]);
    setLoading(false);
  }, [fetchFeatured, fetchBooks]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeatured(), fetchBooks(true)]);
    setRefreshing(false);
  }, [fetchFeatured, fetchBooks]);

  useEffect(() => {
    load();
  }, []);

  // Re-fetch when search/genre changes
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      await fetchBooks(true);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search, genre]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchBooks(false);
    setLoadingMore(false);
  };

  if (loading) return <LoadingScreen message="Loading books…" />;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: c.card, borderBottomColor: c.border },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: c.subtext }]}>
            {user ? `Hello, ${user.name.split(" ")[0]} 👋` : "Welcome 👋"}
          </Text>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            Discover Ebooks
          </Text>
        </View>
        {user && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <View
              style={[styles.avatar, { backgroundColor: Colors.primaryLight }]}
            >
              <Text style={[styles.avatarText, { color: Colors.primary }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BookRow book={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <LoadingScreen /> : null}
        ListEmptyComponent={
          <EmptyState
            emoji="🔍"
            title="No books found"
            subtitle="Try a different search or genre filter"
          />
        }
        ListHeaderComponent={
          <View>
            {/* Search bar */}
            <View
              style={[
                styles.searchWrap,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: c.text }]}
                placeholder="Search by title, author…"
                placeholderTextColor={c.placeholder}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text
                    style={{
                      color: c.subtext,
                      fontSize: 18,
                      paddingHorizontal: 8,
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Genre filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.genreScroll}
              contentContainerStyle={styles.genreContent}
            >
              {GENRES.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGenre(g)}
                  style={[
                    styles.genreChip,
                    genre === g
                      ? { backgroundColor: Colors.primary }
                      : {
                          backgroundColor: c.card,
                          borderColor: c.border,
                          borderWidth: 1,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.genreText,
                      { color: genre === g ? "#fff" : c.subtext },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured section */}
            {featured.length > 0 && search.length === 0 && genre === "All" && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>
                  🔥 Featured
                </Text>
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => <BookCard book={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                />
              </View>
            )}

            <Text
              style={[
                styles.sectionTitle,
                { color: c.text, marginHorizontal: 16, marginTop: 8 },
              ]}
            >
              {search || genre !== "All" ? "Results" : "All Books"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 13 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  genreScroll: { marginBottom: 4 },
  genreContent: { paddingHorizontal: 16, gap: 8 },
  genreChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  genreText: { fontSize: 13, fontWeight: "500" },
  section: { marginBottom: 8, paddingTop: 12 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginLeft: 16,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
});
