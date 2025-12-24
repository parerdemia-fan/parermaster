import { create } from 'zustand';
import type { RawQuestion, ProcessedQuestion, Talent, ScreenType, QuizState, GameStage, Category, Achievement } from '../types';
import { DEV_MODE } from '../config';
import { buildTalentNameMap } from '../utils/talentIconParser';

// 各問題の回答状態を保持する型
interface AnswerRecord {
  selectedAnswer: number;
  isCorrect: boolean;
}

// アチーブメント定義（座標はvw/vh単位で指定）
const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'wa_face_name_perfect',
    name: 'バゥ寮の顔なじみ',
    description: '顔名前当て・バゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_wa1.png',
    unlocked: false,
    x: 15,  // 左上
    y: 9.5,
    w: 8,
    h: 8,
  },
  {
    id: 'me_face_name_perfect',
    name: 'ミュゥ寮の顔なじみ',
    description: '顔名前当て・ミュゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_me1.png',
    unlocked: false,
    x: 32,  // 右上
    y: 9.5,
    w: 8,
    h: 8,
  },
  {
    id: 'co_face_name_perfect',
    name: 'クゥ寮の顔なじみ',
    description: '顔名前当て・クゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_co1.png',
    unlocked: false,
    x: 15,  // 左下
    y: 20.5,
    w: 8,
    h: 8,
  },
  {
    id: 'wh_face_name_perfect',
    name: 'ウィニー寮の顔なじみ',
    description: '顔名前当て・ウィニー寮を全問正解',
    imagePath: './data/images/achievement/medal_wh1.png',
    unlocked: false,
    x: 32,  // 右下
    y: 20.5,
    w: 8,
    h: 8,
  },
  {
    id: 'all_face_name_perfect',
    name: 'パレ学の顔なじみ',
    description: '顔名前当て・すべてを全問正解',
    imagePath: './data/images/achievement/medal_parer1.png',
    unlocked: false,
    x: 22.5,
    y: 14,
    w: 10,
    h: 10,
  },
  {
    id: 'wa_face_name_advanced',
    name: 'バゥ寮推し',
    description: '顔名前当て上級・バゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_wa2.png',
    unlocked: false,
    x: 50.2,
    y: 9.5,
    w: 8,
    h: 8,
  },
  {
    id: 'me_face_name_advanced',
    name: 'ミュゥ寮推し',
    description: '顔名前当て上級・ミュゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_me2.png',
    unlocked: false,
    x: 69.2,
    y: 9.5,
    w: 8,
    h: 8,
  },
  {
    id: 'co_face_name_advanced',
    name: 'クゥ寮推し',
    description: '顔名前当て上級・クゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_co2.png',
    unlocked: false,
    x: 50.2,
    y: 20.5,
    w: 8,
    h: 8,
  },
  {
    id: 'wh_face_name_advanced',
    name: 'ウィニー寮推し',
    description: '顔名前当て上級・ウィニー寮を全問正解',
    imagePath: './data/images/achievement/medal_wh2.png',
    unlocked: false,
    x: 69.2,
    y: 20.5,
    w: 8,
    h: 8,
  },
  {
    id: 'all_face_name_advanced',
    name: 'パレ学箱推し',
    description: '顔名前当て上級・すべてを全問正解',
    imagePath: './data/images/achievement/medal_parer2.png',
    unlocked: false,
    x: 58.7,
    y: 14,
    w: 10,
    h: 10,
  },
  {
    id: 'wa_face_name_expert',
    name: 'バゥ寮ガチ勢',
    description: '顔名前当て超級・バゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_wa3.png',
    unlocked: false,
    x: 91.7,
    y: 9,
    w: 8,
    h: 8,
  },
  {
    id: 'me_face_name_expert',
    name: 'ミュゥ寮ガチ勢',
    description: '顔名前当て超級・ミュゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_me3.png',
    unlocked: false,
    x: 110.2,
    y: 9,
    w: 8,
    h: 8,
  },
  {
    id: 'co_face_name_expert',
    name: 'クゥ寮ガチ勢',
    description: '顔名前当て超級・クゥ寮を全問正解',
    imagePath: './data/images/achievement/medal_co3.png',
    unlocked: false,
    x: 91.7,
    y: 20,
    w: 8,
    h: 8,
  },
  {
    id: 'wh_face_name_expert',
    name: 'ウィニー寮ガチ勢',
    description: '顔名前当て超級・ウィニー寮を全問正解',
    imagePath: './data/images/achievement/medal_wh3.png',
    unlocked: false,
    x: 110.2,
    y: 20,
    w: 8,
    h: 8,
  },
  {
    id: 'all_face_name_expert',
    name: 'パレ学ガチ勢',
    description: '顔名前当て超級・すべてを全問正解',
    imagePath: './data/images/achievement/medal_parer3.png',
    unlocked: false,
    x: 100,
    y: 13.2,
    w: 10,
    h: 10,
  },
  {
    id: 'beginners_perfect',
    name: 'パレ学リスナー',
    description: '基本問題を全問正解',
    imagePath: './data/images/achievement/rosetta1.png',
    unlocked: false,
    x: 22.2,
    y: 32.2,
    w: 11,
    h: 11,
  },
  {
    id: 'deep_dive_10',
    name: 'パレ学常連リスナー',
    description: '深堀り問題・10問を全問正解',
    imagePath: './data/images/achievement/rosetta2.png',
    unlocked: false,
    x: 46.6,
    y: 32,
    w: 12.5,
    h: 12.5,
  },
  {
    id: 'deep_dive_30',
    name: 'パレ学ベテランリスナー',
    description: '深堀り問題・30問を全問正解',
    imagePath: './data/images/achievement/rosetta3.png',
    unlocked: false,
    x: 53.6,
    y: 31.5,
    w: 14,
    h: 14,
  },
  {
    id: 'deep_dive_50',
    name: 'パレ学古参リスナー',
    description: '深堀り問題・50問を全問正解',
    imagePath: './data/images/achievement/rosetta4.png',
    unlocked: false,
    x: 60.5,
    y: 31,
    w: 15.5,
    h: 15.5,
  },
  {
    id: 'deep_dive_100',
    name: 'パレ学最古参リスナー',
    description: '深堀り問題・100問を全問正解',
    imagePath: './data/images/achievement/rosetta5.png',
    unlocked: false,
    x: 68.5,
    y: 30.5,
    w: 17,
    h: 17,
  },
  {
    id: 'ultra_deep_10',
    name: 'パレ学マニア',
    description: '超深堀り問題・10問を全問正解',
    imagePath: './data/images/achievement/trophy1.png',
    unlocked: false,
    x: 84,
    y: 34,
    w: 10,
    h: 10,
  },
  {
    id: 'ultra_deep_30',
    name: 'パレ学名誉博士',
    description: '超深堀り問題・30問を全問正解',
    imagePath: './data/images/achievement/trophy2.png',
    unlocked: false,
    x: 93.7,
    y: 32,
    w: 12,
    h: 12,
  },
  {
    id: 'ultra_deep_50',
    name: 'パレ学名誉教授',
    description: '超深堀り問題・50問を全問正解',
    imagePath: './data/images/achievement/trophy3.png',
    unlocked: false,
    x: 103.5,
    y: 30.2,
    w: 14,
    h: 14,
  },
  {
    id: 'ultra_deep_100',
    name: 'パレ学名誉理事長',
    description: '超深堀り問題・100問を全問正解',
    imagePath: './data/images/achievement/trophy4.png',
    unlocked: false,
    x: 113.5,
    y: 28.1,
    w: 16,
    h: 16,
  },
  {
    id: 'palegaku_freak',
    name: 'パレ学フリーク',
    description: '入門試験を完全制覇',
    imagePath: './data/images/achievement/crown1.png',
    unlocked: false,
    x: 16,
    y: 44,
    w: 23,
    h: 23,
    dependsOn: ['all_face_name_perfect', 'beginners_perfect'],
  },
  {
    id: 'palegaku_sommelier',
    name: 'パレ学ソムリエ',
    description: '入門試験・実力試験を完全制覇',
    imagePath: './data/images/achievement/crown2.png',
    unlocked: false,
    x: 50.5,
    y: 40,
    w: 26,
    h: 28,
    dependsOn: ['all_face_name_perfect', 'beginners_perfect', 'all_face_name_advanced', 'deep_dive_100'],
  },
  {
    id: 'palegaku_master',
    name: 'パレ学マスター',
    description: '全ての試験を完全制覇',
    imagePath: './data/images/achievement/crown3.png',
    unlocked: false,
    x: 88,
    y: 35,
    w: 33,
    h: 33,
    dependsOn: ['all_face_name_perfect', 'beginners_perfect', 'all_face_name_advanced', 'deep_dive_100', 'all_face_name_expert', 'ultra_deep_100'],
  },
];

