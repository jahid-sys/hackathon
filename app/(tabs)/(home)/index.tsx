
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
  ImageSourcePropType
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hackathons</Text>
        <Text style={styles.headerSubtitle}>Discover amazing coding events</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <IconSymbol
            android_material_icon_name="error-outline"
            size={18}
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
      >
        {hackathons.length === 0 && !error && (
          <View style={styles.emptyState}>
            <IconSymbol
              android_material_icon_name="event"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No hackathons found</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </View>
        )}
        {hackathons.map((hackathon, index) => {
          const startDateFormatted = formatDate(hackathon.startDate);
          const endDateFormatted = formatDate(hackathon.endDate);
          const dateRange = `${startDateFormatted} - ${endDateFormatted}`;
          const participantsText = `${hackathon.participants} participants`;

          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleHackathonPress(hackathon)}
              activeOpacity={0.7}
            >
              {hackathon.imageUrl && (
                <Image
                  source={resolveImageSource(hackathon.imageUrl)}
                  style={styles.cardImage}
                />
              )}
              
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{hackathon.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {hackathon.description}
                </Text>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol
                      android_material_icon_name="location-on"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{hackathon.location}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{dateRange}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol
                      android_material_icon_name="group"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{participantsText}</Text>
                  </View>
                </View>

                <View style={styles.prizeContainer}>
                  <IconSymbol
                    android_material_icon_name="emoji-events"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.prizeText}>{hackathon.prize}</Text>
                  <Text style={styles.prizeLabel}>Prize Pool</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundAlt,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  prizeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    flex: 1,
  },
  prizeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
