import { IMAGERY_CATEGORIES, getImageryCategory } from './imageryCategories';
import type { GlobalStats, WordRelationship, Poem, ImageryCount, ProcessedPoem, ImageryWordPair } from '../types';

// 预定义的自然意象词库
export const NATURAL_IMAGERY = [
  // 天文类
  '日', '月', '星', '辰', '北极星', '启明', '北斗', '星宿',  // 日月星辰
  '云', '霞', '虹', '霓', '风', '霜', '露', '雾', '霾',      // 天气现象
  '穹', '霄汉', '天河', '太虚', '清辉', '星汉', '银汉', '银河', // 宇宙元素

  // 地理类
  '山', '川', '峰', '岭', '江', '河', '湖', '海', '溪', '潭', '泉', '瀑布',
  '原野', '沙', '漠', '荒丘', '岛', '屿', '洞', '穴', '岩', '水',

  // 动物类
  '鸟', '鹰', '鹤', '雁', '雀', '燕', '鹊', '鸦', '鹭', '鸠', '黄鹂', '子规', '鸥', '凤', '凰', '精卫', // 飞禽
  '虎', '豹', '狼', '熊', '鹿', '马', '牛', '羊', '犬', '狐', '猿', '兔', '麒麟', '貔貅', // 走兽
  '鱼', '龙', '蛟', '鼋', '鼍', '蚌', '鳖', '虾', '蟹', '鲲', '鹏', // 水族
  '蝉', '螽斯', '蟋蟀', '蝴', '蝶', '蜂', '萤', '蜘蛛', '蜻蜓', '蚕', // 昆虫

  // 植物类
  '松', '柏', '槐', '柳', '竹', '梧', '桐', '桑', '桃', '李', '梅', '枫', '桂', '楠', '银杏', // 树木
  '兰', '菊', '荷', '芍药', '牡丹', '芙蓉', '棠', '杜鹃', '芦苇', '蒲', '萱', '苹', '蓼', '萍', '苔', '菌', '灵芝', // 花草
  '稻', '麦', '黍', '稷', '菽', '麻', '瓜', '瓠', '藤', '蔓', '葛', // 农作物

  // 气候类
  '风', '雨', '雪', '霜', '露', '雾', '霾', '雷', '虹', '霓', '雹', '冰' // 气象变化
];

// 定义常用词表（与意象关联分析时会用到）
export const COMMON_WORDS = [
  '落', '飘', '流', '思', '望', '愿', '斜', '凋', '吹', '垂', '逝', '枯', '残', '碎', '坠', '摇', '散', '拂', '凝', '卷', '舞', '浮', '沉', '涌', '曳', '碎', '残', '映', '凝', '绽', '栖', '鸣', '隐', '泛', '敛', '旱', '离', '归', '叹', '奚', '惜', '别', '醉', '戏', '啼', '飞', '征', '莫', '难', '兴', '啸', '危', '乱',
  '爱', '恨', '怨', '愁', '喜', '怕', '惧', '愁', '苦', '怒', '慕', '痴', '憾', '怜', '妒', '怅', '惶', '怯', '哀', '惑', '倦', '羡', '愧', '嗔', '念', '忧', '寂', '醉', '叹', '恼', '惘', '怜', '泪', '凄', '凉', '骄', '娇', '俏', '孤', '病', '坏', '悠', '闲', '害', '残',
  '生', '死', '昔', '往', '独',
  '霁', '晦', '灼', '烁', '黯', '皎', '朦', '灼', '湮', '溯', '升', '敛', '涌', '徙', '寒', '空', '清', '深', '浅', '香', '幽',
  '栖', '鸣', '曳', '潜', '唳', '啭', '喑', '栖', '萎', '蔓', '明', '翩', '蛰',
  '酒', '茶', '曲', '舟', '诗', '书', '仙', '玉', '剑', '刀', '钟', '盔', '甲', '笛', '萧', '笙', '镜',
  '壑', '涧', '汀', '渚', '岫', '峦', '驿', '隘', '津', '陌', '墟', '砌', '槛', '扉', '村', '郭',
  '红', '黄', '绿', '橙', '青', '蓝', '紫', '白', '素', '黑', '苍', '黯', '皎', '斑', '皑', '绛', '翠', '斑', '皴', '皤', '黧', '缁', '茜', '玄', '灰', '东', '西', '南', '北', '中', '春', '夏', '秋', '冬', '大', '小', '薄', '厚', '高', '低'
];