// LocalStorageのキー
const STORAGE_KEY = 'parermaster_achievements';

/**
 * 髪色の類似グループ
 * 同じ配列内の髪色は「似ている」と判定される
 */
const SIMILAR_HAIR_COLOR_GROUPS: { color: string, similar: string[] }[] = [
  { color: 'silver', similar: ['lightblue'] },
  { color: 'lightblue', similar: ['silver', 'blue'] },
  { color: 'blue', similar: ['lightblue', 'darkblue'] },
  { color: 'green', similar: [] },
  { color: 'darkblue', similar: ['blue', 'purple'] },
  { color: 'purple', similar: ['darkblue'] },
  { color: 'darkpink', similar: ['pink', 'red'] },
  { color: 'pink', similar: ['red', 'darkpink'] },
  { color: 'gold', similar: ['yellow'] },
  { color: 'yellow', similar: ['gold'] },
  { color: 'black', similar: ['darkblue'] },
];

/**
 * 指定した髪色と似ている髪色のリストを取得する（自身を除く）
 * @param hairColor 基準の髪色
 * @returns 似ている髪色のリスト（自身を除く）
 */
const getSimilarHairColors = (hairColor: string): string[] => {
  const group = SIMILAR_HAIR_COLOR_GROUPS.find(g => g.color === hairColor);
  return group ? group.similar : [];
};

