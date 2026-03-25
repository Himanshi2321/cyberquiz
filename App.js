import { useState } from 'react';
import { View } from 'react-native';
import HomeScreen   from './src/screens/HomeScreen';
import QuizScreen   from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';

export default function App() {
  const [screen,     setScreen]     = useState('HOME');
  const [level,      setLevel]      = useState(null);
  const [result,     setResult]     = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  const startQuiz = (selectedLevel) => {
    setLevel(selectedLevel);
    setScreen('QUIZ');
  };

  const finishQuiz = (quizResult) => {
    setResult(quizResult);
    setTotalScore(prev => prev + quizResult.score);
    setScreen('RESULT');
  };

  const goHome = () => setScreen('HOME');

  return (
    <View style={{ flex: 1 }}>
      {screen === 'HOME' && (
        <HomeScreen onSelectLevel={startQuiz} totalScore={totalScore} />
      )}
      {screen === 'QUIZ' && level && (
        <QuizScreen level={level} onFinish={finishQuiz} onBack={goHome} />
      )}
      {screen === 'RESULT' && result && (
        <ResultScreen
          level={level}
          result={result}
          onRetry={() => startQuiz(level)}
          onNextLevel={(nextLvl) => startQuiz(nextLvl)}
          onHome={goHome}
        />
      )}
    </View>
  );
}
