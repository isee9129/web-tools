# Google Colab で実装したもの。これを元にChat-GPTで生成したWebページが calc_accel.html

# @title 計算機

import datetime
dt_now = datetime.datetime.now(
    datetime.timezone(datetime.timedelta(hours=9))
)
print(f"最終実行時刻 : {dt_now.strftime('%Y年%m月%d日 %H:%M:%S')}")
print()

# @markdown ## 編成の設定
# @markdown - 名前：ホロメンの名前を入れてください
# @markdown - 発動間隔：アクティブスキル「○○秒毎に」の部分の数値を入れてください
# @markdown - 持続時間：アクティブスキル「○○秒間」の部分の数値を入れてください
# @markdown - 上昇率：アクティブスキル「○○%UP」の部分の数値を入れてください。ホロメンボードやパッシブスキルの効果も反映させておくとより正確になります
# @markdown - 解放上限：その人のホロメンボードで「アクティブスキル発動頻度」を最大何個解放できるか設定してください（ボードPtが不足してる方向け）

# @markdown ### 1 人目
ホロメン1_名前 = "カリオペ"  # @param {type:"string"}
ホロメン1_発動間隔 = 33  # @param {type:"number"}
ホロメン1_持続時間 = 11  # @param {type:"number"}
ホロメン1_上昇率 = 120  # @param {type:"integer"}
ホロメン1_解放上限 = 0  # @param {type:"integer"}

# @markdown ### 2 人目
ホロメン2_名前 = "オリー"  # @param {type:"string"}
ホロメン2_発動間隔 = 25  # @param {type:"number"}
ホロメン2_持続時間 = 10  # @param {type:"number"}
ホロメン2_上昇率 = 110  # @param {type:"integer"}
ホロメン2_解放上限 = 3  # @param {type:"integer"}

# @markdown ### 3 人目
ホロメン3_名前 = "キアラ"  # @param {type:"string"}
ホロメン3_発動間隔 = 23  # @param {type:"number"}
ホロメン3_持続時間 = 8  # @param {type:"number"}
ホロメン3_上昇率 = 115  # @param {type:"integer"}
ホロメン3_解放上限 = 3  # @param {type:"integer"}

# @markdown ### 4 人目
ホロメン4_名前 = "アーニャ"  # @param {type:"string"}
ホロメン4_発動間隔 = 24  # @param {type:"number"}
ホロメン4_持続時間 = 10  # @param {type:"number"}
ホロメン4_上昇率 = 100  # @param {type:"integer"}
ホロメン4_解放上限 = 3  # @param {type:"integer"}

# @markdown ### 5 人目
ホロメン5_名前 = "わため"  # @param {type:"string"}
ホロメン5_発動間隔 = 15  # @param {type:"number"}
ホロメン5_持続時間 = 6  # @param {type:"number"}
ホロメン5_上昇率 = 110  # @param {type:"integer"}
ホロメン5_解放上限 = 3  # @param {type:"integer"}

# @markdown ## 全体の設定
# @markdown - 全体_解放上限：全体で「アクティブスキル発動頻度」を最大何個解放できるか設定してください（ブルーキューブ・ブルーコアキューブが不足してる方向け）
# @markdown - 開始時刻・終了時刻：アクティブスキルを発動させたい時間を設定してください。単位は秒です
# @markdown - 優先する要素：計算するときにより重視したい要素を選んでください
# @markdown   - 発動時間：より多くの時間でアクティブスキルが発動するようにします。スペシャルスキルが無駄になりにくく、汎用性が高いです
# @markdown   - 上昇率：アクティブスキルの効果量が高くなるようにします。アクティブスキルのない時間が増えるため、スペシャルスキルの発動タイミングによっては微妙かもしれません
全体_解放上限 = 15  # @param {type:"integer"}
開始時刻 = 10  # @param {type:"number"}
終了時刻 = 130  # @param {type:"number"}
優先する要素 = "発動時間" #@param ["発動時間", "上昇率"] {allow-input: false}


