import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ThreePatchButton } from './ThreePatchButton';

// スタッフデータの型
interface StaffRole {
  role: string;
  members: string[];
}

export function StaffRollScreen() {
  const { closeStaffRoll } = useGameStore();
  const [staffData, setStaffData] = useState<StaffRole[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // スタッフデータを読み込む
  useEffect(() => {
    fetch('./data/staff.json')
      .then(response => response.json())
      .then((data: StaffRole[]) => {
        setStaffData(data);
        setIsLoaded(true);
      })
      .catch(error => {
        console.error('Failed to load staff data:', error);
        setIsLoaded(true);
      });
  }, []);

  // スクロールアニメーション
  useEffect(() => {
    if (!isLoaded || !scrollContainerRef.current || !contentRef.current) return;

    const container = scrollContainerRef.current;
    const content = contentRef.current;

    // コンテンツの高さとコンテナの高さを取得
    const containerHeight = container.clientHeight;
    const contentHeight = content.scrollHeight;

    // 初期位置：コンテナの下に配置
    let scrollPosition = containerHeight;
    
    // 初期位置を設定してからアニメーション準備完了にする
    content.style.transform = `translateY(${scrollPosition}px)`;
    setIsAnimationReady(true);

    const animate = () => {
      // スクロール速度（ピクセル/フレーム）
      const scrollSpeed = 0.8;
      scrollPosition -= scrollSpeed;

      // スクロール位置を設定
      content.style.transform = `translateY(${scrollPosition}px)`;

      // コンテンツ全体が画面外に出たら終了
      if (scrollPosition < -contentHeight) {
        closeStaffRoll();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // 少し遅延してからアニメーション開始
    const timer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded, closeStaffRoll]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* スキップボタン */}
      <div
        className="absolute z-10"
        style={{
          top: '3cqmin',
          right: '3cqmin',
        }}
      >
        <ThreePatchButton
          leftImage="./data/images/ui/btn_normal_off_left.png"
          middleImage="./data/images/ui/btn_normal_off_middle.png"
          rightImage="./data/images/ui/btn_normal_off_right.png"
          onClick={closeStaffRoll}
          height="5cqmin"
          fontSize="3cqmin"
          textColor="#CCC"
        >
          Skip
        </ThreePatchButton>
      </div>

      {/* スクロールコンテナ */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-hidden relative"
        style={{
          padding: '0 10cqmin',
        }}
      >
        {/* スクロールするコンテンツ（アニメーション準備完了まで非表示） */}
        <div
          ref={contentRef}
          className="flex flex-col items-center"
          style={{
            paddingBottom: '10cqmin',
            visibility: isAnimationReady ? 'visible' : 'hidden',
          }}
        >
          {/* タイトル */}
          <div
            className="text-center"
            style={{
              marginBottom: '8cqmin',
            }}
          >
            <h1
              className="text-yellow-300 font-bold"
              style={{
                fontSize: '6cqmin',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
              }}
            >
              パレ学マスター
            </h1>
            <div
              className="text-gray-300"
              style={{
                fontSize: '3cqmin',
                marginTop: '2cqmin',
              }}
            >
              Staff Roll
            </div>
          </div>

          {/* スタッフリスト */}
          {staffData.map((roleData, roleIndex) => (
            <div
              key={roleIndex}
              className="text-center"
              style={{
                marginBottom: '6cqmin',
              }}
            >
              {/* 役職名 */}
              <div
                className="text-yellow-400 font-bold"
                style={{
                  fontSize: '3.5cqmin',
                  marginBottom: '2cqmin',
                }}
              >
                {roleData.role}
              </div>
              {/* メンバー */}
              {roleData.members.map((member, memberIndex) => (
                <div
                  key={memberIndex}
                  className="text-white"
                  style={{
                    fontSize: '3cqmin',
                    marginBottom: '1cqmin',
                  }}
                >
                  {member}
                </div>
              ))}
            </div>
          ))}

          {/* エンディングメッセージ */}
          <div
            className="text-center"
            style={{
              marginTop: '8cqmin',
              marginBottom: '4cqmin',
            }}
          >
            <div
              className="text-white"
              style={{
                fontSize: '3.5cqmin',
                lineHeight: '1.8',
              }}
            >
              Thank you for playing!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
