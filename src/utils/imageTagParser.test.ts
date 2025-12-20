import { describe, it, expect } from 'vitest';
import { extractFirstImage, removeImageTags } from './imageTagParser';

describe('extractFirstImage', () => {
  it('画像タグから最初のファイル名を抽出できる', () => {
    expect(extractFirstImage('テスト[image:test.jpg]です')).toBe('test.jpg');
  });

  it('複数の画像タグがある場合、最初のファイル名のみを抽出する', () => {
    expect(extractFirstImage('[image:first.png]中間[image:second.jpg]')).toBe('first.png');
  });

  it('画像タグがない場合はnullを返す', () => {
    expect(extractFirstImage('画像タグなし')).toBeNull();
  });

  it('空文字列の場合はnullを返す', () => {
    expect(extractFirstImage('')).toBeNull();
  });

  it('テキストの先頭に画像タグがある場合も抽出できる', () => {
    expect(extractFirstImage('[image:head.gif]テキスト')).toBe('head.gif');
  });

  it('テキストの末尾に画像タグがある場合も抽出できる', () => {
    expect(extractFirstImage('テキスト[image:tail.webp]')).toBe('tail.webp');
  });
});

describe('removeImageTags', () => {
  it('画像タグを除去できる', () => {
    expect(removeImageTags('テスト[image:test.jpg]です')).toBe('テストです');
  });

  it('複数の画像タグをすべて除去できる', () => {
    expect(removeImageTags('[image:a.png]中間[image:b.jpg]末尾')).toBe('中間末尾');
  });

  it('画像タグがない場合はそのまま返す', () => {
    expect(removeImageTags('画像タグなし')).toBe('画像タグなし');
  });

  it('空文字列の場合は空文字列を返す', () => {
    expect(removeImageTags('')).toBe('');
  });

  it('画像タグのみの場合は空文字列を返す', () => {
    expect(removeImageTags('[image:only.jpg]')).toBe('');
  });

  it('前後の空白をトリムする', () => {
    expect(removeImageTags('  テスト[image:test.jpg]  ')).toBe('テスト');
  });
});
