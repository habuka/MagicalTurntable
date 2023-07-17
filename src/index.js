import P5 from "p5";
import { Player, Ease } from "textalive-app-api";

// パラメータ関連

/**
 * 拡大率の基準とする横幅(px)
 */
const default_width = 1300;


/**
 * 拡大率の基準とする高さ(px)
 */
const default_height = 1000;

/**
 * デフォルトのRPM
 */
const rpm_default = 5;

/**
 * 文字サイズのデフォルト値
 */
const char_size_default = 40;

/**
 * 通常再生時に歌詞の表示が始まる角度[deg]
 * キャンバスの回転を加味しない見かけ上の位置
 * レコード針がある位置
 */
const text_area_angle_begin = 60;

/**
 * 歌詞を表示する領域(上限)。
 * キャンバスの回転を加味しない見かけ上の角度[deg]
 */
const text_area_angle_end = 300

/**
 * 歌詞ごとの最低間隔[deg]
 * デフォルトのRPMでこの間隔以下になる場合、一時的に回転速度を上げる
 */
const min_text_interval_deg = 7.2;

/**
 * レコードの中心座標[x, y]
 * キャンバス倍率1の時の値
 */
const record_pos_default = [522, 500];

/**
 * レコード針の回転軸座標[x, y]
 * キャンバス倍率1の時の値
 */
const needle_axis_pos_default = [1087, 244];

/**
 * レコード針のアームの長さ[px]
 * キャンバス倍率1の時の値
 */
const needle_arm_length = 667;

/**
 * レコード針の元画像におけるレコード針の初期角度[deg]
 * 右方向を基準として時計回りに回した際の角度
 */
const needle_angle_offset = 102;

/**
 * レコードの半径[px]
 * キャンバス倍率1の時の値
 */
const disc_radius_default = 478;

/**
 * レコードの黒い部分の内側までの半径[px]
 * ビートに合わせた演出の表示領域
 * キャンバス倍率1の時の値
 */
const disc_beat_radius_begin_default = 150;

/**
 * レコードの黒い部分の外側までの半径[px]
 * ビートに合わせた演出の表示領域
 * キャンバス倍率1の時の値
 */
const disc_beat_radius_end_default = 429;

/**
 * レコード針の位置(歌詞出現場所)のレコード中心からの距離[px]
 * キャンバス倍率1の時の値
 */
const needle_radius_default = 400;

/**
 * START/STOPボタンの位置[left, top[px]]
 * キャンバス倍率1の時の値
 */
const startstop_button_pos_default = [42, 871];

/**
 * REPLAYボタンの位置[left, top[px]]
 * キャンバス倍率1の時の値
 */
const replay_button_pos_default = [42, 778];

/**
 * BACKボタンの位置[left, top[px]]
 * キャンバス倍率1の時の値
 */
const back_button_pos_default = [27, 698];

/**
 * VOLUMEツマミの位置[left, top[px]]
 * キャンバス倍率1の時の値
 */
const volume_slider_pos_default = [1189, 733];

/**
 * VOLUMEツマミの上限Y座標[top[px]]
 * キャンバス倍率1の時の値
 * この時に音量が最大になる
 */
const volume_slider_max = 592;

/**
 * VOLUMEツマミの下限Y座標[top[px]]
 * キャンバス倍率1の時の値
 * この時に音量が0になる
 */
const volume_slider_min = 865;

/**
 * 音量の最大値[0-100]
 * 100はデカすぎるので調整。初期値は25
 */
const volume_max = 50;

/**
 * START/STOPボタンのサイズ[width, height[px]]
 * キャンバス倍率1の時の値
 */
const startstop_button_size_default = [105, 105];

/**
 * REPLAYボタンのサイズ[width, height[px]]
 * キャンバス倍率1の時の値
 */
const replay_button_size_default = [82, 82];

/**
 * BACKボタンのサイズ[width, height[px]]
 * キャンバス倍率1の時の値
 */
const back_button_size_default = [66, 66];

/**
 * VOLUMEツマミのサイズ[width, height[px]]
 * キャンバス倍率1の時の値
 */
const volume_slider_size_default = [54, 62];

/**
 * レコード針の回転角度の下限値[deg]
 * 曲の初めはこの位置
 * 真下を基準とした値
 */
const angle_needle_min = 18.5;

/**
 * レコード針の回転角度の上限値[deg]
 * 曲の終わりはこの位置
 * 真下を基準とした値
 */
const angle_needle_max = 38;

let p5js_canvas = document.getElementById('p5js');

/**
 * 楽曲選択
 * -1: 未選択
 * 0 : king妃jack躍 / 宮守文学 feat. 初音ミク
 * 1 : 生きること / nogumi feat. 初音ミク
 * 2 : 唱明者 / すこやか大聖堂 feat. KAITO
 * 3 : ネオンライトの海を往く / Ponchi♪ feat. 初音ミク
 * 4 : ミュウテイション / Rin（Kuroneko Lounge） feat. 初音ミク
 * 5 : Entrust via 39 / ikomai feat. 初音ミク
 */
