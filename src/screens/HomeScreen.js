import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { LEVELS } from '../data/questions';

const TOTAL_LEVELS = LEVELS.length;

export default function HomeScreen({ onSelectLevel, totalScore }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>[ TOP SECRET // CLASSIFIED ]</Text>
          </View>
          <Animated.View style={[styles.logoBox, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.logoEmoji}>🔐</Text>
            <Text style={styles.logoTop}>CYBER</Text>
            <Text style={styles.logoBot}>BREACH</Text>
            <Text style={styles.logoTag}>INTELLIGENCE QUIZ  •  6 LEVELS  •  90 QUESTIONS</Text>
          </Animated.View>
          <Text style={styles.desc}>
            From basic concepts to nation-state tactics.{'\n'}
            Prove your worth. Earn your clearance.
          </Text>
          {totalScore > 0 && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpLbl}>TOTAL XP  </Text>
              <Text style={styles.xpVal}>{totalScore}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.secLbl}>// SELECT CLEARANCE LEVEL</Text>
          {LEVELS.map((level, index) => (
            <LevelCard key={level.id} level={level} index={index} onPress={() => onSelectLevel(level)} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerA}>⚠️  FOR AUTHORIZED PERSONNEL ONLY</Text>
          <Text style={styles.footerB}>CyberBreach Intel Systems v3.0  •  6 Levels  •  90 Questions</Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

function LevelCard({ level, index, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.card, { borderColor: level.color + '66' }]}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        activeOpacity={1}
      >
        <View style={[styles.cardStrip, { backgroundColor: level.color }]} />
        <View style={styles.cardBody}>
          <View style={[styles.indexBadge, { backgroundColor: level.color + '22', borderColor: level.color + '66' }]}>
            <Text style={[styles.indexTxt, { color: level.color }]}>{index + 1}</Text>
          </View>
          <Text style={styles.cardEmoji}>{level.icon}</Text>
          <View style={styles.cardMid}>
            <Text style={styles.cardNum}>CLEARANCE LEVEL {index + 1}</Text>
            <Text style={[styles.cardLabel, { color: level.color }]}>{level.label}</Text>
            <Text style={styles.cardDesc}>{level.description}</Text>
            <Text style={styles.cardMeta}>15 questions  •  +{level.xpReward} XP</Text>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.bars}>
              {Array.from({ length: TOTAL_LEVELS }).map((_, i) => (
                <View key={i} style={[styles.bar, { backgroundColor: i <= index ? level.color : COLORS.border }]} />
              ))}
            </View>
            <Text style={[styles.arrow, { color: level.color }]}>▶</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg },
  scroll:      { padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  badge:       { alignSelf: 'center', borderWidth: 1, borderColor: COLORS.danger, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, marginBottom: SPACING.md },
  badgeTxt:    { color: COLORS.danger, fontFamily: 'monospace', fontSize: 9, letterSpacing: 3, fontWeight: '700' },
  logoBox:     { alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '55', borderRadius: RADIUS.lg, paddingVertical: SPACING.xl, marginBottom: SPACING.lg, backgroundColor: COLORS.bgCard },
  logoEmoji:   { fontSize: 50, marginBottom: SPACING.sm },
  logoTop:     { fontSize: 44, fontWeight: '900', color: COLORS.primary, fontFamily: 'monospace', letterSpacing: 10 },
  logoBot:     { fontSize: 32, fontWeight: '900', color: COLORS.accent, fontFamily: 'monospace', letterSpacing: 8, marginTop: -4 },
  logoTag:     { fontSize: 9, color: COLORS.textSecondary, fontFamily: 'monospace', letterSpacing: 2, marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.md },
  desc:        { color: COLORS.textSecondary, textAlign: 'center', fontSize: 13, fontFamily: 'monospace', lineHeight: 21, marginBottom: SPACING.md },
  xpBadge:     { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent + '22', borderWidth: 1, borderColor: COLORS.accent, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginBottom: SPACING.md },
  xpLbl:       { color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 },
  xpVal:       { color: COLORS.accent, fontFamily: 'monospace', fontSize: 20, fontWeight: '900' },
  secLbl:      { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, marginBottom: SPACING.md, marginTop: SPACING.sm },
  card:        { borderWidth: 1, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, marginBottom: SPACING.md, overflow: 'hidden' },
  cardStrip:   { height: 3 },
  cardBody:    { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  indexBadge:  { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  indexTxt:    { fontFamily: 'monospace', fontSize: 12, fontWeight: '900' },
  cardEmoji:   { fontSize: 22, marginRight: SPACING.sm },
  cardMid:     { flex: 1 },
  cardNum:     { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 },
  cardLabel:   { fontFamily: 'monospace', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  cardDesc:    { color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 10, marginTop: 1 },
  cardMeta:    { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  cardRight:   { alignItems: 'center', marginLeft: SPACING.sm },
  bars:        { flexDirection: 'row', marginBottom: 6 },
  bar:         { width: 4, height: 16, borderRadius: 2, marginHorizontal: 1 },
  arrow:       { fontSize: 14 },
  footer:      { alignItems: 'center', marginTop: SPACING.xl },
  footerA:     { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  footerB:     { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 9, opacity: 0.5 },
});
