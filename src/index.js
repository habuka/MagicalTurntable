import P5 from "p5";
import { Player, Ease } from "textalive-app-api";

let angle = 0;

// プレイヤーの初期化 / Initialize TextAlive Player
const player = new Player({
  // トークンは https://developer.textalive.jp/profile で取得したものを使う
  app: { token: "ZkFzIGUn8CuGxtOC" },
  mediaElement: document.querySelector("#media"),
});

// リスナの登録 / Register listeners
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
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

      // 生きること / nogumi feat. 初音ミク
      // player.createFromSongUrl("https://piapro.jp/t/fnhJ/20230131212038", {
      //   video: {
      //     // 音楽地図訂正履歴: https://songle.jp/songs/2427949/history
      //     beatId: 4267300,
      //     chordId: 2405033,
      //     repetitiveSegmentId: 2475606,
      //     // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FfnhJ%2F20230131212038
      //     lyricId: 56131,
      //     lyricDiffId: 9638
      //   },
      // });

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
      //     lyricId: 56097,
      //     lyricDiffId: 9640
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
});

// 停止ボタン
document.querySelector("#stop").addEventListener("click", () => {
  player.requestStop();
});

// p5.js を初期化
new P5((p5) => {
  // キャンバスの大きさなどを計算
  const width = Math.min(1600, window.innerWidth);
  const height = Math.min(800, window.innerHeight);
  const margin = 30;
  const numChars = 10;
  const textAreaWidth = (width - margin * 2) / 2;

  // キャンバスを作成
  p5.setup = () => {
    p5.createCanvas(width, height);
    // p5.rectMode(CENTER);
    // p5.angleMode(DEGREES);
    p5.translate(width / 2, height / 2);
    p5.colorMode(p5.HSB, 100);
    p5.frameRate(30);
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
    // 回転角度を1°ずつ増やす
    angle += 0.01;

    // 初期値の原点を中心にキャンバスを回転
    p5.rotate(angle);

    const position = player.timer.position;

    // 背景
    p5.background(40);
    p5.ellipse(50,50,80,80);
    const beat = player.findBeat(position);
    if (beat) {
      const progress = beat.progress(position);
      const rectHeight = Ease.quintIn(progress) * height;
      p5.fill(0, 0, 0, Ease.quintOut(progress) * 60);
      p5.rect(0, rectHeight, width, height - rectHeight);
    }

    // 歌詞
    // - 再生位置より 100 [ms] 前の時点での発声文字を取得
    // - { loose: true } にすることで発声中でなければ一つ後ろの文字を取得
    let char = player.video.findChar(position - 100, { loose: true });

    if (char) {
      // 位置決めのため、文字が歌詞全体で何番目かも取得しておく
      let index = player.video.findIndex(char);

      while (char) {
        if (char.endTime + 160 < position) {
          // これ以降の文字は表示する必要がない
          break;
        }
        if (char.startTime < position + 100) {
          const x = ((index % numChars) + 0.5) * (textAreaWidth / numChars);
          let transparency,
            y = 0,
            size = 39;

          // 100 [ms] かけてフェードインしてくる
          if (position < char.startTime) {
            const progress = 1 - (char.startTime - position) / 100;
            const eased = Ease.circIn(progress);
            transparency = progress;
            size = 39 * eased + Math.min(width/2, height/2) * (1 - eased);
          }
          // 160 [ms] かけてフェードアウトする
          else if (char.endTime < position) {
            const progress = (position - char.endTime) / 160;
            const eased = Ease.quintIn(progress);
            transparency = 1 - eased;
            y = -eased * (height / 2);
          }
          // 発声区間中は完全に不透明
          else {
            transparency = 1;
          }

          p5.fill(0, 0, 100, transparency * 100);
          p5.textSize(size);
          p5.text(char.text, margin + x, height / 2 + y);
        }
        char = char.next;
        index++;
      }
    }
  };
});