# 整合性チェック
names          = [ホロメン1_名前,     ホロメン2_名前,     ホロメン3_名前,     ホロメン4_名前,     ホロメン5_名前,     ]
base_cooldowns = [ホロメン1_発動間隔, ホロメン2_発動間隔, ホロメン3_発動間隔, ホロメン4_発動間隔, ホロメン5_発動間隔, ]
durations      = [ホロメン1_持続時間, ホロメン2_持続時間, ホロメン3_持続時間, ホロメン4_持続時間, ホロメン5_持続時間, ]
rates          = [ホロメン1_上昇率,   ホロメン2_上昇率,   ホロメン3_上昇率,   ホロメン4_上昇率,   ホロメン5_上昇率,   ]
limit          = [ホロメン1_解放上限, ホロメン2_解放上限, ホロメン3_解放上限, ホロメン4_解放上限, ホロメン5_解放上限, ]
for i in range(5):
  assert base_cooldowns[i] > 0, f"{i} 人目 {names[i]}：発動間隔 を 0 より大きくしてください"
  assert durations[i] > 0,      f"{i} 人目 {names[i]}：持続時間 を 0 より大きくしてください"
  assert rates[i] >= 0,         f"{i} 人目 {names[i]}：上昇率 を 0 以上にしてください"
  assert limit[i] >= 0,         f"{i} 人目 {names[i]}：解放上限 を 0 以上にしてください"

assert 全体_解放上限 >= 0, "全体_解放上限 を 0 以上にしてください"
assert 開始時刻 >= 0, "開始時刻 を 0 以上にしてください"
assert 終了時刻 >= 0, "終了時刻 を 0 以上にしてください"
assert 開始時刻 < 終了時刻, "開始時刻 を 終了時刻 より小さくしてください"

compare_time = (優先する要素 == "発動時間")

color_data = {'ときのそら': '#6878FF', 'そら': '#6878FF', 'ロボ子さん': '#FF6187', 'ロボ子': '#FF6187', 'ろぼこ': '#FF6187', 'AZKi': '#F081A3', 'アズキ': '#F081A3', 'あずき': '#F081A3', 'さくらみこ': '#FF909E', 'みこ': '#FF909E', '星街すいせい': '#75C0FF', 'すいせい': '#75C0FF', 'アキ・ローゼンタール': '#ABE64D', 'アキ': '#ABE64D', '赤井はあと': '#E5395B', 'はあと': '#E5395B', '白上フブキ': '#93D5F2', 'フブキ': '#93D5F2', '夏色まつり': '#FFCB30', 'まつり': '#FFCB30', '百鬼あやめ': '#DD305B', 'あやめ': '#DD305B', '癒月ちょこ': '#FF5487', 'ちょこ': '#FF5487', '大空スバル': '#E5CE00', 'スバル': '#E5CE00', '大神ミオ': '#DB3131', 'ミオ': '#DB3131', '猫又おかゆ': '#D866ED', 'おかゆ': '#D866ED', '戌神ころね': '#FFCD28', 'ころね': '#FFCD28', '兎田ぺこら': '#57A9FF', 'ぺこら': '#57A9FF', '不知火フレア': '#FFAB2D', 'フレア': '#FFAB2D', '白銀ノエル': '#A5B5B7', 'ノエル': '#A5B5B7', '宝鐘マリン': '#C2153B', 'マリン': '#C2153B', '角巻わため': '#E2D065', 'わため': '#E2D065', '常闇トワ': '#B77FFF', 'トワ': '#B77FFF', '姫森ルーナ': '#FF93D0', 'ルーナ': '#FF93D0', '雪花ラミィ': '#49AAFF', 'ラミィ': '#49AAFF', '桃鈴ねね': '#FFC633', 'ねね': '#FFC633', '獅白ぼたん': '#757575', 'ぼたん': '#757575', '尾丸ポルカ': '#ED0043', 'ポルカ': '#ED0043', 'ラプラス・ダークネス': '#9464D2', 'ラプラス': '#9464D2', '鷹嶺ルイ': '#831550', 'ルイ': '#831550', '博衣こより': '#FF95C8', 'こより': '#FF95C8', '風真いろは': '#5ECFC8', 'いろは': '#5ECFC8', 'アユンダ・リス': '#FFAAAA', 'リス': '#FFAAAA', 'ムーナ・ホシノヴァ': '#AA83FF', 'ムーナ': '#AA83FF', 'アイラニ・イオフィフティーン': '#9CDF36', 'イオフィ': '#9CDF36', 'クレージー・オリー': '#C40041', 'オリー': '#C40041', 'アーニャ・メルフィッサ': '#F3BF41', 'アーニャ': '#F3BF41', 'パヴォリア・レイネ': '#004DC2', 'レイネ': '#004DC2', 'ベスティア・ゼータ': '#9290A1', 'ゼータ': '#9290A1', 'カエラ・コヴァルスキア': '#FC4045', 'カエラ': '#FC4045', 'こぼ・かなえる': '#50CFE1', 'こぼ': '#50CFE1', '森カリオペ': '#E01C61', 'カリオペ': '#E01C61', '小鳥遊キアラ': '#FF792E', 'キアラ': '#FF792E', '一伊那尓栖': '#5D4E83', '伊那尓栖': '#5D4E83', 'イナニス': '#5D4E83', 'いなにす': '#5D4E83', 'IRyS': '#DF185D', 'アイリス': '#DF185D', 'オーロ・クロニー': '#2221AA', 'クロニー': '#2221AA', 'ハコス・ベールズ': '#EE2222', 'ベールズ': '#EE2222', 'シオリ・ノヴェラ': '#C288F7', 'シオリ': '#C288F7', '古石ビジュー': '#8674FF', 'ビジュー': '#8674FF', 'ネリッサ・レイヴンクロフト': '#3950EE', 'ネリッサ': '#3950EE', 'フワワ・アビスガード': '#80C2F8', 'フワワ': '#80C2F8', 'モココ・アビスガード': '#F79BC2', 'モココ': '#F79BC2', '音乃瀬奏': '#FFD380', '奏': '#FFD380', 'かなで': '#FFD380', '一条莉々華': '#FF77A9', '莉々華': '#FF77A9', 'りりか': '#FF77A9', '儒烏風亭らでん': '#357B6C', 'らでん': '#357B6C', '轟はじめ': '#A4AAFF', 'はじめ': '#A4AAFF'}
colors = []
for name in names:
  if name in color_data:
    colors.append(color_data[name])
  else:
    colors.append(None)

