import { useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Category } from '../types';
import { QUESTION_DORMITORY_OPTIONS } from '../types';
import { ThreePatchButton } from './ThreePatchButton';

export function SettingScreen() {
  const {
    loadQuestions,
    startGame,
    gameStage,
    questionRange,
    questionCount,
    getQuestionCount,
    setQuestionRange,
    setQuestionCount,
    setCategory,
    category,
    returnToTitle,
  } = useGameStore();

  // コンポーネントマウント時に問題データを読み込む
  useEffect(() => {
    loadQuestions();
    initCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadQuestions]);

  // カテゴリーの選択肢
  const categoryOptions: Category[] = useMemo(() => {
    if (gameStage === '入門試験') {
      return [
        '顔名前当て',
        '基本問題',
      ];
    } else if (gameStage === '実力試験') {
      return [
        '顔名前当て上級',
        '深堀り問題',
      ];
    } else { // マスター試験
      return [
        '顔名前当て超級',
        '超深堀り問題'
      ];
    }
  }, [gameStage]);

  // categoryが選択肢外なら初期化
  const initCategory = useCallback(() => {
    if (categoryOptions.indexOf(category) === -1) {
      setCategory(categoryOptions[0]);
    }
  }, [category, categoryOptions, setCategory]);

  // 出題範囲オプション（categoryに応じて動的に変更）
  const questionRangeOptions = useMemo(() => {
    if (category.indexOf('顔名前当て') !== -1) {
      return QUESTION_DORMITORY_OPTIONS;
    } else {
      return [
        { label: 'すべて', value: 'all' }
      ];
    }
  }, [category]);

  // 出題数オプション
  const questionCountOptions = useMemo(() => {
    const count = getQuestionCount(category);
    const options = [];

    if (category === '基本問題') {
      options.push({ label: `全${count}問`, value: count });
    } else {
      // 10問
      options.push({ label: '10問', value: 10 });
      // 30問
      options.push({ label: '30問', value: 30 });
      // 50問
      options.push({ label: '50問', value: 50 });
      // 100問
      if (count >= 100) {
        options.push({ label: '100問', value: 100 });
      }
    }

    return options;
  }, [category, getQuestionCount]);

  // categoryOptionsが変わったときにcategoryを初期化
  useEffect(() => {
    initCategory();
  }, [categoryOptions, initCategory]);

  // 選択中のオプションが利用不可になった場合、最初の選択肢にリセット
  useEffect(() => {
    if (!questionRangeOptions.some(opt => opt.value === questionRange)) {
      setQuestionRange(questionRangeOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionRangeOptions]);

  // 選択中の出題数が選択肢にない場合、最初の選択肢にリセット
  useEffect(() => {
    if (questionCountOptions.length > 0 && !questionCountOptions.some(opt => opt.value === questionCount)) {
      setQuestionCount(questionCountOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionCountOptions]);


  return (
    <div
      className="w-full h-full flex flex-col items-center justify-start p-[5%] animate-fade-in relative"
      style={{
        backgroundImage: `url(./data/images/ui/dialog_setting.png)`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* カテゴリーラベル */}
      <div
        className="fixed left-1/2 -translate-x-1/2"
        style={{ top: '23.8vh' }}
      >
        <p
          className="text-center font-bold"
          style={{ fontSize: 'min(5vw, 5vh)', color: '#DDA' }}
        >
          カテゴリ
        </p>
      </div>

      {/* 出題範囲/出題数ラベル */}
      <div
        className="fixed left-1/2 -translate-x-1/2"
        style={{ top: '51.7vh' }}
      >
        <p
          className="text-center font-bold"
          style={{ fontSize: 'min(5vw, 5vh)', color: '#DDA' }}
        >
          {category.indexOf("顔名前当て") !== -1 ? '出題範囲' : '出題数'}
        </p>
      </div>

      {/* 設定エリア */}
      <div
        className="w-full flex flex-col items-center relative z-10"
        style={{ gap: '4vmin', marginBottom: '4vmin', marginTop: 'min(6vw, 6vh)' }}
      >
        {/* カテゴリー選択 */}
        <div
          className="flex flex-col items-center w-full relative"
          style={{ marginTop: 'min(31vw, 31vh)' }}
        >
          <div className="flex justify-center" style={{ gap: '3vmin' }}>
            {categoryOptions.map((option) => {
              const isSelected = category === option;
              // 2つ目のボタンはred、それ以外はblue
              const isSecond = categoryOptions.indexOf(option) === 1;
              const colorPrefix = isSecond ? 'red' : 'blue';

              return (
                <ThreePatchButton
                  key={option}
                  leftImage={`./data/images/ui/btn_${colorPrefix}_left.png`}
                  middleImage={`./data/images/ui/btn_${colorPrefix}_middle.png`}
                  rightImage={`./data/images/ui/btn_${colorPrefix}_right.png`}
                  onClick={() => setCategory(option)}
                  height="min(9vw, 9vh)"
                  fontSize="min(4vw, 4vh)"
                  isSelected={isSelected}
                  selectedBrightness={isSelected ? 1.45 : 1}
                  textColor={isSelected ? '#FFF' : '#999'}
                  className="selection-card"
                >
                  {option}
                </ThreePatchButton>
              );
            })}
          </div>
        </div>

        {/* 出題範囲選択 */}
        {category.indexOf("顔名前当て") !== -1 && (
          <div className="flex flex-col items-center absolute left-0 top-0 w-full"
            style={{ marginTop: 'min(56vw, 56vh)' }}>
            <div className="flex justify-center" style={{ gap: '2vmin' }}>
              {questionRangeOptions.map((option) => {
                const isSelected = questionRange === option.value;

                return (
                  <ThreePatchButton
                    key={option.value}
                    leftImage="./data/images/ui/btn_normal_off_left.png"
                    middleImage="./data/images/ui/btn_normal_off_middle.png"
                    rightImage="./data/images/ui/btn_normal_off_right.png"
                    onClick={() => setQuestionRange(option.value)}
                    height="min(7vw, 7vh)"
                    fontSize="min(3.2vw, 3.2vh)"
                    textColor={isSelected ? '#222' : '#fff'}
                    isSelected={isSelected}
                    selectedBrightness={isSelected ? 1.2 : 1}
                    className="selection-card"
                    style={{ filter: isSelected ? 'brightness(2.2)' : undefined }}
                  >
                    {option.label}
                  </ThreePatchButton>
                );
              })}
            </div>
          </div>
        )}

        {/* 出題数選択 */}
        {category.indexOf("顔名前当て") === -1 && (
          <div className="flex flex-col items-center absolute left-0 top-0 w-full"
            style={{ marginTop: 'min(56vw, 56vh)' }}>
            <div className="flex justify-center" style={{ gap: '2vmin' }}>
              {questionCountOptions.map((option) => {
                const isSelected = questionCount === option.value;

                return (
                  <ThreePatchButton
                    key={option.value}
                    leftImage="./data/images/ui/btn_normal_off_left.png"
                    middleImage="./data/images/ui/btn_normal_off_middle.png"
                    rightImage="./data/images/ui/btn_normal_off_right.png"
                    onClick={() => setQuestionCount(option.value)}
                    height="min(7vw, 7vh)"
                    fontSize="min(3.2vw, 3.2vh)"
                    textColor={isSelected ? '#222' : '#fff'}
                    isSelected={isSelected}
                    selectedBrightness={isSelected ? 1.2 : 1}
                    className="selection-card"
                    style={{ filter: isSelected ? 'brightness(2.2)' : undefined }}
                  >
                    {option.label}
                  </ThreePatchButton>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ボタンエリア（画面下部・横並び） */}
      <div
        className="w-full flex justify-center items-end gap-[6vmin] absolute left-0 bottom-[9%] z-10"
      >
        {/* キャンセルボタン */}
        <button
          onClick={returnToTitle}
          className="transition-opacity hover:brightness-140"
          style={{
            padding: 0,
            border: 'none',
            background: 'none',
          }}
        >
          <img
            src="./data/images/ui/btn_cancel.png"
            alt="戻る"
            style={{
              width: 'min(40vw, 40vh)',
              height: 'auto',
            }}
          />
        </button>

        {/* スタートボタン */}
        <button
          onClick={startGame}
          className={`
          transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
          hover:brightness-120
          `}
          style={{
            padding: 0,
            border: 'none',
            background: 'none',
          }}
        >
          <img
            src="./data/images/ui/btn_start.png"
            alt="スタート"
            style={{
              width: 'min(40vw, 40vh)',
              height: 'auto',
            }}
          />
        </button>

      </div>
    </div>
  );
}
