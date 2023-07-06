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
 * レコード針の回転角度の下限値[deg]
 * 曲の初めはこの位置
 */
const angle_needle_min = 16.5;

/**
 * レコード針の回転角度の上限値[deg]
 * 曲の終わりはこの位置
 */
const angle_needle_max = 38;

/**
 * アプリ全体の拡大率
 */
let genaral_magnification = 0;


let needle_pos;

/**
 * 歌詞ごとのキャンバス上の位置と角度{X座標, Y座標, 角度}
 * キャンバスの回転を加味した角度
 */
let char_pos = [];

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
 * レコードの中心座標
 */
let record_pos = [];

/**
 * 針の回転軸座標
 */
let needle_axis_pos = [];

/**
 * キャンバス自体の回転角度
 */
let angle_canvas = 0;

// プレイヤーの初期化 / Initialize TextAlive Player
const player = new Player({
  // トークンは https://developer.textalive.jp/profile で取得したものを使う
  app: { token: "xsnERhRnjyZIGziY" },
  mediaElement: document.querySelector("#media"),
});

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
      // king妃jack躍 / 宮守文学 feat. 初音ミク
      // player.createFromSongUrl("https://piapro.jp/t/ucgN/20230110005414", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2427948/history
      //     beatId: 4267297,
      //     chordId: 2405019,
      //     repetitiveSegmentId: 2475577 /* 2023/5/6 更新 */,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FucgN%2F20230110005414
      //     lyricId: 56092,
      //     lyricDiffId: 9636
      //   },
      // });

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

      // 唱明者 / すこやか大聖堂 feat. KAITO
      // player.createFromSongUrl("https://piapro.jp/t/Vfrl/20230120182855", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2427950/history
      //     beatId: 4267334,
      //     chordId: 2405059,
      //     repetitiveSegmentId: 2475645,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FVfrl%2F20230120182855
      //     lyricId: 56095,
      //     lyricDiffId: 9637
      //   },
      // });

      // ネオンライトの海を往く / Ponchi♪ feat. 初音ミク
      // player.createFromSongUrl("https://piapro.jp/t/fyxI/20230203003935", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2427951/history
      //     beatId: 4267373,
      //     chordId: 2405138,
      //     repetitiveSegmentId: 2475664,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FfyxI%2F20230203003935
      //     lyricId: 56096,
      //     lyricDiffId: 9639
      //   },
      // });

      // ミュウテイション / Rin（Kuroneko Lounge） feat. 初音ミク
      // player.createFromSongUrl("https://piapro.jp/t/Wk83/20230203141007", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2427952/history
      //     beatId: 4267381,
      //     chordId: 2405285,
      //     repetitiveSegmentId: 2475676,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FWk83%2F20230203141007
      //     lyricId: 56812 /* 6月27日更新 */,
      //     lyricDiffId: 10668 /* 6月27日更新 */
      //   },
      // });

      // Entrust via 39 / ikomai feat. 初音ミク
      // player.createFromSongUrl("https://piapro.jp/t/Ya0_/20230201235034", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2427953/history
      //     beatId: 4269734,
      //     chordId: 2405723,
      //     repetitiveSegmentId: 2475686,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYa0_%2F20230201235034
      //     lyricId: 56098,
      //     lyricDiffId: 9643
      //   },
      // });

      // player.createFromSongUrl("https://piapro.jp/t/FDb1/20210213190029", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2121525/history
      //     beatId: 3953882,
      //     repetitiveSegmentId: 2099561,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FFDb1%2F20210213190029
      //     lyricId: 52065,
      //     lyricDiffId: 5093,
      //   },
      // });

      document.querySelector("#control").className = "active";
    } else {
      document.querySelector("#control").className = "inactive";
    }
  },

  onTextLoad: (body) => {
    // Webフォントを確実に読み込むためDOM要素に歌詞を貼り付ける
    document.querySelector("#dummy").textContent = body?.text;
  },

  onVideoReady: () => {
    if (!player.app.managed) {
      document.querySelector("#message").className = "active";
    }
    document.querySelector("#overlay").className = "inactive";
  },

  onPlay: () => {
    document.querySelector("#message").className = "inactive";
    console.log("player.onPlay");
  },

  onPause: () => {
    if (!player.app.managed) {
      document.querySelector("#message").className = "active";
    }
    console.log("player.onPause");
  },

  onSeek: () => {
    console.log("player.onSeek");
  },

  onStop: () => {
    console.log("player.onStop");
  },
});

