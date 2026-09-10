import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, useColorScheme, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { bookService } from '../../services/bookService';
import { Colors } from '../../constants/Colors';
import { GENRES } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

interface FileAsset {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export default function UploadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('English');
  const [pages, setPages] = useState('');
  const [bookFile, setBookFile] = useState<FileAsset | null>(null);
  const [coverImage, setCoverImage] = useState<FileAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <View style={[styles.gate, { backgroundColor: c.background }]}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🔒</Text>
        <Text style={[styles.gateTitle, { color: c.text }]}>Sign in to sell books</Text>
        <Text style={[styles.gateSub, { color: c.subtext }]}>Create an account to start selling your ebooks worldwide.</Text>
        <Button title="Sign In" onPress={() => router.push('/auth/login')} style={{ marginTop: 20, paddingHorizontal: 40 }} />
        <Button title="Create Account" onPress={() => router.push('/auth/register')} variant="outline" style={{ marginTop: 10, paddingHorizontal: 40 }} />
      </View>
    );
  }

  const pickBook = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setBookFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/pdf', size: asset.size });
        setErrors((e) => ({ ...e, bookFile: '' }));
      }
    } catch {
      Alert.alert('Error', 'Could not pick file.');
    }
  };

  const pickCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      setCoverImage({ uri: asset.uri, name: `cover.${ext}`, type: `image/${ext}` });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!author.trim()) e.author = 'Author is required';
    if (!description.trim()) e.description = 'Description is required';
    if (price === '') e.price = 'Price is required';
    else if (isNaN(Number(price)) || Number(price) < 0) e.price = 'Enter a valid price (0 for free)';
    if (!genre) e.genre = 'Please select a genre';
    if (!bookFile) e.bookFile = 'Please attach a PDF or EPUB file';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpload = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await bookService.uploadBook({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        price,
        genre,
        language,
        pages: pages || undefined,
        bookFile: bookFile!,
        coverImage: coverImage ?? undefined,
      });
      Alert.alert('Published!', 'Your book is now live on the store.', [
        { text: 'View Store', onPress: () => router.replace('/(tabs)') },
      ]);
      // Reset form
      setTitle(''); setAuthor(''); setDescription(''); setPrice('');
      setGenre(''); setLanguage('English'); setPages('');
      setBookFile(null); setCoverImage(null);
    } catch (err: unknown) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: c.text }]}>Sell an Ebook</Text>
        <Text style={[styles.pageSub, { color: c.subtext }]}>
          Upload your book and start earning from readers worldwide.
        </Text>

        {/* Cover picker */}
        <TouchableOpacity onPress={pickCover} style={styles.coverPicker}>
          {coverImage ? (
            <Image source={{ uri: coverImage.uri }} style={styles.coverPreview} resizeMode="cover" />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ fontSize: 36 }}>🖼️</Text>
              <Text style={[styles.coverHint, { color: c.subtext }]}>Tap to add cover image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label="Book Title *" placeholder="e.g. The Art of War" value={title} onChangeText={setTitle} error={errors.title} autoCapitalize="words" />
        <Input label="Author Name *" placeholder="e.g. Sun Tzu" value={author} onChangeText={setAuthor} error={errors.author} autoCapitalize="words" />
        <Input
          label="Description *"
          placeholder="Write a compelling description of your book…"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: 'top' }}
          autoCapitalize="sentences"
        />
        <Input
          label="Price (USD) *"
          placeholder="0.00 — enter 0 for free"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          error={errors.price}
        />

        {/* Genre picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.fieldLabel, { color: c.text }]}>Genre *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
            {GENRES.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => { setGenre(g); setErrors((e) => ({ ...e, genre: '' })); }}
                style={[
                  styles.genreChip,
                  genre === g
                    ? { backgroundColor: Colors.primary }
                    : { backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
                ]}
              >
                <Text style={[styles.genreText, { color: genre === g ? '#fff' : c.subtext }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.genre ? <Text style={styles.errText}>{errors.genre}</Text> : null}
        </View>

        <Input label="Language" placeholder="English" value={language} onChangeText={setLanguage} />
        <Input label="Number of Pages" placeholder="Optional" value={pages} onChangeText={setPages} keyboardType="number-pad" />

        {/* Book file picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.fieldLabel, { color: c.text }]}>Book File (PDF / EPUB) *</Text>
          <TouchableOpacity
            onPress={pickBook}
            style={[styles.filePicker, { borderColor: errors.bookFile ? Colors.error : c.border, backgroundColor: c.card }]}
          >
            {bookFile ? (
              <View style={styles.fileInfo}>
                <Text style={{ fontSize: 24 }}>📄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fileName, { color: c.text }]} numberOfLines={1}>{bookFile.name}</Text>
                  {bookFile.size && (
                    <Text style={[styles.fileSize, { color: c.subtext }]}>
                      {(bookFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  )}
                </View>
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>Change</Text>
              </View>
            ) : (
              <View style={styles.fileEmpty}>
                <Text style={{ fontSize: 36 }}>📎</Text>
                <Text style={[styles.fileHint, { color: c.subtext }]}>Tap to select PDF or EPUB</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.bookFile ? <Text style={styles.errText}>{errors.bookFile}</Text> : null}
        </View>

        <Button title="Publish Book" onPress={handleUpload} loading={loading} size="lg" style={{ marginTop: 8, marginBottom: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 60 },
  pageTitle: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  pageSub: { fontSize: 14, marginBottom: 24 },
  coverPicker: { alignItems: 'center', marginBottom: 24 },
  coverPreview: { width: 140, height: 190, borderRadius: 12 },
  coverPlaceholder: {
    width: 140, height: 190, borderRadius: 12, borderWidth: 2,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  coverHint: { fontSize: 12, textAlign: 'center', paddingHorizontal: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  genreRow: { gap: 8, paddingBottom: 4 },
  genreChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  genreText: { fontSize: 13, fontWeight: '500' },
  filePicker: { borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
  fileInfo: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  fileName: { fontSize: 13, fontWeight: '600' },
  fileSize: { fontSize: 11, marginTop: 2 },
  fileEmpty: { alignItems: 'center', padding: 24, gap: 8 },
  fileHint: { fontSize: 13 },
  errText: { color: Colors.error, fontSize: 12, marginTop: 4 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  gateTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  gateSub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});
