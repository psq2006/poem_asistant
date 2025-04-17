import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Calendar, User, Heart, Share2 } from 'lucide-react';
import type { ProcessedPoem } from '../types';

interface PoemDetail {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  translation?: string;
  background?: string;
  authorInfo?: {
    name: string;
    dynasty: string;
    life: string;
    style: string;
    representativeWorks: string[];
  };
  imageryAnalysis?: {
    words: string[];
    emotions: {
      word: string;
      emotion: string;
      explanation: string;
    }[];
  };
}

const DailyRecommendation: React.FC = () => {
  const [todayPoem, setTodayPoem] = useState<PoemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);
  const [showImageryAnalysis, setShowImageryAnalysis] = useState(false);

  useEffect(() => {
    const fetchTodayPoem = async () => {
      try {
        setLoading(true);
        // TODO: 替换为实际的API端点
        const response = await fetch('http://your-api-endpoint/daily-poem');
        if (!response.ok) {
          throw new Error('获取今日推荐失败');
        }
        const data = await response.json();
        setTodayPoem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取今日推荐失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayPoem();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!todayPoem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无今日推荐</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 诗歌卡片 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{todayPoem.title}</h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-indigo-600">
                <Heart className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-indigo-600">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-6">
            <User className="w-4 h-4 mr-1" />
            <span className="mr-4">{todayPoem.author}</span>
            <Calendar className="w-4 h-4 mr-1" />
            <span>{todayPoem.dynasty}</span>
          </div>

          <div className="prose max-w-none mb-6">
            {todayPoem.content.split('\n').map((line, index) => (
              <p key={index} className="text-xl text-gray-800 leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* 功能按钮组 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              译文
            </button>
            <button
              onClick={() => setShowBackground(!showBackground)}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              创作背景
            </button>
            <button
              onClick={() => setShowAuthorInfo(!showAuthorInfo)}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            >
              <User className="w-4 h-4 mr-2" />
              作者简介
            </button>
            <button
              onClick={() => setShowImageryAnalysis(!showImageryAnalysis)}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              意象分析
            </button>
          </div>

          {/* 译文 */}
          {showTranslation && todayPoem.translation && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">译文</h3>
              <p className="text-gray-700">{todayPoem.translation}</p>
            </div>
          )}

          {/* 创作背景 */}
          {showBackground && todayPoem.background && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">创作背景</h3>
              <p className="text-gray-700">{todayPoem.background}</p>
            </div>
          )}

          {/* 作者简介 */}
          {showAuthorInfo && todayPoem.authorInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">作者简介</h3>
              <div className="space-y-2">
                <p><span className="font-medium">朝代：</span>{todayPoem.authorInfo.dynasty}</p>
                <p><span className="font-medium">生平：</span>{todayPoem.authorInfo.life}</p>
                <p><span className="font-medium">风格：</span>{todayPoem.authorInfo.style}</p>
                <div>
                  <span className="font-medium">代表作品：</span>
                  <ul className="list-disc list-inside">
                    {todayPoem.authorInfo.representativeWorks.map((work, index) => (
                      <li key={index}>{work}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 意象分析 */}
          {showImageryAnalysis && todayPoem.imageryAnalysis && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">意象分析</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">意象词：</h4>
                  <div className="flex flex-wrap gap-2">
                    {todayPoem.imageryAnalysis.words.map((word, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">情感分析：</h4>
                  <div className="space-y-2">
                    {todayPoem.imageryAnalysis.emotions.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{item.word}</p>
                        <p className="text-gray-600">{item.emotion}</p>
                        <p className="text-gray-500 text-sm mt-1">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 相关推荐 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">相关推荐</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 这里可以添加相关推荐的诗歌卡片 */}
        </div>
      </div>
    </div>
  );
};

export default DailyRecommendation; 