let song_id = -1;

/**
 * シーンのモードの定義
 * 0: 楽曲選択画面
 * 1: 楽曲再生画面
 */
let scene_mode = 0;

/**
 * アプリ全体の拡大率
 */
let genaral_magnification = 0;

/**
 * 歌詞ごとのキャンバス上の位置と角度[X座標, Y座標, 角度]
 * キャンバスの回転を加味した角度
 */
let char_pos_list = [];

/**
 * 歌詞ごとの発声時間におけるレコード針の位置[X座標, Y座標]
 * キャンバスの回転を加味した角度
 */
let needle_pos_list = [];

/**
 * 歌詞ごとの回転角度[deg]のリスト
 * min_text_interval_degが最短の間隔になるように調整されている
 */
let rotation_list = [];

/**
 * 歌詞ごとの発声開始時間[ms]のリスト
 */
let starttime_list = [];

/**
 * VOLUMEツマミの位置[left, top[px]]

 */
let volume_slider_pos = [];

/**
 * 回転角度リストの要素数
 * 最初に0、最後に楽曲の終端を格納するので要素数は歌詞の文字数 + 2
 */
let rotation_list_size = 0;

/**
 * 再生モードの定義
 * 0: 停止
 * 1: 再生
 * 2: 停止中皿回し
 * 3: 再生中皿回し
 */
let play_mode = 0;

/**
 * VOLUMEツマミモードの定義
 * 0: 操作中でない
 * 1: 操作中
 */
let vol_slider_mode = 0;

/**
 * 直前の皿回し処理におけるポインター位置のディスク上の見かけの角度
 */
let previous_pointer_angle = 0;

/**
 * 直前のVOLUMEツマミ操作におけるポインター位置のy座標
 */
let previous_pointer_volume_y = 0;

/**
 * キャンバス自体の回転角度
 */
let angle_canvas = 0;

/**
 * レコードの回転角度
 */
let angle_disc = 0;

// プレイヤーの初期化 / Initialize TextAlive Player
const player = new Player({
  // トークンは https://developer.textalive.jp/profile で取得したものを使う
  app: { token: "xsnERhRnjyZIGziY" },
});

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: () => {
    console.log("onAppReady");
  },

  onTextLoad: (body) => {
    // Webフォントを確実に読み込むためDOM要素に歌詞を貼り付ける
    console.log("player.onTextLoad");
    document.querySelector("#dummy").textContent = body?.text;
  },

  onVideoReady: () => {
    console.log("player.onVideoReady");
    CreatePositionList();
  },

  onTimerReady: () => {
    // このイベントハンドラが呼ばれたらプレイヤー準備完了なので画面を切り返る
    console.log("player.onTimerReady");
    document.getElementById('loading').style.display = "none";
    document.getElementById('song_select').style.display = "none";
    document.getElementById('startstop').style.display = "block";
    document.getElementById('replay').style.display = "block";
    document.getElementById('back').style.display = "block";
    document.getElementById('p5js').style.display = "flex";
  },

  onPlay: () => {
    console.log("player.onPlay");
  },

  onPause: () => {
    console.log("player.onPause");
  },

  onSeek: () => {
    console.log("player.onSeek");
  },

  onStop: () => {
    console.log("player.onStop");
  },
});

// 楽曲選択ボタン
document.querySelector("#song_0").addEventListener("click", () => {
  StartPlayer(0);
});

document.querySelector("#song_1").addEventListener("click", () => {
  StartPlayer(1);
});

document.querySelector("#song_2").addEventListener("click", () => {
  StartPlayer(2);
});

document.querySelector("#song_3").addEventListener("click", () => {
  StartPlayer(3);
});

document.querySelector("#song_4").addEventListener("click", () => {
  StartPlayer(4);
});

document.querySelector("#song_5").addEventListener("click", () => {
  StartPlayer(5);
});

/**
 * @fn InitPlayer
 * @brief プレイヤー関連のパラメータを初期化する(楽曲再選択時等に必要)
 */
const InitPlayer = () => {
  song_id = -1;
  rotation_list_size = 0;
  play_mode = 0;
  previous_pointer_angle = 0;
  angle_canvas = 0;
  angle_disc = 0;
}

/**
 * @fn StartPlayer
 * @brief 楽曲IDを指定してプレイヤーを表示する
 * @param[in] song_id: 楽曲ID
 */
