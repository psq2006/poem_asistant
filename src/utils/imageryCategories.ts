export const IMAGERY_CATEGORIES = {
  '天文': {
    '日月星辰': ['日', '月', '星', '辰', '北极星', '启明', '北斗', '星宿'],
    '天气现象': ['云', '霞', '虹', '霓', '风', '霜', '露', '雾', '霾'],
    '宇宙元素': ['穹', '霄汉', '天河', '太虚', '清辉', '星汉', '银汉', '银河']
  },
  '地理': {
    '自然地貌': ['山', '川', '峰', '岭', '江', '河', '湖', '海', '溪', '潭', '泉', '瀑布', '原野', '沙', '漠', '荒丘', '岛', '屿', '洞', '穴', '岩', '水']
  },
  '动物': {
    '飞禽': ['鸟', '鹰', '鹤', '雁', '雀', '燕', '鹊', '鸦', '鹭', '鸠', '黄鹂', '子规', '鸥', '凤', '凰', '精卫'],
    '走兽': ['虎', '豹', '狼', '熊', '鹿', '马', '牛', '羊', '犬', '狐', '猿', '兔', '麒麟', '貔貅'],
    '水族': ['鱼', '龙', '蛟', '鼋', '鼍', '蚌', '鳖', '虾', '蟹', '鲲', '鹏'],
    '昆虫': ['蝉', '螽斯', '蟋蟀', '蝴', '蝶', '蜂', '萤', '蜘蛛', '蜻蜓', '蚕']
  },
  '植物': {
    '树木': ['松', '柏', '槐', '柳', '竹', '梧', '桐', '桑', '桃', '李', '梅', '枫', '桂', '楠', '银杏'],
    '花草': ['兰', '菊', '荷', '芍药', '牡丹', '芙蓉', '棠', '杜鹃', '芦苇', '蒲', '萱', '苹', '蓼', '萍', '苔', '菌', '灵芝'],
    '农作物': ['稻', '麦', '黍', '稷', '菽', '麻', '瓜', '瓠', '藤', '蔓', '葛']
  },
  '气候': {
    '气象变化': ['风', '雨', '雪', '霜', '露', '雾', '霾', '雷', '虹', '霓', '雹', '冰']
  }
} as const;

export const getImageryCategory = (imagery: string): { mainCategory: string; subCategory: string } => {
  for (const [mainCategory, subCategories] of Object.entries(IMAGERY_CATEGORIES)) {
    for (const [subCategory, items] of Object.entries(subCategories)) {
      if (items.includes(imagery)) {
        return { mainCategory, subCategory };
      }
    }
  }
  return { mainCategory: '其他', subCategory: '未分类' };
};

export const CATEGORY_COLORS = {
  '天文': {
    main: '#FF7875',
    '日月星辰': '#FF9C91',
    '天气现象': '#FFBBA7',
    '宇宙元素': '#FFD8C2'
  },
  '地理': {
    main: '#95DE64',
    '自然地貌': '#B7EB8F'
  },
  '动物': {
    main: '#69C0FF',
    '飞禽': '#91D5FF',
    '走兽': '#BAE7FF',
    '水族': '#E6F7FF',
    '昆虫': '#F0F5FF'
  },
  '植物': {
    main: '#B37FEB',
    '树木': '#D3ADF7',
    '花草': '#EFDBFF',
    '农作物': '#F9F0FF'
  },
  '气候': {
    main: '#FFC069',
    '气象变化': '#FFE7BA'
  },
  '其他': {
    main: '#D9D9D9',
    '未分类': '#F0F0F0'
  }
} as const;