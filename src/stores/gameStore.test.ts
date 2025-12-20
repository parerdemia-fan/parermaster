import { describe, it, expect } from 'vitest';
import { shuffleArray, fillEmptyAnswers, processQuestion } from './gameStore';
import type { Talent, RawQuestion } from '../types';

// テスト用のモックタレントデータ
const createMockTalent = (overrides: Partial<Talent>): Talent => ({
  name: '',
  kana: '',
  name_separated: '',
  kana_separated: '',
  dormitory: '',
  student_id: '',
  intro: '',
  dream: '',
  hashtags: [],
  hobbies: [],
  skills: [],
  favorites: [],
  fan_name: '',
  fan_mark: '',
  birthday: '',
  height: 0,
  hair_color: '',
  hair_style: '',
  url: '',
  tiktok_url: '',
  youtube_url: '',
  x_url: '',
  marshmallow_url: '',
  awards: [],
  ...overrides,
});

const mockTalents: Talent[] = [
  createMockTalent({ name: '朧月ひかる', kana: 'オボロヅキヒカル', name_separated: '朧月 ひかる', kana_separated: 'オボロヅキ ヒカル', dormitory: 'クゥ', student_id: '25CO001', hair_color: 'darkblue', birthday: '3月16日', height: 165 }),
  createMockTalent({ name: 'シグマ・イングラム', kana: 'シグマ・イングラム', name_separated: 'シグマ・イングラム', kana_separated: 'シグマ・イングラム', dormitory: 'クゥ', student_id: '25CO002', hair_color: 'silver', birthday: '4月2日', height: 164 }),
  createMockTalent({ name: '愛乃宮ゆめ', kana: 'エノミヤユメ', name_separated: '愛乃宮 ゆめ', kana_separated: 'エノミヤ ユメ', dormitory: 'クゥ', student_id: '25CO003', hair_color: 'pink', birthday: '5月14日', height: 150 }),
  createMockTalent({ name: '桜庭羽奈', kana: 'サクラバウナ', name_separated: '桜庭 羽奈', kana_separated: 'サクラバ ウナ', dormitory: 'クゥ', student_id: '25CO004', hair_color: 'darkblue', birthday: '7月18日', height: 160 }),
];

describe('shuffleArray', () => {
  it('空配列を渡すと空配列が返る', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('要素が1つの配列はそのまま返る', () => {
    const result = shuffleArray([1]);
    expect(result).toEqual([1]);
  });

  it('元の配列を変更しない', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffleArray(original);
    expect(original).toEqual(originalCopy);
  });

  it('シャッフル後の配列は同じ要素を含む', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect(result.sort()).toEqual(original.sort());
  });

  it('シャッフル後の配列は元の配列と同じ長さ', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect(result.length).toBe(original.length);
  });

  it('複数回実行すると異なる順序になる可能性がある', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();

    // 20回シャッフルして、少なくとも2種類以上の順序が出ることを確認
    for (let i = 0; i < 20; i++) {
      const result = shuffleArray(original);
      results.add(JSON.stringify(result));
    }

    expect(results.size).toBeGreaterThan(1);
  });
});

describe('fillEmptyAnswers', () => {
  it('空文字列がない場合はそのまま返す', () => {
    const answers = ['選択肢A', '選択肢B', '選択肢C', '選択肢D'];
    const result = fillEmptyAnswers(answers, mockTalents, 'all');
    expect(result).toEqual(answers);
  });

  it('空文字列をタレント名で補完する', () => {
    const answers = ['正解', '', '', ''];
    const result = fillEmptyAnswers(answers, mockTalents, 'all');

    // 空文字列がなくなっていること
    expect(result.filter(a => a === '').length).toBe(0);
    // 正解はそのまま
    expect(result[0]).toBe('正解');
    // 4つの選択肢があること
    expect(result.length).toBe(4);
  });

  it('タレント名がそのまま使用される', () => {
    const answers = ['', '', '', ''];
    const result = fillEmptyAnswers(answers, mockTalents, 'all');

    // すべての選択肢がタレント名と一致すること
    result.forEach(answer => {
      expect(mockTalents.some(t => t.name === answer)).toBe(true);
    });
  });

  it('重複したタレント名を使用しない', () => {
    const answers = ['朧月ひかる', '', '', ''];
    const result = fillEmptyAnswers(answers, mockTalents, 'all');

    // ユニークな選択肢のみ
    const uniqueAnswers = new Set(result.map(a => a.toLowerCase()));
    expect(uniqueAnswers.size).toBe(4);
  });
});

describe('processQuestion', () => {
  it('空の選択肢を補完してシャッフルする', () => {
    const rawQuestion: RawQuestion = {
      question: 'テスト問題',
      answers: ['正解', '', '', ''],
      sort_answers: false,
      difficulty: 1,
    };
    const result = processQuestion(rawQuestion, mockTalents, 'all');

    // 空文字列がなくなっていること
    expect(result.answers.filter(a => a === '').length).toBe(0);
    // 正解が含まれていること
    expect(result.answers.includes('正解')).toBe(true);
    // correctIndexが正しいこと
    expect(result.answers[result.correctIndex]).toBe('正解');
  });

  it('sort_answersがtrueの場合は昇順ソートされる', () => {
    const rawQuestion: RawQuestion = {
      question: 'テスト問題',
      answers: ['ウ', 'ア', 'エ', 'イ'],
      sort_answers: true,
      difficulty: 1,
    };
    const result = processQuestion(rawQuestion, mockTalents, 'all');

    // 昇順にソートされていること
    const sorted = [...result.answers].sort((a, b) => a.localeCompare(b, 'ja'));
    expect(result.answers).toEqual(sorted);
    // 正解（元のanswers[0]）のインデックスが正しいこと
    expect(result.answers[result.correctIndex]).toBe('ウ');
  });

  it('コメントが引き継がれる', () => {
    const rawQuestion: RawQuestion = {
      question: 'テスト問題',
      answers: ['正解', '選択肢B', '選択肢C', '選択肢D'],
      comment: 'これは解説です',
      difficulty: 1,
    };
    const result = processQuestion(rawQuestion, mockTalents, 'all');

    expect(result.comment).toBe('これは解説です');
  });
});
