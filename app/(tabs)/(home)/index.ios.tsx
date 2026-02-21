
import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  ImageSourcePropType,
  Platform
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";

const BACKEND_URL: string =
  (Constants.expoConfig?.extra?.backendUrl as string) ||
  "https://3cspmup2qucctgmkzydqndz338rcjnrs.app.specular.dev";

async function fetchHackathonsFromApi(): Promise<Hackathon[]> {
  console.log(`[API] GET ${BACKEND_URL}/api/hackathons`);
  const response = await fetch(`${BACKEND_URL}/api/hackathons`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[API] GET /api/hackathons failed: ${response.status}`, errorBody);
    throw new Error(`Failed to fetch hackathons: ${response.status}`);
  }
  const data = await response.json();
  console.log(`[API] GET /api/hackathons success, count: ${data.length}`);
  return data as Hackathon[];
}

// Helper to resolve image sources (handles both local require() and remote URLs)
function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface Hackathon {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  prize: string;
  participants: number;
  imageUrl?: string;
}

export default function HomeScreen() {
  console.log('HomeScreen: Component mounted');
  const theme = useTheme();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHackathons = async () => {
    console.log('HomeScreen: Fetching hackathons');
    try {
      const data = await fetchHackathonsFromApi();
      setHackathons(data);
      setError(null);
      console.log('HomeScreen: Loaded hackathons:', data.length);
    } catch (err) {
      console.error('HomeScreen: Error fetching hackathons:', err);
      setError('Failed to load hackathons. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const onRefresh = () => {
    console.log('HomeScreen: User triggered refresh');
    setRefreshing(true);
    fetchHackathons();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const handleHackathonPress = (hackathon: Hackathon) => {
    console.log('HomeScreen: User tapped hackathon:', hackathon.name);
    router.push(`/hackathon/${hackathon.id}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading hackathons...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.1)', 'transparent']}
        style={styles.headerGradient}
      />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Hackathons</Text>
          <Text style={styles.headerSubtitle}>Discover amazing coding events</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{hackathons.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <IconSymbol
            ios_icon_name="exclamationmark.circle.fill"
            android_material_icon_name="error-outline"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {hackathons.length === 0 && !error && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <IconSymbol
                ios_icon_name="calendar.badge.exclamationmark"
                android_material_icon_name="event"
                size={56}
                color={colors.primary}
              />
            </View>
            <Text style={styles.emptyStateText}>No hackathons found</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </View>
        )}
        {hackathons.map((hackathon, index) => {
          const startDateFormatted = formatDate(hackathon.startDate);
          const endDateFormatted = formatDate(hackathon.endDate);
          const dateRange = `${startDateFormatted} - ${endDateFormatted}`;
          const participantsText = `${hackathon.participants}`;

          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleHackathonPress(hackathon)}
              activeOpacity={0.8}
            >
              <View style={styles.cardInner}>
                {hackathon.imageUrl && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={resolveImageSource(hackathon.imageUrl)}
                      style={styles.cardImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
                      style={styles.imageOverlay}
                    />
                  </View>
                )}
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {hackathon.name}
                    </Text>
                    <View style={styles.prizeTag}>
                      <IconSymbol
                        ios_icon_name="trophy.fill"
                        android_material_icon_name="emoji-events"
                        size={16}
                        color={colors.accent}
                      />
                      <Text style={styles.prizeTagText}>{hackathon.prize}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {hackathon.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.infoChip}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="location-on"
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={styles.infoChipText}>{hackathon.location}</Text>
                    </View>

                    <View style={styles.infoChip}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={styles.infoChipText}>{dateRange}</Text>
                    </View>

                    <View style={styles.infoChip}>
                      <IconSymbol
                        ios_icon_name="person.3.fill"
                        android_material_icon_name="group"
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={styles.infoChipText}>{participantsText}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardArrow}>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 70,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsContainer: {
    marginTop: 4,
  },
  statBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  cardInner: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundAlt,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    lineHeight: 28,
  },
  prizeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  prizeTagText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  infoChipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  cardArrow: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
