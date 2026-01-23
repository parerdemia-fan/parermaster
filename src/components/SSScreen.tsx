import { useEffect, useState, useRef, useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { ThreePatchButton } from "./ThreePatchButton";
import {
  parseTextWithTalentIcons,
  getTalentNameMap,
} from "../utils/talentIconParser";

// SSデータの型
interface SSChapter {
  title: string;
  body: string;
}

interface SSData {
  ss_title: string;
  caution: string;
  chapters: SSChapter[];
}

// 演出フェーズの型
type EffectPhase = "none" | "noise1" | "pa" | "pa_noise";

// 演出の秒数設定
const NOISE1_DURATION = 2000; // SSにノイズ: 2秒
const PA_DURATION = 1500; // 「ぱ」表示（ノイズなし）: 1.5秒
const PA_NOISE_DURATION = 2000; // 「ぱ」+ ノイズ: 2秒

export function SSScreen() {
  const { closeSS } = useGameStore();
  const [ssData, setSSData] = useState<SSData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 最下部到達フラグ（一度trueになったら維持）
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  // 演出フェーズ
  const [effectPhase, setEffectPhase] = useState<EffectPhase>("none");

  // SSデータを読み込む
  useEffect(() => {
    fetch("./data/ss.json")
      .then((response) => response.json())
      .then((data: SSData) => {
        setSSData(data);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load SS data:", error);
        setIsLoaded(true);
      });
  }, []);

  // スクロール検知：最下部到達時にフラグを立てる
  const handleScroll = useCallback(() => {
    if (hasReachedBottom) return; // 既に到達済みなら何もしない

    const container = scrollContainerRef.current;
    if (!container) return;

    // 最下部判定（閾値10px）
    const isAtBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10;
    if (isAtBottom) {
      setHasReachedBottom(true);
    }
  }, [hasReachedBottom]);

  // 演出シーケンス制御
  useEffect(() => {
    if (effectPhase === "none") return;

    let timeoutId: ReturnType<typeof setTimeout>;

    switch (effectPhase) {
      case "noise1":
        // SSにノイズ → 「ぱ」表示（ノイズなし）
        timeoutId = setTimeout(() => setEffectPhase("pa"), NOISE1_DURATION);
        break;
      case "pa":
        // 「ぱ」表示（ノイズなし） → 「ぱ」+ ノイズ
        timeoutId = setTimeout(() => setEffectPhase("pa_noise"), PA_DURATION);
        break;
      case "pa_noise":
        // 「ぱ」+ ノイズ → 閉じる
        timeoutId = setTimeout(() => {
          setEffectPhase("none");
          closeSS();
        }, PA_NOISE_DURATION);
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [effectPhase, closeSS]);

  // 閉じるボタンのハンドラ
  const handleClose = useCallback(() => {
    if (hasReachedBottom) {
      // 最下部到達済み：演出開始
      setEffectPhase("noise1");
    } else {
      // 通常：そのまま閉じる
      closeSS();
    }
  }, [hasReachedBottom, closeSS]);

  // タレント名マップが構築済みかどうか
  const hasTalentMap = getTalentNameMap() !== null;

  // テキストをパースしてタレントアイコン付きで表示
  const renderTextWithIcons = (text: string): React.ReactNode => {
    if (!hasTalentMap) {
      return text;
    }

    // 改行で分割して処理
    const lines = text.split("\n");
    return lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        {lineIndex > 0 && <br />}
        {parseTextWithTalentIcons(line, true, true)}
      </span>
    ));
  };

  return (
    <div
      className="absolute inset-0 flex flex-col z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.95)",
      }}
    >
      {/* コンテンツラッパー（グリッチ時に画面全体がブレる） */}
      <div
        className={`flex flex-col flex-1 min-h-0 overflow-hidden ${
          effectPhase === "noise1" || effectPhase === "pa_noise"
            ? "ss-content-glitching"
            : ""
        }`}
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            height: "10%",
            padding: "0 5cqmin",
          }}
        >
          <ThreePatchButton
            leftImage="./data/images/ui/btn_normal_off_left.png"
            middleImage="./data/images/ui/btn_normal_off_middle.png"
            rightImage="./data/images/ui/btn_normal_off_right.png"
            onClick={handleClose}
            height="5cqmin"
            fontSize="3cqmin"
            textColor="#CCC"
          >
            閉じる
          </ThreePatchButton>
          <h1
            className="text-yellow-300 font-bold text-center"
            style={{
              fontSize: "4cqmin",
              textShadow: "0 0 10px rgba(255, 215, 0, 0.8)",
              flex: 1,
              paddingLeft: "2cqmin",
              paddingRight: "2cqmin",
            }}
          >
            {ssData?.ss_title || "ショートストーリー"}
          </h1>
          <div style={{ width: "12cqmin" }}></div>
        </div>

        {/* スクロールコンテナ */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
          style={{
            padding: "0 8cqmin 4cqmin",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 215, 0, 0.5) transparent",
          }}
        >
          {/* Caution */}
          {ssData?.caution && (
            <div
              className="text-gray-600 text-right italic"
              style={{
                fontSize: "2.5cqmin",
                marginTop: "2cqmin",
                marginBottom: "4cqmin",
              }}
            >
              {ssData.caution}
            </div>
          )}

          {isLoaded && !ssData && (
            <div
              className="text-gray-400 text-center"
              style={{ fontSize: "3cqmin", marginTop: "10cqmin" }}
            >
              ショートストーリーが見つかりませんでした
            </div>
          )}

          {/* チャプター */}
          {ssData?.chapters.map((chapter, index) => (
            <div
              key={index}
              className="border-b border-yellow-900/30"
              style={{
                marginBottom: "4cqmin",
                paddingBottom: "4cqmin",
              }}
            >
              {/* チャプタータイトル */}
              <div
                className="text-yellow-300 font-bold"
                style={{
                  fontSize: "3.5cqmin",
                  marginBottom: "2cqmin",
                }}
              >
                {chapter.title}
              </div>
              {/* 本文 */}
              <div
                className="text-gray-200"
                style={{
                  fontSize: "3cqmin",
                  lineHeight: "1.8",
                }}
              >
                {renderTextWithIcons(chapter.body)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* グリッチノイズエフェクトオーバーレイ */}
      {(effectPhase === "noise1" || effectPhase === "pa_noise") && (
        <div className="noise-overlay">
          <div className="glitch-layer glitch-cyan" />
          <div className="glitch-layer glitch-red" />
          <div className="glitch-layer glitch-blue" />
          <div className="glitch-layer glitch-white" />
        </div>
      )}

      {/* 「ぱ」表示オーバーレイ */}
      {(effectPhase === "pa" || effectPhase === "pa_noise") && (
        <div className="pa-display">
          <span className="pa-character">ぱ</span>
        </div>
      )}
    </div>
  );
}