// 再生ボタン
document.querySelector("#play").addEventListener("click", () => {
  player.requestPlay();
  // 読み込み時に発声タイミングからレコード上の配置リストを作る
  CreatePositionList();
  angle_canvas = 0;
});

// 停止ボタン
document.querySelector("#stop").addEventListener("click", () => {
  player.requestStop();
});

// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const width = default_width;
  const height = default_height;
  const frame_rate = 30;
  record_pos = [width / 2 - 100, height / 2];
  needle_axis_pos = [1087, 244];

  p5.preload = () => {
    // 画像を読み込む
    img_disc = p5.loadImage("../img/disc.png"); // ディスク
    img_needle = p5.loadImage("../img/needle.png"); // 針
    img_frame = p5.loadImage("../img/frame.png"); // フレーム
  }

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.ResizeWindow();
    p5.translate(width / 2, height / 2);
    p5.colorMode(p5.HSB, 100);
    p5.angleMode(p5.DEGREES);
    p5.frameRate(frame_rate);
    p5.background(40);
    p5.noStroke();
    p5.textFont("Noto Sans JP");
    p5.textAlign(p5.CENTER, p5.CENTER);
  };

  // ビートにあわせて背景を、発声にあわせて歌詞を表示
  p5.draw = () => {
    // プレイヤーが準備できていなかったら何もしない
    if (!player || !player.video) {
      return;
    }
    // 現在の再生位置
    const position = player.timer.position;

    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.scale(genaral_magnification);

    player.volume = 20;

    // 筐体
    p5.imageMode(p5.CORNER);
    p5.image(img_frame, 0, 0);
    const beat = player.findBeat(position);
    if (beat) {
      const progress = beat.progress(position);
      const rectHeight = Ease.quintIn(progress) * height;
      p5.fill(0, 0, 0, Ease.quintOut(progress) * 60);
      p5.rect(0, rectHeight, width, height - rectHeight);
    }

    // ディスク回転
    p5.push();
    p5.imageMode(p5.CENTER);
    let angle_disc = rpm_default / 60000 * 360 * position;
    p5.translate(record_pos[0], record_pos[1]);
    p5.rotate(angle_disc);
    p5.image(img_disc, 0, 0);
    p5.pop();

    // 針
    p5.push();
    p5.imageMode(p5.CORNER);
    let angle_needle = (angle_needle_min
                        + (angle_needle_max - angle_needle_min) * position / (player.video.duration));
    p5.translate(needle_axis_pos[0], needle_axis_pos[1]);
    p5.rotate(angle_needle);
    p5.translate(-needle_axis_pos[0], -needle_axis_pos[1]);
    p5.image(img_needle, 0, 0);
    p5.pop();
    console.log(player.video.duration, angle_needle);

    // このフレームでのキャンバス角度を決める
    // 次の発声文字から歌詞インデックスを取得
    let next_char = p5.GetNextChar(position);
    let char_index = player.video.findIndex(next_char);

    // 回転角度リストを元に現在時刻における線形補完値を算出
    let per = (position - starttime_list[char_index - 1])
              / (starttime_list[char_index] - starttime_list[char_index - 1]);
    angle_canvas = rotation_list[char_index - 1]
                   + (rotation_list[char_index] - rotation_list[char_index - 1]) * per;

    // キャンバス回転
    p5.translate(record_pos[0], record_pos[1]);
    p5.rotate(angle_canvas);
    p5.translate(-record_pos[0], -record_pos[1]);

    // 歌詞
    // - 再生位置より 100 [ms] 前の時点での発声文字を取得
    // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
    let char = player.video.findChar(position - 10000, { loose: true });

    if (char) {
      // 位置決めのため、文字が歌詞全体で何番目かも取得しておく
      let index = player.video.findIndex(char);

      // 表示領域(-5°～+365°)に含まれていたら描画する
      while (char) {
        if ((rotation_list[index] -5 <= angle_canvas) &&
            (angle_canvas <= rotation_list[index] + 300)) {
          if (char.endTime + 10000 < position) {
            // これ以降の文字は表示する必要がない
            break;
          }
          if (char.startTime < position + 100) {
            let transparency;
            let size = 39;

            // 100 [ms] かけてフェードインしてくる
            if (position < char.startTime) {
              const progress = 1 - (char.startTime - position) / 100;
              const eased = Ease.circIn(progress);
              transparency = progress;
              size = 39 * eased + Math.min(width/2, height/2) * (1 - eased);
            } else if (rotation_list[index] + 270 <= angle_canvas) {
              // 30°かけてフェードアウトする
              transparency = 1 - (angle_canvas - rotation_list[index] - 270) / 30;
              console.log(transparency);
            } else {
              // 発声区間中は完全に不透明
              transparency = 1;
            }
            if (char_pos[index] == null) {
              needle_pos = p5.GetNeedlePos(rotation_list[index]);
              char_pos[index] = [needle_pos[0], needle_pos[1], needle_pos[2]];
            }

            p5.fill(0, 0, 100, transparency * 100);
            p5.textSize(size);
            // needle_pos = p5.GetNeedlePos(angle_canvas);
            needle_pos = p5.GetNeedlePos(rotation_list[index]);
            p5.push();
            p5.translate(char_pos[index][0], char_pos[index][1]);
            p5.rotate(char_pos[index][2]);
            p5.translate(-char_pos[index][0], -char_pos[index][1]);
            p5.text(char.text, char_pos[index][0], char_pos[index][1]);

            // console.log(char.text, needle_pos[0], needle_pos[1], needle_pos[2]);
            p5.pop();
          }
        }
        char = char.next;
        index++;
      }
    }
  };

