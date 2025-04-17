const express = require('express');
const router = express.Router();
const Poem = require('../models/Poem');
const { body, validationResult } = require('express-validator');

// 敏感词检查
const sensitiveWords = ['辱骂', '攻击', '侮辱', '谩骂', '脏话']; // 这里只是示例，实际应该使用更完整的敏感词库

function containsSensitiveWords(text) {
  return sensitiveWords.some(word => text.includes(word));
}

// 用户上传诗歌
router.post('/upload', [
  body('title').trim().notEmpty().withMessage('标题不能为空'),
  body('author').trim().notEmpty().withMessage('作者不能为空'),
  body('dynasty').trim().notEmpty().withMessage('朝代不能为空'),
  body('content').trim().notEmpty().withMessage('内容不能为空'),
  body('translation').optional().trim(),
  body('background').optional().trim(),
  body('tags').optional().isArray().withMessage('标签必须是数组')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查敏感词
    const { title, content, translation, background } = req.body;
    if (containsSensitiveWords(title) || 
        containsSensitiveWords(content) || 
        (translation && containsSensitiveWords(translation)) || 
        (background && containsSensitiveWords(background))) {
      return res.status(400).json({ message: '内容包含敏感词，请修改后重新提交' });
    }

    // 创建新诗歌
    const poem = new Poem({
      ...req.body,
      isUserUploaded: true,
      status: 'pending', // pending, approved, rejected
      uploadedBy: req.user?.id || 'anonymous'
    });

    await poem.save();
    res.status(201).json({ message: '诗歌上传成功，等待审核', poem });
  } catch (error) {
    console.error('上传诗歌失败:', error);
    res.status(500).json({ message: '上传诗歌失败' });
  }
});

// 获取待审核的诗歌
router.get('/pending', async (req, res) => {
  try {
    const poems = await Poem.find({ 
      isUserUploaded: true, 
      status: 'pending' 
    });
    res.json(poems);
  } catch (error) {
    console.error('获取待审核诗歌失败:', error);
    res.status(500).json({ message: '获取待审核诗歌失败' });
  }
});

// 审核诗歌
router.put('/review/:id', [
  body('status').isIn(['approved', 'rejected']).withMessage('状态无效'),
  body('reviewComment').optional().trim()
], async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      return res.status(404).json({ message: '诗歌不存在' });
    }

    if (!poem.isUserUploaded) {
      return res.status(400).json({ message: '只能审核用户上传的诗歌' });
    }

    poem.status = req.body.status;
    poem.reviewComment = req.body.reviewComment;
    poem.reviewedBy = req.user?.id;
    poem.reviewedAt = new Date();

    await poem.save();
    res.json({ message: '审核完成', poem });
  } catch (error) {
    console.error('审核诗歌失败:', error);
    res.status(500).json({ message: '审核诗歌失败' });
  }
});

module.exports = router; 