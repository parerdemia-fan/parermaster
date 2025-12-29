// キャッシュの名前（バージョン管理用）
const CACHE_NAME = 'v202512300730';

// キャッシュしたいファイルのリスト
const urlsToCache = [
  './data/images/favicon192.png',
  './data/images/favicon512.png',
  './data/images/favicon_maskable192.png',
  './data/images/favicon_maskable512.png',
  './data/images/ui/achievement_bg.png',
  './data/images/ui/bg_0.png',
  './data/images/ui/bg_1.png',
  './data/images/ui/bg_2.png',
  './data/images/ui/bg_3.png',
  './data/images/ui/bg_4.png',
  './data/images/ui/bg_5.png',
  './data/images/ui/bg_6.png',
  './data/images/ui/bg_7.png',
  './data/images/ui/btn_achievement.png',
  './data/images/ui/btn_back.png',
  './data/images/ui/btn_blue_left.png',
  './data/images/ui/btn_blue_middle.png',
  './data/images/ui/btn_blue_right.png',
  './data/images/ui/btn_cancel.png',
  './data/images/ui/btn_description.png',
  './data/images/ui/btn_help.png',
  './data/images/ui/btn_home.png',
  './data/images/ui/btn_jitsuryoku.png',
  './data/images/ui/btn_master.png',
  './data/images/ui/btn_next.png',
  './data/images/ui/btn_normal_off_left.png',
  './data/images/ui/btn_normal_off_middle.png',
  './data/images/ui/btn_normal_off_right.png',
  './data/images/ui/btn_nyumon.png',
  './data/images/ui/btn_red_left.png',
  './data/images/ui/btn_red_middle.png',
  './data/images/ui/btn_red_right.png',
  './data/images/ui/btn_result.png',
  './data/images/ui/btn_share.png',
  './data/images/ui/btn_start.png',
  './data/images/ui/btn_talents.png',
  './data/images/ui/clocktower.webp',
  './data/images/ui/dialog_setting.png',
  './data/images/ui/hr.png',
  './data/images/ui/icon_question.png',
  './data/images/ui/label_choice.png',
  './data/images/ui/label_question.png',
  './data/images/ui/marshmallow.jpg',
  './data/images/ui/panel_answer_oneline.png',
  './data/images/ui/panel_choice_face_bg_light.png',
  './data/images/ui/panel_choice_face_bg.png',
  './data/images/ui/panel_choice_face.png',
  './data/images/ui/panel_paper.png',
  './data/images/ui/panel_question.png',
  './data/images/ui/panel_scroll.png',
  './data/images/ui/parerdemia_p.png',
  './data/images/ui/parerdemia-logo.png',
  './data/images/ui/parermaster_l.png',
  './data/images/ui/plate_left.png',
  './data/images/ui/plate_middle.png',
  './data/images/ui/plate_right.png',
  './data/images/ui/tiktok.png',
  './data/images/ui/youtube.png'
];

// 1. インストール時の処理（ファイルをキャッシュに保存）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. フェッチ時の処理（リクエストを横取りしてキャッシュから返す）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }
        // キャッシュになければネットワークに取りに行く
        return fetch(event.request);
      })
  );
});

// 3. 起動時の処理（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 新しいバージョンに関係ない古いキャッシュを消す
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});