const StartPlayer = (song_id) => {
  InitPlayer();
  switch (song_id) {
  case 0:
    // king妃jack躍 / 宮守文学 feat. 初音ミク
    player.createFromSongUrl("https://piapro.jp/t/ucgN/20230110005414", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427948/history
        beatId: 4267297,
        chordId: 2405019,
        repetitiveSegmentId: 2475577 /* 2023/5/6 更新 */,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FucgN%2F20230110005414
        lyricId: 56092,
        lyricDiffId: 9636
      },
    });
    break;
  case 1:
    // 生きること / nogumi feat. 初音ミク
    player.createFromSongUrl("https://piapro.jp/t/fnhJ/20230131212038", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427949/history
        beatId: 4267300,
        chordId: 2405033,
        repetitiveSegmentId: 2475606,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FfnhJ%2F20230131212038
        lyricId: 56131,
        lyricDiffId: 9638
      },
    });
    break;
  case 2:
    // 唱明者 / すこやか大聖堂 feat. KAITO
    player.createFromSongUrl("https://piapro.jp/t/Vfrl/20230120182855", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427950/history
        beatId: 4267334,
        chordId: 2405059,
        repetitiveSegmentId: 2475645,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FVfrl%2F20230120182855
        lyricId: 56095,
        lyricDiffId: 9637
      },
    });
    break;
  case 3:
    // ネオンライトの海を往く / Ponchi♪ feat. 初音ミク
    player.createFromSongUrl("https://piapro.jp/t/fyxI/20230203003935", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427951/history
        beatId: 4267373,
        chordId: 2405138,
        repetitiveSegmentId: 2475664,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FfyxI%2F20230203003935
        lyricId: 56096,
        lyricDiffId: 9639
      },
    });
    break;
  case 4:
    // ミュウテイション / Rin（Kuroneko Lounge） feat. 初音ミク
    player.createFromSongUrl("https://piapro.jp/t/Wk83/20230203141007", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427952/history
        beatId: 4267381,
        chordId: 2405285,
        repetitiveSegmentId: 2475676,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FWk83%2F20230203141007
        lyricId: 56812 /* 6月27日更新 */,
        lyricDiffId: 10668 /* 6月27日更新 */
      },
    });
    break;
  case 5:
    // Entrust via 39 / ikomai feat. 初音ミク
    player.createFromSongUrl("https://piapro.jp/t/Ya0_/20230201235034", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427953/history
        beatId: 4269734,
        chordId: 2405723,
        repetitiveSegmentId: 2475686,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYa0_%2F20230201235034
        lyricId: 56098,
        lyricDiffId: 9643
      },
    });
    break;
  default:
    break;
  }
  document.getElementById('song_select').style.display = "none";
  document.getElementById('loading').style.display = "flex";
}

// START/STOPボタン
document.querySelector("#startstop").addEventListener("click", () => {
  switch (play_mode) {
  case 0:
    // そのまま再生するとPositionが変な値になっていることがあるので現在の再生時間に明示的にシークしてから再生開始
    let position = GetPositionByAngle(angle_canvas);
    player.requestMediaSeek(position);
    player.requestPlay();
    play_mode = 1;
    break;
  case 1:
    player.requestPause();
    play_mode = 0;
    break;
  default:
    break;
  }
});

// REPLAYボタン
document.querySelector("#replay").addEventListener("click", () => {
  if (play_mode <= 1) {
    // 皿回し中は無効
    player.requestPause();
    play_mode = 0;
    angle_canvas = 0;
    player.requestMediaSeek(0);
  }
});

// BACKボタン
document.querySelector("#back").addEventListener("click", () => {
  player.requestStop();
  document.getElementById('p5js').style.display = "none";
  document.getElementById('startstop').style.display = "none";
  document.getElementById('replay').style.display = "none";
  document.getElementById('back').style.display = "none";
  document.getElementById('song_select').style.display = "flex";
});

// 皿回し開始処理
// マウス操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("mousedown", (e) => {
  mousedown(e);
});

// タッチ操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("touchstart", (e) => {
  mousedown(e.changedTouches[0]);
});

// 共通処理
const mousedown = (e) => {
  if (isInDisc(e.pageX, e.pageY)) {
    // ディスクがクリックされたら皿回しモードに入る
    // この時点でのポインタ角度を記録
    previous_pointer_angle = GetAngleOnDisc(e.pageX, e.pageY);
    if (play_mode == 0) {
      play_mode = 2;
    } else if (play_mode == 1) {
      // 再生停止
      player.requestPause();
      play_mode = 3;
    }
  }
}

// 皿回し回転処理
// マウス操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("mousemove", (e) => {
  mousemove(e);
});

// タッチ操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("touchmove", (e) => {
  mousemove(e.changedTouches[0]);
});

