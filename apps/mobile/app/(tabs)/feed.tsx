import { useState, useEffect } from 'react'
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { useNearbyActivities } from '../../hooks/useNearbyActivities'
import { colors, spacing, typography, borderRadius } from '../../constants/theme'
import { format } from 'date-fns'

const CATEGORIES = [
  { id: null,             name: 'All' },
  { id: 'cat-sports',     name: 'Sports' },
  { id: 'cat-outdoors',   name: 'Outdoors' },
  { id: 'cat-food',       name: 'Food' },
  { id: 'cat-music',      name: 'Music' },
  { id: 'cat-wellness',   name: 'Wellness' },
  { id: 'cat-social',     name: 'Social' },
]

export default function FeedScreen() {
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 }) // Chennai default
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [locationLabel, setLocationLabel] = useState('Chennai')

  const { data: activities, isLoading, refetch, isRefetching } = useNearbyActivities({
    lat: coords.lat,
    lng: coords.lng,
    categoryId: selectedCategory,
  })

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({})
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
        const [place] = await Location.reverseGeocodeAsync(loc.coords)
        if (place?.city) setLocationLabel(place.city)
      }
    })()
  }, [])

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>📍 {locationLabel}</Text>
          <Text style={styles.headerTitle}>What's happening?</Text>
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id ?? 'all'}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedCategory === item.id && styles.chipActive]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={[styles.chipText, selectedCategory === item.id && styles.chipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Activities List */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={activities ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No activities nearby. Be the first!</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/screens/ActivityDetailScreen', params: { id: item.id } })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'upcoming' ? colors.upcoming : colors.ongoing }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardMeta}>
                📅 {format(new Date(item.start_time), 'EEE, MMM d · h:mm a')}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDistance}>📍 {item.distance_km} km away</Text>
                <Text style={styles.cardSpots}>
                  👥 {item.participant_count}/{item.max_participants}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB: Create Activity */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/create')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.gray50 },
  header:          { backgroundColor: colors.white, padding: spacing.md, paddingTop: spacing.xl },
  locationLabel:   { fontSize: typography.fontSizeSm, color: colors.gray500 },
  headerTitle:     { fontSize: typography.fontSize2Xl, fontWeight: '700', color: colors.gray900 },
  categoryList:    { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs, backgroundColor: colors.white },
  chip:            { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.gray200 },
  chipActive:      { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:        { fontSize: typography.fontSizeSm, color: colors.gray600, fontWeight: '500' },
  chipTextActive:  { color: colors.white },
  loader:          { marginTop: spacing.xl },
  list:            { padding: spacing.md, gap: spacing.md },
  card:            { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  cardTitle:       { fontSize: typography.fontSizeLg, fontWeight: '600', color: colors.gray900, flex: 1, marginRight: spacing.xs },
  statusBadge:     { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.sm },
  statusText:      { color: colors.white, fontSize: typography.fontSizeXs, fontWeight: '600' },
  cardMeta:        { fontSize: typography.fontSizeSm, color: colors.gray500, marginBottom: spacing.xs },
  cardFooter:      { flexDirection: 'row', justifyContent: 'space-between' },
  cardDistance:    { fontSize: typography.fontSizeSm, color: colors.gray500 },
  cardSpots:       { fontSize: typography.fontSizeSm, color: colors.gray500 },
  empty:           { textAlign: 'center', color: colors.gray400, marginTop: spacing.xl, fontSize: typography.fontSizeMd },
  fab:             { position: 'absolute', bottom: spacing.xl, right: spacing.lg, backgroundColor: colors.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText:         { color: colors.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
})

