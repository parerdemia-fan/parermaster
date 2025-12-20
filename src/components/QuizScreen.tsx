import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { extractFirstImage, removeImageTags } from '../utils/imageTagParser';
import { parseTextWithTalentIcons, getTalentNameMap } from '../utils/talentIconParser';
import { ThreePatchImage } from './ThreePatchImage';
import type { ProcessedQuestion } from '../types';

/**
 * 問題文の文字数に応じた文字サイズを取得する
 * @param text 問題文（画像タグ除去済み）
 * @returns CSS font-size値
 */
function getQuestionFontSize(text: string): string {
  const length = text.length;
  if (length <= 20) {
    return 'min(6vw, 6vh)';
  } else if (length <= 40) {
    return 'min(5vw, 5vh)';
  } else if (length <= 60) {
    return 'min(4vw, 4vh)';
  } else {
    return 'min(3.5vw, 3.5vh)';
  }
}

/**
 * 回答選択肢の文字数に応じた文字サイズを取得する
 * @param text 選択肢のテキスト
 * @returns CSS font-size値
 */
function getAnswerFontSize(text: string): string {
  const length = text.length;
  if (length <= 6) {
    return 'min(4.5vw, 4.5vh)';
  } else if (length <= 12) {
    return 'min(3.8vw, 3.8vh)';
  } else {
    return 'min(3vw, 3vh)';
  }
}