// 共通処理
const mousemove = (e) => {
  if (play_mode >= 2) {
    // 皿回しモード中の場合、皿回し処理を行う
    // TurnDisc(e.pageX, e.pageY);
    let current_pointer_angle = GetAngleOnDisc(e.pageX, e.pageY);
    let pointer_angle_dif = -(current_pointer_angle - previous_pointer_angle);

    // ロールオーバーの補正
    if (pointer_angle_dif > 180) {
      pointer_angle_dif -= 360;
    } else if (pointer_angle_dif < -180) {
      pointer_angle_dif += 360;
    }

    // 楽曲の先頭か終端に到達した場合はそれ以上回転させない
    if (angle_canvas + pointer_angle_dif < 0) {
      angle_canvas = 0;
    } else if (angle_canvas + pointer_angle_dif > rotation_list[rotation_list_size - 1]) {
      angle_canvas = rotation_list[rotation_list_size - 1];
    } else {
      angle_canvas += pointer_angle_dif;
    }
    if (angle_disc + pointer_angle_dif < 0) {
      angle_disc = 0;
    } else if (angle_canvas < rotation_list[rotation_list_size - 1]) {
      angle_disc += pointer_angle_dif;
    }
    previous_pointer_angle = current_pointer_angle;
  } else if (vol_slider_mode == 1) {
    ChangeVolume(e.pageY);
  }
}

const ChangeVolume = (y) => {
  let y_dif = (y - previous_pointer_volume_y) / genaral_magnification;
  if ((volume_slider_pos[1] + y_dif) > volume_slider_min) {
    volume_slider_pos[1] = volume_slider_min;
  } else if ((volume_slider_pos[1] + y_dif) < volume_slider_max) {
    volume_slider_pos[1] = volume_slider_max;
  } else {
    volume_slider_pos[1] += y_dif;
  }
  previous_pointer_volume_y = y;
  document.getElementById("volume_slider").style.top = (volume_slider_pos[1] * genaral_magnification) + 'px';
  player.volume = (volume_slider_min - volume_slider_pos[1]) / (volume_slider_min - volume_slider_max) * volume_max;
}

// 皿回し終了処理
// マウス操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("mouseup", (e) => {
  mouseup(e);
});

// マウス操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("mouseleave", (e) => {
  mouseup(e);
});

// タッチ操作用イベントハンドラ
document.querySelector("#p5js").addEventListener("touchend", (e) => {
  mouseup(e.changedTouches[0]);
});

// 共通処理
const mouseup = (e) => {
  if (play_mode == 2) {
    // 操作後の角度に応じて楽曲をシーク
    let position = GetPositionByAngle(angle_canvas);
    player.requestMediaSeek(position);

    // 停止中皿回しの場合終了後停止状態
    play_mode = 0;
  } else if (play_mode == 3) {
    // 操作後の角度に応じて楽曲をシーク
    let position = GetPositionByAngle(angle_canvas);
    player.requestMediaSeek(position);

    // 再生中皿回しの場合終了後再生状態
    player.requestPlay();
    play_mode = 1;
  } else if (vol_slider_mode == 1) {
    vol_slider_mode = 0;
    document.getElementById('volume_slider').style.display = "block";
  }
}

// VOLUMEツマミ処理
// マウス操作用イベントハンドラ
document.querySelector("#volume_slider").addEventListener("mousedown", (e) => {
  mousedown_vol(e);
});

// タッチ操作用イベントハンドラ
document.querySelector("#volume_slider").addEventListener("touchstart", (e) => {
  mousedown_vol(e.changedTouches[0]);
});

// 共通処理
const mousedown_vol = (e) => {
  vol_slider_mode = 1;
  previous_pointer_volume_y = e.pageY;
  document.getElementById('volume_slider').style.display = "none";
}

// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const width = default_width;
  const height = default_height;
  const frame_rate = 30;

  p5.preload = () => {
    // 画像を読み込む
    img_disc = p5.loadImage("../img/disc.png"); // ディスク
    img_needle = p5.loadImage("../img/needle.png"); // 針
    img_needle_cover = p5.loadImage("../img/needle_cover.png"); // 針カバー
    img_frame = p5.loadImage("../img/frame.png"); // フレーム
    img_startstop_play = p5.loadImage("../img/button_startstop_play.png"); // START/STOPボタン(再生中)
    img_startstop_stop = p5.loadImage("../img/button_startstop_stop.png"); // START/STOPボタン(停止中)
    img_replay_play = p5.loadImage("../img/button_replay_play.png"); // REPLAYボタン(再生中)
    img_replay_stop = p5.loadImage("../img/button_replay_stop.png"); // REPLAYボタン(停止中)
    img_back = p5.loadImage("../img/button_back.png"); // BACKボタン
    img_volume_slider = p5.loadImage("../img/volume_slider.png"); // VOLUMEツマミ
  };

  // キャンバスを作成
  p5.setup = () => {
    let canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.parent(p5js_canvas);
    player.volume = 25;
    volume_slider_pos[0] = volume_slider_pos_default[0];
    volume_slider_pos[1] = volume_slider_pos_default[1];
    previous_pointer_volume_y = volume_slider_pos_default[1];
    p5.ResizeWindow();
    p5.translate(width / 2, height / 2);
    p5.colorMode(p5.HSB, 100);
    p5.angleMode(p5.DEGREES);
    p5.frameRate(frame_rate);
    p5.background(40);
    p5.noStroke();
    p5.textFont("Noto Sans JP");
    p5.textAlign(p5.CENTER, p5.CENTER);

    // キャンバス作成時には楽曲選択画面
    document.getElementById('loading').style.display = "none";
    document.getElementById('p5js').style.display = "none";
    document.getElementById('startstop').style.display = "none";
    document.getElementById('replay').style.display = "none";
    document.getElementById('back').style.display = "none";
  };

  // ビートにあわせて背景を、発声にあわせて歌詞を表示
  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }
    // 現在の再生位置
    const position = player.timer.position;

    // 再生開始直後に再生位置が不正な場合があるので弾く
    if (position > player.video.duration) {
      return;
    }

    // 再生中に楽曲の終端に到達した場合、停止して待機
    if ((position == player.video.duration) &&
        (play_mode == 1)) {
      play_mode = 0;
    }

    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.scale(genaral_magnification);

    // 筐体
    p5.imageMode(p5.CORNER);
    p5.image(img_frame, 0, 0);

    // VOLUMEツマミ
    p5.image(img_volume_slider, volume_slider_pos[0], volume_slider_pos[1]);

    switch (play_mode) {
    case 0:
      // ポーズ中
      break;
    case 1:
      // 再生中
      // 再生中はディスク回転。一定速度でそれっぽく回っていればいいのでデフォルトRPMでインクリメント
      angle_disc += rpm_default / 60 * 360 / frame_rate;

      // 次の発声文字から歌詞インデックスを取得
      let next_char = p5.GetNextChar(position);
      let char_index;
      if (next_char != null) {
        // [0]は0が入っているので+1した場所が歌詞のインデックス
        char_index = player.video.findIndex(next_char) + 1;
      } else {
        // nullの場合、最後の歌詞発声終了から楽曲終了までの期間
        char_index = rotation_list_size - 1;
      }

      // 回転角度リストを元に現在時刻における線形補完値を算出
      let per = (position - starttime_list[char_index - 1])
                / (starttime_list[char_index] - starttime_list[char_index - 1]);
      angle_canvas = rotation_list[char_index - 1]
                    + (rotation_list[char_index] - rotation_list[char_index - 1]) * per;
      break;
    case 2:
      // ポーズ中皿回し
      break;
    case 3:
      // 再生中皿回し
      break;
    }

    // ディスクの描画
    p5.push();
    p5.imageMode(p5.CENTER);
    p5.translate(record_pos_default[0], record_pos_default[1]);
    p5.rotate(angle_disc);
    p5.image(img_disc, 0, 0);
    p5.pop();

    if (play_mode == 1) {
      // 再生中はビートに合わせた演出を行う
      const beat = player.findBeat(position);
      if (beat) {
        let beat_effect = p5.createGraphics(default_width, default_height);
        const progress = beat.progress(position);
        const radius = disc_beat_radius_begin_default
                       + (disc_beat_radius_end_default - disc_beat_radius_begin_default) * Ease.quintIn(progress);

        p5.push();
        beat_effect.ellipseMode(beat_effect.RADIUS);
        beat_effect.imageMode(beat_effect.CENTER);
        beat_effect.translate(record_pos_default[0], record_pos_default[1]);
        beat_effect.fill(150, 150, 150, Ease.quintIn(progress) * 60);
        beat_effect.ellipse(0, 0, disc_beat_radius_end_default, disc_beat_radius_end_default);
        // 光の輪が広がる演出
        beat_effect.erase();
        beat_effect.ellipse(0, 0, radius, radius);
        beat_effect.noErase();
        beat_effect.fill(150, 150, 150, 60);
        beat_effect.ellipse(0, 0, radius, radius);
        // 内周をくり抜く
        beat_effect.erase();
        beat_effect.ellipse(0, 0, disc_beat_radius_begin_default, disc_beat_radius_begin_default);
        beat_effect.noErase();
        p5.image(beat_effect, 0, 0);
        beat_effect.remove(); // remove()でメモリを解放する(やらないとブラウザが落ちる！！！)
        p5.pop();
      }
    }

    // 歌詞の描画
    p5.push();
    p5.translate(record_pos_default[0], record_pos_default[1]);
    p5.rotate(angle_canvas);
    p5.translate(-record_pos_default[0], -record_pos_default[1]);

    // 文字の描画
    for (let i = 0; i < rotation_list_size - 2; i++) {
      // 出現角度が現在のキャンバス角度の範囲内にある文字のみ描画
      if (angle_canvas <= (rotation_list[i + 1] + 300)) {
        if ((rotation_list[i + 1] - 5) <= angle_canvas) {
          let char = player.video.getChar(i);
          let transparency;
          let size = char_size_default;

          let char_pos_temp = [char_pos_list[i][0], char_pos_list[i][1], char_pos_list[i][2]];

          if (play_mode == 1) {
            // 再生中は針の位置からフェードインさせる処理を行う
            // 100msかけてフェードインする
            if ((char.startTime - 100 < position) &&
                (position < char.startTime)) {
              // 針の位置から目標位置までの線形補間値とする
              const progress = 1 - (char.startTime - position) / 100;
              char_pos_temp[0] = needle_pos_list[i][0]
                                 + (char_pos_list[i][0] - needle_pos_list[i][0]) * progress;
              char_pos_temp[1] = needle_pos_list[i][1]
                                 + (char_pos_list[i][1] - needle_pos_list[i][1]) * progress;

              const eased = Ease.circIn(progress);
              transparency = progress;
              size = char_size_default * eased + 200 * (1 - eased);
            } else if ((position < char.startTime) &&
                       (angle_canvas <= (rotation_list[i + 1] + 5))) {
              // 100ms以前で出現領域に引っかかっている場合は非表示
              transparency = 0;
            } else if (rotation_list[i + 1] + 270 <= angle_canvas) {
              // 30°かけてフェードアウトする
              transparency = 1 - (angle_canvas - (rotation_list[i + 1] + 270)) / 30;
            } else {
              // それ以外の区間は完全に不透明
              transparency = 1;
            }
          } else {
            if (angle_canvas <= (rotation_list[i + 1] + 5)) {
              // 10°かけてフェードインする
              transparency = 1 - ((rotation_list[i + 1] + 5) - angle_canvas) / 10;
            } else if (rotation_list[i + 1] + 270 <= angle_canvas) {
              // 30°かけてフェードアウトする
              transparency = 1 - (angle_canvas - (rotation_list[i + 1] + 270)) / 30;
            } else {
              // それ以外の区間は完全に不透明
              transparency = 1;
            }
          }

          p5.fill(0, 0, 100, transparency * 100);
          p5.textSize(size);
          p5.push();
          p5.translate(char_pos_temp[0], char_pos_temp[1]);
          p5.rotate(char_pos_temp[2]);
          p5.translate(-char_pos_temp[0], -char_pos_temp[1]);
          p5.text(char.text, char_pos_temp[0], char_pos_temp[1]);
          p5.pop();
        } else {
          break;
        }
      }
    }
    p5.pop();

    // 針の描画
    p5.push();
    p5.imageMode(p5.CORNER);
    let angle_needle = angle_needle_min
                       + (angle_needle_max - angle_needle_min) * GetPositionByAngle(angle_canvas) / (player.video.duration);
    p5.translate(needle_axis_pos_default[0], needle_axis_pos_default[1]);
    p5.rotate(angle_needle);
    p5.translate(-needle_axis_pos_default[0], -needle_axis_pos_default[1]);
    p5.image(img_needle, 0, 0);
    p5.pop();

    // 針カバーの描画
    p5.push();
    p5.imageMode(p5.CORNER);
    p5.image(img_needle_cover, 0, 0);
    p5.pop();

    // ボタンの描画
    p5.image(img_back, 0, 0);
    // 再生中 or 停止中でライトの色を切り替える
    if ((play_mode == 1) ||
        (play_mode == 3)) {
      p5.image(img_startstop_play, 0, 0);
      p5.image(img_replay_play, 0, 0);
    } else {
      p5.image(img_startstop_stop, 0, 0);
      p5.image(img_replay_stop, 0, 0);
    }
  };

  p5.windowResized = () => {
    p5.ResizeWindow();
  };