const SIMILAR_HAIR_STYLE_GROUPS: { style: string, similar: string[] }[] = [
  { style: 'ロング', similar: ['お団子ロング', 'ロングツインテール', '三つ編み'] },
  { style: 'ショート', similar: ['お団子ショート', 'ショートツインテール'] },
  { style: 'お団子ロング', similar: ['お団子ショート', 'ロング', 'ロングツインテール'] },
  { style: 'お団子ショート', similar: ['お団子ロング', 'ショート', 'ショートツインテール'] },
  { style: 'ロングツインテール', similar: ['ロング', 'お団子ロング', '三つ編み'] },
  { style: 'ショートツインテール', similar: ['ショート', 'お団子ショート'] },
  { style: '三つ編み', similar: ['ロング', 'お団子ロング', 'ロングツインテール'] },
  { style: 'ポニーテール', similar: ['ロングツインテール', 'お団子ロング', 'ショート'] },
]
/**
 * 指定した髪型と似ている髪型のリストを取得する（自身を除く）
 * @param hairStyle 基準の髪型
 * @returns 似ている髪型のリスト（自身を除く）
 */
const getSimilarHairStyles = (hairStyle: string): string[] => {
  const group = SIMILAR_HAIR_STYLE_GROUPS.find(g => g.style === hairStyle);
  return group ? group.similar : [];
};

interface GameState {
  screen: ScreenType;
  rawQuestions: RawQuestion[];    // JSONから読み込んだ生データ
  talents: Talent[];              // タレントデータ
  questions: ProcessedQuestion[]; // 処理済み問題データ（ゲーム中に使用）
  currentIndex: number;
  quizState: QuizState;
  selectedAnswer: number | null;
  correctCount: number;
  answerRecords: AnswerRecord[];  // 各問題の回答履歴
  questionCount: number; // 選択された出題数
  questionRange: string; // 出題範囲
  category: Category; // カテゴリー
  selectedTalent: Talent | null;  // 詳細表示中のタレント
  gameStage: GameStage; // ステージ
  achievements: Achievement[];    // アチーブメント一覧
  newAchievements: Achievement[]; // 新規取得アチーブメント（結果画面で表示）

  // Actions
  loadQuestions: () => Promise<void>;
  getQuestionCount: (category: Category) => number;
  setQuestionCount: (count: number) => void;
  setQuestionRange: (questionRange: string) => void;
  setCategory: (category: Category) => void;
  setGameStage: (gameStage: GameStage) => void;
  startGame: () => void;
  selectAnswer: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  returnToTitle: () => void;
  showSetting: () => void;
  showTalentList: () => void;
  showTalentDetail: (talent: Talent) => void;
  backToTalentList: () => void;
  showHelp: () => void;
  showAchievement: () => void;
  loadAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  checkAchievements: () => void;
}

/**
 * 配列をシャッフルする（Fisher-Yatesアルゴリズム）
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 空の選択肢をタレント名で補完する
 * @param answers 元の選択肢配列
 * @param talents タレントリスト
 * @returns 補完済みの選択肢配列
 */
