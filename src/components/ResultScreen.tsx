import { useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Category } from '../types';

// 称賛メッセージのリスト
type MessageCategory = 'perfect' | 'excellent' | 'great' | 'good' | 'encourage';

const MESSAGES: Record<MessageCategory, string[]> = {
  perfect: [
    'すごい！パレデミア学園のことを完璧に理解している！',
    '満点達成！君こそ真のパレ学マスターだ！',
    '全問正解おめでとう！素晴らしい！',
    'パーフェクト！寮生たちも喜んでいるよ！',
    '完璧だ！パレデミア学園の誇りだね！',
    'すべて正解！この調子で次も頑張ろう！',
    '最高の結果だ！君の知識は本物だ！',
    '見事なパーフェクト！記念すべき瞬間だ！',
  ],
  excellent: [
    'すごい成績だ！あと少しでパーフェクト！',
    '素晴らしい！パレ学博士に近づいている！',
    '立派な成績！この調子で頑張ろう！',
    'いい調子！パレデミア学園のことをよく知っているね！',
    '優秀！次はパーフェクトを狙ってみよう！',
  ],
  great: [
    'いい成績だ！もっと上を目指せる！',
    'よくできました！知識が着実に増えているね！',
    'なかなかの成績！さらなる高みへ！',
    'グッジョブ！パレ学への理解が深まっている！',
    'いいね！この調子で寮生たちのことを覚えていこう！',
  ],
  good: [
    'まだまだこれから！もっと知識を深めよう！',
    'いいスタートだ！次はもっとできる！',
    '挑戦ありがとう！繰り返し挑戦しよう！',
    'パレデミア学園には魅力がたくさん！もっと知ってね！',
    '経験を積んでパレ学マスターを目指そう！',
  ],
  encourage: [
    '諦めずに挑戦してくれてありがとう！',
    '一歩ずつ進めば大丈夫！また挑戦してね！',
    'パレデミア学園のことをもっと知るチャンスだ！',
    '最初は誰でも初心者！続ければ必ず上達する！',
    '次こそはもっといい結果が出るはず！',
  ],
};

// レベル・問題数・正解率に応じたメッセージを取得
function getResultMessage(category: Category, questionCount: number, accuracy: number): string {
  let messageCategory: MessageCategory;

  if (accuracy === 100) {
    messageCategory = 'perfect';
  } else if (accuracy >= 80) {
    messageCategory = 'excellent';
  } else if (accuracy >= 60) {
    messageCategory = 'great';
  } else if (accuracy >= 40) {
    messageCategory = 'good';
  } else {
    messageCategory = 'encourage';
  }

  // レベルと問題数でメッセージを強化
  const messages = MESSAGES[messageCategory];

  // パーフェクト以外でも、上級+多問題+高正解率なら称賛を強める
  if (messageCategory !== 'perfect' && category === '顔名前当て上級' && questionCount >= 50 && accuracy >= 80) {
    // excellent メッセージに上級特別メッセージを追加
    const advancedMessages = [
      '上級で高得点！君は本物のパレ学マスターに近づいている！',
      '上級モードでこの成績は素晴らしい！',
      '難問をこなす実力がある！さらなる高みへ！',
    ];
    return advancedMessages[Math.floor(Math.random() * advancedMessages.length)];
  }

  // 問題数が多い場合の追加称賛
  if (messageCategory !== 'perfect' && questionCount >= 100 && accuracy >= 70) {
    const enduranceMessages = [
      '100問完走おつかれさま！集中力も素晴らしい！',
      '長丁場を乗り切った！その根気強さは立派だ！',
      'たくさんの問題に挑戦してくれてありがとう！',
    ];
    return enduranceMessages[Math.floor(Math.random() * enduranceMessages.length)];
  }

  return messages[Math.floor(Math.random() * messages.length)];
}

// キラキラの位置を生成
function generateSparkles(count: number): Array<{ x: number; y: number; delay: number; size: number }> {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    size: 4 + Math.random() * 8,
  }));
}

