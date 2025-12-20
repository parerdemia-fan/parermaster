/**
 * 画像タグ [image:ファイル名] を解析するユーティリティ関数
 */

/**
 * テキストから最初の[image:ファイル名]を抽出する
 * @param text テキスト文字列
 * @returns 画像ファイル名（見つからない場合はnull）
 */
export function extractFirstImage(text: string): string | null {
  const imagePattern = /\[image:([^\]]+)\]/;
  const match = text.match(imagePattern);
  return match ? match[1] : null;
}

/**
 * テキストから[image:ファイル名]を除去したテキストを返す
 * @param text テキスト文字列
 * @returns 画像タグを除去したテキスト
 */
export function removeImageTags(text: string): string {
  return text.replace(/\[image:[^\]]+\]/g, '').trim();
}
