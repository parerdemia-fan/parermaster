/**
 * スタイルユーティリティ
 * 
 * GameContainer で container-type: size が設定されているため、
 * 子要素では cqmin 単位（コンテナの幅と高さの小さい方の割合）を使用できる。
 * 
 * cqmin はコンテナサイズに基づくため、ビューポートサイズに依存せず
 * 一貫したサイズ指定が可能。
 */

/**
 * コンテナ相対サイズを生成する
 * GameContainer の子要素で使用することで、コンテナサイズに基づいた
 * レスポンシブなサイズ指定が可能
 * 
 * @param value - サイズ値（コンテナの小さい方の辺に対する割合）
 * @returns CSS サイズ文字列（例: "4cqmin"）
 * 
 * @example
 * // フォントサイズ
 * style={{ fontSize: cqmin(4) }}
 * 
 * // パディング
 * style={{ padding: cqmin(2) }}
 * 
 * // 複数値（パディング上下・左右）
 * style={{ padding: `${cqmin(1)} ${cqmin(2)}` }}
 */
export function cqmin(value: number): string {
  return `${value}cqmin`;
}

/**
 * 複数のサイズ値を結合する（margin, padding 用）
 * 
 * @param values - サイズ値の配列
 * @returns スペース区切りの CSS サイズ文字列
 * 
 * @example
 * // padding: 1cqmin 2cqmin
 * style={{ padding: cqminValues(1, 2) }}
 * 
 * // margin: 1cqmin 2cqmin 3cqmin 4cqmin
 * style={{ margin: cqminValues(1, 2, 3, 4) }}
 */
export function cqminValues(...values: number[]): string {
  return values.map(v => `${v}cqmin`).join(' ');
}