export function ResultScreen() {
  const { gameStage, category, questions, correctCount, newAchievements, returnToTitle } = useGameStore();

  const accuracy = Math.round((correctCount / questions.length) * 100);
  const isPerfect = accuracy === 100;

  // メッセージを生成（リレンダリングで変わらないようにメモ化）
  const resultMessage = useMemo(
    () => getResultMessage(category, questions.length, accuracy),
    [category, questions.length, accuracy]
  );

  // キラキラの位置をメモ化
  const sparkles = useMemo(() => generateSparkles(20), []);

  // Xシェア用のURL生成
  const shareOnX = () => {
    const gameUrl = 'https://parerdemia-fan.github.io/parermaster/';
    const text = `【パレ学マスター】\n${gameStage} ${category} / ${questions.length}問\n正解率: ${isPerfect ? 'PERFECT!' : `${accuracy}%`}\n\n${resultMessage}\n\n${gameUrl}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://x.com/intent/tweet?text=${encodedText}`, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-[2%] p-[5%] relative"
      style={{
        backgroundImage: 'url(./data/images/ui/panel_scroll.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 'min(20vw, 20vh)',
      }}
    >
      {/* パーフェクト時のエフェクト */}
      {isPerfect && (
        <>
          {/* 光のバースト */}
          <div className="burst-container">
            <div className="burst-ray" />
          </div>
          {/* キラキラ */}
          {sparkles.map((sparkle, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
                animationDelay: `${sparkle.delay}s`,
              }}
            />
          ))}
        </>
      )}

      {/* ゲームレベルと出題数 */}
      <p
        className="text-black-300 font-medium"
        style={{ fontSize: 'min(4vw, 4vh)' }}
      >
        カテゴリー: {category} ・ 出題数: {questions.length}
      </p>

      {/* 正解率 */}
      {isPerfect ? (
        <p
          className="font-bold perfect-glow"
          style={{ fontSize: 'min(12vw, 12vh)' }}
        >
          PERFECT!
        </p>
      ) : (
        <p
          className="font-bold text-black"
          style={{ fontSize: 'min(10vw, 10vh)' }}
        >
          正解率 {accuracy}%
        </p>
      )}

      {/* 称賛メッセージ または アチーブメント表示 */}
      {newAchievements.length > 0 ? (
        // アチーブメント獲得時はアチーブメント情報を表示
        <div className="flex flex-col items-center">
          <p
            className="font-bold"
            style={{
              fontSize: 'min(3.5vw, 3.5vh)',
              color: '#b8860b',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            🎉 新しい称号を獲得！
          </p>
          <div
            className="flex flex-wrap justify-center items-start"
            style={{ gap: 'min(4vw, 4vh)' }}
          >
            {newAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="flex flex-col items-center"
                style={{ maxWidth: 'min(35vw, 35vh)' }}
              >
                <img
                  src={achievement.imagePath}
                  alt={achievement.name}
                  className="drop-shadow-lg"
                  style={{
                    width: 'min(12vw, 12vh)',
                    height: 'min(12vw, 12vh)',
                    objectFit: 'contain',
                  }}
                />
                <p
                  className="font-bold text-center"
                  style={{
                    fontSize: 'min(2.8vw, 2.8vh)',
                    color: '#4a3728',
                    marginTop: 'min(0.5vw, 0.5vh)',
                  }}
                >
                  {achievement.name}
                </p>
                <p
                  className="text-center"
                  style={{
                    fontSize: 'min(2vw, 2vh)',
                    color: '#6b5344',
                    lineHeight: '1.3',
                  }}
                >
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // アチーブメント獲得がない場合は称賛メッセージを表示
        <p
          className="text-black-200 text-center"
          style={{
            fontSize: 'min(3.5vw, 3.5vh)',
            maxWidth: '90%',
          }}
        >
          {resultMessage}
        </p>
      )}

      {/* ボタンエリア - 横並びでスペース節約 */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 'min(3vw, 3vh)' }}
      >
        {/* タイトルに戻るボタン */}
        <button
          onClick={returnToTitle}
          className="flex items-center transition brightness-125 hover:brightness-150"
        >
          {/* 左端 */}
          <img
            src="./data/images/ui/btn_normal_off_left.png"
            alt=""
            style={{
              height: 'min(5vw, 5vh)',
              width: 'auto',
              display: 'block',
            }}
          />
          {/* 中央（文字列長に合わせて伸縮） */}
          <div
            style={{
              backgroundImage: 'url(./data/images/ui/btn_normal_off_middle.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
              height: 'min(5vw, 5vh)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 min(2vw, 2vh)',
              fontSize: 'min(2.5vw, 2.5vh)',
              color: '#999',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            タイトルに戻る
          </div>
          {/* 右端 */}
          <img
            src="./data/images/ui/btn_normal_off_right.png"
            alt=""
            style={{
              height: 'min(5vw, 5vh)',
              width: 'auto',
              display: 'block',
            }}
          />
        </button>

        {/* Xでシェアボタン */}
        <button
          onClick={shareOnX}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors flex items-center"
          style={{
            fontSize: 'min(2.5vw, 2.5vh)',
            padding: 'min(1.2vw, 1.2vh) min(3vw, 3vh)',
            gap: 'min(1vw, 1vh)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: 'min(3vw, 3vh)', height: 'min(3vw, 3vh)' }}
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          結果をシェア
        </button>
      </div>
    </div>
  );
}
