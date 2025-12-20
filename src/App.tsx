import { GameContainer } from './components/GameContainer';
import { TitleScreen } from './components/TitleScreen';
import { SettingScreen } from './components/SettingScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { TalentListScreen } from './components/TalentListScreen';
import { HelpScreen } from './components/HelpScreen';
import { AchievementScreen } from './components/AchievementScreen';
import { useGameStore } from './stores/gameStore';

function App() {
  const { screen } = useGameStore();

  return (
    <GameContainer>
      {screen === 'title' && <TitleScreen />}
      {screen === 'setting' && <SettingScreen />}
      {screen === 'quiz' && <QuizScreen />}
      {screen === 'result' && <ResultScreen />}
      {screen === 'talents' && <TalentListScreen />}
      {screen === 'help' && <HelpScreen />}
      {screen === 'achievement' && <AchievementScreen />}
    </GameContainer>
  );
}

export default App
