import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Talent } from '../types';

// 寮名から談話室背景画像パスを取得
const DORMITORY_BG_MAP: Record<string, string> = {
  'クゥ寮': './data/images/ui/bg_co.png',
  'ミュゥ寮': './data/images/ui/bg_me.png',
  'バゥ寮': './data/images/ui/bg_wa.png',
  'ウィニー寮': './data/images/ui/bg_wh.png',
};

// LocalStorage キー
const STORAGE_KEY = 'parermaster_selected_talent';

interface RoomAreaProps {
  showSelector?: boolean;
}

/**
 * 談話室エリアコンポーネント
 * 縦画面時にゲーム画面の下部に表示される
 */
export function RoomArea({ showSelector = false }: RoomAreaProps) {
  const { talents } = useGameStore();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 初期化：LocalStorageから選択済みタレントを取得、なければランダム選択
  useEffect(() => {
    if (talents.length === 0) return;

    const savedStudentId = localStorage.getItem(STORAGE_KEY);
    if (savedStudentId) {
      const talent = talents.find(t => t.student_id === savedStudentId);
      if (talent) {
        setSelectedTalent(talent);
        return;
      }
    }

    // ランダム選択
    const randomIndex = Math.floor(Math.random() * talents.length);
    const randomTalent = talents[randomIndex];
    setSelectedTalent(randomTalent);
    localStorage.setItem(STORAGE_KEY, randomTalent.student_id);
  }, [talents]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // タレント選択時の処理
  const handleSelectTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    localStorage.setItem(STORAGE_KEY, talent.student_id);
    setIsDropdownOpen(false);
  };

  if (!selectedTalent) return null;

  const bgImage = DORMITORY_BG_MAP[selectedTalent.dormitory] || DORMITORY_BG_MAP['クゥ寮'];
  const kvImage = `./data/images/kv/orig/${selectedTalent.student_id}.png`;

  // 寮ごとにタレントをグループ化
  const talentsByDormitory = talents.reduce((acc, talent) => {
    if (!acc[talent.dormitory]) {
      acc[talent.dormitory] = [];
    }
    acc[talent.dormitory].push(talent);
    return acc;
  }, {} as Record<string, Talent[]>);

  // 寮の表示順序
  const dormitoryOrder = ['クゥ寮', 'ミュゥ寮', 'バゥ寮', 'ウィニー寮'];

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        // 縦画面時のゲームエリア下の余白を埋める
        // ゲームエリア: 幅 = 100vw, 高さ = 75vw
        // 余白: 100dvh - 75vw
        height: 'calc(100dvh - 75dvw)',
      }}
    >
      {/* 談話室背景 */}
      <img
        src={bgImage}
        alt="談話室"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* 寮生立ち絵（上半分を表示、下半分は画面外にはみ出す） */}
      <div
        className="absolute inset-0 overflow-hidden flex justify-center"
      >
        <img
          src={kvImage}
          alt={selectedTalent.name}
          style={{
            // コンテナの2倍の高さにすることで、下半分が画面外にはみ出す
            height: '200%',
            width: 'auto',
            maxWidth: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* タレント選択ボタン（タイトル画面のみ） */}
      {showSelector && (
        <div
          ref={dropdownRef}
          className="absolute"
          style={{
            top: '2cqmin',
            right: '2cqmin',
          }}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black/80 transition-colors flex items-center gap-1"
            style={{
              fontSize: '3.5cqmin',
              padding: '1cqmin 2cqmin',
            }}
          >
            <span>{selectedTalent.name}</span>
            <span className="text-xs">▼</span>
          </button>

          {/* ドロップダウンメニュー */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-1 bg-gray-900/95 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
              style={{
                maxHeight: 'calc(100dvh - 75dvw - 60px)',
                overflowY: 'auto',
                minWidth: '160px',
              }}
            >
              {dormitoryOrder.map(dormitory => (
                talentsByDormitory[dormitory] && (
                  <div key={dormitory}>
                    {/* 寮名ヘッダー */}
                    <div className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-bold sticky top-0"
                      style={{ fontSize: '4cqmin' }}
                    >
                      {dormitory}
                    </div>
                    {/* タレントリスト */}
                    {talentsByDormitory[dormitory].map(talent => (
                      <button
                        key={talent.student_id}
                        onClick={() => handleSelectTalent(talent)}
                        className={`w-full px-3 py-3 text-left text-sm hover:bg-gray-700 transition-colors ${
                          talent.student_id === selectedTalent.student_id
                            ? 'bg-gray-700 text-yellow-400'
                            : 'text-white'
                        }`}
                        style={{
                          fontSize: '4cqmin',
                          padding: '1.5cqmin 2cqmin',
                        }}
                      >
                        {talent.name}
                      </button>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
