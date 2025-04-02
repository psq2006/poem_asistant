import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Visualizations } from './components/Visualizations';
import { PoemList } from './components/PoemList';
import { EmotionVisualization } from './components/EmotionVisualization';
import { ImageryWordVisualizations } from './components/ImageryWordVisualizations';
import type { ProcessedPoem, GlobalStats, AISettings } from './types';
import { analyzeImageryEmotion } from './services/aiService';
import { calculateGlobalStats } from './utils/imageryExtractor';
import { GraduationCap, AlertTriangle } from 'lucide-react';

function App() {
  const [poems, setPoems] = useState<ProcessedPoem[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedAISettings, setSavedAISettings] = useState<AISettings | null>(null);
  const [analyzedPoems, setAnalyzedPoems] = useState<ProcessedPoem[]>([]);

  // 从localStorage加载保存的AI设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSavedAISettings(parsedSettings);
      } catch {
        console.error('加载保存的AI设置失败');
        setError('加载AI设置失败，请检查浏览器存储权限');
      }
    }
  }, []);

  const handleAISettingsSave = (settings: AISettings) => {
    try {
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      setSavedAISettings(settings);
      setError(null);
    } catch {
      setError('保存AI设置失败，请检查浏览器存储权限');
    }
  };

  const handlePoemsProcessed = async (processedPoems: ProcessedPoem[], aiSettings?: AISettings) => {
    try {
      console.log('=== 开始处理诗词数据 ===');
      console.log('AI设置:', aiSettings);
      console.log('诗词数量:', processedPoems.length);

      // 参数验证
      if (!processedPoems || processedPoems.length === 0) {
        throw new Error('未提供有效的诗词数据');
      }

      if (aiSettings?.useAI && !aiSettings?.apiKey) {
        throw new Error('启用了AI分析但未提供API密钥');
      }

      setPoems(processedPoems);
      setStats(calculateGlobalStats(processedPoems));
      setAnalyzedPoems([]);
      setError(null);

      // 如果提供了AI设置，进行情感分析
      if (aiSettings?.useAI && aiSettings?.apiKey) {
        console.log('=== 开始AI分析 ===');
        console.log('使用的模型:', aiSettings.model);
        console.log('API密钥长度:', aiSettings.apiKey.length);
        
        setIsAnalyzing(true);
        setError(null);

        const totalPoems = processedPoems.length;
        let analyzedCount = 0;
        const failedPoems: string[] = [];

        // 在开始分析前清空之前的分析结果
        setAnalyzedPoems([]);

        const analyzedPoems = await Promise.all(
          processedPoems.map(async (poem) => {
            try {
              console.log(`分析第 ${analyzedCount + 1}/${totalPoems} 首诗:`, poem.title);
              const imagery = poem.imagery.map(item => item.word);
              
              // 检查意象列表是否为空
              if (imagery.length === 0) {
                console.warn(`诗词 "${poem.title}" 没有找到意象词`);
                return {
                  ...poem,
                  emotionAnalysis: {
                    imageryEmotions: []
                  }
                };
              }

              console.log('发送API请求...');
              const emotionAnalysis = await analyzeImageryEmotion(
                poem,
                imagery,
                poem.content,
                aiSettings
              );
              
              analyzedCount++;
              const progress = (analyzedCount / totalPoems) * 100;
              console.log(`分析进度: ${progress.toFixed(1)}%`);
              setAnalysisProgress(progress);
              
              console.log('分析完成:', poem.title, emotionAnalysis);
              
              return {
                ...poem,
                emotionAnalysis
              };
            } catch (error) {
              console.error('单首诗分析失败:', poem.title, error);
              failedPoems.push(poem.title);
              
              return {
                ...poem,
                emotionAnalysis: {
                  imageryEmotions: [],
                  error: error instanceof Error ? error.message : '分析失败'
                }
              };
            }
          })
        );

        console.log('=== AI分析完成 ===');
        console.log('成功分析:', analyzedPoems.length - failedPoems.length);
        console.log('失败数量:', failedPoems.length);
        
        if (failedPoems.length > 0) {
          const warningMessage = `以下诗词分析失败：${failedPoems.join('、')}`;
          console.warn(warningMessage);
          setError(warningMessage);
        }
        
        setAnalyzedPoems(analyzedPoems);
      } else {
        console.log('未启用AI分析，跳过情感分析步骤');
        setAnalyzedPoems(processedPoems);
      }
    } catch (error) {
      console.error('处理过程发生错误:', error);
      setError(error instanceof Error ? error.message : '处理过程中发生未知错误');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-md relative">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">诗词意象分析工具</h1>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              天津大学汉语言文学专业诗词研究小组
            </div>
            <div className="text-sm text-gray-500 mt-1">
              网站负责人：彭思宇
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-12">
          <FileUpload
            onPoemsProcessed={handlePoemsProcessed} 
            savedAISettings={savedAISettings}
            onAISettingsSave={handleAISettingsSave}
          />
        </div>
        
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">发生错误</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {!poems.length && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">欢迎使用诗词意象分析工具</h2>
              <p className="text-gray-600 mb-6">
                本工具由天津大学汉语言文学专业诗词研究小组开发，旨在帮助研究人员快速分析诗词中的自然意象分布及其关联关系。
                通过上传包含诗词的文档，您可以获得：
              </p>
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  详细的意象统计和分类
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  意象共现网络可视化
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  时间维度的分布分析
                </li>
              </ul>
              <p className="text-sm text-gray-500 italic">
                支持 .docx 和 .txt 格式的文件上传（最大 10MB）
              </p>
            </div>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="mt-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">正在进行AI情感分析</h3>
              <p className="text-gray-600 mb-4">请耐心等待，这可能需要一些时间...</p>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    分析进度
                  </span>
                  <span className="text-sm text-blue-700">
                    {Math.round(analysisProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {poems.length > 0 && !isAnalyzing && (
          <>
            {stats && <Visualizations poems={poems} stats={stats} />}
            <ImageryWordVisualizations poems={poems} />
            {analyzedPoems.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">AI情感分析结果</h2>
                <EmotionVisualization poems={analyzedPoems} />
              </div>
            )}
            <PoemList poems={analyzedPoems.length > 0 ? analyzedPoems : poems} />
          </>
        )}
      </main>

      <footer className="bg-white mt-12 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2024 天津大学汉语言文学专业诗词研究小组</p>
          <p className="mt-1">本工具仅供学术研究使用</p>
        </div>
      </footer>
    </div>
  );
}

export default App;