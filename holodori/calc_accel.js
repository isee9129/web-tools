"use strict";

/*
 * ホロメン5人分の入力欄を生成。
 * Notebook の @param に対応するUI。
 */

const holomems = ["ときのそら", "ロボ子さん", "AZKi", "さくらみこ", "星街すいせい", "アキ・ローゼンタール", "赤井はあと", "白上フブキ", "夏色まつり", "百鬼あやめ", "癒月ちょこ", "大空スバル", "大神ミオ", "猫又おかゆ", "戌神ころね", "兎田ぺこら", "不知火フレア", "白銀ノエル", "宝鐘マリン", "角巻わため", "常闇トワ", "姫森ルーナ", "雪花ラミィ", "桃鈴ねね", "獅白ぼたん", "尾丸ポルカ", "ラプラス・ダークネス", "鷹嶺ルイ", "博衣こより", "風真いろは", "アユンダ・リス", "ムーナ・ホシノヴァ", "アイラニ・イオフィフティーン", "クレージー・オリー", "アーニャ・メルフィッサ", "パヴォリア・レイネ", "ベスティア・ゼータ", "カエラ・コヴァルスキア", "こぼ・かなえる", "森カリオペ", "小鳥遊キアラ", "一伊那尓栖", "IRyS", "オーロ・クロニー", "ハコス・ベールズ", "シオリ・ノヴェラ", "古石ビジュー", "ネリッサ・レイヴンクロフト", "フワワ・アビスガード", "モココ・アビスガード", "音乃瀬奏", "一条莉々華", "儒烏風亭らでん", "轟はじめ"];

const STORAGE_KEY = "holodream_accel_inputs";

// 保存対象のID
const inputIds = [
  ...Array.from({ length: 5 }, (_, i) => [
    `member${i}_name`,
    `member${i}_cooldown`,
    `member${i}_duration`,
    `member${i}_rate`,
    `member${i}_limit`
  ]).flat(),
  "overallLimit",
  "priority",
  "startTime",
  "endTime",
  ...Array.from({ length: 5 }, (_, i) => `kaihou${i}`)
];

