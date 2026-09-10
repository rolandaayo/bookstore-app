import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, RefreshControl, useColorScheme, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import { Book } from '../../types';
import { Colors } from '../../constants/Colors';
import Button from '../../components/Button';
import BookRow from '../../components/BookRow';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';

type Tab = 'listings' | 'sales';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser, updateUser } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [toppingUp, setToppingUp] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [booksRes, salesRes] = await Promise.all([
        userService.getMyBooks(),
        orderService.getMySales(),
      ]);
      setMyBooks(booksRes.books);
      setTotalEarnings(salesRes.totalEarnings);
      setTotalSales(salesRes.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(), refreshUser()]);
    setRefreshing(false);
  }, [load, refreshUser]);

  useEffect(() => { load(); }, [load]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile({ name: editName, bio: editBio });
      updateUser(res.user);
      setEditing(false);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) { Alert.alert('Invalid amount', 'Enter a positive amount.'); return; }
    setToppingUp(true);
    try {
      const res = await userService.topUp(amount);
      updateUser({ balance: res.balance });
      setTopUpAmount('');
      Alert.alert('Wallet topped up', res.message);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setToppingUp(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <EmptyState
          emoji="👤"
          title="You're not signed in"
          subtitle="Sign in to manage your profile, listings, and earnings."
          actionLabel="Sign In"
          onAction={() => router.push('/auth/login')}
        />
      </View>
    );
  }

  if (loading) return <LoadingScreen message="Loading profile…" />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
    >
      {/* Profile header */}
      <View style={[styles.profileCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: Colors.primaryLight }]}>
          <Text style={[styles.avatarLetter, { color: Colors.primary }]}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {editing ? (
          <View style={{ width: '100%', gap: 8, marginTop: 12 }}>
            <Input label="Name" value={editName} onChangeText={setEditName} />
            <Input label="Bio" value={editBio} onChangeText={setEditBio} multiline numberOfLines={3} style={{ minHeight: 64, textAlignVertical: 'top' }} />
            <View style={styles.editActions}>
              <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" size="sm" style={{ flex: 1 }} />
              <Button title="Save" onPress={handleSaveProfile} loading={savingProfile} size="sm" style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.profileName, { color: c.text }]}>{user.name}</Text>
            <Text style={[styles.profileEmail, { color: c.subtext }]}>{user.email}</Text>
            {user.bio ? <Text style={[styles.profileBio, { color: c.subtext }]}>{user.bio}</Text> : null}
            <TouchableOpacity
              onPress={() => { setEditName(user.name); setEditBio(user.bio); setEditing(true); }}
              style={[styles.editBtn, { borderColor: c.border }]}
            >
              <Text style={[styles.editBtnText, { color: c.subtext }]}>✏️  Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Books', value: myBooks.length },
          { label: 'Sales', value: totalSales },
          { label: 'Earnings', value: `$${totalEarnings.toFixed(2)}` },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statValue, { color: c.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Wallet */}
      <View style={[styles.walletCard, { backgroundColor: Colors.primary }]}>
        <View>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletBalance}>${user.balance.toFixed(2)}</Text>
        </View>
        <View style={styles.topUpRow}>
          <Input
            placeholder="Amount"
            value={topUpAmount}
            onChangeText={setTopUpAmount}
            keyboardType="decimal-pad"
            style={{ color: '#fff', fontSize: 14 }}
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          <Button
            title="Top Up"
            onPress={handleTopUp}
            loading={toppingUp}
            variant="outline"
            size="sm"
            style={{ borderColor: '#fff' }}
            textStyle={{ color: '#fff' }}
          />
        </View>
      </View>

      {/* Tabs: My Listings / My Sales */}
      <View style={[styles.tabs, { borderColor: c.border }]}>
        {(['listings', 'sales'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { borderBottomColor: Colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? Colors.primary : c.subtext }]}>
              {tab === 'listings' ? '📚 My Books' : '💰 My Sales'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'listings' ? (
        myBooks.length === 0 ? (
          <EmptyState
            emoji="📤"
            title="No books listed yet"
            subtitle="Upload your first ebook and start selling."
            actionLabel="Upload a Book"
            onAction={() => router.push('/(tabs)/upload')}
          />
        ) : (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {myBooks.map((b) => <BookRow key={b._id} book={b} showSeller={false} />)}
          </View>
        )
      ) : (
        totalSales === 0 ? (
          <EmptyState emoji="💸" title="No sales yet" subtitle="Share your listings to start earning." />
        ) : (
          <View style={[styles.salesSummary, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.salesTitle, { color: c.text }]}>Sales Summary</Text>
            <View style={styles.salesRow}>
              <Text style={[styles.salesLabel, { color: c.subtext }]}>Total sales</Text>
              <Text style={[styles.salesValue, { color: c.text }]}>{totalSales}</Text>
            </View>
            <View style={styles.salesRow}>
              <Text style={[styles.salesLabel, { color: c.subtext }]}>Total earned</Text>
              <Text style={[styles.salesValue, { color: Colors.success }]}>${totalEarnings.toFixed(2)}</Text>
            </View>
          </View>
        )
      )}

      {/* Sign out */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="ghost"
        style={styles.logoutBtn}
        textStyle={{ color: Colors.error }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  profileCard: {
    alignItems: 'center', margin: 16, marginTop: 60,
    padding: 20, borderRadius: 16, borderWidth: 1, gap: 6,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarLetter: { fontSize: 28, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '800' },
  profileEmail: { fontSize: 13 },
  profileBio: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 4 },
  editBtn: { marginTop: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  editBtnText: { fontSize: 13 },
  editActions: { flexDirection: 'row', gap: 10 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, alignItems: 'center', padding: 14,
    borderRadius: 12, borderWidth: 1,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  walletCard: {
    marginHorizontal: 16, padding: 18, borderRadius: 16, marginBottom: 16, gap: 12,
  },
  walletLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  walletBalance: { color: '#fff', fontSize: 28, fontWeight: '800' },
  topUpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, borderBottomWidth: 1, marginBottom: 4,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  salesSummary: {
    margin: 16, padding: 16, borderRadius: 14, borderWidth: 1, gap: 10,
  },
  salesTitle: { fontSize: 16, fontWeight: '700' },
  salesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  salesLabel: { fontSize: 14 },
  salesValue: { fontSize: 14, fontWeight: '700' },
  logoutBtn: { marginHorizontal: 16, marginTop: 20 },
});