/**
 * @fn GetNextChar
 * @brief 入力時刻における次の発声文字を取得する
 * @param[in] position: 検索したい時刻
 * @return 次の発声文字
 * @detail 発声中の場合、現在発声中の次の文字を返す
 */
  p5.GetNextChar = (position) => {
    let next_char = player.video.findChar(position, { loose: true });
    if (player.video.findChar(position, { loose: false }) != null) {
      // 発声中の場合、現在発声中の次の文字
      next_char = next_char.next;
    }
    return next_char;
  };

/**
 * @fn ResizeWindow
 * @brief 全体をウインドウサイズに合わせる
 */
  p5.ResizeWindow = () => {
    // 現在のウインドウサイズを取得
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 短い方に合わせてデフォルトサイズに対する拡大率を決める
    let magnification_width = width / default_width;
    let magnification_height = height / default_height;

    if (magnification_width < magnification_height) {
      genaral_magnification = magnification_width;
    } else {
      genaral_magnification = magnification_height;
    }
    // p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    // p5.scale(genaral_magnification);
    startstop_button = document.getElementById("startstop");
    startstop_button.style.width = (startstop_button_size_default[0] * genaral_magnification) + 'px';
    startstop_button.style.height = (startstop_button_size_default[1] * genaral_magnification) + 'px';
    startstop_button.style.left = (startstop_button_pos_default[0] * genaral_magnification) + 'px';
    startstop_button.style.top = (startstop_button_pos_default[1] * genaral_magnification) + 'px';

    replay_button = document.getElementById("replay");
    replay_button.style.width = (replay_button_size_default[0] * genaral_magnification) + 'px';
    replay_button.style.height = (replay_button_size_default[1] * genaral_magnification) + 'px';
    replay_button.style.left = (replay_button_pos_default[0] * genaral_magnification) + 'px';
    replay_button.style.top = (replay_button_pos_default[1] * genaral_magnification) + 'px';

    back_button = document.getElementById("back");
    back_button.style.width = (back_button_size_default[0] * genaral_magnification) + 'px';
    back_button.style.height = (back_button_size_default[1] * genaral_magnification) + 'px';
    back_button.style.left = (back_button_pos_default[0] * genaral_magnification) + 'px';
    back_button.style.top = (back_button_pos_default[1] * genaral_magnification) + 'px';

    volume_slider = document.getElementById("volume_slider");
    volume_slider.style.width = (volume_slider_size_default[0] * genaral_magnification) + 'px';
    volume_slider.style.height = (volume_slider_size_default[1] * genaral_magnification) + 'px';
    volume_slider.style.left = (volume_slider_pos[0] * genaral_magnification) + 'px';
    volume_slider.style.top = (volume_slider_pos[1] * genaral_magnification) + 'px';
  };
});

