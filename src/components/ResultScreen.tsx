import { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Category, ResultMessage, ExamScope, Accuracy, QuestionCount } from '../types';
import { ThreePatchButton } from './ThreePatchButton';
import { QUESTION_EXAM_SCOPE_OPTIONS } from '../types';

// ResultMessage配列をロードする
async function loadResultMessages(): Promise<ResultMessage[]> {
  const response = await fetch('./data/result_messages.json');
  const data = await response.json();
  return data as ResultMessage[];
}

// 正解率（パーセント）をAccuracy型に変換
function convertAccuracyToType(accuracyPercent: number): Accuracy {
  if (accuracyPercent === 100) return 'high';
  if (accuracyPercent >= 75) return 'medium';
  return 'low';
}

// questionRangeからExamScopeに変換
function convertQuestionRangeToExamScope(questionRange: string): ExamScope {
  const option = QUESTION_EXAM_SCOPE_OPTIONS.find(opt => opt.value === questionRange);
  return option?.examScope ?? 'すべて';
}

// questionCountをQuestionCount型に変換（最も近い値にマッチング）
function normalizeQuestionCount(count: number): QuestionCount {
  const validCounts: QuestionCount[] = [10, 15, 30, 50, 100];
  // 完全一致を優先
  if (validCounts.includes(count as QuestionCount)) {
    return count as QuestionCount;
  }
  // 最も近い値を返す
  return validCounts.reduce((prev, curr) => 
    Math.abs(curr - count) < Math.abs(prev - count) ? curr : prev
  );
}

// ResultMessage配列から条件に合うメッセージを取得
function getResultMessage(
  resultMessages: ResultMessage[],
  category: Category,
  questionRange: string,
  questionCount: number,
  accuracyPercent: number
): string {
  const accuracy = convertAccuracyToType(accuracyPercent);
  
  // 顔名前当て系はexamScopeで、それ以外はquestionCountで絞り込む
  const isFaceNameCategory = category.includes('顔名前当て');
  
  let matchedMessages: ResultMessage[];
  
  if (isFaceNameCategory) {
    const examScope = convertQuestionRangeToExamScope(questionRange);
    matchedMessages = resultMessages.filter(msg =>
      msg.category === category &&
      msg.examScope === examScope &&
      msg.accuracy === accuracy
    );
  } else {
    const normalizedCount = normalizeQuestionCount(questionCount);
    matchedMessages = resultMessages.filter(msg =>
      msg.category === category &&
      msg.questionCount === normalizedCount &&
      msg.accuracy === accuracy
    );
  }
  
  // マッチするメッセージがあればランダムで返す（現状は1件のみだが、拡張性のため）
  if (matchedMessages.length > 0) {
    return matchedMessages[Math.floor(Math.random() * matchedMessages.length)].message;
  }
  
  // フォールバック：マッチしない場合は汎用メッセージ
  if (accuracyPercent === 100) {
    return 'パーフェクト！素晴らしい成績です！';
  } else if (accuracyPercent >= 75) {
    return 'よくできました！あと少しでパーフェクトです！';
  } else {
    return '挑戦ありがとう！次はもっと良い結果を目指そう！';
  }
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
  const { gameStage, category, questions, correctCount, newAchievements, returnToTitle, questionRange } = useGameStore();
  const [resultMessages, setResultMessages] = useState<ResultMessage[]>([]);

  const accuracy = Math.round((correctCount / questions.length) * 100);
  const isPerfect = accuracy === 100;

  // ResultMessages を初回ロード
  useEffect(() => {
    loadResultMessages().then(setResultMessages);
  }, []);

  // メッセージを生成（リレンダリングで変わらないようにメモ化）
  const resultMessage = useMemo(() => {
    if (resultMessages.length === 0) return '';
    return getResultMessage(resultMessages, category, questionRange, questions.length, accuracy);
  }, [resultMessages, category, questionRange, questions.length, accuracy]);

  // キラキラの位置をメモ化
  const sparkles = useMemo(() => generateSparkles(20), []);

  // Xシェア用のURL生成
  const shareOnX = () => {
    const gameUrl = 'https://parerdemia-fan.github.io/parermaster/';
    const text = `【パレ学マスター 結果発表】
${gameStage} ${category} / ${questions.length}問
${isPerfect ? '🎉🎉🎉パーフェクト達成!🎉🎉🎉' : `正解率: ${accuracy}%`}

${resultMessage}

👇挑戦はこちら
${gameUrl}
#パレ学マスター #パレデミア学園`;
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
        padding: '20cqmin',
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
        style={{ fontSize: '4cqmin' }}
      >
        カテゴリー: {category} ・ 出題数: {questions.length}
      </p>

      {/* 正解率 */}
      {isPerfect ? (
        <p
          className="font-bold perfect-glow"
          style={{ fontSize: '12cqmin' }}
        >
          PERFECT!
        </p>
      ) : (
        <p
          className="font-bold text-black"
          style={{ fontSize: '10cqmin' }}
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
              fontSize: '3.5cqmin',
              color: '#b8860b',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            🎉 新しい称号を獲得！
          </p>
          <div
            className="flex flex-wrap justify-center items-start"
            style={{ gap: '4cqmin' }}
          >
            {newAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="flex flex-col items-center"
                style={{ maxWidth: '35cqmin' }}
              >
                <img
                  src={achievement.imagePath}
                  alt={achievement.name}
                  className="drop-shadow-lg"
                  style={{
                    width: '12cqmin',
                    height: '12cqmin',
                    objectFit: 'contain',
                  }}
                />
                <p
                  className="font-bold text-center"
                  style={{
                    fontSize: '2.8cqmin',
                    color: '#4a3728',
                    marginTop: '0.5cqmin',
                  }}
                >
                  {achievement.name}
                </p>
                <p
                  className="text-center"
                  style={{
                    fontSize: '2cqmin',
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
            fontSize: '3.5cqmin',
            maxWidth: '90%',
          }}
        >
          {resultMessage}
        </p>
      )}

      {/* ボタンエリア - 横並びでスペース節約 */}
      <div
        className="flex items-center justify-center"
        style={{
          gap: '3cqmin',
          marginTop: newAchievements.length > 0 ? '0' : '5cqmin',
       }}
      >
        {/* タイトルに戻るボタン */}
        <ThreePatchButton
          leftImage="./data/images/ui/btn_normal_off_left.png"
          middleImage="./data/images/ui/btn_normal_off_middle.png"
          rightImage="./data/images/ui/btn_normal_off_right.png"
          onClick={returnToTitle}
          height="8cqmin"
          fontSize="4cqmin"
          textColor="#CCC"
          className="selection-card"
        >
          タイトルに戻る
        </ThreePatchButton>

        {/* Xでシェアボタン */}
        <button
          onClick={shareOnX}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors flex items-center"
          style={{
            fontSize: '4cqmin',
            padding: '1.2cqmin 3cqmin',
            gap: '1cqmin',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: '4cqmin', height: '4cqmin' }}
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
