import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { GameStage } from '../types';

export function TitleScreen() {
  const {
    loadQuestions,
    setGameStage,
    showSetting,
    showTalentList,
    showHelp,
    showAchievement,
  } = useGameStore();

  // コンポーネントマウント時に問題データを読み込む
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleStage = (stage: GameStage) => {
    setGameStage(stage);
    showSetting();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-[5%] animate-fade-in relative">
      {/* 試験モード選択ボタン */}
      <div
        className="w-full flex flex-row items-center justify-center gap-[6vmin] relative z-10"
        style={{ marginTop: 'min(35vw, 35vh)' }}
      >
        <button
          onClick={() => handleStage('入門試験')}
          className="transition-transform active:scale-95 focus:outline-none"
          style={{
            width: 'min(36vw, 36vh)',
          }}
        >
          <img
            src="./data/images/ui/btn_nyumon.png"
            alt="入門試験"
            className="transition brightness-100 hover:brightness-140"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            draggable={false}
          />
        </button>

        <button
          onClick={() => handleStage('実力試験')}
          className="transition-transform active:scale-95 focus:outline-none"
          style={{
            width: 'min(36vw, 36vh)',
          }}
        >
          <img
            src="./data/images/ui/btn_jitsuryoku.png"
            alt="実力試験"
            className="transition brightness-100 hover:brightness-140"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            draggable={false}
          />
        </button>

        <button
          onClick={() => handleStage('マスター試験')}
          className="transition-transform active:scale-95 focus:outline-none"
          style={{
            width: 'min(36vw, 36vh)',
          }}
        >
          <img
            src="./data/images/ui/btn_master.png"
            alt="マスター試験"
            className="transition brightness-100 hover:brightness-140"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            draggable={false}
          />
        </button>
      </div>
      {/* ヘルプ・寮生一覧・アチーブメントリンク */}
      <div
        className="flex justify-center items-center absolute bottom-[5%]"
        style={{ gap: 'min(4vw, 4vh)' }}
      >
        <button
          onClick={showHelp}
          className="transition-transform active:scale-95 focus:outline-none"
          style={{ width: 'min(9vw, 9vh)' }}
        >
          <img
            src="./data/images/ui/btn_help.png"
            alt="ヘルプ"
            className="transition brightness-100 hover:brightness-140"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            draggable={false}
          />
        </button>
        <button
          onClick={showTalentList}
          className="transition-transform active:scale-95 focus:outline-none"
          style={{ width: 'min(9vw, 9vh)' }}
        >
          <img
            src="./data/images/ui/btn_talents.png"
            alt="寮生一覧"
            className="transition brightness-100 hover:brightness-140"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            draggable={false}
          />
        </button>
        <button
          onClick={showAchievement}
          className="transition-transform active:scale-95 focus:outline-none"
          style={{ width: 'min(9vw, 9vh)' }}
        >
          <img
            src="./data/images/ui/btn_achievement.png"
            alt="称号"
            className="transition brightness-100 hover:brightness-140"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            draggable={false}
          />
        </button>
      </div>
      {/* 非公式表記 */}
      <div className="absolute bottom-[1%] text-gray-400 text-xs">
        このゲームは二次創作物であり非公式のものです
      </div>
    </div>
  );
}
