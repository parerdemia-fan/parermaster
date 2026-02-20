import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { extractFirstImage, removeImageTags } from '../utils/imageTagParser';
import { parseTextWithTalentIcons, getTalentNameMap } from '../utils/talentIconParser';
import { ThreePatchImage } from './ThreePatchImage';
import { ThreePatchButton } from './ThreePatchButton';
import type { ProcessedQuestion } from '../types';

/**
 * 問題文の文字数に応じた文字サイズを取得する
 * @param text 問題文（画像タグ除去済み）
 * @returns CSS font-size値
 */
function getQuestionFontSize(text: string): string {
  const length = text.length;
if (length <= 20) {
    return '7cqmin';
  } else if (length <= 40) {
    return '6cqmin';
  } else if (length <= 60) {
    return '5cqmin';
  } else {
    return '4cqmin';
  }
}

/**
 * 画像付き問題文の文字数に応じた文字サイズを取得する
 * @param text 問題文（画像タグ除去済み）
 * @returns CSS font-size値
 */
function getQuestionWithImageFontSize(text: string): string {
  const length = text.length;
  if (length <= 15) {
    return '7cqmin';
  } else if (length <= 20) {
    return '6cqmin';
  } else if (length <= 40) {
    return '5.3cqmin';
  } else {
    return '4cqmin';
  }
}

/**
 * テキストの視覚的な文字幅を計算する
 * 全角文字は1.0、半角英数字・記号は0.65として計算
 * @param text 対象テキスト
 * @returns 視覚的な文字幅
 */
function getVisualLength(text: string): number {
  let length = 0;
  for (const char of text) {
    // 半角英数字・半角記号（U+0020〜U+007E）は0.65、それ以外は1.0
    if (char.charCodeAt(0) >= 0x20 && char.charCodeAt(0) <= 0x7E) {
      length += 0.65;
    } else {
      length += 1;
    }
  }
  return length;
}

/**
 * 回答選択肢の文字数に応じた文字サイズを取得する
 * 半角文字は0.65文字分として計算
 * @param text 選択肢のテキスト
 * @returns CSS font-size値
 */
function getAnswerFontSize(text: string): string {
  const length = getVisualLength(text);
  const size = 50 / length;
  // 最大・最小値で制限
  return `${Math.min(Math.max(size, 4), 8)}cqmin`;
}

function getFaceQuizFontSize(text: string): string {
  const length = text.length;
  if (length <= 6) {
    return '10cqmin';
  } else if (length <= 10) {
    return '6.8cqmin';
  } else {
    return '5.5cqmin';
  }
}

function getFaceQuizAnswerFontSize(text: string): string {
  const length = getVisualLength(text);
  if (length <= 5) {
    return '5.5cqmin';
  } else if (length <= 6) {
    return '5.3cqmin';
  } else if (length <= 10) {
    return '3.5cqmin';
  } else {
    return '2.8cqmin';
  }
}

/**
 * URLからサイト名を取得する
 * @param url 情報源のURL
 * @returns サイト名
 */
function getSourceSiteName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YouTube';
    }
    if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
      return 'X';
    }
    if (hostname.includes('tiktok.com')) {
      return 'TikTok';
    }
    if (hostname.includes('parerdemia.jp')) {
      return 'パレデミア学園公式サイト';
    }

    // その他はドメイン名をそのまま返す
    return hostname;
  } catch {
    return url;
  }
}

/**
 * コメント文中の最初の[image:ファイル名]を解析し、テキストと画像に分割して表示用の要素を生成する
 * 最初の1つのみ画像として表示し、2つ目以降は無視される
 * タレント名にはアイコンを表示する
 * @param comment コメント文字列
 * @returns JSX要素の配列
 */
function parseCommentWithImages(comment: string): React.ReactNode[] {
  const imagePattern = /\[image:([^\]]+)\]/;
  const match = comment.match(imagePattern);
  const parts: React.ReactNode[] = [];

  if (match && match.index !== undefined) {
    // 最初の画像タグの前のテキスト部分を追加（アイコン付き）
    if (match.index > 0) {
      const beforeText = comment.slice(0, match.index);
      parts.push(
        <span key="text-before">
          {parseTextWithTalentIcons(beforeText, true, true)}
        </span>
      );
    }

    // 最初の画像を追加
    const fileName = match[1];
    parts.push(
      <img
        key="image"
        src={`./data/images/questions/${fileName}`}
        alt={fileName}
        className="max-w-full h-auto my-2 mx-auto block"
      />
    );

    // 残りのテキスト部分を追加（2つ目以降の画像タグは除去、アイコン付き）
    const afterImageText = comment.slice(match.index + match[0].length);
    const cleanedAfterText = removeImageTags(afterImageText);
    if (cleanedAfterText) {
      parts.push(
        <span key="text-after">
          {parseTextWithTalentIcons(cleanedAfterText, true, true)}
        </span>
      );
    }
  } else {
    // 画像タグがない場合はアイコン付きで表示
    parts.push(<span key="text">{parseTextWithTalentIcons(comment, true, true)}</span>);
  }

  return parts;
}

/**
 * 選択肢がすべてタレント名かどうかを判定する
 * @param answers 選択肢配列
 * @returns すべてタレント名ならtrue
 */
