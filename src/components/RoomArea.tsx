import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
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

// 談話室のみモードを表す特殊な識別子（寮名をそのまま使用）
const ROOM_ONLY_DORMITORIES = ['バゥ寮', 'ミュゥ寮', 'クゥ寮', 'ウィニー寮'] as const;
type RoomOnlyDormitory = typeof ROOM_ONLY_DORMITORIES[number];

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
  // 談話室のみモード（タレント画像なしで背景のみ表示）
  const [roomOnlyDormitory, setRoomOnlyDormitory] = useState<RoomOnlyDormitory | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const talentImageRef = useRef<HTMLImageElement>(null);

  // 初期化：LocalStorageから選択済みタレント or 談話室のみモードを取得、なければランダム選択
  useEffect(() => {
    if (talents.length === 0) return;

    const savedValue = localStorage.getItem(STORAGE_KEY);
    if (savedValue) {
      // 談話室のみモードかチェック（寮名で保存されている場合）
      if (ROOM_ONLY_DORMITORIES.includes(savedValue as RoomOnlyDormitory)) {
        setRoomOnlyDormitory(savedValue as RoomOnlyDormitory);
        setSelectedTalent(null);
        return;
      }
      // タレントIDで保存されている場合
      const talent = talents.find(t => t.student_id === savedValue);
      if (talent) {
        setSelectedTalent(talent);
        setRoomOnlyDormitory(null);
        return;
      }
    }

    // ランダム選択
    const randomIndex = Math.floor(Math.random() * talents.length);
    const randomTalent = talents[randomIndex];
    setSelectedTalent(randomTalent);
    setRoomOnlyDormitory(null);
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

  // 寮生画像のゆらゆらアニメーション
  useEffect(() => {
    const element = talentImageRef.current;
    if (!element) return;

    // 複数のアニメーションを異なるdurationで設定し、自然な動きを実現
    const animations: gsap.core.Tween[] = [];

    // 上下移動
    animations.push(
      gsap.to(element, {
        y: '1%',
        duration: 'random(3, 5)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    );

    // 左右移動
    animations.push(
      gsap.to(element, {
        x: '2%',
        duration: 'random(4, 6)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    );

    // 回転
    animations.push(
      gsap.to(element, {
        rotation: 'random(-5, 5)',
        duration: 'random(5, 7)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    );

    // 拡大・縮小
    animations.push(
      gsap.to(element, {
        scale: 'random(1, 1.07)',
        duration: 'random(4, 5)',
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    );

    return () => {
      animations.forEach(anim => anim.kill());
    };
  }, [selectedTalent]);

  // タレント選択時の処理
  const handleSelectTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setRoomOnlyDormitory(null);
    localStorage.setItem(STORAGE_KEY, talent.student_id);
    setIsDropdownOpen(false);
  };

  // 談話室のみモード選択時の処理
  const handleSelectRoomOnly = (dormitory: RoomOnlyDormitory) => {
    setRoomOnlyDormitory(dormitory);
    setSelectedTalent(null);
    localStorage.setItem(STORAGE_KEY, dormitory);
    setIsDropdownOpen(false);
  };

  // 談話室のみモードでもタレント選択でもない場合は何も表示しない
  if (!selectedTalent && !roomOnlyDormitory) return null;

  // 背景画像の決定：談話室のみモード or タレントの寮から
  const bgImage = roomOnlyDormitory
    ? DORMITORY_BG_MAP[roomOnlyDormitory]
    : DORMITORY_BG_MAP[selectedTalent!.dormitory] || DORMITORY_BG_MAP['クゥ寮'];
  const kvImage = selectedTalent ? `./data/images/kv/orig/${selectedTalent.student_id}.png` : null;

  // 寮ごとにタレントをグループ化
  const talentsByDormitory = talents.reduce((acc, talent) => {
    if (!acc[talent.dormitory]) {
      acc[talent.dormitory] = [];
    }
    acc[talent.dormitory].push(talent);
    return acc;
  }, {} as Record<string, Talent[]>);

  // 寮の表示順序
  const dormitoryOrder = ['バゥ寮', 'ミュゥ寮', 'クゥ寮', 'ウィニー寮'];

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

      {/* 寮生立ち絵（上半分を表示、下半分は画面外にはみ出す）- タレント選択時のみ表示 */}
      {selectedTalent && kvImage && (
        <div
          className="absolute inset-0 overflow-hidden flex justify-center"
        >
          <img
            ref={talentImageRef}
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
      )}

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
            <span>{roomOnlyDormitory ? `${roomOnlyDormitory}談話室` : selectedTalent?.name}</span>
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
                    {/* 談話室のみ選択肢 */}
                    <button
                      onClick={() => handleSelectRoomOnly(dormitory as RoomOnlyDormitory)}
                      className={`w-full px-3 py-3 text-left text-sm hover:bg-gray-700 transition-colors ${
                        roomOnlyDormitory === dormitory
                          ? 'bg-gray-700 text-yellow-400'
                          : 'text-white'
                      }`}
                      style={{
                        fontSize: '4cqmin',
                        padding: '1.5cqmin 2cqmin',
                      }}
                    >
                      {dormitory}談話室のみ
                    </button>
                    {/* タレントリスト */}
                    {talentsByDormitory[dormitory].map(talent => (
                      <button
                        key={talent.student_id}
                        onClick={() => handleSelectTalent(talent)}
                        className={`w-full px-3 py-3 text-left text-sm hover:bg-gray-700 transition-colors ${
                          selectedTalent?.student_id === talent.student_id
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
