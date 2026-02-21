
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Platform
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const BACKEND_URL: string =
  (Constants.expoConfig?.extra?.backendUrl as string) ||
  "https://3cspmup2qucctgmkzydqndz338rcjnrs.app.specular.dev";

async function fetchHackathonById(id: string): Promise<Hackathon> {
  console.log(`[API] GET ${BACKEND_URL}/api/hackathons/${id}`);
  const response = await fetch(`${BACKEND_URL}/api/hackathons/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[API] GET /api/hackathons/${id} failed: ${response.status}`, errorBody);
    throw new Error(`Failed to fetch hackathon: ${response.status}`);
  }
  const data = await response.json();
  console.log(`[API] GET /api/hackathons/${id} success:`, data.name);
  return data as Hackathon;
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

export default function HackathonDetailScreen() {
  console.log('HackathonDetailScreen: Component mounted');
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHackathonDetails();
  }, [id]);

  const fetchHackathonDetails = async () => {
    console.log('HackathonDetailScreen: Fetching details for hackathon:', id);
    try {
      const data = await fetchHackathonById(id as string);
      setHackathon(data);
      setError(null);
      console.log('HackathonDetailScreen: Loaded hackathon:', data.name);
    } catch (err) {
      console.error('HackathonDetailScreen: Error fetching hackathon:', err);
      setError('Failed to load hackathon details.');
      setHackathon(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = () => {
    console.log('HackathonDetailScreen: User tapped Register button');
    // TODO: Implement registration logic
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Loading...',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerBackTitle: 'Back',
            headerTransparent: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (!hackathon) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: error ? 'Error' : 'Not Found',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerBackTitle: 'Back'
          }}
        />
        <View style={styles.errorIconContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="error-outline"
            size={56}
            color={colors.accent}
          />
        </View>
        <Text style={styles.errorText}>
          {error || 'Hackathon not found'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchHackathonDetails();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startDateFormatted = formatDate(hackathon.startDate);
  const endDateFormatted = formatDate(hackathon.endDate);
  const participantsText = `${hackathon.participants}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
          headerTransparent: true,
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hackathon.imageUrl && (
          <View style={styles.heroContainer}>
            <Image
              source={resolveImageSource(hackathon.imageUrl)}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.8)', colors.background]}
              style={styles.heroGradient}
            />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{hackathon.name}</Text>

          <View style={styles.prizeCard}>
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.2)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.prizeGradient}
            />
            <View style={styles.prizeIconContainer}>
              <IconSymbol
                ios_icon_name="trophy.fill"
                android_material_icon_name="emoji-events"
                size={40}
                color={colors.accent}
              />
            </View>
            <View style={styles.prizeInfo}>
              <Text style={styles.prizeAmount}>{hackathon.prize}</Text>
              <Text style={styles.prizeLabel}>Total Prize Pool</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <IconSymbol
                  ios_icon_name="doc.text.fill"
                  android_material_icon_name="description"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.description}>{hackathon.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>Details</Text>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar-today"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={styles.detailValue}>{startDateFormatted}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <IconSymbol
                    ios_icon_name="calendar.badge.clock"
                    android_material_icon_name="event"
                    size={24}
                    color={colors.secondary}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>End Date</Text>
                  <Text style={styles.detailValue}>{endDateFormatted}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="location-on"
                    size={24}
                    color={colors.highlight}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{hackathon.location}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <IconSymbol
                    ios_icon_name="person.3.fill"
                    android_material_icon_name="group"
                    size={24}
                    color={colors.success}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Participants</Text>
                  <Text style={styles.detailValue}>{participantsText}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                <Text style={styles.registerButtonText}>Register Now</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={colors.text}
                />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        ) : (
          <View style={styles.bottomBarFallback}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                <Text style={styles.registerButtonText}>Register Now</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={colors.text}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 350,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundAlt,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  prizeCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  prizeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  prizeIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeInfo: {
    flex: 1,
  },
  prizeAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 4,
  },
  prizeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    fontWeight: '400',
  },
  detailsGrid: {
    gap: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  detailIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  bottomBarFallback: {
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.2)',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  registerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