/**
 * @fn GetNeedlePos
 * @brief キャンバスの回転を考慮したレコード針の場所(歌詞が出る場所)を取得する
 * @param[in] angle: 現在のキャンバスの回転角度[deg]
 * @retval x: レコード針のX座標
 * @retval y: レコード針のX座標
 * @retval deg: 文字の回転角度
 */
  p5.GetNeedlePos = (deg) => {
    rad = Deg2Rad(text_area_angle_begin - deg); // 初期値を真下方向に
    radius = height / 2 - 100;
    x = radius * Math.cos(rad) + record_pos[0];
    y = radius * Math.sin(rad) + record_pos[1];
    // console.log(x, y, deg, angle);
    return [x, y, text_area_angle_begin - deg - 90];
  }

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
  }

  p5.windowResized = () => {
    p5.ResizeWindow();
  }

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
    button = p5.createButton("じゃんけん");
  }
});

const CreatePositionList = () => {
  let index = 0;
  let previous_char_time = 0;
  let total_rotation_deg = 0;

  let rotation_time;
  let char = player.video.findChar(0, {loose: true}); // 最初の発声文字
  while(char != null) {
    rotation_time = char.startTime - previous_char_time; // 次の発声までの時間[ms]

    let possible_rotation_deg = rotation_time * rpm_default / 60000 * 360;
    if (possible_rotation_deg >= min_text_interval_deg) {
      // デフォルトのRPMで十分な回転が確保できている場合はそのまま表示
      total_rotation_deg += possible_rotation_deg;
    } else {
      // 文字が重なってしまう場合、規定の間隔だけずらす
      total_rotation_deg += min_text_interval_deg;
    }
    rotation_list[index] = total_rotation_deg;

    previous_char_time = char.startTime;
    starttime_list[index] = char.startTime;

    console.log(char.text, char.startTime);

    char = char.next
    index++;
  }
}

const Deg2Rad = (deg) => {
  let rad = deg / 180 * Math.PI;
  return rad;
}

const Rad2Deg = (rad) => {
  let deg = rad / Math.PI * 180;
  return deg;
}
