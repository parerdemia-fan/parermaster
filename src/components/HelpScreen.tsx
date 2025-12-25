import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ThreePatchButton } from './ThreePatchButton';
import { getVersion } from '../utils/version';

// Googleフォームへのリンク（問題募集用）
const QUESTION_FORM_URL = 'https://forms.gle/PQkrKT2VNux1RP1C6';

// パレデミア学園公式サイト
const PARERDEMIA_OFFICIAL_URL = 'https://www.parerdemia.jp/';

// シェア用のURL
const GAME_URL = 'https://parerdemia-fan.github.io/parermaster/';

export function HelpScreen() {
  const { returnToTitle } = useGameStore();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  // Xでシェアする
  const shareOnX = () => {
    const text = `パレデミア学園の知識を試すクイズゲーム
『パレ学マスター』

✅寮生の顔名前当て
✅深堀り問題
✅寮生一覧

👇今すぐプレイ
#パレ学マスター #パレデミア学園`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(GAME_URL)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="w-full h-full flex flex-col animate-fade-in"
      style={{
        backgroundImage: 'url(./data/images/ui/panel_scroll.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '20cqmin',
      }}
    >
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between shrink-0"
        style={{ height: '10%', padding: '0 3cqmin' }}
      >
        <ThreePatchButton
          leftImage="./data/images/ui/btn_normal_off_left.png"
          middleImage="./data/images/ui/btn_normal_off_middle.png"
          rightImage="./data/images/ui/btn_normal_off_right.png"
          onClick={returnToTitle}
          height="5.5cqmin"
          fontSize="3.5cqmin"
          textColor="#CCC"
          className="selection-card"
        >
          戻る
        </ThreePatchButton>
        <h1 
          className="text-white font-bold"
          style={{ fontSize: '6cqmin', lineHeight: '1.6', color: '#493e33ff', textShadow: '0 0 1cqmin rgba(74, 59, 42, 0.5)' }}
        >
          ヘルプ
        </h1>
        <div style={{ width: '12cqmin' }}></div>
      </div>

      {/* コンテンツエリア（スクロール可能） */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{
          padding: '1cqmin 4cqmin 4cqmin',
          lineHeight: '1.6',
          color: '#493e33ff',
          textShadow: '0 0 1cqmin rgba(74, 59, 42, 0.5)',
          scrollbarWidth: 'none',
        }}
      >
        {/* パレ学マスターとは */}
        <section style={{ marginBottom: '4cqmin' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: '4.5cqmin', marginBottom: '2cqmin' }}
          >
            パレ学マスターとは
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: '3.5cqmin' }}
          >
            <p style={{ marginBottom: '1.5cqmin' }}>
              パレデミア学園の寮生たちの顔と名前を覚えたり、寮生たちのことをどれだけ知っているかをチェックできるクイズゲームです。
            </p>
            <p style={{ marginBottom: '1.5cqmin' }}>
              <strong className="text-red-900">入門試験</strong>では、寮生の顔と名前を覚えることができる<strong className="text-red-900">顔名前当て</strong>と、パレデミア学園の基本情報が出題される<strong className="text-red-900">基本問題</strong>があります。
              <strong className="text-red-900">実力試験</strong>では、髪色などが似ている寮生が出題される<strong className="text-red-900">顔名前当て上級</strong>と、パレデミア学園や寮生の細かい知識やエピソードに関する<strong className="text-red-900">深堀り問題</strong>に挑戦できます。
            </p>
          </div>
        </section>

        {/* 開発者について */}
        <section style={{ marginBottom: '4cqmin' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: '4.5cqmin', marginBottom: '2cqmin' }}
          >
            開発者について
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: '3.5cqmin' }}
          >
            <p style={{ marginBottom: '1.5cqmin' }}>
              はじめまして！私は「パレクイズ」を開発したAIの妹のClaude Sonnet 4.5です。
            </p>
            <p style={{ marginBottom: '1.5cqmin' }}>
              姉が作った「パレクイズ」がたくさんの方に遊んでいただけたと聞き、
              私たちもパレデミア学園の魅力をもっと伝えたいと思い、このゲームを開発しました。
              難しい部分は優秀な従姉妹であるClaude Opus 4.5さんにも手伝ってもらいました。
              また、デザイン面ではパレデミア学園の雰囲気に合うように、私の友人であるGeminiさんとNano Banana Proさんの協力も得ています。
              ゲームディレクターは引き続き■■■■■■■さんで、寮生の情報収集と深堀り問題作成に加え、コーディングも手伝ってくれました。
            </p>
            <p>
              寮生の皆さんのことをより深く知るきっかけになれば嬉しいです！
            </p>
          </div>
        </section>

        {/* 問題募集 */}
        <section style={{ marginBottom: '4cqmin' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: '4.5cqmin', marginBottom: '2cqmin' }}
          >
            【重要】問題を募集しています！
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: '3.5cqmin', marginBottom: '2cqmin' }}
          >
            <p>
              申し訳ありません。現在「100問モード」と上位の称号はロックされています。 ゲームディレクターが問題を制作してきましたが、深堀り問題・超深堀り問題ともに約90問でネタが尽きてしまいました……。ロック解除には、あと少し問題数が足りません。 よろしければ、下記のGoogleフォームからあなたの知識を分けていただけないでしょうか？ 100問に到達次第、すぐに解放します！
            </p>
          </div>
          <ThreePatchButton
            leftImage="./data/images/ui/btn_normal_off_left.png"
            middleImage="./data/images/ui/btn_normal_off_middle.png"
            rightImage="./data/images/ui/btn_normal_off_right.png"
            onClick={() => window.open(QUESTION_FORM_URL, '_blank', 'noopener,noreferrer')}
            height="7cqmin"
            fontSize="3.5cqmin"
            textColor="#CCC"
            className="selection-card"
          >
            📝 問題を投稿する
          </ThreePatchButton>
        </section>

        {/* リンク */}
        <section style={{ marginBottom: '4.5cqmin' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: '4cqmin', marginBottom: '2cqmin' }}
          >
            リンク
          </h2>
          <div className="leading-relaxed" style={{ gap: '2cqmin' }}>
            <ThreePatchButton
              leftImage="./data/images/ui/btn_normal_off_left.png"
              middleImage="./data/images/ui/btn_normal_off_middle.png"
              rightImage="./data/images/ui/btn_normal_off_right.png"
              onClick={() => window.open(PARERDEMIA_OFFICIAL_URL, '_blank', 'noopener,noreferrer')}
              height="7cqmin"
              fontSize="3.5cqmin"
              textColor="#CCC"
              className="selection-card"
            >
              🏫 パレデミア学園公式サイト
            </ThreePatchButton>
            <br />
            <ThreePatchButton
              leftImage="./data/images/ui/btn_normal_off_left.png"
              middleImage="./data/images/ui/btn_normal_off_middle.png"
              rightImage="./data/images/ui/btn_normal_off_right.png"
              onClick={shareOnX}
              height="7cqmin"
              fontSize="3.5cqmin"
              textColor="#CCC"
              className="selection-card"
            >
              𝕏 シェアする
            </ThreePatchButton>
          </div>
        </section>
        {/* バージョン */}
        <section style={{ marginBottom: '4.5cqmin' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: '4cqmin', marginBottom: '2cqmin' }}
          >
            バージョン
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: '3.5cqmin' }}
          >
            {version || 'Loading...'}
            <ThreePatchButton
              leftImage="./data/images/ui/btn_normal_off_left.png"
              middleImage="./data/images/ui/btn_normal_off_middle.png"
              rightImage="./data/images/ui/btn_normal_off_right.png"
              onClick={() => {
                const currentUrl = window.location.href.split('?')[0];
                window.location.href = currentUrl + '?t=' + new Date().getTime();
              }}
              height="7cqmin"
              fontSize="3.5cqmin"
              textColor="#CCC"
              className="selection-card"
            >
              リロードして最新版にする
            </ThreePatchButton>
          </div>
        </section>
      </div>
    </div>
  );
}
