import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ThreePatchButton } from './ThreePatchButton';
import { parseTextWithTalentIcons, getTalentNameMap } from '../utils/talentIconParser';

// SSデータの型
interface SSChapter {
  title: string;
  body: string;
}

interface SSData {
  ss_title: string;
  chapters: SSChapter[];
}

export function SSScreen() {
  const { closeSS } = useGameStore();
  const [ssData, setSSData] = useState<SSData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // SSデータを読み込む
  useEffect(() => {
    fetch('./data/ss.json')
      .then(response => response.json())
      .then((data: SSData) => {
        setSSData(data);
        setIsLoaded(true);
      })
      .catch(error => {
        console.error('Failed to load SS data:', error);
        setIsLoaded(true);
      });
  }, []);

  // タレント名マップが構築済みかどうか
  const hasTalentMap = getTalentNameMap() !== null;

  // テキストをパースしてタレントアイコン付きで表示
  const renderTextWithIcons = (text: string): React.ReactNode => {
    if (!hasTalentMap) {
      return text;
    }

    // 改行で分割して処理
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        {lineIndex > 0 && <br />}
        {parseTextWithTalentIcons(line, true, true)}
      </span>
    ));
  };

  return (
    <div
      className="absolute inset-0 flex flex-col z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          height: '10%',
          padding: '0 5cqmin',
        }}
      >
        <ThreePatchButton
          leftImage="./data/images/ui/btn_normal_off_left.png"
          middleImage="./data/images/ui/btn_normal_off_middle.png"
          rightImage="./data/images/ui/btn_normal_off_right.png"
          onClick={closeSS}
          height="5cqmin"
          fontSize="3cqmin"
          textColor="#CCC"
        >
          閉じる
        </ThreePatchButton>
        <h1
          className="text-yellow-300 font-bold text-center"
          style={{
            fontSize: '4cqmin',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
            flex: 1,
            paddingLeft: '2cqmin',
            paddingRight: '2cqmin',
          }}
        >
          {ssData?.ss_title || 'ショートストーリー'}
        </h1>
        <div style={{ width: '12cqmin' }}></div>
      </div>

      {/* スクロールコンテナ */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: '0 8cqmin 4cqmin',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 215, 0, 0.5) transparent',
        }}
      >
        {isLoaded && !ssData && (
          <div
            className="text-gray-400 text-center"
            style={{ fontSize: '3cqmin', marginTop: '10cqmin' }}
          >
            ショートストーリーが見つかりませんでした
          </div>
        )}

        {/* チャプター */}
        {ssData?.chapters.map((chapter, index) => (
          <div
            key={index}
            className="border-b border-yellow-900/30"
            style={{
              marginBottom: '4cqmin',
              paddingBottom: '4cqmin',
            }}
          >
            {/* チャプタータイトル */}
            <div
              className="text-yellow-300 font-bold"
              style={{
                fontSize: '3.5cqmin',
                marginBottom: '2cqmin',
              }}
            >
              {chapter.title}
            </div>
            {/* 本文 */}
            <div
              className="text-gray-200"
              style={{
                fontSize: '3cqmin',
                lineHeight: '1.8',
              }}
            >
              {renderTextWithIcons(chapter.body)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