for i in range(5):
  if colors[i] is None:
    for col in color_data.values():
      if col not in colors:
        colors[i] = col
        break

# @markdown ----
# @markdown ## 計算する
# @markdown - 編成を入力したら、左上の ▶ を押して実行してください
# @markdown - AssertionError と表示された場合、どこか入力した値がおかしくなっています
# @markdown   - 出力最後の行に説明が出るハズ…

# 計算するところ
from itertools import product

bestscore1 = 0  # 最優先の要素
bestscore2 = 0  # ↑が同率のとき、次に比較する要素
if compare_time:
  bestscore1 = 10000
else:
  bestscore2 = 10000
bestkaihou = [0, 0, 0, 0, 0]  # 最も良かった解放設定
bestevents = []  # ↑のときの時系列 (時刻, 誰のスキルが発動しているか)

# 解放数を全部試す
for kaihou in product(range(4), repeat=5):
  if any(k > limk for k, limk in zip(kaihou, limit)): continue
  if sum(kaihou) > 全体_解放上限: continue
  cooldowns = [b_cooldown / (1 + k * 0.04) for b_cooldown, k in zip(base_cooldowns, kaihou)]

  # スキルの開始・終了時刻をまとめる
  skill_events = []  # (時刻, 開始 or 終了, 誰)
  for i, cd, dur in zip(range(5), cooldowns, durations):
    curtime = cd
    while curtime < 終了時刻+10:
      skill_events.append((curtime, -1, i))
      curtime += dur
      if curtime >= 終了時刻+10: break
      skill_events.append((curtime, 1, i))
      curtime += cd - dur
  skill_events.sort()

  # 実際のスキル発動時系列をまとめる
  events = [(0, -1)]  # (時刻, スキル発動中の人)
  active = [False]*5  # 現在スキルを発動してる人

  for t, d, i in skill_events:
    active[i] = (d == -1)
    curi = -1
    curbestrate = -1
    for i in range(5):
      if not active[i]: continue
      if curbestrate < rates[i]:
        curi = i
        curbestrate = rates[i]
    if events[-1][0] == t:
      events[-1] = (t, curi)
    else:
      events.append((t, curi))
  events.append((終了時刻+10, -1))

  # score計算
  noskill_time = 0  # スキルなしの区間の長さ
  sum_rate = 0  # 上昇量×時間の総和
  prevt = 開始時刻
  previ = -1
  prevprevi = -1

  for t, i in events:
    if t >= prevt:
      dt = min(t, 終了時刻) - prevt
      if previ == -1:
        noskill_time += dt
      else:
        sum_rate += dt * rates[previ]
      prevt = t
    prevprevi, previ = previ, i
    if t > 終了時刻: break

  if compare_time:
    score1 = noskill_time
    score2 = -sum_rate
  else:
    score1 = -sum_rate
    score2 = noskill_time

  if bestscore1 > score1 or bestscore1 == score1 and bestscore2 > score2:
    bestscore1 = score1
    bestscore2 = score2
    bestkaihou = kaihou
    bestevents = events

# 出力
if compare_time:
  besttime = bestscore1
  bestrate = -bestscore2
else:
  besttime = bestscore2
  bestrate = -bestscore1

print("解放設定：")
for i, name, k in zip(range(5), names, bestkaihou):
  print(f"    ホロメン{i+1} {name}：{k} 個")
