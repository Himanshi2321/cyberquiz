import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { QUESTIONS } from '../data/questions';

const TIME_PER_Q = 20;
const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizScreen({ level, onFinish, onBack }) {
  const questions = QUESTIONS[level.id];

  const [idx,        setIdx]        = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [answered,   setAnswered]   = useState(false);
  const [showExp,    setShowExp]    = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(TIME_PER_Q);
  const [scoreDisp,  setScoreDisp]  = useState(0);
  const [livesDisp,  setLivesDisp]  = useState(3);
  const [streakDisp, setStreakDisp] = useState(0);

  const scoreRef  = useRef(0);
  const livesRef  = useRef(3);
  const streakRef = useRef(0);
  const timerRef  = useRef(null);
  const doneRef   = useRef(false);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  const current = questions[idx];

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [idx]);

  useEffect(() => {
    if (answered) {
      clearInterval(timerRef.current);
      timerAnim.stopAnimation();
      return;
    }
    doneRef.current = false;
    setTimeLeft(TIME_PER_Q);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, { toValue: 0, duration: TIME_PER_Q * 1000, useNativeDriver: false }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!doneRef.current) { doneRef.current = true; triggerTimeout(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [idx, answered]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const loseLife = () => {
    livesRef.current -= 1;
    setLivesDisp(livesRef.current);
    shake();
    if (livesRef.current <= 0) {
      setTimeout(() => onFinish({ score: scoreRef.current, lives: 0, streak: streakRef.current, total: questions.length }), 1800);
    }
  };

  const triggerTimeout = () => {
    setAnswered(true);
    setShowExp(true);
    streakRef.current = 0;
    setStreakDisp(0);
    loseLife();
  };

  const handleSelect = (optIdx) => {
    if (answered || doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    timerAnim.stopAnimation();
    setSelected(optIdx);
    setAnswered(true);
    setShowExp(true);

    if (optIdx === current.answer) {
      const timeBonus   = Math.floor((timeLeft / TIME_PER_Q) * 50);
      const streakBonus = streakRef.current >= 2 ? 25 : 0;
      scoreRef.current  += 100 + timeBonus + streakBonus;
      streakRef.current += 1;
      setScoreDisp(scoreRef.current);
      setStreakDisp(streakRef.current);
    } else {
      streakRef.current = 0;
      setStreakDisp(0);
      loseLife();
    }
  };

  const handleNext = () => {
    if (livesRef.current <= 0) return;
    if (idx + 1 >= questions.length) {
      onFinish({ score: scoreRef.current, lives: livesRef.current, streak: streakRef.current, total: questions.length });
    } else {
      setIdx(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
      setShowExp(false);
    }
  };

  const timerColor = timeLeft <= 5 ? COLORS.danger : timeLeft <= 10 ? COLORS.warning : COLORS.accent;
  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backTxt}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topMid}>
          <Text style={[styles.levelTxt, { color: level.color }]}>{level.icon} {level.label}</Text>
          <Text style={styles.qCount}>{idx + 1} / {questions.length}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={styles.livesRow}>
            {[0,1,2].map(i => (
              <Text key={i} style={[styles.lifeIcon, { opacity: i < livesDisp ? 1 : 0.2 }]}>❤️</Text>
            ))}
          </View>
          {streakDisp >= 2 && <Text style={styles.streakTxt}>🔥 {streakDisp}</Text>}
        </View>
      </View>

      {/* PROGRESS */}
      <View style={styles.progTrack}>
        <View style={[styles.progFill, { width: `${Math.round(((idx+1)/questions.length)*100)}%`, backgroundColor: level.color }]} />
      </View>

      {/* TIMER */}
      <View style={styles.timerRow}>
        <View style={styles.timerTrack}>
          <Animated.View style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
        </View>
        <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
      </View>

      {/* SCORE */}
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLbl}>XP  </Text>
        <Text style={styles.scoreVal}>{scoreDisp}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* QUESTION */}
        <Animated.View style={[
          styles.qCard,
          { opacity: fadeAnim, transform: [{ translateX: shakeAnim }],
            borderColor: answered ? (selected === current.answer ? COLORS.accent + '99' : COLORS.danger + '99') : level.color + '44' }
        ]}>
          <View style={[styles.qTag, { backgroundColor: level.color + '22', borderColor: level.color + '55' }]}>
            <Text style={[styles.qTagTxt, { color: level.color }]}>Q{idx + 1}</Text>
          </View>
          <Text style={styles.qTxt}>{current.question}</Text>
        </Animated.View>

        {/* OPTIONS */}
        {current.options.map((opt, i) => {
          const isSel  = selected === i;
          const isCorr = i === current.answer;
          let bc = COLORS.optionBorder, bg = COLORS.optionDefault, tc = COLORS.textPrimary, lc = COLORS.border, icon = LABELS[i];
          if (answered) {
            if (isCorr)     { bc = COLORS.optionCorrectBorder; bg = COLORS.optionCorrect; tc = COLORS.accent; lc = COLORS.accent; icon = '✓'; }
            else if (isSel) { bc = COLORS.optionWrongBorder;   bg = COLORS.optionWrong;   tc = COLORS.danger; lc = COLORS.danger; icon = '✗'; }
            else            { tc = COLORS.textMuted; bc = COLORS.border; }
          }
          return (
            <TouchableOpacity key={i} style={[styles.optBtn, { borderColor: bc, backgroundColor: bg }]} onPress={() => handleSelect(i)} disabled={answered} activeOpacity={0.8}>
              <View style={[styles.optLbl, { borderColor: lc, backgroundColor: lc + '33' }]}>
                <Text style={[styles.optLblTxt, { color: tc }]}>{icon}</Text>
              </View>
              <Text style={[styles.optTxt, { color: tc }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {/* EXPLANATION */}
        {showExp && (
          <View style={[styles.expCard, { borderColor: selected === current.answer ? COLORS.accent + '66' : COLORS.danger + '66' }]}>
            <Text style={[styles.expTitle, { color: selected === null ? COLORS.warning : selected === current.answer ? COLORS.accent : COLORS.danger }]}>
              {selected === null ? '⏱  TIME\'S UP!' : selected === current.answer ? '✓  CORRECT!' : '✗  INCORRECT'}
            </Text>
            {streakDisp >= 2 && selected === current.answer && (
              <Text style={styles.streakBonus}>🔥 STREAK BONUS +25 XP</Text>
            )}
            <Text style={styles.expTxt}>{current.explanation}</Text>
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: level.color }]} onPress={handleNext}>
              <Text style={styles.nextTxt}>{idx + 1 >= questions.length ? '🏁  VIEW RESULTS' : 'NEXT  ▶'}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  backTxt:     { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  topMid:      { alignItems: 'center' },
  levelTxt:    { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  qCount:      { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 11, marginTop: 2 },
  topRight:    { alignItems: 'flex-end' },
  livesRow:    { flexDirection: 'row' },
  lifeIcon:    { fontSize: 14, marginLeft: 2 },
  streakTxt:   { color: '#FF8C00', fontFamily: 'monospace', fontSize: 12, fontWeight: '700', marginTop: 2 },
  progTrack:   { height: 3, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  progFill:    { height: 3 },
  timerRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  timerTrack:  { flex: 1, height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginRight: SPACING.sm },
  timerFill:   { height: 5, borderRadius: 3 },
  timerNum:    { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right' },
  scoreRow:    { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: SPACING.md, paddingTop: 6, paddingBottom: 4 },
  scoreLbl:    { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },
  scoreVal:    { color: COLORS.primary, fontFamily: 'monospace', fontSize: 18, fontWeight: '900' },
  scroll:      { padding: SPACING.md, paddingBottom: SPACING.xxl },
  qCard:       { backgroundColor: COLORS.bgCard, borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  qTag:        { alignSelf: 'flex-start', borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 2, marginBottom: SPACING.sm },
  qTagTxt:     { fontFamily: 'monospace', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  qTxt:        { color: COLORS.textPrimary, fontFamily: 'monospace', fontSize: 15, fontWeight: '700', lineHeight: 24 },
  optBtn:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  optLbl:      { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  optLblTxt:   { fontFamily: 'monospace', fontSize: 13, fontWeight: '900' },
  optTxt:      { fontFamily: 'monospace', fontSize: 13, flex: 1, lineHeight: 20 },
  expCard:     { marginTop: SPACING.sm, backgroundColor: COLORS.bgCardAlt, borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.lg },
  expTitle:    { fontFamily: 'monospace', fontSize: 15, fontWeight: '900', letterSpacing: 2, marginBottom: SPACING.xs },
  streakBonus: { color: '#FF8C00', fontFamily: 'monospace', fontSize: 11, fontWeight: '700', marginBottom: SPACING.sm },
  expTxt:      { color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 13, lineHeight: 20, marginBottom: SPACING.md },
  nextBtn:     { borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  nextTxt:     { color: COLORS.bg, fontFamily: 'monospace', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});