function areAllAnswersTalentNames(answers: string[]): boolean {
  const talentMap = getTalentNameMap();
  if (!talentMap) return false;

  return answers.every(answer => {
    const keyNoSpace = answer.replace(/\s/g, '');
    return talentMap.has(answer) || talentMap.has(keyNoSpace);
  });
}

/**
 * 選択肢のタレント学籍番号配列を取得する
 * @param answers 選択肢配列
 * @returns 学籍番号配列（タレント名でない場合はnull）
 */
function getAnswerStudentIds(answers: string[]): string[] | null {
  const talentMap = getTalentNameMap();
  if (!talentMap) return null;

  const studentIds: string[] = [];
  for (const answer of answers) {
    const keyNoSpace = answer.replace(/\s/g, '');
    const studentId = talentMap.get(answer) ?? talentMap.get(keyNoSpace);
    if (!studentId) return null; // 1つでもタレント名でなければnull
    studentIds.push(studentId);
  }
  return studentIds;
}

/**
 * ヘッダーエリアコンポーネント
 * @param gameStage ゲームステージ名（例: "入門試験"）
 * @param category カテゴリー名（例: "顔名前当て"）
 * @param genre 問題ジャンル（例: "コラボ", "パレ学"）- 深堀り/超深堀り問題でのみ表示
 * @param difficulty 問題難易度
 * @param currentIndex 現在の問題番号（0始まり）
 * @param totalQuestions 問題総数
 * @param returnToTitle タイトルに戻る処理
 */
function QuizHeader({
  gameStage,
  category,
  genre,
  difficulty,
  currentIndex,
  totalQuestions,
}: {
  gameStage: string;
  category: string;
  genre?: string;
  difficulty: number;
  currentIndex: number;
  totalQuestions: number;
}): React.ReactNode {

  return (
    <>
      <div
        className="flex items-center justify-between"
        style={{ padding: '0 1cqmin' }}
      >
        {/* 左側: ステージ / カテゴリ */}
        <div className="flex items-center gap-[1.5cqmin]">
          <div className="flex items-center">
            <ThreePatchImage
              leftImage="./data/images/ui/plate_left.png"
              middleImage="./data/images/ui/plate_middle.png"
              rightImage="./data/images/ui/plate_right.png"
              height="11cqmin"
            >
              <span
                className="text-white font-bold"
                style={{
                  fontSize: '5.8cqmin',
                  textShadow: '2px 2px 4px rgba(0,0,0,1)',
                 }}
              >
                {gameStage} / {category}
              </span>
            </ThreePatchImage>
          </div>
        </div>
        {/* 右側: 進捗 */}
        <div className="flex items-center gap-[1.5cqmin]">
          <div className="flex items-center">
            <ThreePatchImage
              leftImage="./data/images/ui/plate_left.png"
              middleImage="./data/images/ui/plate_middle.png"
              rightImage="./data/images/ui/plate_right.png"
              height="11cqmin"
            >
              <span
                className="text-white font-bold"
                style={{ fontSize: '5.8cqmin', textShadow: '2px 2px 4px rgba(0,0,0,1)' }}
              >
                {currentIndex + 1} / {totalQuestions}
              </span>
            </ThreePatchImage>
          </div>
        </div>
      </div>
      <div
        className="flex items-center justify-center w-full"
        style={{ paddingTop: '0.8cqmin' }}
      >
        <DifficultyStars difficulty={difficulty} genre={genre} />
      </div>
    </>
  );
}

/**
 * 解説ダイアログコンポーネント
 * @param isOpen ダイアログを表示するか
 * @param onClose ダイアログを閉じるときの処理
 * @param currentQuestion 現在の問題
 */
function CommentDialog({
  isOpen,
  onClose,
  currentQuestion,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: ProcessedQuestion;
}): React.ReactNode {
  if (!isOpen) return null;

  const hasComment = !!currentQuestion.comment;
  const hasSourceUrl = !!currentQuestion.sourceUrl;
  const hasQuestioner = !!currentQuestion.questioner;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-h-[80%] overflow-auto shadow-lg"
        style={{
          maxWidth: '80cqmin',
          padding: '5.5cqmin',
          backgroundImage: 'url(./data/images/ui/panel_paper.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {hasComment && (
          <div
            className="mb-4"
            style={{ fontSize: '4cqmin', lineHeight: '1.6', color: '#493e33ff', textShadow: '0 0 1cqmin rgba(74, 59, 42, 0.5)' }}
          >
            {parseCommentWithImages(currentQuestion.comment ?? '')}
          </div>
        )}
        {hasSourceUrl && (
          <div
            className="mb-4"
            style={{ fontSize: '3.5cqmin' }}
          >
            <a
              href={currentQuestion.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 underline inline-flex items-center gap-1"
              style={{ color: '#500' }}
            >
              📎 情報源: {getSourceSiteName(currentQuestion.sourceUrl ?? '')}
            </a>
          </div>
        )}
        {hasQuestioner && (
          <div
            className="mb-4"
            style={{ fontSize: '3.5cqmin' }}
          >
            🎓️出題者: {currentQuestion.questioner}
          </div>
        )}
        <div className="flex justify-center" style={{ marginTop: '2cqmin' }}>
          <ThreePatchButton
            leftImage="./data/images/ui/btn_normal_off_left.png"
            middleImage="./data/images/ui/btn_normal_off_middle.png"
            rightImage="./data/images/ui/btn_normal_off_right.png"
            onClick={onClose}
            height="7cqmin"
            fontSize="3.5cqmin"
            textColor="#CCC"
            className="selection-card"
          >
            閉じる
          </ThreePatchButton>
        </div>
      </div>
    </div>
  );
}