print()
print(f"スキル効果合計：{bestrate:.03f}")
print()
print(f"スキルなし区間長さ：{besttime:.03f}秒")
print()
print(f"スキルなし区間：")
for e_idx in range(len(bestevents) - 1):
  (cur_t, cur_i), (next_t, next_i) = bestevents[e_idx], bestevents[e_idx+1]
  if cur_i != -1: continue
  if next_t <= 開始時刻 or 終了時刻 <= cur_t: continue
  if cur_t <= 開始時刻 < next_t:
    print(f"    長さ {next_t - 開始時刻:.03f}秒：時刻 {開始時刻:.03f}秒 ～ 時刻 {next_t:.03f}秒 - 計測開始 ～ {names[next_i]} 開始")
  elif cur_t < 終了時刻 <= next_t:
    print(f"    長さ {終了時刻 - cur_t:.03f}秒：時刻 {cur_t:.03f}秒 ～ 時刻 {終了時刻:.03f}秒 - {names[prev_i]} 終了 ～ 計測終了")
  else:
    _, prev_i = bestevents[e_idx-1]
    print(f"    長さ {next_t - cur_t:.03f}秒：時刻 {cur_t:.03f}秒 ～ 時刻 {next_t:.03f}秒 - {names[prev_i]} 終了 ～ {names[next_i]} 開始")
print()

# グラフの描画
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# データ
cooldowns = [b_cooldown / (1 + k * 0.04) for b_cooldown, k in zip(base_cooldowns, bestkaihou)]
color_data = {'ときのそら': '#6878FF', 'そら': '#6878FF', 'ロボ子さん': '#FF6187', 'ロボ子': '#FF6187', 'ろぼこ': '#FF6187', 'AZKi': '#F081A3', 'アズキ': '#F081A3', 'あずき': '#F081A3', 'さくらみこ': '#FF909E', 'みこ': '#FF909E', '星街すいせい': '#75C0FF', 'すいせい': '#75C0FF', 'アキ・ローゼンタール': '#ABE64D', 'アキ': '#ABE64D', '赤井はあと': '#E5395B', 'はあと': '#E5395B', '白上フブキ': '#93D5F2', 'フブキ': '#93D5F2', '夏色まつり': '#FFCB30', 'まつり': '#FFCB30', '百鬼あやめ': '#DD305B', 'あやめ': '#DD305B', '癒月ちょこ': '#FF5487', 'ちょこ': '#FF5487', '大空スバル': '#E5CE00', 'スバル': '#E5CE00', '大神ミオ': '#DB3131', 'ミオ': '#DB3131', '猫又おかゆ': '#D866ED', 'おかゆ': '#D866ED', '戌神ころね': '#FFCD28', 'ころね': '#FFCD28', '兎田ぺこら': '#57A9FF', 'ぺこら': '#57A9FF', '不知火フレア': '#FFAB2D', 'フレア': '#FFAB2D', '白銀ノエル': '#A5B5B7', 'ノエル': '#A5B5B7', '宝鐘マリン': '#C2153B', 'マリン': '#C2153B', '角巻わため': '#E2D065', 'わため': '#E2D065', '常闇トワ': '#B77FFF', 'トワ': '#B77FFF', '姫森ルーナ': '#FF93D0', 'ルーナ': '#FF93D0', '雪花ラミィ': '#49AAFF', 'ラミィ': '#49AAFF', '桃鈴ねね': '#FFC633', 'ねね': '#FFC633', '獅白ぼたん': '#757575', 'ぼたん': '#757575', '尾丸ポルカ': '#ED0043', 'ポルカ': '#ED0043', 'ラプラス・ダークネス': '#9464D2', 'ラプラス': '#9464D2', '鷹嶺ルイ': '#831550', 'ルイ': '#831550', '博衣こより': '#FF95C8', 'こより': '#FF95C8', '風真いろは': '#5ECFC8', 'いろは': '#5ECFC8', 'アユンダ・リス': '#FFAAAA', 'リス': '#FFAAAA', 'ムーナ・ホシノヴァ': '#AA83FF', 'ムーナ': '#AA83FF', 'アイラニ・イオフィフティーン': '#9CDF36', 'イオフィ': '#9CDF36', 'クレージー・オリー': '#C40041', 'オリー': '#C40041', 'アーニャ・メルフィッサ': '#F3BF41', 'アーニャ': '#F3BF41', 'パヴォリア・レイネ': '#004DC2', 'レイネ': '#004DC2', 'ベスティア・ゼータ': '#9290A1', 'ゼータ': '#9290A1', 'カエラ・コヴァルスキア': '#FC4045', 'カエラ': '#FC4045', 'こぼ・かなえる': '#50CFE1', 'こぼ': '#50CFE1', '森カリオペ': '#E01C61', 'カリオペ': '#E01C61', '小鳥遊キアラ': '#FF792E', 'キアラ': '#FF792E', '一伊那尓栖': '#5D4E83', '伊那尓栖': '#5D4E83', 'イナニス': '#5D4E83', 'いなにす': '#5D4E83', 'IRyS': '#DF185D', 'アイリス': '#DF185D', 'オーロ・クロニー': '#2221AA', 'クロニー': '#2221AA', 'ハコス・ベールズ': '#EE2222', 'ベールズ': '#EE2222', 'シオリ・ノヴェラ': '#C288F7', 'シオリ': '#C288F7', '古石ビジュー': '#8674FF', 'ビジュー': '#8674FF', 'ネリッサ・レイヴンクロフト': '#3950EE', 'ネリッサ': '#3950EE', 'フワワ・アビスガード': '#80C2F8', 'フワワ': '#80C2F8', 'モココ・アビスガード': '#F79BC2', 'モココ': '#F79BC2', '音乃瀬奏': '#FFD380', '奏': '#FFD380', 'かなで': '#FFD380', '一条莉々華': '#FF77A9', '莉々華': '#FF77A9', 'りりか': '#FF77A9', '儒烏風亭らでん': '#357B6C', 'らでん': '#357B6C', '轟はじめ': '#A4AAFF', 'はじめ': '#A4AAFF'}
colors = []
for name in names:
  if name in color_data:
    colors.append(color_data[name])
  else:
    colors.append(None)
