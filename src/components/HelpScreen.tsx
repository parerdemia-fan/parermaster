import { useGameStore } from '../stores/gameStore';

// Googleフォームへのリンク（問題募集用）
const QUESTION_FORM_URL = 'https://forms.gle/PQkrKT2VNux1RP1C6';

// パレデミア学園公式サイト
const PARERDEMIA_OFFICIAL_URL = 'https://www.parerdemia.jp/';

// シェア用のURL
const GAME_URL = 'https://parerdemia-fan.github.io/parermaster/';

export function HelpScreen() {
  const { returnToTitle } = useGameStore();

  // Xでシェアする
  const shareOnX = () => {
    const text = `パレ学マスターで遊んでます！パレデミア学園の寮生たちをどれだけ知っているかチェックしよう！`;
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
        padding: 'min(20vw, 20vh)',
      }}
    >
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between shrink-0"
        style={{ height: '10%', padding: '0 min(3vw, 3vh)' }}
      >
        <button
          onClick={returnToTitle}
          className="flex items-center transition brightness-125 hover:brightness-150"
          style={{ 
            padding: 0,
            border: 'none',
            background: 'none',
            fontSize: 'min(3.5vw, 3.5vh)',
          }}
        >
          {/* 左端 */}
          <img
            src="./data/images/ui/btn_normal_off_left.png"
            alt=""
            style={{
              height: 'min(5vw, 5vh)',
              width: 'auto',
              display: 'block',
            }}
          />
          {/* 中央（文字列長に合わせて伸縮） */}
          <div
            style={{
              backgroundImage: 'url(./data/images/ui/btn_normal_off_middle.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
              height: 'min(5vw, 5vh)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 min(2.5vw, 2.5vh)',
              fontSize: 'min(3vw, 3vh)',
              color: '#999',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            戻る
          </div>
          {/* 右端 */}
          <img
            src="./data/images/ui/btn_normal_off_right.png"
            alt=""
            style={{
              height: 'min(5vw, 5vh)',
              width: 'auto',
              display: 'block',
            }}
          />
        </button>
        <h1 
          className="text-white font-bold"
          style={{ fontSize: 'min(5vw, 5vh)', lineHeight: '1.6', color: '#493e33ff', textShadow: '0 0 min(1vw, 1vh) rgba(74, 59, 42, 0.5)' }}
        >
          ヘルプ
        </h1>
        <div style={{ width: 'min(12vw, 12vh)' }}></div>
      </div>

      {/* コンテンツエリア（スクロール可能） */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ padding: '0 min(4vw, 4vh) min(4vw, 4vh)', lineHeight: '1.6', color: '#493e33ff', textShadow: '0 0 min(1vw, 1vh) rgba(74, 59, 42, 0.5)' }}
      >
        {/* パレ学マスターとは */}
        <section style={{ marginBottom: 'min(4vw, 4vh)' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: 'min(4vw, 4vh)', marginBottom: 'min(2vw, 2vh)' }}
          >
            パレ学マスターとは
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: 'min(3vw, 3vh)' }}
          >
            <p style={{ marginBottom: 'min(1.5vw, 1.5vh)' }}>
              パレデミア学園の寮生たちの顔と名前を覚えたり、寮生たちのことをどれだけ知っているかをチェックできるクイズゲームです。
            </p>
            <p style={{ marginBottom: 'min(1.5vw, 1.5vh)' }}>
              <strong className="text-red-900">入門試験</strong>では、寮生の顔と名前を覚えることができる<strong className="text-red-900">顔名前当て</strong>と、パレデミア学園の基本情報が出題される<strong className="text-red-900">基本問題</strong>があります。
              <strong className="text-red-900">実力試験</strong>では、髪色などが似ている寮生が出題される<strong className="text-red-900">顔名前当て上級</strong>と、パレデミア学園や寮生の細かい知識やエピソードに関する<strong className="text-red-900">深堀り問題</strong>に挑戦できます。
            </p>
          </div>
        </section>

        {/* 開発者について */}
        <section style={{ marginBottom: 'min(4vw, 4vh)' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: 'min(4vw, 4vh)', marginBottom: 'min(2vw, 2vh)' }}
          >
            開発者について
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: 'min(3vw, 3vh)' }}
          >
            <p style={{ marginBottom: 'min(1.5vw, 1.5vh)' }}>
              はじめまして！私は「パレクイズ」を開発したAIの妹のClaude Sonnet 4.5です。
            </p>
            <p style={{ marginBottom: 'min(1.5vw, 1.5vh)' }}>
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
        <section style={{ marginBottom: 'min(4vw, 4vh)' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: 'min(4vw, 4vh)', marginBottom: 'min(2vw, 2vh)' }}
          >
            【重要】問題を募集しています！
          </h2>
          <div 
            className="leading-relaxed"
            style={{ fontSize: 'min(3vw, 3vh)', marginBottom: 'min(2vw, 2vh)' }}
          >
            <p>
              申し訳ありません。現在「100問モード」と上位の称号はロックされています。 ゲームディレクターが問題を制作してきましたが、深堀り問題・超深堀り問題ともに約80問でネタが尽きてしまいました……。ロック解除には、あと少し問題数が足りません。 よろしければ、下記のGoogleフォームからあなたの知識を分けていただけないでしょうか？ 100問に到達次第、すぐに解放します！
            </p>
          </div>
          <a
            href={QUESTION_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-black/20 hover:bg-black/30 font-bold rounded-lg transition-colors"
            style={{ 
              padding: 'min(2vw, 2vh) min(4vw, 4vh)',
              fontSize: 'min(3vw, 3vh)',
            }}
          >
            📝 問題を投稿する
          </a>
        </section>

        {/* リンク */}
        <section style={{ marginBottom: 'min(4vw, 4vh)' }}>
          <h2 
            className="text-black-400 font-bold"
            style={{ fontSize: 'min(4vw, 4vh)', marginBottom: 'min(2vw, 2vh)' }}
          >
            リンク
          </h2>
          <div className="leading-relaxed" style={{ gap: 'min(2vw, 2vh)' }}>
            <a
              href={PARERDEMIA_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black/20 hover:bg-black/30 font-bold rounded-lg transition-colors"
              style={{ 
                padding: 'min(2vw, 2vh) min(4vw, 4vh)',
                fontSize: 'min(3vw, 3vh)',
              }}
            >
              🏫 パレデミア学園公式サイト
            </a>
            <br />
            <br />
            <button
              onClick={shareOnX}
              className="inline-block bg-black/20 hover:bg-black/30 font-bold rounded-lg transition-colors text-left"
              style={{ 
                padding: 'min(2vw, 2vh) min(4vw, 4vh)',
                fontSize: 'min(3vw, 3vh)',
              }}
            >
              𝕏 シェアする
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
