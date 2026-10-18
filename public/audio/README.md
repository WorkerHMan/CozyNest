# 音乐文件 / Audio files

## 仓库自带 13 首（CC BY 3.0 / CC0，均可自由使用）

### 中文 —— 7 首，排在最前

| 文件名 | 曲名 | 类型 | 时长 | 授权 |
| --- | --- | --- | --- | --- |
| `guzheng-morning.mp3` | Guzheng Morning | 古筝 | 3:37 | CC BY 3.0 |
| `hubei-folk-songs.mp3` | Hubei Folk Songs | 湖北民歌（人声） | 2:24 | **CC0** |
| `beijing-park-choir.mp3` | Beijing Park Choir | 北京公园合唱（人声） | 0:51 | **CC0** |
| `guzheng-happy-monks.mp3` | Señor Guzheng and the Happy Monks | 古筝 | 3:41 | CC BY 3.0 |
| `dances-with-erhu.mp3` | Dances With Erhu | 二胡 | 3:22 | CC BY 3.0 |
| `more-erhu.mp3` | More Erhu! | 二胡 | 3:25 | CC BY 3.0 |
| `erhu-on-3.mp3` | Erhu on 3 | 二胡 | 3:45 | CC BY 3.0 |

古筝 / 二胡：**Antti Luode**，CC BY 3.0
湖北民歌 / 北京公园合唱：Freesound 现场录音，**CC0（无需署名）**

> **这里终于有中文人声了。** 《湖北民歌》和《北京公园合唱》是 CC0 的
> **中文演唱现场录音** —— 这是自由授权曲库里能找到的、最接近"中文歌"的东西。
> 代价是**它们是现场录音**：有环境噪声、不是录音棚音质。
>
> 商业华语流行（《海阔天空》《浮夸》《光辉岁月》等）授权极严，
> 自由曲库**不存在**这类录音。想放只能由你提供有权的文件。

### 其他 —— 6 首

| 文件名 | 曲名 | 时长 |
| --- | --- | --- |
| `serene.mp3` | Serene | 2:10 |
| `midsummer-sky.mp3` | Midsummer Sky | 1:54 |
| `reaching-out.mp3` | Reaching Out | 1:01 |
| `lone-harvest.mp3` | Lone Harvest | 1:00 |
| `swimmey-texture.mp3` | Swimmey Texture | 1:04 |
| `piano-between.mp3` | Piano Between | 0:25 |

作者：**Kevin MacLeod**（<https://incompetech.com/>），CC BY 3.0

> **关于中文歌**：以上都是**中文乐器**曲目（古筝、二胡），**没有中文人声演唱的歌曲**。
> 商业华语流行乐授权极严，Wikimedia Commons 上**不存在**可自由使用的中文演唱录音。
> 想放《海阔天空》《浮夸》这类，只能由你提供有权的文件。

**CC BY 要求署名**，因此播放器展开时底部会显示
`Kevin MacLeod · Antti Luode · CC BY 3.0` 并可点击跳转授权全文。
**请勿删除这行署名** —— 删掉就不再符合授权条件。

授权全文：<https://creativecommons.org/licenses/by/3.0/>
来源：Wikimedia Commons（原文件名带 ISRC 编号）

## 已严格校验：13 首全部完整

每首都做过严格 MPEG 解码校验：**仅 MPEG-1 Layer III**、帧连续、跳字节比例 < 0.02%、
**字节覆盖率 100%（解析器一直走到文件末尾，确认没有被截断）**。
最后这一条是关键——**被截断的文件会在播放中途断掉**，而只看"能否解析出帧数"
是发现不了的。当前 **13/13 通过，0 首需要删除**。

## 播放器的行为

- **进入页面会尝试自动播放**（音量默认 0.5）。浏览器普遍**禁止有声自动播放**，
  被拦截时会在访客**第一次点击/按键**时补播，折叠图标也会变成静音图标说明原因。
- **默认折叠**成一个小图标（居中），播放时图标上亮一个小绿点。
- **折叠不等于停止**：点 ✕ 只是把面板收起来，音乐继续放；只有 ⏸ 才真的暂停。
- **自动收起**：换壁纸时、以及 20 秒没碰过播放器时，面板会自己收起来 —— 但**不会暂停**。
- **可拖动进度条**：支持鼠标拖动、触屏拖动、键盘左右键（原生 `input[type=range]`），
  左下角显示 `当前时间 / 总时长`。
- **默认循环整个歌单**：一首播完自动下一首，最后一首播完回到第一首。
- **切歌不会误报错误**：切换音源会中断上一次加载，那会触发 `error` 事件；
  播放器只把「网络 / 解码 / 格式不支持」当作真错误，不把中断当成「文件坏了」。

## 换成自己的歌

1. 把文件放进本目录，例如 `my-song.mp3`。
2. 编辑 `src/config/hero-player.ts` 的 `tracks` 数组。
3. 非 CC 授权的歌，记得把 `credit` 改成你自己的署名。

## 体积

音频合计约 **39.3 MB**。嫌大可删掉几首并同步修改 `tracks`。

## 要求

- **格式**：`.mp3` 兼容性最好（Safari 也能播）。`.ogg` 在部分 Safari 版本上无法播放。
- **文件名**要与 `src/config/hero-player.ts` 里一致，否则会显示「音频暂不可用」。
