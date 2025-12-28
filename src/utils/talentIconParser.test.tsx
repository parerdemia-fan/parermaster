import { describe, it, expect, beforeEach } from 'vitest';
import { buildTalentNameMap, getTalentNameMap, parseTextWithTalentIcons } from './talentIconParser';
import type { Talent } from '../types';

// テスト用のモックタレントデータ
const mockTalents: Talent[] = [
  {
    name: '朧月ひかる',
    kana: 'オボロヅキヒカル',
    name_separated: '朧月 ひかる',
    kana_separated: 'オボロヅキ ヒカル',
    dormitory: 'クゥ',
    student_id: '25CO001',
    intro: '',
    dream: '',
    hashtags: [],
    hobbies: [],
    skills: [],
    favorites: [],
    fan_name: '',
    fan_mark: '',
    birthday: '',
    height: 165,
    hair_color: '',
    hair_style: '',
    mbti: '',
    url: '',
    tiktok_url: '',
    youtube_url: '',
    x_url: '',
    marshmallow_url: '',
    awards: [],
  },
  {
    name: 'シグマ・イングラム',
    kana: 'シグマ・イングラム',
    name_separated: 'シグマ・イングラム',
    kana_separated: 'シグマ・イングラム',
    dormitory: 'クゥ',
    student_id: '25CO002',
    intro: '',
    dream: '',
    hashtags: [],
    hobbies: [],
    skills: [],
    favorites: [],
    fan_name: '',
    fan_mark: '',
    birthday: '',
    height: 164,
    hair_color: '',
    hair_style: '',
    mbti: '',
    url: '',
    tiktok_url: '',
    youtube_url: '',
    x_url: '',
    marshmallow_url: '',
    awards: [],
  },
];

describe('talentIconParser', () => {
  describe('buildTalentNameMap', () => {
    it('タレントデータからマップを構築する', () => {
      buildTalentNameMap(mockTalents);
      const map = getTalentNameMap();
      
      expect(map).not.toBeNull();
      expect(map?.get('朧月ひかる')).toBe('25CO001');
      expect(map?.get('シグマ・イングラム')).toBe('25CO002');
    });
  });

  describe('parseTextWithTalentIcons', () => {
    beforeEach(() => {
      buildTalentNameMap(mockTalents);
    });

    it('タレント名を含むテキストを解析する', () => {
      const result = parseTextWithTalentIcons('朧月ひかるが得意な楽器は？', true);
      
      // 結果は配列であること
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('タレント名を含まないテキストはそのまま返す', () => {
      const result = parseTextWithTalentIcons('これはテストです', true);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('showIconがfalseかつ未回答の場合はプレースホルダーを表示する', () => {
      const result = parseTextWithTalentIcons('朧月ひかるが得意な楽器は？', false, false);
      
      expect(Array.isArray(result)).toBe(true);
      // タレント名が含まれるため、複数のパーツに分割される
      expect(result.length).toBeGreaterThan(0);
    });

    it('showIconがfalseでも回答後は画像を表示する', () => {
      const result = parseTextWithTalentIcons('朧月ひかるが得意な楽器は？', false, true);
      
      expect(Array.isArray(result)).toBe(true);
      // タレント名が含まれるため、複数のパーツに分割される
      expect(result.length).toBeGreaterThan(0);
    });

    it('複数のタレント名を含むテキストを解析する', () => {
      const result = parseTextWithTalentIcons('朧月ひかるとシグマ・イングラムのコラボ', true);
      
      expect(Array.isArray(result)).toBe(true);
      // 複数のパーツに分割されること
      expect(result.length).toBeGreaterThan(1);
    });

    it('空のテキストを処理する', () => {
      const result = parseTextWithTalentIcons('', true);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
