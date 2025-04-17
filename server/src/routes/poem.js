const express = require('express');
const router = express.Router();
const Poem = require('../models/Poem');

// 获取今日推荐
router.get('/daily', async (req, res) => {
  try {
    // 获取最近30天内未推荐过的诗歌
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const poem = await Poem.findOne({
      lastRecommended: { $lt: thirtyDaysAgo }
    }).sort({ recommendationCount: 1 });

    if (!poem) {
      // 如果没有符合条件的诗歌，随机选择一首
      const count = await Poem.countDocuments();
      const random = Math.floor(Math.random() * count);
      const poem = await Poem.findOne().skip(random);
      
      if (!poem) {
        return res.status(404).json({ message: '没有找到诗歌' });
      }
    }

    // 更新推荐信息
    poem.lastRecommended = new Date();
    poem.recommendationCount += 1;
    await poem.save();

    res.json(poem);
  } catch (error) {
    console.error('获取今日推荐失败:', error);
    res.status(500).json({ message: '获取今日推荐失败' });
  }
});

// 获取相关推荐
router.get('/related/:poemId', async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.poemId);
    if (!poem) {
      return res.status(404).json({ message: '诗歌不存在' });
    }

    // 基于标签和朝代获取相关诗歌
    const relatedPoems = await Poem.find({
      _id: { $ne: poem._id },
      $or: [
        { tags: { $in: poem.tags } },
        { dynasty: poem.dynasty }
      ]
    })
    .limit(4)
    .select('title author dynasty content')
    .sort({ recommendationCount: 1 });

    res.json(relatedPoems);
  } catch (error) {
    console.error('获取相关推荐失败:', error);
    res.status(500).json({ message: '获取相关推荐失败' });
  }
});

// 添加新诗歌
router.post('/', async (req, res) => {
  try {
    const poem = new Poem(req.body);
    await poem.save();
    res.status(201).json(poem);
  } catch (error) {
    console.error('添加诗歌失败:', error);
    res.status(400).json({ message: '添加诗歌失败' });
  }
});

// 更新诗歌
router.put('/:id', async (req, res) => {
  try {
    const poem = await Poem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!poem) {
      return res.status(404).json({ message: '诗歌不存在' });
    }
    res.json(poem);
  } catch (error) {
    console.error('更新诗歌失败:', error);
    res.status(400).json({ message: '更新诗歌失败' });
  }
});

module.exports = router; 