for i in range(5):
  if colors[i] is None:
    for col in color_data.values():
      if col not in colors:
        colors[i] = col
        break

L = max(0, 開始時刻 - 5)
R = 終了時刻 + 5

events = bestevents

# レイアウト

ROW_HEIGHT = 1
ALL_GAP = 0.25

# 1～5 の各行の下端
# 5, 4, 3, 2, 1 の順に上から配置
row_bottoms = {
    1: 4 * ROW_HEIGHT,
    2: 3 * ROW_HEIGHT,
    3: 2 * ROW_HEIGHT,
    4: 1 * ROW_HEIGHT,
    5: 0,
}

# all の下端
all_bottom = -ROW_HEIGHT - ALL_GAP


# 描画

fig, ax = plt.subplots(figsize=(12, 2))

# 上5行
for i in range(5):
    label = i + 1
    y = row_bottoms[label]

    x = cooldowns[i]

    while x < R:
        left = max(x, L)
        right = min(x + durations[i], R)

        if left < right:
            ax.add_patch(
                Rectangle(
                    (left, y),
                    right - left,
                    ROW_HEIGHT,
                    facecolor=colors[i],
                    edgecolor="none",
                )
            )

        x += cooldowns[i]


# all 行
for i in range(len(events) - 1):
    x1, color_index = events[i]
    x2, _ = events[i + 1]

    left = max(x1, L)
    right = min(x2, R)

    if left >= right or color_index == -1:
        continue

    ax.add_patch(
        Rectangle(
            (left, all_bottom),
            right - left,
            ROW_HEIGHT,
            facecolor=colors[color_index],
            edgecolor="none",
        )
    )


# 軸とか

ax.set_xlim(L, R)

# 1～5 + all がすべて表示される範囲
ax.set_ylim(all_bottom, 5 * ROW_HEIGHT)

# 枠線を消す
for spine in ax.spines.values():
    spine.set_visible(False)

# ラベル位置
ax.set_yticks([
    row_bottoms[1] + ROW_HEIGHT / 2,
    row_bottoms[2] + ROW_HEIGHT / 2,
    row_bottoms[3] + ROW_HEIGHT / 2,
    row_bottoms[4] + ROW_HEIGHT / 2,
    row_bottoms[5] + ROW_HEIGHT / 2,
    all_bottom + ROW_HEIGHT / 2,
])
ax.set_yticklabels(["1", "2", "3", "4", "5", "all"])

# 10刻みの主目盛り
ax.set_xticks(range((L + 9) // 10 * 10, R + 1, 10))

# 5刻みの補助目盛り
ax.set_xticks(range((L + 4) // 5 * 5, R + 1, 5), minor=True)

# 主目盛り線
ax.grid(axis="x", which="major", linestyle="--", alpha=0.5)

# 補助目盛り線
ax.grid(axis="x", which="minor", linestyle="--", alpha=0.3)

ax.margins(x=0)

plt.tight_layout()
plt.show()