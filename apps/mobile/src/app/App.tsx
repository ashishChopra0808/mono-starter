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
import { I18nProvider, useTranslation } from '../i18n';

function DemoContent() {
  const { colors, themeName, toggleTheme } = useTheme();
  const { t, locale, setLocale, supportedLocales } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  if (showLoading) {
    return (
      <Screen scrollable={false}>
        <LoadingState message={t('mobile.states.fetchingData')} />
        <View style={demoStyles.bottomAction}>
          <Button variant="ghost" onPress={() => setShowLoading(false)}>
            {t('actions.cancel')}
          </Button>
        </View>
      </Screen>
    );
  }

  if (showEmpty) {
    return (
      <Screen scrollable={false}>
        <EmptyState
          title={t('mobile.states.noBookingsTitle')}
          description={t('mobile.states.noBookingsDesc')}
          action={{ label: t('actions.goBack'), onPress: () => setShowEmpty(false) }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* ── Header ── */}
      <View style={demoStyles.header}>
        <Text style={[demoStyles.title, { color: colors.foreground }]}>
          {t('mobile.title')}
        </Text>
        <Text style={[demoStyles.subtitle, { color: colors['foreground-muted'] }]}>
          {t('common.theme')}: {themeName}
        </Text>
      </View>

      {/* ── Language Switcher ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          {t('common.language')}
        </Text>
        <View style={demoStyles.row}>
          {supportedLocales.map((loc) => (
            <Button
              key={loc}
              variant={loc === locale ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setLocale(loc)}
            >
              {t(`locale.${loc}` as Parameters<typeof t>[0])}
            </Button>
          ))}
        </View>
      </View>

      {/* ── Theme Toggle ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          {t('mobile.sections.theme')}
        </Text>
        <Button variant="outline" size="md" onPress={toggleTheme}>
          {t('mobile.cycleTheme', { theme: themeName })}
        </Button>
      </View>

      {/* ── Buttons ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          {t('mobile.sections.buttons')}
        </Text>
        <View style={demoStyles.row}>
          <Button variant="primary" size="sm" onPress={() => {}}>
            {t('mobile.buttons.primary')}
          </Button>
          <Button variant="secondary" size="sm" onPress={() => {}}>
            {t('mobile.buttons.secondary')}
          </Button>
          <Button variant="destructive" size="sm" onPress={() => {}}>
            {t('mobile.buttons.delete')}
          </Button>
        </View>
        <View style={demoStyles.row}>
          <Button variant="outline" size="sm" onPress={() => {}}>
            {t('mobile.buttons.outline')}
          </Button>
          <Button variant="ghost" size="sm" onPress={() => {}}>
            {t('mobile.buttons.ghost')}
          </Button>
          <Button variant="primary" size="sm" loading onPress={() => {}}>
            {t('mobile.buttons.loading')}
          </Button>
        </View>
        <View style={demoStyles.row}>
          <Button variant="primary" size="lg" onPress={() => {}}>
            {t('mobile.buttons.large')}
          </Button>
        </View>
      </View>

      {/* ── Cards ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          {t('mobile.sections.cards')}
        </Text>
        <Card variant="elevated">
          <Text style={[demoStyles.cardTitle, { color: colors.foreground }]}>
            {t('mobile.cards.elevated')}
          </Text>
          <Text style={{ color: colors['foreground-muted'] }}>
            {t('mobile.cards.elevatedDesc')}
          </Text>
        </Card>
        <View style={{ height: sp('3') }} />
        <Card variant="outlined">
          <Text style={[demoStyles.cardTitle, { color: colors.foreground }]}>
            {t('mobile.cards.outlined')}
          </Text>
          <Text style={{ color: colors['foreground-muted'] }}>
            {t('mobile.cards.outlinedDesc')}
          </Text>
        </Card>
        <View style={{ height: sp('3') }} />
        <Card variant="filled" onPress={() => {}}>
          <Text style={[demoStyles.cardTitle, { color: colors.foreground }]}>
            {t('mobile.cards.filled')}
          </Text>
          <Text style={{ color: colors['foreground-muted'] }}>
            {t('mobile.cards.filledDesc')}
          </Text>
        </Card>
      </View>

      {/* ── Text Fields ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          {t('mobile.sections.textFields')}
        </Text>
        <Card variant="outlined">
          <TextField
            label={t('form.name')}
            placeholder={t('mobile.fields.namePlaceholder')}
            value={name}
            onChangeText={setName}
          />
          <View style={{ height: sp('3') }} />
          <TextField
            label={t('form.email')}
            placeholder={t('mobile.fields.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={email.length > 0 && !email.includes('@') ? t('mobile.fields.emailError') : undefined}
          />
          <View style={{ height: sp('3') }} />
          <TextField
            label={t('mobile.fields.disabledField')}
            placeholder={t('form.disabled')}
            value={t('mobile.fields.readOnlyValue')}
            onChangeText={() => {}}
            disabled
          />
        </Card>
      </View>

      {/* ── State Demos ── */}
      <View style={demoStyles.section}>
        <Text style={[demoStyles.sectionTitle, { color: colors.foreground }]}>
          {t('mobile.sections.screenStates')}
        </Text>
        <View style={demoStyles.row}>
          <Button variant="secondary" onPress={() => setShowLoading(true)}>
            {t('mobile.states.showLoading')}
          </Button>
          <Button variant="secondary" onPress={() => setShowEmpty(true)}>
            {t('mobile.states.showEmpty')}
          </Button>
        </View>
      </View>

      <View style={{ height: sp('10') }} />
    </Screen>
  );
}

export const App = () => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <DemoContent />
      </ThemeProvider>
    </I18nProvider>
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
