/**
 * public/sw.js からバージョン情報を抽出
 */
export async function getVersion(): Promise<string> {
  try {
    const response = await fetch('./sw.js');
    const content = await response.text();
    
    // CACHE_NAME = 'vXXXXXXXXXXXX' のパターンから抽出
    const match = content.match(/CACHE_NAME\s*=\s*['"](v[\d]+)['"]/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.error('Failed to fetch version:', error);
  }
  
  return 'Unknown';
}