/**
 * @fn CreatePositionList
 * @brief 歌詞の配置リストを作成する
 */
const CreatePositionList = () => {
  let previous_char_time = 0;
  let total_rotation_deg = 0;

  let rotation_time;
  let possible_rotation_deg;
  let char_pos_temp;

  // 計算に使うので[0]は0で固定
  rotation_list[0] = 0;
  starttime_list[0] = 0;
  rotation_list_size++;

  let char = player.video.findChar(0, {loose: true}); // 最初の発声文字
  while(char != null) {
    rotation_time = char.startTime - previous_char_time; // 次の発声までの時間[ms]

    possible_rotation_deg = rotation_time * rpm_default / 60000 * 360;
    if (possible_rotation_deg >= min_text_interval_deg) {
      // デフォルトのRPMで十分な回転が確保できている場合はそのまま表示
      total_rotation_deg += possible_rotation_deg;
    } else {
      // 文字が重なってしまう場合、規定の間隔だけずらす
      total_rotation_deg += min_text_interval_deg;
    }
    rotation_list[rotation_list_size] = total_rotation_deg;
    char_pos_temp = GetCharPos(total_rotation_deg);
    char_pos_list[rotation_list_size - 1] = [char_pos_temp[0], char_pos_temp[1], char_pos_temp[2]];

    let angle_needle = angle_needle_min
                       + (angle_needle_max - angle_needle_min) * char.startTime / (player.video.duration);
    let needle_pos_temp = GetNeedlePos(angle_needle, total_rotation_deg);
    needle_pos_list[rotation_list_size - 1] = [needle_pos_temp[0], needle_pos_temp[1]];

    previous_char_time = char.startTime;
    starttime_list[rotation_list_size] = char.startTime;

    char = char.next
    rotation_list_size++;
  }
  // 最後の歌詞発声から楽曲終了までの動きを作る(この期間はchar == null)
  rotation_time = player.video.duration - previous_char_time; // 次の発声までの時間[ms]
  possible_rotation_deg = rotation_time * rpm_default / 60000 * 360;
  total_rotation_deg += possible_rotation_deg;
  rotation_list[rotation_list_size] = total_rotation_deg;
  starttime_list[rotation_list_size] = player.video.duration;
  rotation_list_size++;
}

/**
 * @fn GetCharPos
 * @brief キャンバスの回転を考慮した歌詞の座標を取得する
 * @param[in] angle: 現在のキャンバスの回転角度[deg]
 * @retval x: 歌詞のX座標
 * @retval y: 歌詞のY座標
 * @retval char_rotation: 文字の回転角度[deg]
 */
const GetCharPos = (deg) => {
  let rad = Deg2Rad(text_area_angle_begin - deg); // 出現位置のオフセット+時計回り
  let x = needle_radius_default * Math.cos(rad) + record_pos_default[0];
  let y = needle_radius_default * Math.sin(rad) + record_pos_default[1];
  let char_rotation = text_area_angle_begin - deg - 90; // 円周沿いの向きになるように90°オフセット
  return [x, y, char_rotation];
}