export const extractImagery = (text: string): { word: string; count: number }[] => {
  const imageryCount = new Map<string, number>();
  
  NATURAL_IMAGERY.forEach(word => {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) {
      imageryCount.set(word, matches.length);
    }
  });

  return Array.from(imageryCount.entries())
    .map(([word, count]) => ({ word, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
};

// 提取意象与常用词的关联关系
export const extractWordRelationships = (text: string, imageryWords: string[]): WordRelationship[] => {
  if (!text || !text.trim() || imageryWords.length === 0) {
    return [];
  }
  
  // 将文本分割成句子，只使用句号和换行作为分隔符
  const sentences = text.split(/[。！？\n]/).filter(s => s.trim());
  const relationships: Map<string, Map<string, number>> = new Map();
  
  // 初始化结果Map，只处理预定义的自然意象词
  imageryWords.filter(word => NATURAL_IMAGERY.includes(word)).forEach(imagery => {
    relationships.set(imagery, new Map());
  });
  
  // 分析每个句子中意象词和其他词的共现
  sentences.forEach(sentence => {
    if (!sentence.trim()) return; // 跳过空句子
    
    // 找出这个句子中包含的所有意象词
    const presentImageries = imageryWords.filter(img => sentence.includes(img));
    if (presentImageries.length === 0) return; // 如果没有意象词，跳过这个句子
    
    // 将句子分割成词（这里简单地按照单字分割）
    const words = Array.from(new Set(sentence.split('')));
    
    // 记录每对意象词-其他词在这个句子中的共现
    presentImageries.forEach(imagery => {
      words.forEach(word => {
        // 避免自己和自己的关联，排除空白字符和非常用词
        if (imagery !== word && word.trim() && COMMON_WORDS.includes(word)) {
          const currentCount = relationships.get(imagery)?.get(word) || 0;
          relationships.get(imagery)?.set(word, currentCount + 1);
        }
      });
    });
  });
  
  // 转换为结果数组，不再过滤共现次数
  const result: WordRelationship[] = [];
  relationships.forEach((wordMap, imagery) => {
    wordMap.forEach((count, word) => {
      result.push({
        imagery,
        word,
        count
      });
    });
  });
  
  return result.sort((a, b) => b.count - a.count);
};

export const parsePoems = (text: string): ProcessedPoem[] => {
  // 如果输入文本为空或只包含空白字符，则返回空数组
  if (!text || !text.trim()) {
    return [];
  }
  
  const poems: ProcessedPoem[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  // 检查文本是否为空
  if (lines.length === 0) {
    return [];
  }
  
  let currentTitle = '';
  let currentContent = '';
  let foundAnyPoemFormat = false;
  
  lines.forEach(line => {
    // 使用正则表达式匹配"数字.数字"或"数字.标题"格式的行
    if (line.match(/^\d+\.\d+/) || line.match(/^\d+\.[^0-9]/)) {
      // 找到了符合格式的行，标记为找到了诗词格式
      foundAnyPoemFormat = true;
      
      if (currentTitle && currentContent) {
        poems.push({ 
          id: currentTitle,
          title: currentTitle, 
          content: currentContent,
          imagery: extractImagery(currentContent),
          wordAssociations: []
        });
      }
      
      const titleMatch = line.match(/^\d+\.(.*)/);
      currentTitle = titleMatch ? titleMatch[1].trim() : line;
      currentContent = '';
    } else {
      // 如果已经有标题，则将当前行添加到内容中
      if (currentTitle) {
        currentContent += (currentContent ? '\n' : '') + line;
      }
    }
  });
  
  // 添加最后一首诗
  if (currentTitle && currentContent) {
    poems.push({ 
      id: currentTitle,
      title: currentTitle, 
      content: currentContent,
      imagery: extractImagery(currentContent),
      wordAssociations: []
    });
  }
  
  // 如果没有找到任何符合格式的诗词，返回空数组
  if (!foundAnyPoemFormat) {
    return [];
  }
  
  return poems;
};

const findImageryWordPairs = (poems: ProcessedPoem[]): ImageryWordPair[] => {
  const pairs: Map<string, ImageryWordPair> = new Map();
  
  poems.forEach(poem => {
    // 获取诗中的所有意象
    const imageryWords = poem.imagery.map(item => item.word);
    
    // 获取诗中的所有关联词
    const associatedWords = poem.wordAssociations.map(item => item.word);
    
    // 分析意象和关联词的共现关系
    imageryWords.forEach(imagery => {
      associatedWords.forEach(word => {
        const key = `${imagery}-${word}`;
        if (!pairs.has(key)) {
          pairs.set(key, {
            imagery,
            word,
            count: 0,
            occurrences: []
          });
        }
        
        const pair = pairs.get(key)!;
        pair.count++;
        
        // 记录出现位置
        const sentence = poem.content.split('。').find(s => 
          s.includes(imagery) && s.includes(word)
        );
        if (sentence) {
          pair.occurrences.push({
            poemId: poem.id,
            sentence: sentence + '。'
          });
        }
      });
    });
  });
  
  // 过滤掉出现次数少于2次的配对
  return Array.from(pairs.values()).filter(pair => pair.count >= 2);
};

export const calculateGlobalStats = (poems: ProcessedPoem[]): GlobalStats => {
  // 如果没有诗词数据，返回空的统计结果
  if (!poems || poems.length === 0) {
    return {
      coOccurrenceNetwork: { nodes: [], links: [], categories: [] },
      timeline: [],
      categoryAnalysis: [],
      topPairs: [],
      wordRelationships: [],
      imageryWordNetwork: { nodes: [], links: [] }
    };
  }

  // 计算全局意象频率
  const globalFrequency = new Map<string, number>();
  const coOccurrenceMap = new Map<string, Map<string, number>>();
  const categoryStats = new Map<string, Map<string, number>>();
  
  // 收集所有出现的意象词并初始化频率统计
  const allImageryWords = new Set<string>();
  NATURAL_IMAGERY.forEach(word => {
    globalFrequency.set(word, 0);
    allImageryWords.add(word);
  });
  
  poems.forEach(poem => {
    poem.imagery.forEach(({word}) => {
      if (NATURAL_IMAGERY.includes(word)) {
        allImageryWords.add(word);
      }
    });
  });
  
  // 分析意象词与常用词的关联关系
  const allWordRelationships: WordRelationship[] = [];
  poems.forEach(poem => {
    if (!poem.content || !poem.imagery.length) return;
    const imageryWords = poem.imagery.map(i => i.word).filter(word => NATURAL_IMAGERY.includes(word));
    if (imageryWords.length === 0) return;
    const relationships = extractWordRelationships(poem.content, imageryWords);
    allWordRelationships.push(...relationships);
  });
  
  // 合并相同关系的计数
  const relationshipMap = new Map<string, number>();
  allWordRelationships.forEach(({imagery, word, count}) => {
    const key = `${imagery}-${word}`;
    relationshipMap.set(key, (relationshipMap.get(key) || 0) + count);
  });
  
  // 转换回数组并排序
  const mergedRelationships: WordRelationship[] = [];
  relationshipMap.forEach((count, key) => {
    const [imagery, word] = key.split('-');
    mergedRelationships.push({imagery, word, count});
  });
  mergedRelationships.sort((a, b) => b.count - a.count);
  
  // 初始化类别统计
  // 为每个主类和子类创建统计Map
  Object.entries(IMAGERY_CATEGORIES).forEach(([mainCategory, subCategories]) => {
    // 为主类创建统计Map
    categoryStats.set(mainCategory, new Map());
    // 为每个子类创建统计Map
    Object.keys(subCategories).forEach(subCategory => {
      categoryStats.set(`${mainCategory}/${subCategory}`, new Map());
    });
  });
  
  // 初始化共现矩阵
  NATURAL_IMAGERY.forEach(word1 => {
    coOccurrenceMap.set(word1, new Map());
    NATURAL_IMAGERY.forEach(word2 => {
      if (word1 !== word2) {
        coOccurrenceMap.get(word1)?.set(word2, 0);
      }
    });
  });

  // 统计频率和共现
  poems.forEach(poem => {
    const poemImagery = poem.imagery.map(i => i.word);
    
    // 更新全局频率和类别统计
    poem.imagery.forEach(({ word, count }) => {
      globalFrequency.set(word, (globalFrequency.get(word) || 0) + count);
      const { mainCategory, subCategory } = getImageryCategory(word);
      // 更新主类统计
      const mainCategoryMap = categoryStats.get(mainCategory);
      if (mainCategoryMap) {
        mainCategoryMap.set(word, (mainCategoryMap.get(word) || 0) + count);
      }
      // 更新子类统计
      const subCategoryMap = categoryStats.get(`${mainCategory}/${subCategory}`);
      if (subCategoryMap) {
        subCategoryMap.set(word, (subCategoryMap.get(word) || 0) + count);
      }
    });
    
    // 更新共现矩阵
    poemImagery.forEach(word1 => {
      poemImagery.forEach(word2 => {
        if (word1 !== word2) {
          const current = coOccurrenceMap.get(word1)?.get(word2) || 0;
          coOccurrenceMap.get(word1)?.set(word2, current + 1);
        }
      });
    });
  });

  // 构建网络数据
  const categories = Object.keys(IMAGERY_CATEGORIES).map(name => ({ name }));
  const nodes = Array.from(globalFrequency.entries())
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({
      name,
      value,
      category: getImageryCategory(name)
    }));

  // 计算最大共现值用于归一化
  let maxCoOccurrence = 0;
  coOccurrenceMap.forEach(targetMap => {
    targetMap.forEach(value => {
      maxCoOccurrence = Math.max(maxCoOccurrence, value);
    });
  });

  // 构建边数据，只保留较强的关联
  const links: GlobalStats['coOccurrenceNetwork']['links'] = [];
  const threshold = maxCoOccurrence > 0 ? maxCoOccurrence * 0.2 : 0; // 只显示前20%强度的连接
  coOccurrenceMap.forEach((targetMap, source) => {
    targetMap.forEach((value, target) => {
      if (value > threshold) {
        const normalizedValue = maxCoOccurrence > 0 ? value / maxCoOccurrence : 0;
        links.push({
          source,
          target,
          value,
          lineStyle: {
            width: 1 + normalizedValue * 5,
            color: `rgba(128, 128, 128, ${0.3 + normalizedValue * 0.7})`
          }
        });
      }
    });
  });

  // 构建时间线数据
  const timelineData = NATURAL_IMAGERY.map(imagery => {
    const counts = Array(Math.ceil(poems.length / 5)).fill(0);
    poems.forEach((poem, index) => {
      const period = Math.floor(index / 5);
      const count = poem.imagery.find(i => i.word === imagery)?.count || 0;
      counts[period] += count;
    });
    return { imagery, counts };
  }).filter(data => data.counts.some(count => count > 0));

  // 类别分析
  const categoryAnalysis = Array.from(categoryStats.entries()).map(([category, imageryMap]) => ({
    category,
    imageryCount: Object.fromEntries(imageryMap)
  }));

  // 计算最常见的意象搭配
  const topPairs: Array<{ pair: string[]; count: number }> = [];
  coOccurrenceMap.forEach((targetMap, source) => {
    targetMap.forEach((value, target) => {
      if (source < target) { // 避免重复计算
        topPairs.push({
          pair: [source, target],
          count: value
        });
      }
    });
  });
  topPairs.sort((a, b) => b.count - a.count);

  // 计算意象-关联词网络
  const imageryWordPairs = findImageryWordPairs(poems);
  const imageryWordNodes = new Set<string>();
  const imageryWordLinks: Array<{
    source: string;
    target: string;
    value: number;
    lineStyle: {
      width: number;
      color: string;
    };
  }> = [];
  
  imageryWordPairs.forEach(pair => {
    imageryWordNodes.add(pair.imagery);
    imageryWordNodes.add(pair.word);
    
    imageryWordLinks.push({
      source: pair.imagery,
      target: pair.word,
      value: pair.count,
      lineStyle: {
        width: Math.min(pair.count * 2, 10),
        color: '#6366f1'
      }
    });
  });
  
  return {
    coOccurrenceNetwork: { 
      nodes: nodes.map(node => ({
        ...node,
        category: node.category.mainCategory
      })), 
      links, 
      categories 
    },
    timeline: timelineData,
    categoryAnalysis,
    topPairs: topPairs.slice(0, 10),
    wordRelationships: mergedRelationships,
    imageryWordNetwork: {
      nodes: Array.from(imageryWordNodes).map(name => ({
        name,
        value: imageryWordPairs.filter(p => p.imagery === name || p.word === name)
          .reduce((sum, p) => sum + p.count, 0),
        category: 'default'
      })),
      links: imageryWordLinks
    }
  };
};

export const exportToCSV = (poems: ProcessedPoem[], stats: GlobalStats): string => {
  // 如果没有数据，返回空字符串
  if (!poems || poems.length === 0) {
    return '';
  }
  
  const lines: string[] = [];
  
  // 添加标题行
  lines.push('数据类型,项目,数值');
  
  // 导出每首诗的意象统计
  poems.forEach((poem, index) => {
    lines.push(`诗词${index + 1},${poem.title},`);
    poem.imagery.forEach(({ word, count }) => {
      lines.push(`意象统计,${word},${count}`);
    });
  });
  
  // 导出类别分析
  stats.categoryAnalysis.forEach(({ category, imageryCount }) => {
    Object.entries(imageryCount).forEach(([imagery, count]) => {
      lines.push(`类别分析,${category}-${imagery},${count}`);
    });
  });
  
  // 导出最常见搭配
  stats.topPairs.forEach(({ pair, count }) => {
    lines.push(`常见搭配,${pair.join('+')},${count}`);
  });
  
  // 导出意象-词关联
  stats.wordRelationships.forEach(({ imagery, word, count }) => {
    lines.push(`意象关联词,${imagery}-${word},${count}`);
  });
  
  return lines.join('\n');
};

// 修改WordAssociation接口，添加出处信息
interface WordAssociation {
  word: string;
  count: number;
  strength: number;
  occurrences: Array<{
    poemId: string;  // 诗词编号
    sentence: string;  // 具体句子
  }>;
}

interface ImageryWordAssociation {
  imagery: string;
  associations: WordAssociation[];
}

// 修改analyzeImageryWordAssociations函数
export function analyzeImageryWordAssociations(poems: Poem[]): ImageryWordAssociation[] {
  const wordFrequency = new Map<string, number>();
  const imageryWordCooccurrence = new Map<string, Map<string, WordAssociation>>();
  
  // 定义句子分隔符
  const sentenceSeparators = /[，。！？；：\s]/;
  
  // 统计所有词的出现频率
  poems.forEach(poem => {
    const words = poem.content.split(sentenceSeparators).filter((word: string) => word.length > 0);
    words.forEach((word: string) => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
  });

  // 分析意象与词的共现关系
  poems.forEach(poem => {
    // 将文本分割成句子
    const sentences = poem.content.split(sentenceSeparators).filter(sentence => sentence.trim());
    
    sentences.forEach(sentence => {
      // 找出这个句子中包含的所有意象词
      const presentImageries = NATURAL_IMAGERY.filter(imagery => sentence.includes(imagery));
      
      if (presentImageries.length === 0) return; // 如果没有意象词，跳过这个句子
      
      // 将句子分割成词（这里简单地按照单字分割）
      const words = Array.from(new Set(sentence.split('')));
      
      // 记录每对意象词-其他词在这个句子中的共现
      presentImageries.forEach(imagery => {
        if (!imageryWordCooccurrence.has(imagery)) {
          imageryWordCooccurrence.set(imagery, new Map());
        }
        
        words.forEach(word => {
          // 避免自己和自己的关联，排除空白字符
          if (imagery !== word && word.trim()) {
            const cooccurrenceMap = imageryWordCooccurrence.get(imagery)!;
            const existingAssociation = cooccurrenceMap.get(word);
            
            if (existingAssociation) {
              existingAssociation.count++;
              existingAssociation.strength = existingAssociation.count / (wordFrequency.get(word) || 1);
              existingAssociation.occurrences.push({
                poemId: poem.id,
                sentence
              });
            } else {
              cooccurrenceMap.set(word, {
                word,
                count: 1,
                strength: 1 / (wordFrequency.get(word) || 1),
                occurrences: [{
                  poemId: poem.id,
                  sentence
                }]
              });
            }
          }
        });
      });
    });
  });

  // 生成关联结果
  const associations: ImageryWordAssociation[] = [];
  
  imageryWordCooccurrence.forEach((cooccurrenceMap, imagery) => {
    const wordAssociations: WordAssociation[] = [];
    
    cooccurrenceMap.forEach((association) => {
      if (association.count >= 2) { // 只包含共现次数大于等于2的词
        wordAssociations.push(association);
      }
    });

    // 按关联强度排序
    wordAssociations.sort((a, b) => b.strength - a.strength);

    associations.push({
      imagery,
      associations: wordAssociations
    });
  });

  return associations;
}