export const fillEmptyAnswers = (answers: string[], talents: Talent[], dormitory: string): string[] => {
  const result = [...answers];
  const usedNames = new Set(result.filter(a => a !== ''));

  // シャッフルしたタレントリストから選択
  const shuffledTalents = shuffleArray(talents);
  let talentIndex = 0;

  for (let i = 0; i < result.length; i++) {
    // result[i]が寮生名で、それが出題範囲の寮生でないなら空にする
    if (dormitory !== 'all') {
      const talent = talents.find(t => t.name === result[i]);
      if (talent && talent.student_id.indexOf(dormitory.toUpperCase()) === -1) {
        result[i] = '';
      }
    }

    if (result[i] === '') {
      // 重複しないタレント名を探す
      while (talentIndex < shuffledTalents.length) {
        // 出題範囲の寮でフィルタリング
        if (dormitory !== 'all' && shuffledTalents[talentIndex].student_id.indexOf(dormitory.toUpperCase()) === -1) {
          talentIndex++;
          continue;
        }
        const talentName = shuffledTalents[talentIndex].name;
        if (!usedNames.has(talentName)) {
          result[i] = talentName;
          usedNames.add(talentName);
          talentIndex++;
          break;
        }
        talentIndex++;
      }
    }
  }

  return result;
};

/**
 * 生の問題データを処理済みデータに変換する
 * @param rawQuestion 生の問題データ
 * @param talents タレントリスト
 * @returns 処理済み問題データ
 */
export const processQuestion = (rawQuestion: RawQuestion, talents: Talent[], dormitory: string): ProcessedQuestion => {
  // 空の選択肢をタレント名で補完
  const filledAnswers = fillEmptyAnswers(rawQuestion.answers, talents, dormitory);

  // 正解は常にanswers[0]
  const correctAnswer = filledAnswers[0];

  // 選択肢を並べ替え（sort_answersがtrueの場合は昇順ソート、それ以外はシャッフル）
  let processedAnswers: string[];
  if (rawQuestion.sort_answers) {
    processedAnswers = [...filledAnswers].sort((a, b) => a.localeCompare(b, 'ja'));
  } else {
    processedAnswers = shuffleArray(filledAnswers);
  }

  // 正解のインデックスを特定
  const correctIndex = processedAnswers.indexOf(correctAnswer);

  return {
    questionType: 'normal',
    question: rawQuestion.question,
    answers: processedAnswers,
    correctIndex,
    comment: rawQuestion.comment,
    sourceUrl: rawQuestion.source_url,
    hideIcon: rawQuestion.hide_icon,
    difficulty: rawQuestion.difficulty || 1,
    category: rawQuestion.category,
    genre: rawQuestion.genre,
    questioner: rawQuestion.questioner,
  };
};

/**
 * タレントから顔当て問題を生成する
 * @param talent 正解のタレント
 * @param otherTalents 不正解選択肢用のタレント（3人）
 * @returns 処理済み問題データ
 */
export const generateFaceQuestion = (talent: Talent, otherTalents: Talent[], difficulty: number): ProcessedQuestion => {
  // 正解タレントを含む4人分のデータ
  const allTalents = [talent, ...otherTalents];
  const allData = allTalents.map(t => ({
    imagePath: `./data/images/kv/sq/${t.student_id}.png`,
    name: t.name,
  }));

  // データをシャッフル
  const shuffledData = shuffleArray(allData);
  const correctImagePath = `./data/images/kv/sq/${talent.student_id}.png`;
  const correctIndex = shuffledData.findIndex(d => d.imagePath === correctImagePath);

  return {
    questionType: 'face',
    question: talent.name,
    answers: shuffledData.map(d => d.imagePath), // 画像パスを選択肢として使用
    correctIndex,
    answerImages: shuffledData.map(d => d.imagePath),
    answerTalentNames: shuffledData.map(d => d.name),
    talentProfile: {
      dormitory: talent.dormitory,
      dream: talent.dream,
    },
    talentKana: talent.kana,
    difficulty,
    genre: '顔当て',
  };
};

/**
 * タレントから名前当て問題を生成する
 * @param talent 正解のタレント
 * @param otherTalents 不正解選択肢用のタレント（3人）
 * @returns 処理済み問題データ
 */
export const generateNameQuestion = (talent: Talent, otherTalents: Talent[], difficulty: number): ProcessedQuestion => {
  // 正解タレントを含む4人分のデータ
  const allTalents = [talent, ...otherTalents];
  const allData = allTalents.map(t => ({
    name: t.name,
    studentId: t.student_id,
  }));

  // データをシャッフル
  const shuffledData = shuffleArray(allData);
  const correctIndex = shuffledData.findIndex(d => d.name === talent.name);

  return {
    questionType: 'name',
    question: talent.name, // 内部的には名前を保持（表示には使わない）
    answers: shuffledData.map(d => d.name),
    correctIndex,
    answerStudentIds: shuffledData.map(d => d.studentId),
    talentImagePath: `./data/images/kv/sq/${talent.student_id}.png`,
    talentProfile: {
      dormitory: talent.dormitory,
      dream: talent.dream,
    },
    difficulty,
    genre: '名前当て',
  };
};

