import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ThemeProvider,
  useTheme,
  Screen,
  Button,
  Card,
  TextField,
  LoadingState,
  EmptyState,
  sp,
  nativeFontSize,
} from '@mono/ui-mobile';

// ─── Demo Screen ────────────────────────────────────────────────────────────
// Showcases all @mono/ui-mobile primitives in a single scrollable screen.

function DemoContent() {
  const { colors, themeName, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  // Simulate loading state
  if (showLoading) {
    return (
      <Screen scrollable={false}>
        <LoadingState message="Fetching your data…" />
        <View style={demoStyles.bottomAction}>
          <Button variant="ghost" onPress={() => setShowLoading(false)}>
            Cancel
          </Button>
        </View>
      </Screen>
    );
  }

  // Simulate empty state
  if (showEmpty) {
    return (
      <Screen scrollable={false}>
        <EmptyState
          title="No bookings yet"
          description="Your upcoming trips will appear here once you make a reservation."
          action={{ label: 'Go Back', onPress: () => setShowEmpty(false) }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* ── Header ── */}
      <View style={demoStyles.header}>
        <Text style={[demoStyles.title, { color: colors.foreground }]}>
          UI Mobile Demo
        </Text>
        <Text style={[demoStyles.subtitle, { color: colors['foreground-muted'] }]}>
          Theme: {themeName}
        </Text>
      </View>

      {/* ── Theme Toggle ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          Theme
        </Text>
        <Button variant="outline" size="md" onPress={toggleTheme}>
          Cycle Theme ({themeName})
        </Button>
      </View>

      {/* ── Buttons ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          Buttons
        </Text>
        <View style={demoStyles.row}>
          <Button variant="primary" size="sm" onPress={() => {}}>
            Primary
          </Button>
          <Button variant="secondary" size="sm" onPress={() => {}}>
            Secondary
          </Button>
          <Button variant="destructive" size="sm" onPress={() => {}}>
            Delete
          </Button>
        </View>
        <View style={demoStyles.row}>
          <Button variant="outline" size="sm" onPress={() => {}}>
            Outline
          </Button>
          <Button variant="ghost" size="sm" onPress={() => {}}>
            Ghost
          </Button>
          <Button variant="primary" size="sm" loading onPress={() => {}}>
            Loading
          </Button>
        </View>
        <View style={demoStyles.row}>
          <Button variant="primary" size="lg" onPress={() => {}}>
            Large Button
          </Button>
        </View>
      </View>

      {/* ── Cards ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          Cards
        </Text>
        <Card variant="elevated">
          <Text style={[demoStyles.cardTitle, { color: colors.foreground }]}>
            Elevated Card
          </Text>
          <Text style={{ color: colors['foreground-muted'] }}>
            With shadow elevation for depth.
          </Text>
        </Card>
        <View style={{ height: sp('3') }} />
        <Card variant="outlined">
          <Text style={[demoStyles.cardTitle, { color: colors.foreground }]}>
            Outlined Card
          </Text>
          <Text style={{ color: colors['foreground-muted'] }}>
            Bordered surface variant.
          </Text>
        </Card>
        <View style={{ height: sp('3') }} />
        <Card variant="filled" onPress={() => {}}>
          <Text style={[demoStyles.cardTitle, { color: colors.foreground }]}>
            Filled Card (Pressable)
          </Text>
          <Text style={{ color: colors['foreground-muted'] }}>
            Tap me — I have an onPress handler.
          </Text>
        </Card>
      </View>

      {/* ── Text Fields ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          Text Fields
        </Text>
        <Card variant="outlined">
          <TextField
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
          <View style={{ height: sp('3') }} />
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={email.length > 0 && !email.includes('@') ? 'Please enter a valid email' : undefined}
          />
          <View style={{ height: sp('3') }} />
          <TextField
            label="Disabled Field"
            placeholder="Cannot edit"
            value="Read-only value"
            onChangeText={() => {}}
            disabled
          />
        </Card>
      </View>

      {/* ── State Demos ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          Screen States
        </Text>
        <View style={demoStyles.row}>
          <Button variant="secondary" onPress={() => setShowLoading(true)}>
            Show Loading
          </Button>
          <Button variant="secondary" onPress={() => setShowEmpty(true)}>
            Show Empty
          </Button>
        </View>
      </View>

      <View style={{ height: sp('10') }} />
    </Screen>
  );
}

export const App = () => {
  return (
    <ThemeProvider>
      <DemoContent />
    </ThemeProvider>
  );
};

const demoStyles = StyleSheet.create({
  header: {
    paddingTop: sp('8'),
    paddingBottom: sp('4'),
  },
  title: {
    fontSize: nativeFontSize['3xl'],
    fontWeight: '700',
  },
  subtitle: {
    fontSize: nativeFontSize.base,
    marginTop: sp('1'),
  },
  section: {
    marginTop: sp('6'),
    gap: sp('3'),
  },
  sectionTitle: {
    fontSize: nativeFontSize.xl,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sp('2'),
  },
  cardTitle: {
    fontSize: nativeFontSize.lg,
    fontWeight: '600',
    marginBottom: sp('1'),
  },
  bottomAction: {
    position: 'absolute',
    bottom: sp('8'),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default App;