function getFaceQuizFontSize(text: string): string {
  const length = text.length;
  if (length <= 6) {
    return 'min(10vw, 10vh)';
  } else if (length <= 10) {
    return 'min(6.8vw, 6.8vh)';
  } else {
    return 'min(5.5vw, 5.5vh)';
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
  returnToTitle,
}: {
  gameStage: string;
  category: string;
  genre?: string;
  difficulty: number;
  currentIndex: number;
  totalQuestions: number;
  returnToTitle: () => void;
}): React.ReactNode {
  // 深堀り問題または超深堀り問題の場合のみジャンルを表示
  const showGenre = genre && (category === '深堀り問題' || category === '超深堀り問題');

  return (
    <div
      className="flex items-center justify-between"
      style={{ height: '8%', padding: '0 min(1vw, 1vh)' }}
    >
      {/* 左側: ステージ、ラベル、問題難易度 */}
      <div className="flex items-center gap-[1.5vmin]">
        <div className="flex items-center">
          <ThreePatchImage
            leftImage="./data/images/ui/plate_left.png"
            middleImage="./data/images/ui/plate_middle.png"
            rightImage="./data/images/ui/plate_right.png"
            height="min(6.5vw, 6.5vh)"
          >
            <span
              className="text-white font-bold"
              style={{
                fontSize: 'min(3.5vw, 3.5vh)',
                textShadow: '2px 2px 4px rgba(0,0,0,1)',
               }}
            >
              {gameStage} / {category}
            </span>
          </ThreePatchImage>
        </div>
        <DifficultyStars difficulty={difficulty} genre={genre} />
      </div>
      {/* 右側: 進捗 + ホームボタン */}
      <div className="flex items-center gap-[1.5vmin]">
        <div className="flex items-center">
          <ThreePatchImage
            leftImage="./data/images/ui/plate_left.png"
            middleImage="./data/images/ui/plate_middle.png"
            rightImage="./data/images/ui/plate_right.png"
            height="min(6.5vw, 6.5vh)"
          >
            <span
              className="text-white font-bold"
              style={{ fontSize: 'min(3.5vw, 3.5vh)', textShadow: '2px 2px 4px rgba(0,0,0,1)' }}
            >
              {currentIndex + 1} / {totalQuestions}
            </span>
          </ThreePatchImage>
        </div>
        {
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm('ゲームを中断してタイトルに戻りますか？')) {
                returnToTitle();
              }
            }}
            className="cursor-pointer transition-opacity hover:opacity-80"
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
            }}
            title="タイトルに戻る"
            aria-label="タイトルに戻る"
          >
            <img
              src="./data/images/ui/btn_home.png"
              alt="ホーム"
              style={{ height: 'min(7vw, 7vh)', width: 'auto' }}
            />
          </button>
        }
      </div>
    </div>
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
          maxWidth: 'calc(min(100vw, 100vh) * 0.8)',
          padding: 'min(5.5vw, 5.5vh)',
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
            style={{ fontSize: 'min(4vw, 4vh)', lineHeight: '1.6', color: '#493e33ff', textShadow: '0 0 min(1vw, 1vh) rgba(74, 59, 42, 0.5)' }}
          >
            {parseCommentWithImages(currentQuestion.comment ?? '')}
          </div>
        )}
        {hasSourceUrl && (
          <div
            className="mb-4"
            style={{ fontSize: 'min(3.5vw, 3.5vh)' }}
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
            style={{ fontSize: 'min(3.5vw, 3.5vh)' }}
          >
            🎓️出題者: {currentQuestion.questioner}
          </div>
        )}
        <div className="flex justify-center" style={{ marginTop: 'min(2vw, 2vh)' }}>
          <button
            onClick={onClose}
            className="flex items-center transition brightness-125 hover:brightness-150"
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
              fontSize: 'min(3.5vw, 3.5vh)',
            }}
          >
            {/* 左端 */}
            <img
              src="./data/images/ui/btn_normal_off_left.png"
              alt=""
              style={{
                height: 'min(7vw, 7vh)',
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
                height: 'min(7vw, 7vh)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 min(2.5vw, 2.5vh)',
                color: '#999',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              閉じる
            </div>
            {/* 右端 */}
            <img
              src="./data/images/ui/btn_normal_off_right.png"
              alt=""
              style={{
                height: 'min(7vw, 7vh)',
                width: 'auto',
                display: 'block',
              }}
            />
          </button>
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
        gap: 'min(2vw, 2vh)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'min(1vw, 1vh)',
      }}
    >
      {/* 左パネル: 出題エリア（正方形） */}
      <div
        className="flex flex-col items-center justify-center relative"
        style={{
          flex: '0 0 calc(50% - min(1vw, 1vh))',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        {/* 問題画像がある場合 */}
        {questionImage ? (
          <>
            {/* 問題画像 */}
            <div
              className="flex items-center justify-center"
              style={{
                width: '90%',
                height: '60%',
                marginBottom: 'min(1vw, 1vh)',
              }}
            >
              <img
                src={`./data/images/questions/${questionImage}`}
                alt="問題画像"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            {/* 問題文 */}
            <p
              className="text-white text-center font-bold leading-relaxed"
              style={{
                fontSize: getQuestionFontSize(questionText),
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                padding: '0 min(2vw, 2vh)',
              }}
            >
              {parseTextWithTalentIcons(questionText, showIconInQuestion, isAnswered)}
            </p>
          </>
        ) : (
          /* 問題画像がない場合は問題文のみ */
          <p
            className="text-white text-center font-bold leading-relaxed"
            style={{
              fontSize: getQuestionFontSize(questionText),
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              padding: '0 min(3vw, 3vh)',
            }}
          >
            {parseTextWithTalentIcons(questionText, showIconInQuestion, isAnswered)}
          </p>
        )}

        {/* 正解/不正解表示 */}
        {isAnswered && (
          <div
            className="text-center font-bold rounded-lg absolute"
            style={{
              fontSize: 'min(5vw, 5vh)',
              color: isCorrect ? '#4ade80' : '#f87171',
              bottom: 'min(2vw, 2vh)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(128, 128, 128, 0.5)',
              padding: 'min(0.5vw, 0.5vh) min(1.5vw, 1.5vh)',
            }}
          >
            {isCorrect ? '正解！' : '不正解...'}
          </div>
        )}
      </div>

      {/* 右パネル: 選択肢エリア（正方形） */}
      <div
        className="relative flex items-center justify-center"
        style={{
          flex: '0 0 calc(50% - min(1vw, 1vh))',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          borderRadius: 'min(1vw, 1vh)',
          padding: 'min(1vw, 1vw)',
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {isTalentNameAnswers && answerStudentIds ? (
          /* タレント名選択肢: 2x2グリッド */
          <div
            className="grid grid-cols-2 grid-rows-2 w-full h-full"
            style={{ gap: 'min(1vw, 1vh)' }}
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
                    style={{ borderRadius: 'min(0.8vw, 0.8vh)' }}
                  />

                  {/* 正解時のグリーングローエフェクト */}
                  {isAnswered && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: 'min(0.8vw, 0.8vh)',
                        boxShadow: `0 0 min(10vw, 10vh) min(10vw, 10vh) ${bgColor} inset`,
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
                        style={{ borderRadius: 'min(0.8vw, 0.8vh)' }}
                      />
                      <div
                        className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderBottomLeftRadius: 'min(0.8vw, 0.8vh)',
                          borderBottomRightRadius: 'min(0.8vw, 0.8vh)',
                          padding: 'min(0.3vw, 0.3vh) min(0.5vw, 0.5vh)',
                          zIndex: 10,
                        }}
                      >
                        <p
                          className="font-bold truncate w-full text-center"
                          style={{
                            fontSize: 'min(2.5vw, 2.5vh)',
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
                          borderRadius: 'min(0.8vw, 0.8vh)',
                          padding: '15%',
                        }}
                      />
                      {/* タレント名（中央にオーバーレイ） */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ padding: 'min(1vw, 1vh)' }}
                      >
                        <span
                          className="text-white font-bold text-center"
                          style={{
                            fontSize: getAnswerFontSize(answer),
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
                      borderRadius: 'min(0.8vw, 0.8vh)',
                      boxShadow: isAnswered ? `0 0 0 min(0.5vw, 0.5vh) ${borderColor}` : 'none',
                    }}
                  />

                  {/* 回答後のタレント名表示 */}
                  {isAnswered && (
                    <div
                      className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderBottomLeftRadius: 'min(0.8vw, 0.8vh)',
                        borderBottomRightRadius: 'min(0.8vw, 0.8vh)',
                        padding: 'min(0.3vw, 0.3vh) min(0.5vw, 0.5vh)',
                      }}
                    >
                      <p
                        className="font-bold truncate w-full text-center"
                        style={{
                          fontSize: 'min(2.5vw, 2.5vh)',
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
            style={{ gap: 'min(1vw, 1vh)', padding: 'min(1vw, 1vh)' }}
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
                      boxShadow: '0 0 min(2vw, 2vh) min(1vw, 1vh) #4ade80',
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
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      borderRadius: 'min(0.5vw, 0.5vh)',
                      ...bgStyle,
                    }}
                  />
                  {/* 選択肢テキスト */}
                  <span
                    className="relative z-10 font-bold text-center"
                    style={{
                      fontSize: getAnswerFontSize(answer),
                      color: textColor,
                      padding: 'min(0.5vw, 0.5vh) min(1vw, 1vh)',
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
        gap: 'min(2vw, 2vh)', // パネル間の余白も少し広げる
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'min(1vw, 1vh)',
      }}
    >
      {/* 左パネル: 出題エリア（正方形, 小さめ） */}
      <div
        className="flex flex-col items-center justify-center relative"
        style={{
          flex: '0 0 calc(50% - min(1vw, 1vh))',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)', // 半透明の背景
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {/* 出題文言 */}
        <div
          className="text-white text-center font-bold"
          style={{
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            height: 'min(20vw, 20vh)',
            paddingTop: 'min(5vw, 5vh)',
          }}
        >
          {currentQuestion.talentKana && (
            <div style={{ fontSize: 'min(3.7vw, 3.7vh)', opacity: 0.9 }}>
              {currentQuestion.talentKana}
            </div>
          )}
          <div style={{ fontSize: getFaceQuizFontSize(currentQuestion.question) }}>
            {currentQuestion.question}<br />
          </div>
          <div style={{ fontSize: 'min(4vw, 4vh)' }}>はどれ？</div>
        </div>

        {/* ヒント: 将来の夢 */}
        {profile && (
          <div
            className="flex flex-col justify-center items-center text-center"
            style={{
              fontSize: 'min(2.5vw, 2.5vh)',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              padding: 'min(1.5vw, 1.5vh)',
              height: 'min(40vw, 40vh)',
            }}
          >
            <p style={{ margin: 0, fontSize: 'min(3.5vw, 3.5vh)' }}>
              💭将来の夢: {profile.dream}
            </p>
          </div>
        )}

        {/* 正解/不正解表示 */}
        {isAnswered && (
          <div
            className="text-center font-bold rounded-lg absolute"
            style={{
              fontSize: 'min(5vw, 5vh)',
              color: isCorrect ? '#4ade80' : '#f87171',
              bottom: 'min(2vw, 2vh)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(128, 128, 128, 0.5)',
              padding: 'min(0.5vw, 0.5vh) min(1.5vw, 1.5vh)',
            }}
          >
            {isCorrect ? '正解！' : '不正解...'}
          </div>
        )}
      </div>

      {/* 右パネル: 選択肢エリア（正方形, 小さめ） */}
      <div
        className="relative flex items-center justify-center"
        style={{
          flex: '0 0 calc(50% - min(1vw, 1vh))',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)', // 半透明の背景
          borderRadius: 'min(1vw, 1vh)',
          padding: 'min(1vw, 1vw)',
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {/* 2x2グリッド */}
        <div
          className="grid grid-cols-2 grid-rows-2 w-full h-full"
          style={{ gap: 'min(1vw, 1vh)' }}
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
                  style={{ borderRadius: 'min(0.8vw, 0.8vh)' }}
                />

                {/* 正解時のグリーングローエフェクト */}
                {isAnswered && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderRadius: 'min(0.8vw, 0.8vh)',
                      boxShadow: `0 0 min(10vw, 10vh) min(10vw, 10vh) ${bgColor} inset`,
                    }}
                  />)}

                {/* タレント画像 */}
                <img
                  src={imagePath}
                  draggable={false}
                  alt={`選択肢${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    borderRadius: 'min(0.8vw, 0.8vh)',
                    ...(showSilhouette ? { filter: 'brightness(0) saturate(0.2)' } : {}),
                  }}
                />

                {/* 前面フレーム画像 */}
                <img
                  src="./data/images/ui/panel_choice_face.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    borderRadius: 'min(0.8vw, 0.8vh)',
                    boxShadow: isAnswered ? `0 0 0 min(0.5vw, 0.5vh) ${borderColor}` : 'none',
                  }}
                />

                {/* 回答後のタレント名表示 */}
                {isAnswered && answerTalentNames[index] && (
                  <div
                    className="absolute left-0 right-0 bottom-0 flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderBottomLeftRadius: 'min(0.8vw, 0.8vh)',
                      borderBottomRightRadius: 'min(0.8vw, 0.8vh)',
                      padding: 'min(0.3vw, 0.3vh) min(0.5vw, 0.5vh)',
                    }}
                  >
                    <p
                      className="font-bold truncate w-full text-center"
                      style={{
                        fontSize: 'min(2.5vw, 2.5vh)',
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
  const profile = currentQuestion.talentProfile;
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
        gap: 'min(2vw, 2vh)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'min(1vw, 1vh)',
      }}
    >
      {/* 左パネル: 出題エリア（正方形） */}
      <div
        className="flex flex-col items-center justify-center relative"
        style={{
          flex: '0 0 calc(50% - min(1vw, 1vh))',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          maxWidth: '50%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        {/* 問題文 */}
        {
          <div
            className="text-gray-200"
            style={{ fontSize: 'min(4vw, 4vh)', padding: '0', height: '10%' }}
          >
            <p className="mt-1">この人は誰？</p>
          </div>
        }

        {/* タレント画像 */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '55%',
            height: '55%',
            marginBottom: 'min(1vw, 1vh)',
          }}
        >
          <div
            className="w-full h-full rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'white',
              borderRadius: 'min(0.8vw, 0.8vh)',
            }}
          >
            <img
              src={talentImage}
              alt="誰でしょう？"
              className="w-full h-full object-cover"
              style={showSilhouette ? { filter: 'brightness(0)' } : undefined}
              draggable={false}
            />
          </div>
        </div>

        {/* プロフィール */}
        {profile && (
          <div
            className="text-gray-200"
            style={{ fontSize: 'min(3vw, 3vh)', padding: '0 min(2vw, 2vh)', height: '25%', overflowY: 'auto' }}
          >
            <p className="mt-1">💭将来の夢: {profile.dream}</p>
          </div>
        )}

        {/* 正解/不正解表示 */}
        {isAnswered && (
          <div
            className="text-center font-bold rounded-lg absolute"
            style={{
              fontSize: 'min(5vw, 5vh)',
              color: isCorrect ? '#4ade80' : '#f87171',
              bottom: 'min(2vw, 2vh)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(128, 128, 128, 0.5)',
              padding: 'min(0.5vw, 0.5vh) min(1.5vw, 1.5vh)',
            }}
          >
            {isCorrect ? '正解！' : '不正解...'}
          </div>
        )}
      </div>

      {/* 右パネル: 選択肢エリア（正方形） */}
      <div
        className="relative flex items-center justify-center"
        style={{
          flex: '0 0 calc(50% - min(1vw, 1vh))',
          aspectRatio: '1 / 1',
          backgroundImage: 'url(./data/images/ui/panel_question.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(30,30,30,0.90)',
          borderRadius: 'min(1vw, 1vh)',
          padding: 'min(1vw, 1vw)',
          maxWidth: '50%',
          maxHeight: '100%',
        }}
      >
        {/* 2x2グリッド - 通常問題のタレント名選択肢と同じ */}
        <div
          className="grid grid-cols-2 grid-rows-2 w-full h-full"
          style={{ gap: 'min(1vw, 1vh)' }}
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
                className="relative rounded-lg transition-colors h-full"
                style={{
                  padding: 0,
                  border: `min(0.3vw, 0.3vh) solid ${borderColor}`,
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
                      borderRadius: 'min(0.7vw, 0.7vh)',
                    }}
                  />
                )}

                {/* 前面フレーム画像 */}
                <img
                  src="./data/images/ui/panel_choice_face.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    borderRadius: 'min(0.8vw, 0.8vh)',
                    boxShadow: isAnswered ? `0 0 0 min(0.5vw, 0.5vh) ${borderColor}` : 'none',
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
                        borderRadius: 'min(0.8vw, 0.8vh)',
                        padding: '15%',
                      }}
                    />
                    {/* タレント名（中央にオーバーレイ） */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ padding: 'min(1vw, 1vh)' }}
                    >
                      <span
                        className="text-white font-bold text-center"
                        style={{
                          fontSize: getAnswerFontSize(answer),
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
                      borderBottomLeftRadius: 'min(0.8vw, 0.8vh)',
                      borderBottomRightRadius: 'min(0.8vw, 0.8vh)',
                      padding: 'min(0.3vw, 0.3vh) min(0.5vw, 0.5vh)',
                    }}
                  >
                    <p
                      className="font-bold truncate w-full text-center"
                      style={{
                        fontSize: 'min(2.5vw, 2.5vh)',
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
          fontSize: 'min(3.5vw, 3.5vh)',
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
        height="min(6.5vw, 6.5vh)"
      >
        {genre && genre !== '' && (
          <span
            className="ml-2 text-white font-bold"
            style={{
              fontSize: 'min(3vw, 3vh)',
              textShadow: '2px 2px 4px rgba(0,0,0,1)',
              paddingRight: 'min(1vw, 1vh)',
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
  height = 'min(7vw, 7vh)',
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
}: {
  showPrevButton: boolean;
  showCommentButton: boolean;
  showNextButton: boolean;
  isLastQuestion: boolean;
  isAnswered: boolean;
  onPrevClick: () => void;
  onCommentClick: () => void;
  onNextClick: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ height: '10%', padding: '0 min(1vw, 1vh)' }}
    >
      {/* 左側: 前の問題へボタン */}
      <div style={{ minWidth: '25%', marginBottom: 'min(7vw, 7vh)' }}>
        {showPrevButton && (
          <ImageButton
            src="./data/images/ui/btn_back.png"
            alt="前の問題へ"
            label="前の問題へ"
            onClick={onPrevClick}
          />
        )}
      </div>

      {/* 中央: 解説ボタン */}
      <div className="flex items-center justify-center" style={{ marginBottom: 'min(8vw, 8vh)' }}>
        {showCommentButton && isAnswered && (
          <ImageButton
            src="./data/images/ui/btn_description.png"
            alt="解説"
            label="解説"
            onClick={onCommentClick}
          />
        )}
      </div>

      {/* 右側: 次の問題へ / 結果を見るボタン */}
      <div className="flex items-center justify-end" style={{ minWidth: '25%', marginBottom: 'min(8vw, 8vh)' }}>
        {showNextButton && isAnswered && (
          <ImageButton
            src={isLastQuestion ? './data/images/ui/btn_result.png' : './data/images/ui/btn_next.png'}
            alt={isLastQuestion ? '結果を見る' : '次の問題へ'}
            label={isLastQuestion ? '結果を見る' : '次の問題へ'}
            onClick={onNextClick}
            height="min(10vw, 10vh)"
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

  // 顔当て問題かどうかで全体レイアウトを変える
  const isFaceQuiz = questionType === 'face';

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

  // 顔当て問題用のレイアウト（横4:縦3）
  if (isFaceQuiz) {
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
          returnToTitle={returnToTitle}
        />

        {/* 水平線 */}
        <div style={{ height: '2%', display: 'flex', alignItems: 'center' }}>
          <img
            src="./data/images/ui/hr.png"
            alt=""
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* 中央エリア（横4:縦3のメインコンテンツ） */}
        <div
          className="flex items-center justify-center"
          style={{ flex: 1, minHeight: 0 }}
        >
          <FaceQuizLayout
            currentQuestion={currentQuestion}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            selectedAnswer={selectedAnswer}
            selectAnswer={selectAnswer}
          />
        </div>

        {/* 下部: 操作ボタン */}
        <ControlButtonArea
          showPrevButton={!isFirstQuestion}
          showCommentButton={showCommentButton}
          showNextButton={true}
          isLastQuestion={isLastQuestion}
          isAnswered={isAnswered}
          onPrevClick={prevQuestion}
          onCommentClick={() => setIsCommentDialogOpen(true)}
          onNextClick={nextQuestion}
        />

        {/* 解説ダイアログ */}
        <CommentDialog
          isOpen={isCommentDialogOpen}
          onClose={() => setIsCommentDialogOpen(false)}
          currentQuestion={currentQuestion}
        />
      </div>
    );
  }

  // 通常問題用のレイアウト（顔当てと同様の構成）
  if (questionType === 'normal') {
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
          returnToTitle={returnToTitle}
        />

        {/* 水平線 */}
        <div style={{ height: '2%', display: 'flex', alignItems: 'center' }}>
          <img
            src="./data/images/ui/hr.png"
            alt=""
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* 中央エリア（メインコンテンツ） */}
        <div
          className="flex items-center justify-center"
          style={{ flex: 1, minHeight: 0 }}
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

        {/* 下部: 操作ボタン */}
        <ControlButtonArea
          showPrevButton={!isFirstQuestion}
          showCommentButton={showCommentButton}
          showNextButton={true}
          isLastQuestion={isLastQuestion}
          isAnswered={isAnswered}
          onPrevClick={prevQuestion}
          onCommentClick={() => setIsCommentDialogOpen(true)}
          onNextClick={nextQuestion}
        />

        {/* 解説ダイアログ */}
        <CommentDialog
          isOpen={isCommentDialogOpen}
          onClose={() => setIsCommentDialogOpen(false)}
          currentQuestion={currentQuestion}
        />
      </div>
    );
  }

  // 名前当て問題用のレイアウト（通常問題と同じレイアウト）
  return (
    <div className="w-full h-full flex flex-col p-[5%]">
      {/* ヘッダーエリア */}
      <QuizHeader
        gameStage={gameStage}
        category={category}
        genre={currentQuestion.genre}
        difficulty={currentQuestion.difficulty}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        returnToTitle={returnToTitle}
      />

      {/* 水平線 */}
      <div style={{ height: '2%', display: 'flex', alignItems: 'center' }}>
        <img
          src="./data/images/ui/hr.png"
          alt=""
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* 中央エリア（メインコンテンツ） */}
      <div
        className="flex items-center justify-center"
        style={{ flex: 1, minHeight: 0 }}
      >
        <NameQuizLayout
          currentQuestion={currentQuestion}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          selectedAnswer={selectedAnswer}
          selectAnswer={selectAnswer}
        />
      </div>

      {/* 操作ボタンエリア (10%) */}
      <ControlButtonArea
        showPrevButton={!isFirstQuestion}
        showCommentButton={showCommentButton}
        showNextButton={true}
        isLastQuestion={isLastQuestion}
        isAnswered={isAnswered}
        onPrevClick={prevQuestion}
        onCommentClick={() => setIsCommentDialogOpen(true)}
        onNextClick={nextQuestion}
      />

      {/* 解説ダイアログ */}
      <CommentDialog
        isOpen={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        currentQuestion={currentQuestion}
      />
    </div>
  );
}