/**
 * タレントリストから顔当て/名前当て問題を生成する
 * 各タレントに対してランダムに顔当てか名前当てを選択
 * @param talents タレントリスト
 * @returns 処理済み問題データの配列
 */
export const generateTalentQuestions = (talents: Talent[], selectedTalents: Talent[]): ProcessedQuestion[] => {
  const questions: ProcessedQuestion[] = [];
  const shuffledTalents = shuffleArray(selectedTalents);

  for (const talent of shuffledTalents) {
    // このタレント以外から3人選ぶ
    const otherTalents = shuffleArray(
      talents.filter(t => t.student_id !== talent.student_id)
    ).slice(0, 3);

    if (otherTalents.length < 3) continue; // 選択肢が足りない場合はスキップ

    // ランダムに顔当てか名前当てを選択
    const isFaceQuestion = Math.random() < 0.5;

    if (isFaceQuestion) {
      questions.push(generateFaceQuestion(talent, otherTalents, 1));
    } else {
      questions.push(generateNameQuestion(talent, otherTalents, 1));
    }
  }

  return questions;
};

/**
 * 中級用: 髪色が同じまたは似ているタレントを優先して選択肢に使う顔当て/名前当て問題を生成する
 * 優先順位: 1. 同じ髪色 → 2. 似た髪色 → 3. ランダム
 * @param talents タレントリスト
 * @returns 処理済み問題データの配列
 */
export const generateTalentQuestionsIntermediate = (talents: Talent[], selectedTalents: Talent[]): ProcessedQuestion[] => {
  const questions: ProcessedQuestion[] = [];
  const shuffledTalents = shuffleArray(selectedTalents);

  for (const talent of shuffledTalents) {
    const otherTalents = talents.filter(t => t.student_id !== talent.student_id);

    // 1. 同じ髪色のタレント
    const sameHairColorTalents = shuffleArray(
      otherTalents.filter(t => t.hair_color === talent.hair_color)
    );

    // 2. 似た髪色のタレント
    const similarColors = getSimilarHairColors(talent.hair_color);
    const similarHairColorTalents = shuffleArray(
      otherTalents.filter(t => similarColors.includes(t.hair_color))
    );

    // 3. 同じ髪型のタレント
    const sameHairStyleTalents = shuffleArray(
      otherTalents.filter(t => t.hair_style === talent.hair_style)
    );
    // 4. 似た髪型のタレント
    const similarStyles = getSimilarHairStyles(talent.hair_style);
    const similarHairStyleTalents = shuffleArray(
      otherTalents.filter(t => similarStyles.includes(t.hair_style))
    );

    // 5. その他のタレント
    const remainingTalents = shuffleArray(
      otherTalents.filter(t =>
        t.hair_color !== talent.hair_color && !similarColors.includes(t.hair_color) && t.hair_style !== talent.hair_style && !similarStyles.includes(t.hair_style)
      )
    );

    // 優先順位に従って3人選ぶ
    const selectedOthers: Talent[] = [];
    const candidates = [...sameHairColorTalents, ...similarHairColorTalents, ...sameHairStyleTalents, ...similarHairStyleTalents, ...remainingTalents];

    for (const candidate of candidates) {
      if (selectedOthers.length >= 3) break;
      if (!selectedOthers.some(t => t.student_id === candidate.student_id)) {
        selectedOthers.push(candidate);
      }
    }

    if (selectedOthers.length < 3) continue; // 選択肢が足りない場合はスキップ

    // ランダムに顔当てか名前当てを選択
    const isFaceQuestion = Math.random() < 0.5;

    if (isFaceQuestion) {
      questions.push(generateFaceQuestion(talent, selectedOthers, 3));
    } else {
      questions.push(generateNameQuestion(talent, selectedOthers, 3));
    }
  }

  return questions;
};

/**
 * 上級用: シルエットモードの顔当て/名前当て問題を生成する
 * @param talents タレントリスト
 * @returns 処理済み問題データの配列
 */
