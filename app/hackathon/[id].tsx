
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
            headerBackTitle: 'Back'
          }}
        />
        <ActivityIndicator size="large" color={colors.primary} />
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
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="error-outline"
          size={48}
          color={colors.accent}
        />
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
  const participantsText = `${hackathon.participants} participants`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: hackathon.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back'
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {hackathon.imageUrl && (
          <Image
            source={resolveImageSource(hackathon.imageUrl)}
            style={styles.heroImage}
          />
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{hackathon.name}</Text>

          <View style={styles.prizeCard}>
            <IconSymbol
              ios_icon_name="trophy.fill"
              android_material_icon_name="emoji-events"
              size={32}
              color={colors.accent}
            />
            <View style={styles.prizeInfo}>
              <Text style={styles.prizeAmount}>{hackathon.prize}</Text>
              <Text style={styles.prizeLabel}>Total Prize Pool</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{hackathon.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.detailCard}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.primary}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Start Date</Text>
                <Text style={styles.detailValue}>{startDateFormatted}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.primary}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>End Date</Text>
                <Text style={styles.detailValue}>{endDateFormatted}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={24}
                color={colors.primary}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{hackathon.location}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="group"
                size={24}
                color={colors.primary}
              />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Participants</Text>
                <Text style={styles.detailValue}>{participantsText}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Register Now</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.backgroundAlt,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  prizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  prizeInfo: {
    flex: 1,
  },
  prizeAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
  },
  prizeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
