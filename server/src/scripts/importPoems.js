require('dotenv').config();
const mongoose = require('mongoose');
const Poem = require('../models/Poem');

// 示例诗歌数据
const poems = [
  {
    title: "静夜思",
    author: "李白",
    dynasty: "唐",
    content: "床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。",
    translation: "明亮的月光洒在床前，\n好像地上泛起了一层霜。\n我禁不住抬起头来，\n看那天窗外空中的一轮明月，\n不由得低头沉思，\n想起远方的家乡。",
    background: "这首诗写于唐玄宗开元十四年（726年）九月十五日的扬州旅舍，时李白26岁。同时同地所作的还有一首《秋浦歌》。此诗表达了作者客居思乡之情。",
    authorInfo: {
      name: "李白",
      dynasty: "唐",
      life: "李白（701年－762年），字太白，号青莲居士，又号谪仙人，唐代伟大的浪漫主义诗人，被后人誉为诗仙。",
      style: "豪放飘逸，想象丰富，语言流转自然，音律和谐多变。",
      representativeWorks: ["将进酒", "蜀道难", "梦游天姥吟留别"]
    },
    imageryAnalysis: {
      words: ["明月", "霜", "故乡"],
      emotions: [
        {
          word: "明月",
          emotion: "思念",
          explanation: "明月常被用来象征思念之情，在这里表达了诗人对家乡的深切思念。"
        },
        {
          word: "霜",
          emotion: "清冷",
          explanation: "霜的意象营造出一种清冷孤寂的氛围，衬托出诗人的思乡之情。"
        },
        {
          word: "故乡",
          emotion: "眷恋",
          explanation: "直接表达了诗人对家乡的眷恋之情。"
        }
      ]
    },
    tags: ["思乡", "月亮", "夜晚"]
  },
  {
    title: "春晓",
    author: "孟浩然",
    dynasty: "唐",
    content: "春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。",
    translation: "春日里贪睡不知不觉天已破晓，\n搅乱我酣眠的是那啁啾的小鸟。\n昨天夜里风声雨声一直不断，\n那娇美的春花不知被吹落了多少？",
    background: "这首诗是唐代诗人孟浩然的作品，描写了春天早晨的景象，表达了诗人对春天的喜爱和对自然美景的赞美。",
    authorInfo: {
      name: "孟浩然",
      dynasty: "唐",
      life: "孟浩然（689年－740年），字浩然，号孟山人，襄州襄阳（今湖北襄阳）人，唐代著名的山水田园派诗人。",
      style: "清新自然，意境优美，语言简练。",
      representativeWorks: ["过故人庄", "宿建德江", "望洞庭湖赠张丞相"]
    },
    imageryAnalysis: {
      words: ["春眠", "啼鸟", "风雨", "花落"],
      emotions: [
        {
          word: "春眠",
          emotion: "舒适",
          explanation: "表达了春天早晨的舒适和惬意。"
        },
        {
          word: "啼鸟",
          emotion: "欢快",
          explanation: "鸟儿的啼叫声传递出春天的生机和活力。"
        },
        {
          word: "风雨",
          emotion: "惋惜",
          explanation: "风雨声暗示了春天的无常和生命的短暂。"
        },
        {
          word: "花落",
          emotion: "感伤",
          explanation: "花落象征着美好事物的消逝，引发对生命短暂的思考。"
        }
      ]
    },
    tags: ["春天", "自然", "感伤"]
  }
];

async function importPoems() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('数据库连接成功');

    // 清空现有数据
    await Poem.deleteMany({});
    console.log('已清空现有数据');

    // 导入新数据
    for (const poem of poems) {
      const newPoem = new Poem(poem);
      await newPoem.save();
      console.log(`已导入: ${poem.title}`);
    }

    console.log('数据导入完成');
  } catch (error) {
    console.error('导入失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

importPoems(); 