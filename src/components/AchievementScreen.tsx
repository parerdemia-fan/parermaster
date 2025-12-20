import { useGameStore } from '../stores/gameStore';
import { ThreePatchButton } from './ThreePatchButton';
import { ThreePatchImage } from './ThreePatchImage';

export function AchievementScreen() {
  const { achievements, returnToTitle } = useGameStore();

  // 取得済みアチーブメントのみフィルタリング
  // 依存関係があるアチーブメントは、依存するアチーブメントがすべて取得済みの場合のみ表示
  const unlockedAchievements = achievements.filter(a => {
    if (!a.unlocked && !a.dependsOn) {
      return false; // 未取得で依存関係がないものは非表示
    }
    if (a.unlocked) {
      return true; // 取得済みは表示
    }
    // 依存関係がある場合、すべての依存アチーブメントが取得済みかチェック
    if (a.dependsOn) {
      return a.dependsOn.every(depId => 
        achievements.find(dep => dep.id === depId)?.unlocked
      );
    }
    return false;
  });

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-start animate-fade-in relative"
      style={{
        backgroundImage: 'url(./data/images/ui/achievement_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ヘッダー */}
      <div 
        className="w-full flex items-center justify-between"
        style={{ 
          height: '10%',
          padding: '2cqmin 3cqmin',
        }}
      >
        {/* 戻るボタン */}
        <ThreePatchButton
          leftImage="./data/images/ui/btn_normal_off_left.png"
          middleImage="./data/images/ui/btn_normal_off_middle.png"
          rightImage="./data/images/ui/btn_normal_off_right.png"
          onClick={returnToTitle}
          height="5cqmin"
          fontSize="2.5cqmin"
          textColor="#CCC"
          className="selection-card"
        >
          戻る
        </ThreePatchButton>

        <ThreePatchImage
          leftImage="./data/images/ui/plate_left.png"
          middleImage="./data/images/ui/plate_middle.png"
          rightImage="./data/images/ui/plate_right.png"
          height="6.5cqmin"
        >
          <span
            className="text-white font-bold"
            style={{
              fontSize: '3.5cqmin',
              textShadow: '2px 2px 4px rgba(0,0,0,1)',
             }}
          >
            実績
          </span>
        </ThreePatchImage>

        {/* 右側スペース（レイアウトバランス用） */}
        <div style={{ width: '12cqmin' }} />
      </div>

      {/* コンテンツエリア - 絶対位置指定 */}
      <div 
        className="w-full flex-1 relative"
      >
        {unlockedAchievements.length === 0 ? (
          <div 
            className="absolute inset-0 flex items-center justify-center"
          >
          </div>
        ) : (
          <>
            {unlockedAchievements.map((achievement) => (
                <div
                key={achievement.id}
                className="absolute group"
                style={{
                  left: `${achievement.x}cqmin`,
                  top: `${achievement.y}cqmin`,
                }}
                >
                {/* アチーブメント画像 */}
                <img
                  src={achievement.imagePath}
                  alt={achievement.name}
                  className="drop-shadow-lg cursor-pointer"
                  style={{
                  width: `${achievement.w}cqmin`,
                  height: `${achievement.h}cqmin`,
                  objectFit: 'contain',
                  }}
                  draggable={false}
                />
                {/* アチーブメント名と説明（ホバー時のみ表示） */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                  top: `${achievement.h}cqmin`,
                  padding: '1cqmin 1.5cqmin',
                  zIndex: 10,
                  maxWidth: '40cqmin',
                  }}
                >
                  <p
                  className="text-white font-bold text-center whitespace-nowrap"
                  style={{ fontSize: '4cqmin' }}
                  >
                  {achievement.name}
                  </p>
                  <p
                  className="text-white text-center mt-1"
                  style={{ 
                    fontSize: '3cqmin',
                    lineHeight: '1.4',
                  }}
                  >
                  {achievement.description}
                  </p>
                </div>
                </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
