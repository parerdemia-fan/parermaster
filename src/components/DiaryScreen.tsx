import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ThreePatchButton } from './ThreePatchButton';

// 開発日誌データの型
interface DiaryEntry {
  date: string;
  title: string;
  body: string;
}

/**
 * 「やっぱり」の「ぱ」をクリック可能なリンクに変換する
 * @param text テキスト
 * @param onClickPa 「ぱ」がクリックされたときのコールバック
 * @returns React要素の配列
 */
function renderBodyWithClickablePa(text: string, onClickPa: () => void): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  
  // 「やっぱり」を検索
  const pattern = /やっぱり/g;
  let match: RegExpExecArray | null;
  
  while ((match = pattern.exec(text)) !== null) {
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      result.push(
        <span key={`text-${keyIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }
    
    // 「やっ」「ぱ」「り」に分割して、「ぱ」をクリック可能にする
    result.push(
      <span key={`yappari-${keyIndex++}`}>
        やっ
        <span
          onClick={onClickPa}
          style={{
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationColor: '#444',
            textUnderlineOffset: '0.2em',
          }}
          title="？"
        >
          ぱ
        </span>
        り
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // 残りのテキストを追加
  if (lastIndex < text.length) {
    result.push(
      <span key={`text-${keyIndex++}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }
  
  return result.length > 0 ? result : [<span key="empty">{text}</span>];
}

export function DiaryScreen() {
  const { closeDiary, showSS } = useGameStore();
  const [diaryData, setDiaryData] = useState<DiaryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 開発日誌データを読み込む
  useEffect(() => {
    fetch('./data/diary.json')
      .then(response => response.json())
      .then((data: DiaryEntry[]) => {
        setDiaryData(data);
        setIsLoaded(true);
      })
      .catch(error => {
        console.error('Failed to load diary data:', error);
        setIsLoaded(true);
      });
  }, []);

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
          onClick={closeDiary}
          height="5cqmin"
          fontSize="3cqmin"
          textColor="#CCC"
        >
          閉じる
        </ThreePatchButton>
        <h1
          className="text-yellow-300 font-bold"
          style={{
            fontSize: '5cqmin',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
          }}
        >
          開発日誌
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
        {isLoaded && diaryData.length === 0 && (
          <div
            className="text-gray-400 text-center"
            style={{ fontSize: '3cqmin', marginTop: '10cqmin' }}
          >
            開発日誌が見つかりませんでした
          </div>
        )}

        {/* 日誌エントリー */}
        {diaryData.map((entry, index) => (
          <div
            key={index}
            className="border-b border-yellow-900/30"
            style={{
              marginBottom: '4cqmin',
              paddingBottom: '4cqmin',
            }}
          >
            {/* 日付 */}
            <div
              className="text-yellow-400/80"
              style={{
                fontSize: '2.5cqmin',
                marginBottom: '1cqmin',
              }}
            >
              {entry.date}
            </div>
            {/* タイトル */}
            <div
              className="text-yellow-300 font-bold"
              style={{
                fontSize: '3.5cqmin',
                marginBottom: '2cqmin',
              }}
            >
              {entry.title}
            </div>
            {/* 本文 */}
            <div
              className="text-gray-200"
              style={{
                fontSize: '3cqmin',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
              }}
            >
              {renderBodyWithClickablePa(entry.body, showSS)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
