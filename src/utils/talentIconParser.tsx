/**
 * タレントアイコン挿入ユーティリティ
 * 文章中のタレント名を検出し、名前の手前に顔アイコンを挿入する
 */

import type { Talent } from '../types';

// タレント名と学籍番号のマッピング（初回構築後はキャッシュ）
let talentNameToIdMap: Map<string, string> | null = null;

/**
 * タレントデータからタレント名→学籍番号のマップを構築する
 * @param talents タレントデータ配列
 */
export function buildTalentNameMap(talents: Talent[]): void {
  talentNameToIdMap = new Map();
  for (const talent of talents) {
    // スペースを除去した名前でマッピング
    const nameWithoutSpace = talent.name.replace(/\s/g, '');
    talentNameToIdMap.set(nameWithoutSpace, talent.student_id);
    
    // スペース区切りの名前もマッピング（完全一致用）
    if (talent.name !== nameWithoutSpace) {
      talentNameToIdMap.set(talent.name, talent.student_id);
    }
  }
}

/**
 * マップを取得する（未構築の場合はnullを返す）
 */
export function getTalentNameMap(): Map<string, string> | null {
  return talentNameToIdMap;
}

/**
 * テキスト中のタレント名を検出し、アイコン付きのReact要素に変換する
 * @param text 変換対象のテキスト
 * @param showIcon アイコンを表示するかどうか（falseの場合はプレースホルダー表示）
 * @param isAnswered 回答済みかどうか（showIcon=falseでも回答後は画像を表示）
 * @returns React要素の配列
 */
export function parseTextWithTalentIcons(
  text: string,
  showIcon: boolean = true,
  isAnswered: boolean = false
): React.ReactNode[] {
  if (!talentNameToIdMap || talentNameToIdMap.size === 0) {
    return [<span key="text">{text}</span>];
  }

  // showIcon=falseかつ未回答の場合はプレースホルダーを表示
  // showIcon=falseかつ回答済みの場合は画像を表示
  const shouldShowImage = showIcon || isAnswered;

  // サイズを統一（プレースホルダーと画像で同じサイズを使用）
  const iconSize = '2.2em';

  // タレント名を長い順にソート（部分一致を防ぐため）
  const talentNames = Array.from(talentNameToIdMap.keys()).sort(
    (a, b) => b.length - a.length
  );

  // 正規表現パターンを構築（特殊文字をエスケープ）
  const escapedNames = talentNames.map(name =>
    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(`(${escapedNames.join('|')})`, 'g');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    // タレント名とアイコンを追加
    const talentName = match[1];
    const studentId = talentNameToIdMap.get(talentName);
    
    if (studentId) {
      parts.push(
        <span key={`talent-${keyIndex++}`}>
          {/* プレースホルダーと画像で同じサイズを確保するラッパー */}
          <span
            style={{
              display: 'inline-block',
              width: iconSize,
              height: iconSize,
              marginRight: '0.15em',
              verticalAlign: '-0.5em',
              textAlign: 'center',
            }}
          >
            {shouldShowImage ? (
              <img
                src={`./data/images/kv/sq/${studentId}.png`}
                alt={talentName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '0.2em',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: iconSize,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
                aria-label="非表示"
              >
                👤
              </span>
            )}
          </span>
          {talentName}
        </span>
      );
    } else {
      parts.push(
        <span key={`text-${keyIndex++}`}>{talentName}</span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${keyIndex++}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [<span key="empty">{text}</span>];
}