// 保存
function saveInputs() {
  const values = {};

  for (const id of inputIds) {
    const element = document.getElementById(id);
    if (element) {
      values[id] = element.value;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

// 復元
function restoreInputs() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const values = JSON.parse(saved);

    for (const id of inputIds) {
      const element = document.getElementById(id);

      if (element && Object.hasOwn(values, id)) {
        element.value = values[id];
      }
    }
  } catch (e) {
    console.warn("保存された入力値を読み込めませんでした:", e);
  }
}

const priorityElement = document.getElementById("priority");
const userKaihouSettings =
  document.getElementById("userKaihouSettings");

function updateKaihouSettingsVisibility() {
  userKaihouSettings.hidden = priorityElement.value !== "user";
}

priorityElement.addEventListener(
  "change",
  updateKaihouSettingsVisibility
);

updateKaihouSettingsVisibility();

const membersElement = document.getElementById("members");

for (let i = 0; i < 5; i++) {

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>${i + 1} 人目</h3>
    <div class="field-grid">
      <div class="field full">
        <label for="member${i}_name">名前</label>
        <select id="member${i}_name">
          ${holomems.map(name => `<option value="${name}">${name}</option>`).join("")}
        </select>
      </div>

      <div class="field">
        <label for="member${i}_cooldown">発動間隔（秒）</label>
        <input id="member${i}_cooldown" type="number"
               min="1" step="any" value="50">
      </div>

      <div class="field">
        <label for="member${i}_duration">持続時間（秒）</label>
        <input id="member${i}_duration" type="number"
               min="1" step="any" value="10">
      </div>

      <div class="field">
        <label for="member${i}_rate">上昇率（%）</label>
        <input id="member${i}_rate" type="number"
               min="0" step="1" value="150">
      </div>

      <div class="field">
        <label for="member${i}_limit">解放上限</label>
        <input id="member${i}_limit" type="number"
               min="0" step="1" value="3">
      </div>
    </div>
  `;

  membersElement.appendChild(card);
}

// 前回の入力値を復元
restoreInputs();

// 入力値が変更されたら自動保存
for (const id of inputIds) {
  const element = document.getElementById(id);

  if (element) {
    element.addEventListener("change", saveInputs);

    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("calculateButton").click();
      }
    });
  }
}

function displayResult(result) {
  const resultElement = document.getElementById("result");
  const releaseSettings = document.getElementById("releaseSettings");
  const noSkillIntervals = document.getElementById("noSkillIntervals");

  releaseSettings.innerHTML = "";
  noSkillIntervals.innerHTML = "";

  result.releaseSettings.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `${item.name}：${item.count} 個`;
    releaseSettings.appendChild(li);
  });

  document.getElementById("totalRate").textContent =
    result.totalRate.toFixed(3);

  document.getElementById("noSkillTime").textContent =
    result.noSkillTime.toFixed(3) + " 秒";

  result.noSkillIntervals.forEach(item => {
    const li = document.createElement("li");
    li.textContent =
      `長さ ${item.length.toFixed(3)}秒：時刻 ` +
      `${item.start.toFixed(3)}秒 ～ ${item.end.toFixed(3)}秒 - ${item.description}`;
    noSkillIntervals.appendChild(li);
  });

  if (result.noSkillIntervals.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "スキルなし区間はありません。";
    noSkillIntervals.appendChild(li);
  }

  resultElement.classList.add("visible");

  drawTimeline(result);
}

/*
 * matplotlib のグラフに対応する簡易タイムライン。
 * 計算ロジック完成後は result.timeline を利用して描画する。
 */
function drawTimeline(result) {
  const canvas = document.getElementById("timeline");
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = Math.max(canvas.parentElement.clientWidth, 760);
  const cssHeight = 280;

  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const L = result.startTime - 5;
  const R = result.endTime + 5;
  const left = 90;
  const right = cssWidth - 15;
  const top = 20;
  const rowHeight = 32;
  const gap = 10;

  const x = t => left + (t - L) / (R - L) * (right - left);


  // 縦グリッド
  ctx.setLineDash([4, 4]);
  for (let t = Math.ceil(L / 10) * 10; t <= R; t += 10) {
    ctx.strokeStyle = "rgba(128,128,128,1)";
    ctx.beginPath();
    ctx.moveTo(x(t), top);
    ctx.lineTo(x(t), top + rowHeight * 6 + gap);
    ctx.stroke();
  }

  ctx.setLineDash([2, 4]);
  for (let t = Math.ceil(L / 5) * 5; t <= R; t += 5) {
    if (t % 10 === 0) continue;
    ctx.strokeStyle = "rgba(192,192,192,1)";
    ctx.beginPath();
    ctx.moveTo(x(t), top);
    ctx.lineTo(x(t), top + rowHeight * 6 + gap);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 行ラベル
  const namedata = { "ときのそら": "そら", "ロボ子さん": "ロボ子さん", "AZKi": "アズキ", "さくらみこ": "みこ", "星街すいせい": "すいせい", "アキ・ローゼンタール": "アキ", "赤井はあと": "はあと", "白上フブキ": "フブキ", "夏色まつり": "まつり", "百鬼あやめ": "あやめ", "癒月ちょこ": "ちょこ", "大空スバル": "スバル", "大神ミオ": "ミオ", "猫又おかゆ": "おかゆ", "戌神ころね": "ころね", "兎田ぺこら": "ぺこら", "不知火フレア": "フレア", "白銀ノエル": "ノエル", "宝鐘マリン": "マリン", "角巻わため": "わため", "常闇トワ": "トワ", "姫森ルーナ": "ルーナ", "雪花ラミィ": "ラミィ", "桃鈴ねね": "ねね", "獅白ぼたん": "ぼたん", "尾丸ポルカ": "ポルカ", "ラプラス・ダークネス": "ラプラス", "鷹嶺ルイ": "ルイ", "博衣こより": "こより", "風真いろは": "いろは", "アユンダ・リス": "リス", "ムーナ・ホシノヴァ": "ムーナ", "アイラニ・イオフィフティーン": "イオフィ", "クレージー・オリー": "オリー", "アーニャ・メルフィッサ": "アーニャ", "パヴォリア・レイネ": "レイネ", "ベスティア・ゼータ": "ゼータ", "カエラ・コヴァルスキア": "カエラ", "こぼ・かなえる": "こぼ", "森カリオペ": "カリオペ", "小鳥遊キアラ": "キアラ", "一伊那尓栖": "伊那尓栖", "IRyS": "アイリス", "オーロ・クロニー": "クロニー", "ハコス・ベールズ": "ベールズ", "シオリ・ノヴェラ": "シオリ", "古石ビジュー": "ビジュー", "ネリッサ・レイヴンクロフト": "ネリッサ", "フワワ・アビスガード": "フワワ", "モココ・アビスガード": "モココ", "音乃瀬奏": "奏", "一条莉々華": "莉々華", "儒烏風亭らでん": "らでん", "轟はじめ": "はじめ" };
  ctx.fillStyle = "#333";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i < 5; i++) {
    ctx.fillText(namedata[result.releaseSettings[i].name], left - 10,
      top + i * (rowHeight - 3) + rowHeight / 2 + 15);
  }
  ctx.fillText("all", left - 10,
    top + 5 * rowHeight + rowHeight / 2 + 5);

  // 時刻ラベル
  ctx.textAlign = "center";
  for (let t = Math.ceil(L / 10) * 10; t <= R; t += 10) {
    ctx.fillText(String(t), x(t), top + rowHeight * 6 + gap + 20);
  }

  // 各ホロメンのスキル区間
  for (let i = 0; i < 5; i++) {
    const y = top + i * (rowHeight - 3) + 12;
    const color = result.colors[i] || "#999";

    for (const interval of result.memberIntervals[i]) {
      const l = Math.max(interval.start, L);
      const r = Math.min(interval.end, R);
      if (l >= r) continue;

      ctx.fillStyle = color;
      ctx.fillRect(x(l), y, x(r) - x(l), rowHeight - 3);

      // 単独発動時間に応じたマーク
      let mark = "";
      let size = "13";

      if (interval.soloTime > 3) {
        mark = "★";
      } else if (interval.soloTime > 1) {
        mark = "■";
      } else if (interval.soloTime > 0) {
        mark = "▲"; size = "9"
      }

      if (mark !== "") {
        const centerX = (x(l) + x(r)) / 2;
        const centerY = y + (rowHeight - 3) / 2 + 2;

        ctx.font = size + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(mark, centerX, centerY);
        // ctx.fillStyle = "#333";
        // ctx.fillText(mark2, centerX, centerY);
      }
    }
  }

  ctx.textBaseline = "alphabetic";

  // all 行
  const allY = top + 5 * rowHeight;

  let mergedInterval = null;

  for (const interval of result.allIntervals) {
    const l = Math.max(interval.start, L);
    const r = Math.min(interval.end, R);

    if (l >= r || interval.memberIndex < 0) continue;

    if (
      mergedInterval !== null &&
      mergedInterval.memberIndex === interval.memberIndex &&
      mergedInterval.end === l
    ) {
      // 同じ色かつ連続しているので結合
      mergedInterval.end = r;
    } else {
      // これまでの長方形を描画
      if (mergedInterval !== null) {
        ctx.fillStyle =
          result.colors[mergedInterval.memberIndex] || "#999";

        ctx.fillRect(
          x(mergedInterval.start),
          allY,
          x(mergedInterval.end) - x(mergedInterval.start),
          rowHeight - 3
        );
      }

      mergedInterval = {
        start: l,
        end: r,
        memberIndex: interval.memberIndex
      };
    }
  }

  // 最後の長方形を描画
  if (mergedInterval !== null) {
    ctx.fillStyle =
      result.colors[mergedInterval.memberIndex] || "#999";

    ctx.fillRect(
      x(mergedInterval.start),
      allY,
      x(mergedInterval.end) - x(mergedInterval.start),
      rowHeight - 3
    );
  }
  // 枠線は matplotlib 版と同様に描かない。
}

/* Python版の計算処理をJavaScriptへ移植 */
function calculate(members, overallLimit, startTime, endTime, priority, userKaihou) {
  const compareTime = priority === "time";
  let bestScore1 = compareTime ? 10000 : 0;
  let bestScore2 = compareTime ? 0 : 10000;
  let bestKaihou = [0, 0, 0, 0, 0];
  let bestEvents = [];
  let bestMemberIntervals = [];

  // 探索する解放設定を作る
  let kaihouCandidates;

  if (priority === "user") {
    // ユーザー指定の場合は探索せず、指定された1パターンだけを計算
    kaihouCandidates = [userKaihou.slice()];
  } else {
    // これまで通り 4^5 = 1024 通りを全探索
    kaihouCandidates = [];

    for (let k0 = 0; k0 < 4; k0++) {
      for (let k1 = 0; k1 < 4; k1++) {
        for (let k2 = 0; k2 < 4; k2++) {
          for (let k3 = 0; k3 < 4; k3++) {
            for (let k4 = 0; k4 < 4; k4++) {
              const kaihou = [k0, k1, k2, k3, k4];
              if (kaihou.some((k, i) => k > members[i].limit)) continue;
              if (kaihou.reduce((a, b) => a + b, 0) > overallLimit) continue;
              kaihouCandidates.push(kaihou);
            }
          }
        }
      }
    }
  }

  for (const kaihou of kaihouCandidates) {
    // 以下は既存の処理をそのまま
    const cooldowns = members.map((m, i) => m.cooldown / (1 + kaihou[i] * 0.04));
    const skillEvents = [];
    for (let i = 0; i < 5; i++) {
      const cd = cooldowns[i], dur = members[i].duration;
      let t = cd;
      while (t < endTime + 10) {
        skillEvents.push([t, -1, i]);
        t += dur;
        if (t >= endTime + 10) break;
        skillEvents.push([t, 1, i]);
        t += cd - dur;
      }
    }
    skillEvents.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

    const events = [[0, -1]];
    const active = [false, false, false, false, false];

    // 各スキルの発動区間
    const memberIntervals = Array.from({ length: 5 }, () => []);

    // 現在発動中の区間。
    // スキルが開始したときに作成し、終了したときに確定する。
    const currentIntervals = Array(5).fill(null);

    // 直前のイベント時刻
    let prevEventTime = 0;
    for (const [t, d, i] of skillEvents) {
      // 直前のイベントから今回のイベントまで、
      // どのスキルが発動していたかを調べる。
      const dt = t - prevEventTime;

      if (dt > 0) {
        let activeCount = 0;
        let soleIndex = -1;

        for (let j = 0; j < 5; j++) {
          if (active[j]) {
            activeCount++;
            soleIndex = j;
          }
        }

        // この区間で発動していたスキルが1人だけなら、
        // そのスキルの soloTime に加算する。
        if (activeCount === 1 && currentIntervals[soleIndex] !== null) {
          const l = Math.max(prevEventTime, startTime - 5);
          const r = Math.min(t, endTime + 5);

          if (l < r) {
            currentIntervals[soleIndex].soloTime += r - l;
          }
        }
      }

      // 今回のイベントを反映
      active[i] = (d === -1);

      // 開始イベント
      if (d === -1) {
        currentIntervals[i] = {
          start: t,
          end: null,
          soloTime: 0
        };
      }
      // 終了イベント
      else {
        if (currentIntervals[i] !== null) {
          currentIntervals[i].end = t;

          const interval = currentIntervals[i];

          const l = Math.max(interval.start, startTime - 5);
          const r = Math.min(interval.end, endTime + 5);

          if (l < r) {
            memberIntervals[i].push({
              start: l,
              end: r,
              soloTime: interval.soloTime
            });
          }

          currentIntervals[i] = null;
        }
      }

      let curi = -1, curRate = -1;

      for (let j = 0; j < 5; j++) {
        if (active[j] && curRate < members[j].rate) {
          curi = j;
          curRate = members[j].rate;
        }
      }

      // 以下は既存の処理
      if (events[events.length - 1][0] === t) events[events.length - 1] = [t, curi];
      else events.push([t, curi]);
      prevEventTime = t;
    }
    events.push([endTime + 10, -1]);

    let noSkillTime = 0, sumRate = 0, prevt = startTime, previ = -1;
    for (const [t, i] of events) {
      if (t >= prevt) {
        const dt = Math.min(t, endTime) - prevt;
        if (previ === -1) noSkillTime += dt;
        else sumRate += dt * members[previ].rate;
        prevt = t;
      }
      previ = i;
      if (t > endTime) break;
    }

    const score1 = compareTime ? noSkillTime : -sumRate;
    const score2 = compareTime ? -sumRate : noSkillTime;
    if (bestScore1 > score1 || (bestScore1 === score1 && bestScore2 > score2)) {
      bestScore1 = score1; bestScore2 = score2;
      bestKaihou = kaihou.slice(); bestEvents = events.map(e => e.slice());
      bestMemberIntervals = memberIntervals.map(intervals =>
        intervals.map(interval => ({ ...interval }))
      );
    }
  }

  const bestTime = compareTime ? bestScore1 : bestScore2;
  const bestRate = compareTime ? -bestScore2 : -bestScore1;
  const cooldowns = members.map((m, i) => m.cooldown / (1 + bestKaihou[i] * 0.04));
  const memberIntervals = bestMemberIntervals;
  const L = startTime - 5, R = endTime + 5;

  // for(let i=0;i<5;i++) {
  //   const a=[]; let x=cooldowns[i];
  //   while(x<R) {
  //     const left=Math.max(x,L), right=Math.min(x+members[i].duration,R);
  //     if(left<right) a.push({start:left,end:right});
  //     x+=cooldowns[i];
  //   }
  //   memberIntervals.push(a);
  // }

  const allIntervals = [];
  for (let i = 0; i < bestEvents.length - 1; i++) {
    const [t, idx] = bestEvents[i], next = bestEvents[i + 1][0];
    if (idx === -1) continue;
    const left = Math.max(t, L), right = Math.min(next, R);
    if (left < right) allIntervals.push({ start: left, end: right, memberIndex: idx });
  }

  const noSkillIntervals = [];
  for (let i = 0; i < bestEvents.length - 1; i++) {
    const [cur, idx] = bestEvents[i], [next, nextIdx] = bestEvents[i + 1];
    if (idx !== -1 || next <= startTime || endTime <= cur) continue;
    const left = Math.max(cur, startTime), right = Math.min(next, endTime);
    if (left >= right) continue;
    let description;
    if (cur <= startTime && next > startTime) {
      description = next >= endTime ? "計測開始 ～ 計測終了" : `計測開始 ～ ${members[nextIdx].name} 開始`;
    } else if (next >= endTime) {
      const prevIdx = i > 0 ? bestEvents[i - 1][1] : -1;
      description = prevIdx >= 0 ? `${members[prevIdx].name} 終了 ～ 計測終了` : "計測開始 ～ 計測終了";
    } else {
      const prevIdx = i > 0 ? bestEvents[i - 1][1] : -1;
      description = prevIdx >= 0 && nextIdx >= 0 ? `${members[prevIdx].name} 終了 ～ ${members[nextIdx].name} 開始` : "スキルなし";
    }
    noSkillIntervals.push({ start: left, end: right, length: right - left, description });
  }

  const colorData = { "ときのそら": "#6878FF", "ロボ子さん": "#FF6187", "AZKi": "#F081A3", "さくらみこ": "#FF909E", "星街すいせい": "#75C0FF", "アキ・ローゼンタール": "#ABE64D", "赤井はあと": "#E5395B", "白上フブキ": "#93D5F2", "夏色まつり": "#FFCB30", "百鬼あやめ": "#DD305B", "癒月ちょこ": "#FF5487", "大空スバル": "#E5CE00", "大神ミオ": "#DB3131", "猫又おかゆ": "#D866ED", "戌神ころね": "#FFCD28", "兎田ぺこら": "#57A9FF", "不知火フレア": "#FFAB2D", "白銀ノエル": "#A5B5B7", "宝鐘マリン": "#C2153B", "角巻わため": "#E2D065", "常闇トワ": "#B77FFF", "姫森ルーナ": "#FF93D0", "雪花ラミィ": "#49AAFF", "桃鈴ねね": "#FFC633", "獅白ぼたん": "#757575", "尾丸ポルカ": "#ED0043", "ラプラス・ダークネス": "#9464D2", "鷹嶺ルイ": "#831550", "博衣こより": "#FF95C8", "風真いろは": "#5ECFC8", "アユンダ・リス": "#FFAAAA", "ムーナ・ホシノヴァ": "#AA83FF", "アイラニ・イオフィフティーン": "#9CDF36", "クレージー・オリー": "#C40041", "アーニャ・メルフィッサ": "#F3BF41", "パヴォリア・レイネ": "#004DC2", "ベスティア・ゼータ": "#9290A1", "カエラ・コヴァルスキア": "#FC4045", "こぼ・かなえる": "#50CFE1", "森カリオペ": "#E01C61", "小鳥遊キアラ": "#FF792E", "一伊那尓栖": "#5D4E83", "IRyS": "#DF185D", "オーロ・クロニー": "#2221AA", "ハコス・ベールズ": "#EE2222", "シオリ・ノヴェラ": "#C288F7", "古石ビジュー": "#8674FF", "ネリッサ・レイヴンクロフト": "#3950EE", "フワワ・アビスガード": "#80C2F8", "モココ・アビスガード": "#F79BC2", "音乃瀬奏": "#FFD380", "一条莉々華": "#FF77A9", "儒烏風亭らでん": "#357B6C", "轟はじめ": "#A4AAFF" };
  const colors = members.map(m => colorData[m.name] || "#999");

  return {
    releaseSettings: members.map((m, i) => ({ name: m.name, count: bestKaihou[i] })),
    totalRate: bestRate, noSkillTime: bestTime, noSkillIntervals, startTime, endTime,
    colors, memberIntervals, allIntervals, bestEvents, bestCooldowns: cooldowns
  };
}

document.getElementById("calculateButton").addEventListener("click", () => {
  const status = document.getElementById("status"), error = document.getElementById("error");
  error.hidden = true; status.textContent = "";
  try {
    const members = [];
    for (let i = 0; i < 5; i++) {
      const name = document.getElementById(`member${i}_name`).value;
      const cooldown = Number(document.getElementById(`member${i}_cooldown`).value);
      const duration = Number(document.getElementById(`member${i}_duration`).value);
      const rate = Number(document.getElementById(`member${i}_rate`).value);
      const limit = Number(document.getElementById(`member${i}_limit`).value);
      if (cooldown <= 0) throw new Error(`${i + 1} 人目 ${name}：発動間隔 を 0 より大きくしてください`);
      if (duration <= 0) throw new Error(`${i + 1} 人目 ${name}：持続時間 を 0 より大きくしてください`);
      if (rate < 0) throw new Error(`${i + 1} 人目 ${name}：上昇率 を 0 以上にしてください`);
      if (limit < 0) throw new Error(`${i + 1} 人目 ${name}：解放上限 を 0 以上にしてください`);
      members.push({ name, cooldown, duration, rate, limit });
    }
    const overallLimit = Number(document.getElementById("overallLimit").value);
    const startTime = Number(document.getElementById("startTime").value);
    const endTime = Number(document.getElementById("endTime").value);
    const priority = document.getElementById("priority").value;
    let userKaihou = null;

    if (priority === "user") {
      userKaihou = [];

      for (let i = 0; i < 5; i++) {
        const value = Number(
          document.getElementById(`kaihou${i}`).value
        );

        if (!Number.isInteger(value) || value < 0) {
          throw new Error(
            `${i + 1} 人目の解放設定を 0 以上の整数にしてください`
          );
        }

        userKaihou.push(value);
      }
    }
    if (overallLimit < 0) throw new Error("全体_解放上限 を 0 以上にしてください");
    if (startTime < 0) throw new Error("開始時刻 を 0 以上にしてください");
    if (endTime < 0) throw new Error("終了時刻 を 0 以上にしてください");
    if (startTime >= endTime) throw new Error("開始時刻 を 終了時刻 より小さくしてください");
    displayResult(calculate(members, overallLimit, startTime, endTime, priority, userKaihou));
    const now = new Date();

    const completedAt =
      `${now.getFullYear()}/` +
      `${String(now.getMonth() + 1).padStart(2, "0")}/` +
      `${String(now.getDate()).padStart(2, "0")} ` +
      `${String(now.getHours()).padStart(2, "0")}:` +
      `${String(now.getMinutes()).padStart(2, "0")}:` +
      `${String(now.getSeconds()).padStart(2, "0")}`;

    status.textContent = `計算が完了しました。 (${completedAt})`;
  } catch (e) {
    error.textContent = e.message; error.hidden = false;
    document.getElementById("result").classList.remove("visible");
  }
});
