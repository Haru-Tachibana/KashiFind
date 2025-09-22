const mongoose = require('mongoose');
const Song = require('../models/Song');
const japaneseProcessor = require('../utils/simpleJapaneseProcessor');
require('dotenv').config();

// Sample Japanese songs data
const sampleSongs = [
  {
    title: "Lemon",
    artist: "米津玄師",
    album: "Lemon",
    year: 2018,
    genre: "J-POP",
    lyrics: {
      original: `夢ならばどれほどよかったでしょう
未だにあなたのことを夢にみる
忘れた物を取りに帰るように
古びた思い出の埃を払う

戻らない幸せがあることを
最後にあなたが教えてくれた
言えずに隠してた昏い過去も
あなたがいなきゃ永遠に昏いまま

きっともうこれ以上 傷つくことなど
ありはしないとわかっている
あの日の悲しみさえ
あの日の苦しみさえ
そのすべてを愛してた あなたとともに
胸に残り離れない
苦いレモンの匂い
雨が降り止むまで帰れない
今でもあなたはわたしの光

暗闇であなたの背をなぞった
その輪郭を鮮明に覚えている
受け止めきれないものと出会うたび
溢れてやまないのは涙だけ

何をしていたの
何を見ていたの
わたしの知らない横顔で
どこかであなたの今を
わたしは生きてる

きっともうこれ以上 傷つくことなど
ありはしないとわかっている
あの日の悲しみさえ
あの日の苦しみさえ
そのすべてを愛してた あなたとともに
胸に残り離れない
苦いレモンの匂い
雨が降り止むまで帰れない
今でもあなたはわたしの光

もう二度と会えないなんて信じられない
まだこの胸に あなたを探している
あの日の悲しみさえ
あの日の苦しみさえ
そのすべてを愛してた あなたとともに
胸に残り離れない
苦いレモンの匂い
雨が降り止むまで帰れない
今でもあなたはわたしの光`
    },
    metadata: {
      duration: 257,
      bpm: 120,
      key: "F#m",
      language: "ja"
    },
    tags: ["ドラマ主題歌", "感動", "切ない", "人気"],
    popularity: 1500000,
    source: "manual"
  },
  {
    title: "Pretender",
    artist: "Official髭男dism",
    album: "Traveler",
    year: 2019,
    genre: "J-POP",
    lyrics: {
      original: `君がどれだけ笑ってくれるか
僕はそれを知りたくて
君がどれだけ泣いてくれるか
僕はそれを知りたくて

君がどれだけ笑ってくれるか
僕はそれを知りたくて
君がどれだけ泣いてくれるか
僕はそれを知りたくて

君がどれだけ笑ってくれるか
僕はそれを知りたくて
君がどれだけ泣いてくれるか
僕はそれを知りたくて

君がどれだけ笑ってくれるか
僕はそれを知りたくて
君がどれだけ泣いてくれるか
僕はそれを知りたくて`
    },
    metadata: {
      duration: 245,
      bpm: 128,
      key: "C#m",
      language: "ja"
    },
    tags: ["映画主題歌", "ロック", "バンド", "人気"],
    popularity: 1200000,
    source: "manual"
  },
  {
    title: "夜に駆ける",
    artist: "YOASOBI",
    album: "THE BOOK",
    year: 2020,
    genre: "J-POP",
    lyrics: {
      original: `沈むように溶けてゆくように
二人だけの空が広がる夜に
「さよなら」だけだった
その一言で全てが分かった
日が沈み出した空と君の姿
フェンス越しに重なっていた
初めて会った日から
僕の心の全てを奪った
どこか虚しいような
そんな気持ち
つまらないなと思っていた
あの日
君は眩しすぎて
近くにいるだけで
涙が出そうで
ただ
君に好きと言えないで
どうしようもない
僕の心は
君を選んだ
君に好きと言えないで
どうしようもない
僕の心は
君を選んだ`
    },
    metadata: {
      duration: 241,
      bpm: 140,
      key: "Am",
      language: "ja"
    },
    tags: ["小説原作", "バーチャルシンガー", "人気", "切ない"],
    popularity: 2000000,
    source: "manual"
  },
  {
    title: "紅蓮華",
    artist: "LiSA",
    album: "LEO-NiNE",
    year: 2019,
    genre: "アニメソング",
    lyrics: {
      original: `強くなれる理由を知った
僕を連れて進め
泥だらけの走馬灯に
酔いしれ
手を伸ばせば
届くのに
まだ遠くて
見えない
この暗闇を
照らす光
強くなれる理由を知った
僕を連れて進め
泥だらけの走馬灯に
酔いしれ
手を伸ばせば
届くのに
まだ遠くて
見えない
この暗闇を
照らす光`
    },
    metadata: {
      duration: 248,
      bpm: 160,
      key: "F#m",
      language: "ja"
    },
    tags: ["アニメ主題歌", "鬼滅の刃", "ロック", "熱血"],
    popularity: 1800000,
    source: "manual"
  },
  {
    title: "アイドル",
    artist: "YOASOBI",
    album: "THE BOOK 2",
    year: 2023,
    genre: "J-POP",
    lyrics: {
      original: `嘘つきな私が嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い
でも本当の私も嫌い`
    },
    metadata: {
      duration: 223,
      bpm: 145,
      key: "C#m",
      language: "ja"
    },
    tags: ["アニメ主題歌", "推しの子", "人気", "バーチャルシンガー"],
    popularity: 2500000,
    source: "manual"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lyrics_search');
    console.log('Connected to database');

    // Clear existing songs
    await Song.deleteMany({});
    console.log('Cleared existing songs');

    // Initialize Japanese text processor
    await japaneseProcessor.initialize();
    console.log('Initialized Japanese text processor');

    // Process and save songs
    for (const songData of sampleSongs) {
      console.log(`Processing song: ${songData.title} by ${songData.artist}`);
      
      // Process lyrics to generate hiragana and romaji
      const processedLyrics = await japaneseProcessor.processLyrics(songData.lyrics.original);
      
      const song = new Song({
        ...songData,
        lyrics: {
          original: processedLyrics.original,
          hiragana: processedLyrics.hiragana,
          romaji: processedLyrics.romaji
        }
      });

      await song.save();
      console.log(`Saved: ${song.title}`);
    }

    console.log('Database seeded successfully!');
    console.log(`Added ${sampleSongs.length} songs`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
