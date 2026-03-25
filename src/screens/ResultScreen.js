import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { LEVELS } from '../data/questions';

export default function ResultScreen({ level, result, onRetry, onNextLevel, onHome }) {
  const { score, lives, streak, total } = result;

  const scaleAnim  = useRef(new Animated.Value(0.6)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const maxScore = total * 150;
  const pct      = Math.min(100, Math.round((score / maxScore) * 100));
  const passed   = pct >= 50;

  const grade =
    pct >= 90 ? { label: 'S', title: 'LEGENDARY', color: '#FFD700',      emoji: '👑' } :
    pct >= 75 ? { label: 'A', title: 'ELITE',     color: COLORS.accent,  emoji: '🏆' } :
    pct >= 60 ? { label: 'B', title: 'SKILLED',   color: COLORS.primary, emoji: '⭐' } :
    pct >= 50 ? { label: 'C', title: 'RECRUIT',   color: COLORS.warning, emoji: '🎖️' } :
                { label: 'F', title: 'DEFEATED',  color: COLORS.danger,  emoji: '💀' };

  const lvlIndex = LEVELS.findIndex(l => l.id === level.id);
  const nextLvl  = LEVELS[lvlIndex + 1];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -7, duration: 750, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0,  duration: 750, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const stats = [
    { label: 'Questions',       value: `${total}/${total}` },
    { label: 'Lives Remaining', value: '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives)) },
    { label: 'Best Streak',     value: streak > 0 ? `🔥 ${streak}x` : '—', color: streak >= 3 ? '#FF8C00' : null },
    { label: 'Difficulty',      value: level.label, color: level.color },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.header}>// MISSION {passed ? 'COMPLETE' : 'FAILED'}</Text>
        </Animated.View>

        {/* GRADE CARD */}
        <Animated.View style={[styles.gradeCard, { borderColor: grade.color + '66', opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] }]}>
          <View style={[styles.gradeStrip, { backgroundColor: grade.color }]} />
          <Text style={styles.gradeEmoji}>{grade.emoji}</Text>
          <Text style={[styles.gradeLetter, { color: grade.color }]}>{grade.label}</Text>
          <Text style={[styles.gradeTitle,  { color: grade.color }]}>{grade.title}</Text>
          <Text style={styles.gradeSub}>{level.icon} {level.label} LEVEL</Text>
        </Animated.View>

        {/* SCORE */}
        <Animated.View style={[styles.scoreCard, { opacity: fadeAnim, borderColor: level.color + '44' }]}>
          <Text style={styles.scoreLbl}>TOTAL XP EARNED</Text>
          <Text style={[styles.scoreNum, { color: level.color }]}>{score}</Text>
          <Text style={styles.scorePct}>{pct}% accuracy</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: grade.color }]} />
          </View>
        </Animated.View>

        {/* STATS */}
        <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
          <Text style={styles.secLbl}>// PERFORMANCE BREAKDOWN</Text>
          {stats.map((row, i) => (
            <View key={i}>
              <View style={styles.statRow}>
                <Text style={styles.statLbl}>{row.label}</Text>
                <Text style={[styles.statVal, row.color && { color: row.color }]}>{row.value}</Text>
              </View>
              {i < stats.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Animated.View>

        {/* TIP */}
        <Animated.View style={[styles.tip, { opacity: fadeAnim }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipTxt}>
            {pct >= 90 ? 'Outstanding! You have expert-level cybersecurity knowledge.'
              : pct >= 70 ? 'Great work! Review missed questions to sharpen your skills.'
              : pct >= 50 ? 'Keep training! Review the explanations and try again.'
              : 'Study the fundamentals and come back stronger!'}
          </Text>
        </Animated.View>

        {/* BUTTONS */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={styles.btnSec} onPress={onRetry}>
            <Text style={styles.btnSecTxt}>↺  RETRY LEVEL</Text>
          </TouchableOpacity>
          {nextLvl && passed && (
            <TouchableOpacity style={[styles.btnPri, { backgroundColor: nextLvl.color }]} onPress={() => onNextLevel(nextLvl)}>
              <Text style={styles.btnPriTxt}>{nextLvl.icon}  NEXT: {nextLvl.label}  ▶</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btnPri, { backgroundColor: COLORS.primary }]} onPress={onHome}>
            <Text style={styles.btnPriTxt}>🏠  MISSION HQ</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerTxt}>CyberBreach Intel Systems</Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg },
  scroll:      { padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  header:      { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, textAlign: 'center', marginBottom: SPACING.lg },
  gradeCard:   { backgroundColor: COLORS.bgCard, borderWidth: 1, borderRadius: RADIUS.xl, alignItems: 'center', overflow: 'hidden', marginBottom: SPACING.lg, paddingBottom: SPACING.xl },
  gradeStrip:  { height: 4, width: '100%', marginBottom: SPACING.xl },
  gradeEmoji:  { fontSize: 52, marginBottom: SPACING.sm },
  gradeLetter: { fontFamily: 'monospace', fontSize: 72, fontWeight: '900', lineHeight: 82 },
  gradeTitle:  { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', letterSpacing: 6 },
  gradeSub:    { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, letterSpacing: 3, marginTop: SPACING.sm },
  scoreCard:   { backgroundColor: COLORS.bgCard, borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md },
  scoreLbl:    { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 3 },
  scoreNum:    { fontFamily: 'monospace', fontSize: 48, fontWeight: '900', lineHeight: 58 },
  scorePct:    { color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 12, marginTop: 2, marginBottom: SPACING.sm },
  barTrack:    { width: '100%', height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  barFill:     { height: 6 },
  statsCard:   { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  secLbl:      { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginBottom: SPACING.md },
  statRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  statLbl:     { color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 12 },
  statVal:     { color: COLORS.textPrimary, fontFamily: 'monospace', fontSize: 12, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: COLORS.border },
  tip:         { flexDirection: 'row', backgroundColor: COLORS.primary + '11', borderWidth: 1, borderColor: COLORS.primary + '33', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, alignItems: 'flex-start' },
  tipIcon:     { fontSize: 18, marginRight: SPACING.sm },
  tipTxt:      { flex: 1, color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 12, lineHeight: 19 },
  btnPri:      { borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  btnPriTxt:   { color: COLORS.bg, fontFamily: 'monospace', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  btnSec:      { borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border },
  btnSecTxt:   { color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  footer:      { alignItems: 'center', marginTop: SPACING.md },
  footerTxt:   { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 9, opacity: 0.5 },
});