export const generateTalentQuestionsAdvanced = (talents: Talent[], selectedTalents: Talent[]): ProcessedQuestion[] => {
  const questions: ProcessedQuestion[] = [];
  const shuffledTalents = shuffleArray(selectedTalents);

  for (const talent of shuffledTalents) {
    const otherTalents = talents.filter(t => t.student_id !== talent.student_id);

    // 1. 同じ髪型のタレント
    const sameHairStyleTalents = shuffleArray(
      otherTalents.filter(t => t.hair_style === talent.hair_style)
    );

    // 2. 似た髪型のタレント
    const similarStyles = getSimilarHairStyles(talent.hair_style);
    const similarHairStyleTalents = shuffleArray(
      otherTalents.filter(t => similarStyles.includes(t.hair_style))
    );

    // 3. 同じ髪色のタレント
    const sameHairColorTalents = shuffleArray(
      otherTalents.filter(t => t.hair_color === talent.hair_color)
    );

    // 3. 似た髪色のタレント
    const similarColors = getSimilarHairColors(talent.hair_color);
    const similarHairColorTalents = shuffleArray(
      otherTalents.filter(t => similarColors.includes(t.hair_color))
    );

    // 4. その他のタレント
    const remainingTalents = shuffleArray(
      otherTalents.filter(t =>
        t.hair_style !== talent.hair_style && !similarStyles.includes(t.hair_style) && t.hair_color !== talent.hair_color && !similarColors.includes(t.hair_color)
      )
    );

    // 優先順位に従って3人選ぶ
    const selectedOthers: Talent[] = [];
    const candidates = [...sameHairStyleTalents, ...similarHairStyleTalents, ...sameHairColorTalents, ...similarHairColorTalents, ...remainingTalents];

    for (const candidate of candidates) {
      if (selectedOthers.length >= 3) break;
      if (!selectedOthers.some(t => t.student_id === candidate.student_id)) {
        selectedOthers.push(candidate);
      }
    }

    if (selectedOthers.length < 3) continue; // 選択肢が足りない場合はスキップ

    // ランダムに顔当てか名前当てを選択    
    const isFaceQuestion = Math.random() < 0.5;
    if (isFaceQuestion) {
      const question = generateFaceQuestion(talent, selectedOthers, 5);
      question.isSilhouette = true;
      questions.push(question);
    } else {
      const question = generateNameQuestion(talent, selectedOthers, 5);
      question.isSilhouette = true;
      questions.push(question);
    }
  }

  return questions;
};

/**
 * レベルごとの総問題数を計算する
 * @param rawQuestions 生の問題データ
 * @param talents タレントリスト
 * @param level ゲームレベル
 * @returns 総問題数
 */
