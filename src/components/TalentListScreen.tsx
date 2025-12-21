import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Talent } from '../types';
import { ThreePatchButton } from './ThreePatchButton';
import { ThreePatchImage } from './ThreePatchImage';

// 寮の表示順序と表示名
const DORMITORIES = [
  { name: 'バゥ寮', color: 'bg-red-700' },
  { name: 'ミュゥ寮', color: 'bg-pink-400' },
  { name: 'クゥ寮', color: 'bg-cyan-400' },
  { name: 'ウィニー寮', color: 'bg-green-600' }
] as const;

// SNSリンクのアイコンと表示名
const SNS_LINKS = [
  { key: 'url', icon: './data/images/ui/parerdemia-logo.png', name: '公式ページ' },
  { key: 'x_url', icon: '𝕏', name: 'X' },
  { key: 'youtube_url', icon: './data/images/ui/youtube.png', name: 'YouTube' },
  { key: 'tiktok_url', icon: './data/images/ui/tiktok.png', name: 'TikTok' },
  { key: 'marshmallow_url', icon: './data/images/ui/marshmallow.jpg', name: 'マシュマロ' },
] as const;

export function TalentListScreen() {
  const { talents, returnToTitle } = useGameStore();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  // 初期選択: 選択なし (選択はユーザーのクリックで行う)

  // 寮ごとにタレントをグループ化
  const talentsByDormitory = DORMITORIES.map(dorm => ({
    ...dorm,
    talents: talents.filter(t => t.dormitory === dorm.name),
  }));

  const handleTalentClick = (talent: Talent) => {
    // 右側プロフィールエリアのスクロール位置をリセット
    const profileArea = document.querySelector('.overflow-y-auto.overflow-x-hidden.relative');
    if (profileArea) {
      profileArea.scrollTop = 0;
    }
    setSelectedTalent(talent);
  };

  // プロフィール項目を配列化（空でないものだけ表示）
  const profileItems = selectedTalent ? [
    { label: '誕生日', value: selectedTalent.birthday },
    { label: '身長', value: selectedTalent.height ? `${selectedTalent.height}cm` : '' },
    { label: '学籍番号', value: selectedTalent.student_id },
    { label: 'ファンネーム', value: selectedTalent.fan_name },
    { label: 'ファンマーク', value: selectedTalent.fan_mark },
  ].filter(item => item.value) : [];

  // リスト項目（配列系）
  const listItems = selectedTalent ? [
    { label: '趣味', items: selectedTalent.hobbies },
    { label: '特技', items: selectedTalent.skills },
    { label: '好きなもの', items: selectedTalent.favorites },
    { label: 'ハッシュタグ', items: selectedTalent.hashtags },
    { label: '受賞歴', items: selectedTalent.awards },
  ].filter(item => item.items && item.items.length > 0) : [];

  return (
    <div className="w-full h-full flex flex-col"
    style={{
      backgroundImage: 'url(./data/images/ui/achievement_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-[3%] shrink-0"
        style={{ height: '10%' }}
      >
        <ThreePatchButton
          leftImage="./data/images/ui/btn_normal_off_left.png"
          middleImage="./data/images/ui/btn_normal_off_middle.png"
          rightImage="./data/images/ui/btn_normal_off_right.png"
          onClick={returnToTitle}
          height="7cqmin"
          fontSize="5cqmin"
          textColor="#CCC"
          className="selection-card"
          style={{marginLeft: '2cqmin'}}
        >
          戻る
        </ThreePatchButton>

        <ThreePatchImage
          leftImage="./data/images/ui/plate_left.png"
          middleImage="./data/images/ui/plate_middle.png"
          rightImage="./data/images/ui/plate_right.png"
          height="7cqmin"
        >
          <span
            className="text-white font-bold"
            style={{
              fontSize: '5cqmin',
              textShadow: '2px 2px 4px rgba(0,0,0,1)',
             }}
          >
            寮生一覧
          </span>
        </ThreePatchImage>
        <div style={{ width: '20cqmin' }} /> {/* スペーサー */}
      </div>

      {/* メインコンテンツ: 左右2分割 */}
      <div className="flex-1 flex overflow-hidden" style={{ gap: '2cqmin', padding: '2cqmin' }}>
        {/* 左側: 寮生一覧 (50%) */}
        <div
          className="overflow-y-auto"
          style={{
            width: '50%',
            scrollbarWidth: 'thin',
            minHeight: '0',
          }}
        >
          {talentsByDormitory.map((dorm, idx) => (
            <div key={dorm.name}>
              {/* 寮名ヘッダー */}
              <ThreePatchImage
                leftImage="./data/images/ui/plate_left.png"
                middleImage="./data/images/ui/plate_middle.png"
                rightImage="./data/images/ui/plate_right.png"
                width="62cqmin"
                height="4cqmin"
                filter={
                  idx === 0 ? "sepia(1) hue-rotate(-50deg) saturate(8) brightness(1)" :
                  idx === 1 ? "sepia(1) hue-rotate(-60deg) saturate(3) brightness(1)" :
                  idx === 2 ? "sepia(1) hue-rotate(150deg) saturate(2) brightness(1)" :
                  "sepia(1) hue-rotate(60deg) saturate(2) brightness(1)"
                }
                >
                <span
                  className="text-white font-bold"
                  style={{
                  fontSize: '2.5cqmin',
                  textShadow: '2px 2px 4px rgba(0,0,0,1)',
                   }}
                >
                  {dorm.name}
                </span>
              </ThreePatchImage>

              {/* 寮生グリッド: 3列 */}
              <div
                className="bg-gray-800/50 rounded-b-lg grid"
                style={{
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1cqmin',
                  padding: '1cqmin',
                }}
              >
                {dorm.talents.map(talent => {
                  const isSelected = selectedTalent?.student_id === talent.student_id;
                  return (
                    <button
                      key={talent.student_id}
                      onClick={() => handleTalentClick(talent)}
                      className="relative w-full cursor-pointer transition-transform hover:scale-[1.02]"
                      style={{
                        aspectRatio: '1 / 1',
                        padding: 0,
                        border: 'none',
                        background: 'none',
                      }}
                    >
                      {/* 背景画像 */}
                      <img
                        src="./data/images/ui/panel_choice_face_bg.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ borderRadius: '0.8cqmin' }}
                      />

                      {/* タレント画像 */}
                      <img
                        src={`./data/images/kv/sq/${talent.student_id}.png`}
                        draggable={false}
                        alt={talent.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ borderRadius: '0.8cqmin' }}
                      />

                      {/* 前面フレーム画像 */}
                      <img
                        src="./data/images/ui/panel_choice_face.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{
                          borderRadius: '0.8cqmin',
                          boxShadow: isSelected ? '0 0 0 0.5cqmin #facc15' : 'none',
                        }}
                      />

                      {/* タレント名 */}
                      <div
                        className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderBottomLeftRadius: '0.8cqmin',
                          borderBottomRightRadius: '0.8cqmin',
                          padding: '0.3cqmin 0.5cqmin',
                        }}
                      >
                        <p
                          className="font-bold truncate w-full text-center"
                          style={{
                            fontSize: '2cqmin',
                            color: '#374151',
                          }}
                        >
                          {talent.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 右側: 寮生詳細 (50%) */}
        <div
          className="relative"
          style={{
            width: '50%',
            minHeight: '0',
            paddingTop: '8cqmin',
            paddingBottom: '8cqmin',
          }}
        >
          {/* 背景画像レイヤー（固定） */}
          <div
            className="absolute left-0 top-0 pointer-events-none"
            style={{
              width: '55cqmin',
              height: '100%',
              backgroundImage: 'url(./data/images/ui/panel_paper.png)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left',
              zIndex: 0,
            }}
          />
          {/* 寮バッジ */}
          {selectedTalent && (
            <img src={`./data/images/emblem/${
              selectedTalent?.dormitory === 'バゥ寮' ? 'wa' :
              selectedTalent?.dormitory === 'ミュゥ寮' ? 'me' :
              selectedTalent?.dormitory === 'クゥ寮' ? 'co' :
              'wh'
            }.webp`}
              className="absolute top-30 left-0"
              style={{
                width: '57cqmin',
                opacity: 0.15,
                zIndex: 1,
              }}
             />
          )}
          {/* 立ち絵画像レイヤー（固定） */}
          {selectedTalent && (
            <div
              className="absolute right-0 top-0 bottom-0 flex items-end justify-end pointer-events-none"
              style={{
                width: '50cqmin',
                zIndex: 2,
              }}
            >
              <img
                src={`./data/images/kv/orig/${selectedTalent.student_id}.png`}
                alt={selectedTalent.name}
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                  marginRight: 'max(-7.5vw, -7.5vh)',
                }}
              />
            </div>
          )}
          {/* スクロール可能なコンテンツエリア */}
          <div
            className="overflow-y-auto overflow-x-hidden relative"
            style={{
              width: '100%',
              height: '100%',
              scrollbarWidth: 'thin',
              zIndex: 3,
            }}
          >
            {selectedTalent && (
              <div className="relative w-full">
                {/* プロフィール情報エリア (左側3/4) */}
                <div
                  className="relative left-0 top-0"
                  style={{
                    width: '45cqmin',
                    paddingLeft: '4cqmin',
                    paddingRight: '4cqmin',
                  }}
                >
                  {/* 読み仮名 */}
                  <p
                    className="mb-[1.5cqmin]"
                    style={{
                      fontSize: '2cqmin',
                      color: '#304056ff',
                      textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                      marginBottom: 'max(-1vw, -1vh)',
                    }}
                  >
                    {selectedTalent.kana}
                  </p>

                  {/* 名前 */}
                  <h2
                    className="font-bold mb-[1cqmin]"
                    style={{
                      fontSize: '4cqmin',
                      color: '#1f2937',
                      textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                    }}
                  >
                    {selectedTalent.name}
                  </h2>

                  {/* SNSリンク */}
                  <div
                    className="flex flex-wrap mb-[3cqmin]"
                    style={{ gap: '1.5cqmin' }}
                  >
                    {SNS_LINKS.map(sns => {
                      const url = selectedTalent[sns.key as keyof typeof selectedTalent] as string;
                      if (!url) return null;

                      if (sns.key === 'x_url') {
                        return (
                          <a
                            key={sns.key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                            style={{ width: '5cqmin', height: '5cqmin' }}
                          >
                            <span
                              className="flex items-center justify-center rounded-full bg-black text-white"
                              style={{ width: '100%', height: '100%', fontSize: '3cqmin' }}
                            >
                              {sns.icon}
                            </span>
                          </a>
                        );
                      }

                      if (sns.key === 'marshmallow_url') {
                        return (
                          <a
                            key={sns.key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                            style={{ width: '5cqmin', height: '5cqmin' }}
                          >
                            <img
                              src={sns.icon}
                              alt={sns.name + 'アイコン'}
                              className="rounded-full"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </a>
                        );
                      }

                      return (
                        <a
                          key={sns.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                          style={{ width: '5cqmin', height: '5cqmin' }}
                        >
                          <img
                            src={sns.icon}
                            alt={sns.name + 'アイコン'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              backgroundColor: sns.key === 'url' ? 'rgba(255, 255, 255, 1)' : 'transparent',
                              borderRadius: sns.key === 'url' ? '50%' : '0',
                            }}
                          />
                        </a>
                      );
                    })}
                  </div>

                  {/* 夢 */}
                  {selectedTalent.dream && (
                    <div className="mb-[2.5cqmin]">
                      <h3
                        className="font-bold mb-[1%]"
                        style={{
                          fontSize: '2.5cqmin',
                          color: '#b45309',
                          textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                        }}
                      >
                        💫 夢
                      </h3>
                      <p
                        style={{
                          fontSize: '2.2cqmin',
                          color: '#29303cff',
                          paddingLeft: '3%',
                          textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                        }}
                      >
                        {selectedTalent.dream}
                      </p>
                    </div>
                  )}

                  {/* 自己紹介 */}
                  {selectedTalent.intro && (
                    <div className="mb-[2.5cqmin]">
                      <h3
                        className="font-bold mb-[1%]"
                        style={{
                          fontSize: '2.5cqmin',
                          color: '#b45309',
                          textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                        }}
                      >
                        📝 自己紹介
                      </h3>
                      <p
                        className="whitespace-pre-wrap"
                        style={{
                          fontSize: '2.2cqmin',
                          color: '#29303cff',
                          paddingLeft: '3%',
                          textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                        }}
                      >
                        {selectedTalent.intro}
                      </p>
                    </div>
                  )}

                  {/* 基本プロフィール */}
                  {profileItems.length > 0 && (
                    <div className="mb-[2.5cqmin]">
                      <h3
                        className="font-bold mb-[1cqmin]"
                        style={{
                          fontSize: '2.5cqmin',
                          color: '#b45309',
                          paddingLeft: '1%',
                          textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                        }}
                      >
                        📋 基本情報
                      </h3>
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: 'auto 1fr',
                          gap: '1cqmin',
                          fontSize: '2cqmin',
                          paddingLeft: '3%',
                        }}
                      >
                        {profileItems.map(item => (
                          <div key={item.label} className="contents">
                            <span style={{ color: '#29303cff', textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)' }}>{item.label}</span>
                            <span style={{ color: '#29303cff', textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)' }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* リスト系プロフィール */}
                  {listItems.map(section => (
                    <div key={section.label} className="mb-[2.5cqmin]">
                      <h3
                        className="font-bold mb-[1cqmin]"
                        style={{
                          fontSize: '2.5cqmin',
                          color: '#b45309',
                          paddingLeft: '1%',
                          textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)',
                        }}
                      >
                        {section.label === '趣味' && '🎮 '}
                        {section.label === '特技' && '✨ '}
                        {section.label === '好きなもの' && '❤️ '}
                        {section.label === 'ハッシュタグ' && '# '}
                        {section.label === '受賞歴' && '🏆 '}
                        {section.label}
                      </h3>
                      <div
                        className="flex flex-wrap"
                        style={{
                          gap: '1cqmin',
                          fontSize: '2cqmin',
                          paddingLeft: '3%',
                        }}
                      >
                        {section.items.map((item, idx) => (
                          section.label === 'ハッシュタグ' ? (
                            <a
                              key={idx}
                              href={`https://x.com/hashtag/${encodeURIComponent(item.replace(/^#/, ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              style={{ color: '#3b82f6', textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)' }}
                            >
                              {item}
                            </a>
                          ) : (
                            <span
                              key={idx}
                              style={{
                                color: '#29303cff',
                                textShadow: '1px 1px 10px rgba(217, 214, 198, 1), 1px -1px 10px rgba(217, 214, 198, 1), -1px 1px 10px rgba(217, 214, 198, 1), -1px -1px 10px rgba(217, 214, 198, 1)'
                              }}
                            >
                              {item}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ))}                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
