import { GameContainer } from './components/GameContainer';
import { TitleScreen } from './components/TitleScreen';
import { SettingScreen } from './components/SettingScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { TalentListScreen } from './components/TalentListScreen';
import { HelpScreen } from './components/HelpScreen';
import { AchievementScreen } from './components/AchievementScreen';
import { StaffRollScreen } from './components/StaffRollScreen';
import { DiaryScreen } from './components/DiaryScreen';
import { RoomArea } from './components/RoomArea';
import { useGameStore } from './stores/gameStore';

function App() {
  const { screen, showingStaffRoll, showingDiary } = useGameStore();

  return (
    <div className="w-screen h-screen flex flex-col">
      <GameContainer>
        {screen === 'title' && <TitleScreen />}
        {screen === 'setting' && <SettingScreen />}
        {screen === 'quiz' && <QuizScreen />}
        {screen === 'result' && <ResultScreen />}
        {screen === 'talents' && <TalentListScreen />}
        {screen === 'help' && <HelpScreen />}
        {screen === 'achievement' && <AchievementScreen />}
        {/* スタッフロール（オーバーレイ表示） */}
        {showingStaffRoll && <StaffRollScreen />}
        {/* 開発日誌（オーバーレイ表示） */}
        {showingDiary && <DiaryScreen />}
      </GameContainer>
      {/* 縦画面時のみ表示される談話室エリア */}
      <div className="hidden portrait:block">
        <RoomArea showSelector={screen === 'title'} />
      </div>
    </div>
  );
}

export default App
