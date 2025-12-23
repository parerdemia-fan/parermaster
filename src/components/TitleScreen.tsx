import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { GameStage } from '../types';
import { ThreePatchButton } from './ThreePatchButton';

// BeforeInstallPromptEvent型定義
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function TitleScreen() {
  const {
    loadQuestions,
    setGameStage,
    showSetting,
    showTalentList,
    showHelp,
    showAchievement,
  } = useGameStore();

  // PWA関連の状態管理
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  // コンポーネントマウント時に問題データを読み込む
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // PWA関連の初期化処理
  useEffect(() => {
    // PWAアプリとして実行中かチェック
    const checkIsPWA = isRunningInPwa();
    setIsPWA(checkIsPWA);

    // モバイルデバイスかチェック
    const checkIsMobile = window.matchMedia('(pointer: coarse)').matches;
    setIsMobile(checkIsMobile);

    // beforeinstallpromptイベントリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // appinstalledイベントリスナー（インストール完了検知）
    const handleAppInstalled = () => {
      setTimeout(() => {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isRunningInPwa = (): boolean => {
    // 1. 複数の display-mode をチェック
    // standalone: 通常のアプリモード（ステータスバーあり）
    // fullscreen: フルスクリーンモード（ステータスバーなし・ゲーム等）
    // minimal-ui: 最小限のUI（戻るボタン等だけある状態）
    const isAppMode = window.matchMedia(
      '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)'
    ).matches;

    // 2. iOS Safari (レガシー対応)
    // iOSは fullscreen 指定でも navigator.standalone が true になることが多いですが、
    // 念のためこの判定も残しておきます。
    const isIosStandalone = 
      'standalone' in window.navigator && 
      (window.navigator as any).standalone === true;

    return isAppMode || isIosStandalone;
  };

  const handleStage = (stage: GameStage) => {
    setGameStage(stage);
    showSetting();
  };

  // PWAインストールボタンのクリック処理
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  // インストールボタン表示条件：PWAアプリ実行中でなく、モバイルで、インストール可能な場合
  const showInstallButton = !isPWA && isMobile && isInstallable;
  // 通常ボタン表示条件：インストールボタン非表示の場合
  const showNormalButtons = isPWA || !isMobile;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-[5%] animate-fade-in relative">
      {/* PWAインストールボタン */}
      {showInstallButton && (
        <div className="w-full h-full flex flex-col items-center justify-center"
          style={{ marginTop: '60cqmin' }}
        >
          <ThreePatchButton
            key="install-pwa-button"
            leftImage={`./data/images/ui/btn_red_left.png`}
            middleImage={`./data/images/ui/btn_red_middle.png`}
            rightImage={`./data/images/ui/btn_red_right.png`}
            onClick={handleInstallClick}
            height="9cqmin"
            fontSize="4cqmin"
            textColor="#FFF"
            className="selection-card"
          >
            アプリをインストール
          </ThreePatchButton>
            {typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent) && (
            <p
              className="text-white mt-[1cqmin]"
              style={{ fontSize: '5cqmin', width: '80cqmin' }}
            >
              インストール完了後にホーム画面にアイコンが追加されない場合は、アプリ一覧から起動をお願いします。
            </p>
            )}
        </div>
      )}
      {!isPWA && isMobile && !isInstallable && (
        <div className="w-full h-full flex flex-col items-center justify-center"
          style={{ marginTop: '70cqmin' }}
        >
          <p
            className="text-white mt-[1cqmin]"
            style={{ fontSize: '5cqmin', width: '80cqmin' }}
          >
            ホーム画面またはアプリ一覧より「パレ学マスター」を起動してください。
          </p>
        </div>
      )}

      {/* 通常の試験モード選択ボタン */}
      {showNormalButtons && (
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
      )}

      {/* ヘルプ・寮生一覧・アチーブメントリンク */}
      {showNormalButtons && (
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
      )}

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
    </div>
  );
}