export const getTotalQuestions = (
  rawQuestions: RawQuestion[],
  category: Category,
): number => {
  if (category === '深堀り問題') {
    // difficulty 1〜2の通常問題
    const normalCount = rawQuestions.filter(q =>
      q.difficulty !== undefined && q.difficulty >= 1 && q.difficulty <= 2
    ).length;
    return normalCount;
  } else if (category === '超深堀り問題') {
    // difficulty 3〜5の通常問題
    const normalCount = rawQuestions.filter(q =>
      q.difficulty !== undefined && q.difficulty >= 3 && q.difficulty <= 5
    ).length;
    return normalCount;
  }
  return 0;
};

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'title',
  rawQuestions: [],
  talents: [],
  questions: [],
  currentIndex: 0,
  quizState: 'answering',
  selectedAnswer: null,
  correctCount: 0,
  answerRecords: [],
  questionCount: 10,
  questionRange: 'all',
  gameLevel: 'beginner',
  selectedTalent: null,
  gameStage: '入門試験',
  category: '顔名前当て',
  achievements: [...ACHIEVEMENT_DEFINITIONS],
  newAchievements: [],

  loadQuestions: async () => {
    // 開発モードの場合は動作確認用データを使用
    const questionsPath = DEV_MODE ? './data/questions_dev.json' : './data/questions.json';
    const [questionsRes, talentsRes] = await Promise.all([
      fetch(questionsPath),
      fetch('./data/talents.json'),
    ]);
    const rawQuestions: RawQuestion[] = await questionsRes.json();
    const talents: Talent[] = await talentsRes.json();

    // タレント名マップを構築（アイコン表示用）
    buildTalentNameMap(talents);

    set({ rawQuestions, talents });

    // アチーブメントをロード
    get().loadAchievements();
  },

  loadAchievements: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const unlockedIds: string[] = JSON.parse(saved);
        const achievements = ACHIEVEMENT_DEFINITIONS.map(achievement => ({
          ...achievement,
          unlocked: unlockedIds.includes(achievement.id),
          unlockedAt: unlockedIds.includes(achievement.id) ? new Date().toISOString() : undefined,
        }));
        set({ achievements });
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  },

  unlockAchievement: (achievementId: string) => {
    const { achievements } = get();
    const achievement = achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.unlocked) {
      return; // すでに取得済み
    }

    // アチーブメントを解放
    const updatedAchievements = achievements.map(a =>
      a.id === achievementId
        ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
        : a
    );

    const newAchievement = updatedAchievements.find(a => a.id === achievementId)!;

    set(state => ({
      achievements: updatedAchievements,
      newAchievements: [...state.newAchievements, newAchievement],
    }));

    // LocalStorageに保存
    try {
      const unlockedIds = updatedAchievements
        .filter(a => a.unlocked)
        .map(a => a.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  },

  checkAchievements: () => {
    const { category, questionRange, questions, answerRecords, questionCount } = get();

    // 全問正解かチェック
    const isPerfect = answerRecords.length === questions.length &&
      answerRecords.every(record => record.isCorrect);

    if (!isPerfect) {
      return;
    }

    // 顔名前当て系のアチーブメント
    if (category === '顔名前当て' || category === '顔名前当て上級' || category === '顔名前当て超級') {
      let achievementMap: Record<string, string>;
      if (category === '顔名前当て') {
        achievementMap = {
          'wa': 'wa_face_name_perfect',
          'me': 'me_face_name_perfect',
          'co': 'co_face_name_perfect',
          'wh': 'wh_face_name_perfect',
          'all': 'all_face_name_perfect',
        };
      } else if (category === '顔名前当て上級') {
        achievementMap = {
          'wa': 'wa_face_name_advanced',
          'me': 'me_face_name_advanced',
          'co': 'co_face_name_advanced',
          'wh': 'wh_face_name_advanced',
          'all': 'all_face_name_advanced',
        };
      } else { // 顔名前当て超級
        achievementMap = {
          'wa': 'wa_face_name_expert',
          'me': 'me_face_name_expert',
          'co': 'co_face_name_expert',
          'wh': 'wh_face_name_expert',
          'all': 'all_face_name_expert',
        };
      }

      const achievementId = achievementMap[questionRange];
      if (achievementId) {
        get().unlockAchievement(achievementId);
      }
    }

    // 基本問題のアチーブメント
    if (category === '基本問題') {
      get().unlockAchievement('beginners_perfect');
    }

    // 深堀り問題のアチーブメント
    if (category === '深堀り問題') {
      if (questionCount === 10) {
        get().unlockAchievement('deep_dive_10');
      } else if (questionCount === 30) {
        get().unlockAchievement('deep_dive_30');
      } else if (questionCount === 50) {
        get().unlockAchievement('deep_dive_50');
      } else if (questionCount === 100) {
        get().unlockAchievement('deep_dive_100');
      }
    }

    // 超深堀り問題のアチーブメント
    if (category === '超深堀り問題') {
      if (questionCount === 10) {
        get().unlockAchievement('ultra_deep_10');
      } else if (questionCount === 30) {
        get().unlockAchievement('ultra_deep_30');
      } else if (questionCount === 50) {
        get().unlockAchievement('ultra_deep_50');
      } else if (questionCount === 100) {
        get().unlockAchievement('ultra_deep_100');
      }
    }
  },

  setQuestionCount: (count: number) => {
    set({ questionCount: count });
  },

  setCategory: (category: Category) => {
    set({ category });
  },

  setQuestionRange: (questionRange: string) => {
    set({ questionRange });
  },

  setGameStage: (gameStage: GameStage) => {
    set({ gameStage });
  },

  startGame: () => {
    const { rawQuestions, talents, questionRange, category, questionCount } = get();
    let allQuestions: ProcessedQuestion[] = [];

    const rangedTalents = shuffleArray(talents.filter(t => {
      if (questionRange === 'all') return true;
      return t.student_id.toUpperCase().includes(questionRange.toUpperCase());
    }));

    if (category === '顔名前当て') {
      allQuestions = generateTalentQuestions(talents, rangedTalents);
    } else if (category === '顔名前当て上級') {
      // 顔名前当て上級: 全難易度の問題を使用
      allQuestions = generateTalentQuestionsIntermediate(talents, rangedTalents);
    } else if (category === '顔名前当て超級') {
      allQuestions = generateTalentQuestionsAdvanced(talents, rangedTalents);
    } else if (category === '基本問題') {
      // 難易度0の通常問題を全て順番に出題
      const filteredQuestions = rawQuestions.filter(q => q.difficulty === 0);
      allQuestions = filteredQuestions.map(q => processQuestion(q, talents, questionRange));
    } else if (category.indexOf('深堀り問題') !== -1) {
      // 難易度と出題範囲でフィルタリング
      const difficultyMin = category === '深堀り問題' ? 1 : 3;
      const difficultyMax = category === '深堀り問題' ? 2 : 5;
      let filteredQuestions = rawQuestions.filter(q =>
        q.difficulty !== undefined && q.difficulty >= difficultyMin && q.difficulty <= difficultyMax
      );
      // シャッフル
      filteredQuestions = shuffleArray(filteredQuestions);
      // 出題数で絞る
      filteredQuestions = filteredQuestions.slice(0, questionCount);
      // difficultyでソート
      filteredQuestions.sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0));
      // 処理済み問題に変換
      allQuestions = filteredQuestions.map(q => processQuestion(q, talents, questionRange));
    }

    // allQuestionsにindexを付ける
    allQuestions = allQuestions.map((q, i) => ({ ...q, index: i }));

    set({
      screen: 'quiz',
      currentIndex: 0,
      quizState: 'answering',
      selectedAnswer: null,
      correctCount: 0,
      answerRecords: [],
      questions: allQuestions,
      newAchievements: [], // 新規アチーブメントをリセット
    });
  },

  selectAnswer: (index: number) => {
    const { questions, currentIndex, correctCount, answerRecords } = get();
    const currentQuestion = questions[currentIndex];
    const isCorrect = index === currentQuestion.correctIndex;

    // 回答履歴を更新
    const newRecords = [...answerRecords];
    newRecords[currentIndex] = { selectedAnswer: index, isCorrect };

    set({
      selectedAnswer: index,
      quizState: 'answered',
      correctCount: isCorrect ? correctCount + 1 : correctCount,
      answerRecords: newRecords,
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions, answerRecords } = get();
    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isLastQuestion) {
      // ゲーム終了時にアチーブメント判定
      get().checkAchievements();
      set({ screen: 'result' });
    } else {
      const nextIndex = currentIndex + 1;
      const nextRecord = answerRecords[nextIndex];

      // 次の問題が既に回答済みなら、その状態を復元
      if (nextRecord) {
        set({
          currentIndex: nextIndex,
          quizState: 'answered',
          selectedAnswer: nextRecord.selectedAnswer,
        });
      } else {
        set({
          currentIndex: nextIndex,
          quizState: 'answering',
          selectedAnswer: null,
        });
      }
    }
  },

  prevQuestion: () => {
    const { currentIndex, answerRecords } = get();
    if (currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;
    const prevRecord = answerRecords[prevIndex];

    set({
      currentIndex: prevIndex,
      quizState: 'answered',
      selectedAnswer: prevRecord?.selectedAnswer ?? null,
    });
  },

  returnToTitle: () => {
    set({
      screen: 'title',
      currentIndex: 0,
      quizState: 'answering',
      selectedAnswer: null,
      correctCount: 0,
      answerRecords: [],
      selectedTalent: null,
    });
  },

  showSetting: () => {
    set({ screen: 'setting' });
  },

  showTalentList: () => {
    set({ screen: 'talents' });
  },

  showTalentDetail: (talent: Talent) => {
    set({
      screen: 'talent-detail',
      selectedTalent: talent,
    });
  },

  backToTalentList: () => {
    set({
      screen: 'talents',
      selectedTalent: null,
    });
  },

  showHelp: () => {
    set({ screen: 'help' });
  },
  getQuestionCount: (category: Category) => {
    const { rawQuestions } = get();
    if (category === '基本問題') {
      // difficulty 0の通常問題
      const count = rawQuestions.filter(q =>
        q.difficulty === 0
      ).length;
      return count;
    } else if (category === '深堀り問題') {
      // difficulty 1〜2の通常問題
      const count = rawQuestions.filter(q =>
        q.difficulty !== undefined && q.difficulty >= 1 && q.difficulty <= 2
      ).length;
      return count;
    } else if (category === '超深堀り問題') {
      // difficulty 3〜5の通常問題
      const count = rawQuestions.filter(q =>
        q.difficulty !== undefined && q.difficulty >= 3 && q.difficulty <= 5
      ).length;
      return count;
    }
    return 0;
  },
  showAchievement: () => {
    set({ screen: 'achievement' });
  },
}));
