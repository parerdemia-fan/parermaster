// タレントデータ
export type Talent = {
  name: string;
  kana: string;
  name_separated: string;
  kana_separated: string;
  dormitory: string;
  student_id: string;
  intro: string;
  dream: string;
  hashtags: string[];
  hobbies: string[];
  skills: string[];
  favorites: string[];
  fan_name: string;
  fan_mark: string;
  birthday: string;
  height: number;
  hair_color: string;
  hair_style: string;
  url: string;
  tiktok_url: string;
  youtube_url: string;
  x_url: string;
  marshmallow_url: string;
  awards: string[];
};

// 問題データ（JSONから読み込んだ生データ）
export type RawQuestion = {
  question: string;
  answers: string[];
  category?: string;       // 問題のカテゴリ（プロフィール、エピソード等）
  genre?: string;          // 問題のジャンル（コラボ、パレ学、エピソード等）
  sort_answers?: boolean;
  comment?: string;
  image?: string | null;
  hide_icon?: boolean;
  source_url?: string;
  difficulty: number;  // 問題の難易度（1-5）
  dormitory?: string;    // 関連する寮（出題範囲フィルタ用）
  questioner?: string;  // 出題者名（任意）
};

// 問題タイプ
export type QuestionType = 'normal' | 'face' | 'name';

// 処理済み問題データ（ゲーム中に使用）
export type ProcessedQuestion = {
  index?: number;           // 問題番号（0始まり）
  questionType: QuestionType;  // 問題タイプ
  question: string;
  answers: string[];        // シャッフル/ソート済みの選択肢
  correctIndex: number;     // 正解の選択肢のインデックス
  comment?: string;
  sourceUrl?: string;       // 情報源URL
  hideIcon?: boolean;       // 回答前にアイコンを非表示にするか
  difficulty: number;      // 問題の難易度（1-5）
  category?: string;        // 問題のカテゴリ（プロフィール、エピソード等）
  genre?: string;           // 問題のジャンル（コラボ、パレ学、エピソード等）
  // 顔当て/名前当て用の追加情報
  talentImagePath?: string;    // 正解タレントの画像パス（名前当てで出題画像として使用）
  answerImages?: string[];     // 選択肢の画像パス配列（顔当てで選択肢として使用）
  answerTalentNames?: string[]; // 選択肢のタレント名配列（顔当てで回答後に表示）
  answerStudentIds?: string[];  // 選択肢のタレント学籍番号配列（名前当てでアイコン表示に使用）
  talentProfile?: {            // 出題時に表示するプロフィール情報
    dormitory: string;         // 所属寮
    dream: string;             // 将来の夢
  };
  talentKana?: string;         // タレント名のフリガナ（顔当て問題用）
  isSilhouette?: boolean;      // 画像をシルエット表示するか
  questioner?: string;        // 出題者名（任意）
};

export type ExamScope = 'バゥ寮' | 'ミュゥ寮' | 'クゥ寮' | 'ウィニー寮' | 'すべて'
export type QuestionCount = 10 | 15 | 30 | 50 | 100
export type Accuracy = 'low' | 'medium' | 'high'; // low: ~74%, medium: 75~99%, high: 100%

// 出題範囲の選択肢
export const QUESTION_EXAM_SCOPE_OPTIONS: { examScope: ExamScope; value: string }[] = [
  { examScope: 'バゥ寮', value: 'wa' },
  { examScope: 'ミュゥ寮', value: 'me' },
  { examScope: 'クゥ寮', value: 'co' },
  { examScope: 'ウィニー寮', value: 'wh' },
  { examScope: 'すべて', value: 'all' },
];

// ステージ（入門試験、実力試験）
export type GameStage = '入門試験' | '実力試験' | 'マスター試験';

// カテゴリー
export type Category = '顔名前当て' | '顔名前当て上級' | '顔名前当て超級' | '基本問題' | '深堀り問題' | '超深堀り問題'

// 画面状態
export type ScreenType = 'title' | 'setting' | 'quiz' | 'result' | 'talents' | 'talent-detail' | 'help' | 'achievement';

// クイズ画面の状態
export type QuizState = 'answering' | 'answered';

// アチーブメント
export type Achievement = {
  id: string;           // アチーブメントID
  name: string;         // アチーブメント名
  description: string;  // 説明
  imagePath: string;    // 画像パス
  unlocked: boolean;    // 取得済みかどうか
  unlockedAt?: string;  // 取得日時
  x: number;            // 配置位置X座標（vw/vh単位）
  y: number;            // 配置位置Y座標（vw/vh単位）
  w: number;            // 画像幅（vw/vh単位）
  h: number;            // 画像高さ（vw/vh単位）
  dependsOn?: string[]; // 依存する他のアチーブメントID（すべて取得済みの場合のみ表示）
};

export type ResultMessage = {
  category: Category;
  examScope?: ExamScope;
  questionCount?: QuestionCount;
  accuracy: Accuracy;
  message: string;
};
