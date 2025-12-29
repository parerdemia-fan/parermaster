import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { GameStage, Achievement } from '../types';
import { ThreePatchButton } from './ThreePatchButton';

export function TitleScreen() {
  const {
    loadQuestions,
    setGameStage,
    showSetting,
    showTalentList,
    showHelp,
    showAchievement,
    pendingCompositeAchievements,
    checkCompositeAchievements,
    markCompositeAchievementShown,
    triggerCompositeAchievementForDebug,
    showStaffRoll,
    hasMasterAchievement,
    toggleMasterAchievement,
  } = useGameStore();

  // 表示中の複合アチーブメント
  const [displayedAchievement, setDisplayedAchievement] = useState<Achievement | null>(null);
  // デバッグモードで表示しているか（trueなら表示済みフラグを立てない）
  const [isDebugMode, setIsDebugMode] = useState(false);

  // コンポーネントマウント時に問題データを読み込む
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // 複合アチーブメントのチェック（タイトル画面表示時）
  useEffect(() => {
    const timer = setTimeout(() => {
      checkCompositeAchievements();
    }, 500);
    return () => clearTimeout(timer);
  }, [checkCompositeAchievements]);

  // pending の複合アチーブメントがあれば表示
  useEffect(() => {
    if (pendingCompositeAchievements.length > 0 && !displayedAchievement) {
      setDisplayedAchievement(pendingCompositeAchievements[0]);
    }
  }, [pendingCompositeAchievements, displayedAchievement]);

  // ダイアログを閉じる
  const handleCloseAchievementDialog = useCallback(() => {
    if (displayedAchievement) {
      // パレ学ソムリエ称号の場合はスタッフロールを表示
      if (displayedAchievement.id === 'palegaku_sommelier' || displayedAchievement.id === 'palegaku_master') {
        showStaffRoll();
      }
      // デバッグモードの場合はLocalStorageに保存しない（第2引数=false）
      markCompositeAchievementShown(displayedAchievement.id, !isDebugMode);
      setDisplayedAchievement(null);
      setIsDebugMode(false);
    }
  }, [displayedAchievement, isDebugMode, markCompositeAchievementShown, showStaffRoll]);

  const handleStage = (stage: GameStage) => {
    setGameStage(stage);
    showSetting();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-[5%] animate-fade-in relative">
      {/* 通常の試験モード選択ボタン */}
      <div
        className="w-full flex flex-row items-center justify-center gap-[6cqmin] relative z-10"
        style={{ marginTop: '35cqmin' }}
      >
          <button
            onClick={() => handleStage('入門試験')}
            className="transition-transform active:scale-95 focus:outline-none"
            style={{
              width: '36cqmin',
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
              width: '36cqmin',
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
              width: '36cqmin',
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
          style={{ gap: '4cqmin' }}
        >
          <button
            onClick={showHelp}
            className="transition-transform active:scale-95 focus:outline-none"
            style={{ width: '9cqmin' }}
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
            style={{ width: '9cqmin' }}
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
            style={{ width: '9cqmin' }}
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
      <div className="absolute text-gray-300"
        style={{
          fontSize: '2cqmin',
          bottom: '0',
          filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 1))',
         }}
      >
        ※このゲームは二次創作物であり非公式のものです
      </div>

      {/* ローカル環境用デバッグボタン */}
      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <div className="absolute flex" style={{ top: '3cqmin', left: '3cqmin', gap: '2cqmin' }}>
          <ThreePatchButton
            leftImage="./data/images/ui/btn_normal_off_left.png"
            middleImage="./data/images/ui/btn_normal_off_middle.png"
            rightImage="./data/images/ui/btn_normal_off_right.png"
            onClick={() => {
              setIsDebugMode(true);
              triggerCompositeAchievementForDebug();
            }}
            height="5cqmin"
            fontSize="2.5cqmin"
            textColor="#F88"
          >
            称号演出テスト
          </ThreePatchButton>
          <ThreePatchButton
            leftImage="./data/images/ui/btn_normal_off_left.png"
            middleImage="./data/images/ui/btn_normal_off_middle.png"
            rightImage="./data/images/ui/btn_normal_off_right.png"
            onClick={toggleMasterAchievement}
            height="5cqmin"
            fontSize="2.5cqmin"
            textColor={hasMasterAchievement() ? '#8F8' : '#F88'}
          >
            マスター{hasMasterAchievement() ? 'ON' : 'OFF'}
          </ThreePatchButton>
        </div>
      )}

      {/* 複合アチーブメント獲得ダイアログ */}
      {displayedAchievement && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={handleCloseAchievementDialog}
        >
          <div
            className="flex flex-col items-center animate-fade-in"
            style={{ padding: '4cqmin' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 称号獲得テキスト */}
            <div
              className="text-yellow-300 font-bold mb-4"
              style={{
                fontSize: '5cqmin',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)',
              }}
            >
              🎉 称号獲得！ 🎉
            </div>

            {/* アチーブメント画像 */}
            <div
              className="relative mb-4"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <img
                src={displayedAchievement.imagePath}
                alt={displayedAchievement.name}
                style={{
                  width: '30cqmin',
                  height: '30cqmin',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))',
                }}
                draggable={false}
              />
            </div>

            {/* アチーブメント名 */}
            <div
              className="text-white font-bold text-center"
              style={{
                fontSize: '5cqmin',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
              }}
            >
              {displayedAchievement.name}
            </div>

            {/* 説明 */}
            <div
              className="text-gray-300 text-center mt-2"
              style={{
                fontSize: '3cqmin',
              }}
            >
              {displayedAchievement.description}
            </div>

            {/* 閉じるボタン */}
            <div style={{ marginTop: '8cqmin' }}>
              <ThreePatchButton
                leftImage="./data/images/ui/btn_normal_off_left.png"
                middleImage="./data/images/ui/btn_normal_off_middle.png"
                rightImage="./data/images/ui/btn_normal_off_right.png"
                onClick={handleCloseAchievementDialog}
                height="7cqmin"
                fontSize="4cqmin"
                textColor="#DDA"
              >
                閉じる
              </ThreePatchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