/**
 * @fn GetNeedlePos
 * @brief レコード針の回転(楽曲の進行度)とキャンバスの回転を考慮したレコード針先端の位置を取得する
 * @param[in] needle: レコード針の回転角度[deg]
 * @param[in] canvas: キャンバスの回転角度[deg]
 * @retval x: 歌詞のX座標
 * @retval y: 歌詞のY座標
 */
const GetNeedlePos = (needle, canvas) => {
  // まずはキャンバスの回転を考慮しない見かけ上の位置を計算する
  let angle_needle_rad = Deg2Rad(needle_angle_offset + needle);
  let x_norotation = needle_arm_length * Math.cos(angle_needle_rad) + needle_axis_pos_default[0];
  let y_norotation = needle_arm_length * Math.sin(angle_needle_rad) + needle_axis_pos_default[1];

  // 次に、キャンバスの回転を考慮するとこの位置がどの座標に来るかを計算する
  let radius = Math.hypot(x_norotation - record_pos_default[0], y_norotation - record_pos_default[1]);
  let angle_canvas_rad = Deg2Rad(text_area_angle_begin - canvas);
  let x = radius * Math.cos(angle_canvas_rad) + record_pos_default[0];
  let y = radius * Math.sin(angle_canvas_rad) + record_pos_default[1];
  return [x, y];
}

/**
 * @fn isInDisc
 * @brief クリック/タップされた場所がディスク上かどうかを判定する
 * @param[in] x: X座標
 * @param[in] y: Y座標
 * @retval true: ディスク上
 * @retval false: ディスク上でない
 */
const isInDisc = (x, y) => {
  // ウインドウ倍率1の時のレコードの中心は[550, 500]
  let disc_center_x = record_pos_default[0] * genaral_magnification;
  let disc_center_y = record_pos_default[1] * genaral_magnification;
  let disc_radius = disc_radius_default * genaral_magnification;

  // 入力されたX座標におけるレコードの外周のY座標を求める
  let distance_x = Math.abs(x - disc_center_x);

  if (distance_x > disc_radius) {
    // まずX座標で円の内側にいるか判定する
    return false;
  }
  // 円周上のそのX座標の角度を計算
  let angle_rad = Math.acos(distance_x / disc_radius);

  // Y座標の上限と下限を計算
  let max_y = disc_center_y + disc_radius * Math.sin(angle_rad);
  let min_y = disc_center_y - disc_radius * Math.sin(angle_rad);

  if ((min_y <= y) &&
       (y <= max_y)) {
    // Y座標も範囲内にいれば円周内にいる判定
    return true;
  } else {
    return false;
  }
}

/**
 * @fn GetAngleOnDisc
 * @brief ポインター位置のディスク中心に対する角度[deg]を取得する
 * @param[in] x: X座標
 * @param[in] y: Y座標
 * @return ポインター位置のディスク中心に対する角度[deg]
 */
const GetAngleOnDisc = (x, y) => {
  let disc_center_x = record_pos_default[0] * genaral_magnification;
  let disc_center_y = record_pos_default[1] * genaral_magnification;

  // 入力されたX座標におけるレコードの外周のY座標を求める
  let distance_x = x - disc_center_x;
  let distance_y = y - disc_center_y;

  // ディスク中心に対する角度を計算
  let angle_rad = Math.atan2(distance_x, distance_y);
  let angle_deg = Rad2Deg(angle_rad);
  return angle_deg;
}

/**
 * @fn GetPositionByAngle
 * @brief 入力角度に対応した再生時間を取得する
 * @param[in] angle: 角度[deg]
 * @return 再生時間[ms]
 */
const GetPositionByAngle = (angle) => {
  let i;
  let progress;
  let position;

  for (i = 0; i < rotation_list_size; i++) {
    if (angle < rotation_list[i]) {
      break;
    }
  }
  if (i == rotation_list_size) {
    position = starttime_list[i - 1];
  } else {
    progress = (angle - rotation_list[i - 1])
                  / (rotation_list[i] - rotation_list[i - 1]);
    position = starttime_list[i - 1]
                  + (starttime_list[i] - starttime_list[i - 1]) * progress;
  }
  return position;
}

/**
 * @fn Deg2Rad
 * @brief Deg -> Radの変換を行う
 * @param[in] deg: 角度[deg]
 * @return 角度[rad]
 */
const Deg2Rad = (deg) => {
  let rad = deg / 180 * Math.PI;
  return rad;
}

/**
 * @fn Rad2Deg
 * @brief Rad -> Degの変換を行う
 * @param[in] rad: 角度[rad]
 * @return 角度[deg]
 */
const Rad2Deg = (rad) => {
  let deg = rad / Math.PI * 180;
  return deg;
}