/**
 * 通常問題のレイアウト（顔当てと同様の左右2パネル構成）
 * 左パネル: 出題エリア（問題文・問題画像）
 * 右パネル: 選択肢エリア（タレント名なら2x2、それ以外なら4行）
 */
function NormalQuizLayout({
  currentQuestion,
  isAnswered,
  isCorrect,
  selectedAnswer,
  selectAnswer,
  showIconInQuestion,
}: {
  currentQuestion: ProcessedQuestion;
  isAnswered: boolean;
  isCorrect: boolean;
  selectedAnswer: number | null;
  selectAnswer: (index: number) => void;
  showIconInQuestion: boolean;
}) {
  // 問題文から画像を抽出
  const questionImage = extractFirstImage(currentQuestion.question);
  const questionText = removeImageTags(currentQuestion.question);

  // 選択肢がタレント名かどうかを判定
  const isTalentNameAnswers = areAllAnswersTalentNames(currentQuestion.answers);
  const answerStudentIds = isTalentNameAnswers ? getAnswerStudentIds(currentQuestion.answers) : null;

  return (
    <div
      className="flex flex-row"
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 左パネル: 出題エリア（正方形） */}
      <div
        className="flex flex-col relative"
        style={{
          flex: '0 0 calc(50% - 1cqmin)',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
          borderRadius: '0.8cqmin',
          overflow: 'hidden',
          // 縦に上から順に配置するための設定
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',          
        }}
      >
        {/* 問題画像がある場合 */}
        {questionImage ? (
          <>
            {/* 問題画像 */}
            <div
              className="flex items-center justify-center"
              style={{
                width: '100%',
                height: '50%',
                marginTop: '3cqmin',
                marginBottom: '1cqmin',
              }}
            >
              <img
                src={`./data/images/questions/${questionImage}`}
                alt="問題画像"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            {/* 問題文 */}
            <div
              className="text-white font-bold"
              style={{
                flex: '0 0 26cqmin',
                fontSize: getQuestionWithImageFontSize(questionText),
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                padding: '0 2cqmin',
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {parseTextWithTalentIcons(questionText, showIconInQuestion, isAnswered)}
            </div>
          </>
        ) : (
          /* 問題画像がない場合は問題文のみ */
          <div
            className="flex items-center justify-center text-white font-bold"
            style={{
              flex: '0 0 65cqmin',
            }}
          >
            <div
              className="text-white font-bold leading-relaxed"
              style={{
                flex: '0 0 65cqmin',
                fontSize: getQuestionFontSize(questionText),
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                padding: '0 2cqmin',
                whiteSpace: 'pre-wrap',
              }}
            >
              {parseTextWithTalentIcons(questionText, showIconInQuestion, isAnswered)}
            </div>
          </div>
        )}

        {/* 正解/不正解表示 */}
        {isAnswered && (
          <div
            className="text-center font-bold rounded-lg absolute"
            style={{
              fontSize: '8cqmin',
              color: isCorrect ? '#2cff7aff' : '#ff3e3eff',
              top: '88%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(128, 128, 128, 0.8)',
              padding: '0.5cqmin 3cqmin',
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            {isCorrect ? '正解！' : '不正解..'}
          </div>
        )}
      </div>

      {/* 右パネル: 選択肢エリア（正方形） */}
      <div
        className="relative flex items-center justify-center"
        style={{
          flex: '0 0 calc(50% - 1cqmin)',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {isTalentNameAnswers && answerStudentIds ? (
          /* タレント名選択肢: 2x2グリッド */
          <div
            className="grid grid-cols-2 grid-rows-2 w-full h-full"
          >
            {currentQuestion.answers.map((answer, index) => {
              const studentId = answerStudentIds[index];
              const shouldShowImage = showIconInQuestion || isAnswered;

              // 正解/不正解の枠線色と背景色
              let borderColor = 'transparent';
              let bgColor = 'transparent';
              let opacity = 1;
              if (isAnswered) {
                if (index === currentQuestion.correctIndex) {
                  borderColor = '#4ade80';
                  bgColor = 'rgba(74,222,128,0.7)';
                } else if (index === selectedAnswer) {
                  borderColor = '#f87171';
                  bgColor = 'rgba(248,113,113,0.7)';
                } else {
                  opacity = 0.8;
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !isAnswered && selectAnswer(index)}
                  disabled={isAnswered}
                  className="relative w-full h-full cursor-pointer transition-transform hover:scale-[1.02]"
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    opacity,
                  }}
                >
                  {/* 背景画像 */}
                  <img
                    src="./data/images/ui/panel_choice_face_bg.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* 正解時のグリーングローエフェクト */}
                  {isAnswered && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '0.8cqmin',
                        boxShadow: `0 0 10cqmin 10cqmin ${bgColor} inset`,
                      }}
                    />
                  )}

                  {/* 回答前: クエスチョンアイコン + タレント名 / 回答後: タレント画像 */}
                  {shouldShowImage ? (
                    <>
                      <img
                        src={`./data/images/kv/sq/${studentId}.png`}
                        draggable={false}
                        alt={answer}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ borderRadius: '0.8cqmin' }}
                      />
                      <div
                        className="absolute left-0.5 right-0.5 bottom-0.5 flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderBottomLeftRadius: '0.8cqmin',
                          borderBottomRightRadius: '0.8cqmin',
                          padding: '0.3cqmin 0',
                          height: '6cqmin',
                          zIndex: 10,
                        }}
                      >
                        <p
                          className="font-bold truncate w-full text-center"
                          style={{
                            fontSize: getFaceQuizAnswerFontSize(answer),
                            color: '#374151',
                          }}
                        >
                          {answer}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* クエスチョンアイコン */}
                      <img
                        src="./data/images/ui/icon_question.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{
                          borderRadius: '0.8cqmin',
                          padding: '15%',
                        }}
                      />
                      {/* タレント名（中央にオーバーレイ） */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ padding: '1cqmin 0' }}
                      >
                        <span
                          className="text-white font-bold text-center"
                          style={{
                            fontSize: getFaceQuizAnswerFontSize(answer),
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {answer}
                        </span>
                      </div>
                    </>
                  )}

                  {/* 前面フレーム画像 */}
                  <img
                    src="./data/images/ui/panel_choice_face.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      borderRadius: '0.8cqmin',
                      boxShadow: isAnswered ? `0 0 0 0.5cqmin ${borderColor}` : 'none',
                    }}
                  />

                  {/* 回答後のタレント名表示 */}
                  {isAnswered && (
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
                          fontSize: '2.5cqmin',
                          color: index === currentQuestion.correctIndex ? '#166534' : (index === selectedAnswer ? '#7f1d1d' : '#374151'),
                        }}
                      >
                        {answer}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* 通常選択肢: 4行配置 */
          <div
            className="flex flex-col w-full h-full justify-center"
          >
            {currentQuestion.answers.map((answer, index) => {
              // 正解/不正解の背景色
              let bgStyle = {};
              const textColor = '#ffffffff';
              if (isAnswered) {
                if (index === currentQuestion.correctIndex) {
                  if (isCorrect) {
                    bgStyle = {
                      filter: 'brightness(1.6) sepia(1) hue-rotate(70deg) saturate(2)',
                      boxShadow: '0 0 2cqmin 1cqmin #4ade80',
                    };
                  } else {
                    bgStyle = {
                      filter: 'brightness(1.6) sepia(1) hue-rotate(70deg) saturate(2)',
                    };
                  }
                } else if (index === selectedAnswer) {
                  bgStyle = { filter: 'brightness(1) sepia(1) hue-rotate(-30deg) saturate(2)', opacity: 0.9 };
                } else {
                  bgStyle = { opacity: 0.6 };
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !isAnswered && selectAnswer(index)}
                  disabled={isAnswered}
                  className="relative flex items-center justify-center transition-transform hover:scale-[1.02]"
                  style={{
                    flex: 1,
                    padding: 0,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  {/* 背景画像 */}
                  <img
                    src="./data/images/ui/panel_answer_oneline.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-fill"
                    style={{
                      borderRadius: '0.5cqmin',
                      width: '66cqmin',
                      ...bgStyle,
                    }}
                  />
                  {/* 選択肢テキスト */}
                  <span
                    className="relative z-10 font-bold text-center"
                    style={{
                      fontSize: getAnswerFontSize(answer),
                      color: textColor,
                      padding: '0.5cqmin 1cqmin',
                      wordBreak: 'break-word',
                    }}
                  >
                    {parseTextWithTalentIcons(answer, showIconInQuestion, isAnswered)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 顔当て問題のレイアウト（左右2つの正方形パネル）
 * 左パネル: 出題エリア（タレント名とヒント）
 * 右パネル: 選択肢エリア（2x2グリッドの顔画像）
 */
function FaceQuizLayout({
  currentQuestion,
  isAnswered,
  isCorrect,
  selectedAnswer,
  selectAnswer,
}: {
  currentQuestion: ProcessedQuestion;
  isAnswered: boolean;
  isCorrect: boolean;
  selectedAnswer: number | null;
  selectAnswer: (index: number) => void;
}) {
  const profile = currentQuestion.talentProfile;
  const answerImages = currentQuestion.answerImages ?? [];
  const answerTalentNames = currentQuestion.answerTalentNames ?? [];
  const isSilhouette = currentQuestion.isSilhouette ?? false;

  return (
    <div
      className="flex flex-row"
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 左パネル: 出題エリア（正方形, 小さめ） */}
      <div
        className="flex flex-col relative"
        style={{
          flex: '0 0 calc(50% - 1cqmin)',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
          borderRadius: '0.8cqmin',
          overflow: 'hidden',
          // 縦に上から順に配置するための設定
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        {/* 上から順に固定高さで配置（重ならない） */}
        {/* 1) タレント読み（あれば表示） */}
        {currentQuestion.talentKana && currentQuestion.talentKana != currentQuestion.question && (
          <div
            className="flex items-center justify-center text-white font-bold"
            style={{
              flex: '0 0 6cqmin',
              textAlign: 'center',
              fontSize: '4.5cqmin',
              paddingTop: '5cqmin',
            }}
          >
            {currentQuestion.talentKana}
          </div>
        )}

        {/* 2) 問題文（高さ固定） */}
        <div
          className="flex items-center justify-center text-center font-bold text-white"
          style={{
            flex: '0 0 15cqmin',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ lineHeight: 1.1, fontSize: getFaceQuizFontSize(currentQuestion.question) }}>
            {currentQuestion.question}
          </div>
        </div>

        {/* 3) 補助テキスト「はどれ？」 */}
        <div
          className="flex items-center justify-center text-white font-bold"
          style={{
            flex: '0 0 8cqmin',
            paddingBottom: '2cqmin',
            fontSize: '4cqmin',
            textAlign: 'center',
            
          }}
        >
          はどれ？
        </div>

        {/* 4) ヒント（将来の夢など） - 残り領域を使用しスクロール可 */}
        {profile && (
          <div
            className="text-white"
            style={{
              flex: '0 0 29cqmin',
              padding: '0 2cqmin',
              fontSize: '4.5cqmin',
              color: 'rgba(255,255,255,0.95)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              overflowY: 'scroll',
              scrollbarWidth: 'none',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ width: '100%' }}>💭将来の夢: {profile.dream}</div>
          </div>
        )}

        {/* 正解/不正解表示 */}
        {isAnswered && (
          <div
            className="text-center font-bold rounded-lg absolute"
            style={{
              fontSize: '8cqmin',
              color: isCorrect ? '#2cff7aff' : '#ff3e3eff',
              top: '88%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(128, 128, 128, 0.8)',
              padding: '0.5cqmin 3cqmin',
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            {isCorrect ? '正解！' : '不正解..'}
          </div>
        )}
      </div>

      {/* 右パネル: 選択肢エリア（正方形, 小さめ） */}
      <div
        className="relative flex items-center justify-center"
        style={{
          flex: '0 0 calc(50% - 1cqmin)',
          aspectRatio: '1 / 1',
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {/* 2x2グリッド */}
        <div
          className="grid grid-cols-2 grid-rows-2 w-full h-full"
        >
          {answerImages.map((imagePath, index) => {
            const showSilhouette = isSilhouette && !isAnswered;

            // 正解/不正解の枠線色と背景色
            let borderColor = 'transparent';
            let bgColor = 'transparent';
            let opacity = 1;
            if (isAnswered) {
              if (index === currentQuestion.correctIndex) {
                borderColor = '#4ade80'; // green-400
                bgColor = 'rgba(74,222,128,0.7)';
              } else if (index === selectedAnswer) {
                borderColor = '#f87171'; // red-400
                bgColor = 'rgba(248,113,113,0.7)';
              } else {
                opacity = 0.8;
              }
            }

            return (
              <button
                key={index}
                onClick={() => !isAnswered && selectAnswer(index)}
                disabled={isAnswered}
                className="relative w-full h-full cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: isAnswered ? 'default' : 'pointer',
                  opacity,
                }}
              >

                {/* 背景画像（難易度advancedかつ未回答時はlight版） */}
                <img
                  src={
                    !isAnswered && showSilhouette
                      ? "./data/images/ui/panel_choice_face_bg_light.png"
                      : "./data/images/ui/panel_choice_face_bg.png"
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ borderRadius: '0.8cqmin' }}
                />

                {/* 正解時のグリーングローエフェクト */}
                {isAnswered && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderRadius: '0.8cqmin',
                      boxShadow: `0 0 10cqmin 10cqmin ${bgColor} inset`,
                    }}
                  />)}

                {/* タレント画像 */}
                <img
                  src={imagePath}
                  draggable={false}
                  alt={`選択肢${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    borderRadius: '0.8cqmin',
                    ...(showSilhouette ? { filter: 'brightness(0) saturate(0.2)' } : {}),
                  }}
                />

                {/* 前面フレーム画像 */}
                <img
                  src="./data/images/ui/panel_choice_face.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    borderRadius: '0.8cqmin',
                    boxShadow: isAnswered ? `0 0 0 0.5cqmin ${borderColor}` : 'none',
                  }}
                />

                {/* 回答後のタレント名表示 */}
                {isAnswered && answerTalentNames[index] && (
                  <div
                    className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderBottomLeftRadius: '0.8cqmin',
                      borderBottomRightRadius: '0.8cqmin',
                      padding: '0.3cqmin 0.5cqmin',
                      height: '7cqmin',
                    }}
                  >
                    <p
                      className="font-bold truncate w-full text-center"
                      style={{
                        fontSize: getFaceQuizAnswerFontSize(answerTalentNames[index]),
                        color: index === currentQuestion.correctIndex ? '#166534' : (index === selectedAnswer ? '#7f1d1d' : '#374151'),
                      }}
                    >
                      {answerTalentNames[index]}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 名前当て問題のレイアウト（通常問題のタレント名選択と同じレイアウト）
 * 左パネル: 出題エリア（タレント画像とプロフィール）
 * 右パネル: 選択肢エリア（2x2グリッドのアイコン選択肢）
 */
function NameQuizLayout({
  currentQuestion,
  isAnswered,
  isCorrect,
  selectedAnswer,
  selectAnswer,
}: {
  currentQuestion: ProcessedQuestion;
  isAnswered: boolean;
  isCorrect: boolean;
  selectedAnswer: number | null;
  selectAnswer: (index: number) => void;
}) {
  const talentImage = currentQuestion.talentImagePath;
  const isSilhouette = currentQuestion.isSilhouette ?? false;
  const answerStudentIds = currentQuestion.answerStudentIds ?? [];

  // シルエットモード: 回答前は黒く、回答後は通常表示
  const showSilhouette = isSilhouette && !isAnswered;

  return (
    <div
      className="flex flex-row"
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 左パネル: 出題エリア（正方形） */}
      <div
        className="flex flex-col relative"
        style={{
          flex: '0 0 calc(50% - 1cqmin)',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
          borderRadius: '0.8cqmin',
          overflow: 'hidden',
          // 縦に上から順に配置するための設定
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        {/* 問題文 */}
        <div
          className="flex items-center justify-center text-white font-bold"
          style={{
            flex: '0 0 6cqmin',
            textAlign: 'center',
            fontSize: '4.5cqmin',
            paddingTop: '2cqmin',
          }}
        >
          この人は誰？
        </div>

        {/* タレント画像 */}
        <div
          className="flex items-center justify-center text-white font-bold"
          style={{
            flex: '0 0 6cqmin',
            textAlign: 'center',
            paddingTop: '2cqmin',
          }}
        >
          <div className="flex items-center justify-center"
            style={{ 
              width: '75%',
              height: '100%',
              backgroundImage: `url("./data/images/ui/bg_${(currentQuestion.index ?? 0) % 8}.png")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '0.8cqmin',
            }}
          >
            <img
              src={talentImage}
              alt="誰でしょう？"
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                borderRadius: '0.8cqmin',
                filter: showSilhouette ? 'brightness(0) saturate(0.2)' : 'none',
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* 正解/不正解表示 */}
        {isAnswered && (
          <div
            className="text-center font-bold rounded-lg absolute"
            style={{
              fontSize: '8cqmin',
              color: isCorrect ? '#2cff7aff' : '#ff3e3eff',
              top: '88%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(128, 128, 128, 0.8)',
              padding: '0.5cqmin 3cqmin',
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            {isCorrect ? '正解！' : '不正解..'}
          </div>
        )}
      </div>

      {/* 右パネル: 選択肢エリア（正方形） */}
      <div
        className="relative flex items-center justify-center"
        style={{
          flex: '0 0 calc(50% - 1cqmin)',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {/* 2x2グリッド - 通常問題のタレント名選択肢と同じ */}
        <div
          className="grid grid-cols-2 grid-rows-2 w-full h-full"
        >
          {currentQuestion.answers.map((answer, index) => {
            const studentId = answerStudentIds[index];

            // 正解/不正解の枠線色と背景色
            let borderColor = 'transparent';
            let bgColor = 'transparent';
            let opacity = 1;
            if (isAnswered) {
              if (index === currentQuestion.correctIndex) {
                borderColor = '#4ade80';
                bgColor = 'rgba(74, 222, 128, 0.6)';
              } else if (index === selectedAnswer) {
                borderColor = '#f87171';
                bgColor = 'rgba(248, 113, 113, 0.6)';
                opacity = 0.8;
              } else {
                opacity = 0.8;
              }
            }

            return (
              <button
                key={index}
                onClick={() => !isAnswered && selectAnswer(index)}
                disabled={isAnswered}
                className="relative rounded-lg transition-colors h-full cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                  padding: 0,
                  background: bgColor,
                  cursor: isAnswered ? 'default' : 'pointer',
                  opacity,
                }}
              >
                {/* 背景画像（正解/不正解時に表示） */}
                {isAnswered && (
                  <img
                    src={`./data/images/kv/sq/${studentId}.png`}
                    alt={answer}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      borderRadius: '0.8cqmin',
                    }}
                  />
                )}

                {/* 前面フレーム画像 */}
                <img
                  src="./data/images/ui/panel_choice_face.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    borderRadius: '0.8cqmin',
                    boxShadow: isAnswered ? `0 0 0 0.5cqmin ${borderColor}` : 'none',
                  }}
                />

                {/* 回答前: クエスチョンアイコン + タレント名 */}
                {!isAnswered && (
                  <>
                    {/* クエスチョンアイコン */}
                    <img
                      src="./data/images/ui/icon_question.png"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{
                        borderRadius: '0.8cqmin',
                        padding: '15%',
                      }}
                    />
                    {/* タレント名（中央にオーバーレイ） */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ padding: '1cqmin 0' }}
                    >
                      <span
                        className="text-white font-bold text-center"
                        style={{
                          fontSize: getFaceQuizAnswerFontSize(answer),
                          textShadow: '2px 2px 2px rgba(0, 0, 0, 1), 2px -2px 2px rgba(0, 0, 0, 1), -2px 2px 2px rgba(0, 0, 0, 1), -2px -2px 2px rgba(0, 0, 0, 1)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {answer}
                      </span>
                    </div>
                  </>
                )}

                {/* 回答後: タレント画像 + タレント名 */}
                {isAnswered && (
                  <div
                    className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderBottomLeftRadius: '0.8cqmin',
                      borderBottomRightRadius: '0.8cqmin',
                      padding: '0.3cqmin 0.5cqmin',
                      height: '7cqmin',
                    }}
                  >
                    <p
                      className="font-bold truncate w-full text-center"
                      style={{
                        fontSize: getFaceQuizAnswerFontSize(answer),
                        color: index === currentQuestion.correctIndex ? '#166534' : (index === selectedAnswer ? '#7f1d1d' : '#374151'),
                      }}
                    >
                      {answer}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * 難易度を星で表示するコンポーネント
 * @param difficulty 難易度（1-5）
 * @param maxStars 最大星数（デフォルト5）
 */
function DifficultyStars({ difficulty, maxStars = 5, genre ='' }: { difficulty: number; maxStars?: number; genre?: string }) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <span
        key={i}
        className={i <= difficulty ? 'text-yellow-400' : 'text-gray-500'}
        style={{
          fontSize: '5cqmin',
          textShadow: i <= difficulty ? '2px 2px 4px rgba(0,0,0,0.7)' : undefined,
        }}
      >
        ★
      </span>
    );
  }
  return (
    <div className="flex items-center">
      <ThreePatchImage
        leftImage="./data/images/ui/plate_left.png"
        middleImage="./data/images/ui/plate_middle.png"
        rightImage="./data/images/ui/plate_right.png"
        height="10cqmin"
      >
        {genre && genre !== '' && (
          <span
            className="ml-2 text-white font-bold"
            style={{
              fontSize: '5cqmin',
              textShadow: '2px 2px 4px rgba(0,0,0,1)',
              paddingRight: '1cqmin',
            }}
          >
            {genre}
          </span>
        )}
        <span className="inline-flex">{stars}</span>
      </ThreePatchImage>
    </div>
  );
}

/**
 * アイコン画像ボタンコンポーネント（共通）
 */
function ImageButton({
  src,
  alt,
  label,
  onClick,
  height = '7cqmin',
}: {
  src: string;
  alt: string;
  label: string;
  onClick: () => void;
  height?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="transition-all"
      style={{
        padding: 0,
        border: 'none',
        background: 'none',
        filter: 'brightness(1)',
        transition: 'filter 0.2s',
      }}
      aria-label={label}
      title={label}
      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
      onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
    >
      <img
        src={src}
        alt={alt}
        style={{ height, width: 'auto' }}
      />
    </button>
  );
}

/**
 * 操作ボタンエリアのコンポーネント
 * 前の問題へボタン、解説ボタン、次の問題へ/結果を見るボタンを共通化
 */
function ControlButtonArea({
  showPrevButton,
  showCommentButton,
  showNextButton,
  isLastQuestion,
  isAnswered,
  onPrevClick,
  onCommentClick,
  onNextClick,
  returnToTitle,
}: {
  showPrevButton: boolean;
  showCommentButton: boolean;
  showNextButton: boolean;
  isLastQuestion: boolean;
  isAnswered: boolean;
  onPrevClick: () => void;
  onCommentClick: () => void;
  onNextClick: () => void;
  returnToTitle: () => void;
}) {
  return (
    <div
      className="relative w-full"
      style={{ padding: '0 1cqmin' }}
    >
      {/* 左端: ホーム / 前の問題へ */}
      <div
      className="flex items-center gap-[1.5cqmin]"
      style={{ position: 'absolute', left: '1cqmin', top: '50%', transform: 'translateY(-50%)' }}
      >
      <ImageButton
        src="./data/images/ui/btn_home.png"
        alt="ホームへ"
        label="ホームへ"
        onClick={returnToTitle}
        height="11cqmin"
      />
      {showPrevButton && (
        <ImageButton
        src="./data/images/ui/btn_back.png"
        alt="前の問題へ"
        label="前の問題へ"
        onClick={onPrevClick}
        height="8cqmin"
        />
      )}
      </div>

      {/* 中央: 解説ボタン（真ん中に固定） */}
      <div
      className="flex items-center justify-center"
      style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
      {showCommentButton && isAnswered && (
        <ImageButton
        src="./data/images/ui/btn_description.png"
        alt="解説"
        label="解説"
        onClick={onCommentClick}
        />
      )}
      </div>

      {/* 右端: 次の問題へ / 結果を見る */}
      <div
      className="flex items-center gap-[1.5cqmin]"
      style={{ position: 'absolute', right: '1cqmin', top: '50%', transform: 'translateY(-50%)' }}
      >
      {showNextButton && isAnswered && (
        <ImageButton
        src={isLastQuestion ? './data/images/ui/btn_result.png' : './data/images/ui/btn_next.png'}
        alt={isLastQuestion ? '結果を見る' : '次の問題へ'}
        label={isLastQuestion ? '結果を見る' : '次の問題へ'}
        onClick={onNextClick}
        height="10cqmin"
        />
      )}
      </div>
    </div>
  );
}

export function QuizScreen() {
  const {
    gameStage,
    category,
    questions,
    currentIndex,
    quizState,
    selectedAnswer,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    returnToTitle,
  } = useGameStore();

  const currentQuestion = questions[currentIndex];
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;
  const isAnswered = quizState === 'answered';

  // 解説ダイアログの表示状態
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  // コメントが存在し、空文字でないかを判定
  const hasComment = currentQuestion.comment && currentQuestion.comment.trim() !== '';
  // 情報源URLが存在し、空文字でないかを判定
  const hasSourceUrl = currentQuestion.sourceUrl && currentQuestion.sourceUrl.trim() !== '';
  // 解説ボタンを表示するかどうか（コメントまたは情報源がある場合）
  const showCommentButton: boolean = !!(hasComment || hasSourceUrl);

  // hide_iconがtrueの場合は回答前はアイコン非表示、回答後は表示
  const showIconInQuestion = currentQuestion.hideIcon ? isAnswered : true;

  // 問題タイプを取得
  const questionType = currentQuestion.questionType;

  /**
   * 次の問題の選択肢画像をプリロードする
   */
  useEffect(() => {
    // 回答済みかつ次の問題が存在する場合のみプリロード
    if (!isAnswered || isLastQuestion) {
      return;
    }

    const nextQuestion = questions[currentIndex + 1];
    if (!nextQuestion) {
      return;
    }

    const imagesToPreload: string[] = [];

    // 顔当て問題の場合
    if (nextQuestion.questionType === 'face' && nextQuestion.answerImages) {
      imagesToPreload.push(...nextQuestion.answerImages);
    }
    // 名前当て問題の場合
    else if (nextQuestion.questionType === 'name') {
      const talentMap = getTalentNameMap();
      if (talentMap && nextQuestion.answers) {
        for (const answer of nextQuestion.answers) {
          const studentId = talentMap.get(answer) ?? talentMap.get(answer.replace(/\s/g, ''));
          if (studentId) {
            imagesToPreload.push(`./data/images/kv/sq/${studentId}.png`);
          }
        }
      }
    }
    // 通常問題でタレント名選択肢の場合
    else if (nextQuestion.questionType === 'normal') {
      const talentMap = getTalentNameMap();
      if (talentMap && nextQuestion.answers) {
        const allTalentNames = nextQuestion.answers.every(answer => {
          const keyNoSpace = answer.replace(/\s/g, '');
          return talentMap.has(answer) || talentMap.has(keyNoSpace);
        });

        if (allTalentNames) {
          for (const answer of nextQuestion.answers) {
            const studentId = talentMap.get(answer) ?? talentMap.get(answer.replace(/\s/g, ''));
            if (studentId) {
              imagesToPreload.push(`./data/images/kv/sq/${studentId}.png`);
            }
          }
        }
      }
    }

    // 画像をプリロード
    for (const imagePath of imagesToPreload) {
      const img = new Image();
      img.src = imagePath;
      // エラーハンドリングは最小限
      img.onerror = () => {
        console.warn(`Failed to preload image: ${imagePath}`);
      };
    }
  }, [isAnswered, currentIndex, questions, isLastQuestion]);

  return (
    <div className="w-full h-full flex flex-col p-[3%]">
      {/* ヘッダーエリア */}
      <QuizHeader
        gameStage={gameStage}
        category={category}
        genre={currentQuestion.genre}
        difficulty={currentQuestion.difficulty}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
      />

      {/* 中央エリア（横4:縦3のメインコンテンツ） */}
      {/* 顔当て問題 */}
      {questionType === 'face' && (
        <div
          className="flex items-center justify-center"
          style={{ flex: '0 0 65cqmin', minHeight: 0 }}
        >
          <FaceQuizLayout
            currentQuestion={currentQuestion}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            selectedAnswer={selectedAnswer}
            selectAnswer={selectAnswer}
          />
        </div>
      )}
      {/* 名前当て問題 */}
      {questionType === 'name' && (
        <div
          className="flex items-center justify-center"
          style={{ flex: '0 0 65cqmin', minHeight: 0 }}
        >
          <NameQuizLayout
            currentQuestion={currentQuestion}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            selectedAnswer={selectedAnswer}
            selectAnswer={selectAnswer}
          />
        </div>
      )}
      {/* 通常問題 */}
      {questionType === 'normal' && (
        <div
          className="flex items-center justify-center"
          style={{ flex: '0 0 65cqmin', minHeight: 0 }}
        >
          <NormalQuizLayout
            currentQuestion={currentQuestion}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            selectedAnswer={selectedAnswer}
            selectAnswer={selectAnswer}
            showIconInQuestion={showIconInQuestion}
          />
        </div>
      )}

      {/* 下部: 操作ボタン */}
      <div
        className="flex items-center justify-center"
        style={{ flex: '0 0 12cqmin', minHeight: 0 }}
      >
        <ControlButtonArea
          showPrevButton={!isFirstQuestion}
          showCommentButton={showCommentButton}
          showNextButton={true}
          isLastQuestion={isLastQuestion}
          isAnswered={isAnswered}
          onPrevClick={prevQuestion}
          onCommentClick={() => setIsCommentDialogOpen(true)}
          onNextClick={nextQuestion}
          returnToTitle={returnToTitle}
        />
      </div>

      {/* 解説ダイアログ */}
      <CommentDialog
        isOpen={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        currentQuestion={currentQuestion}
      />
    </div>
  );
}
