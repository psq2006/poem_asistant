import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { Visualizations } from './components/Visualizations';
import { PoemList } from './components/PoemList';
import { EmotionVisualization } from './components/EmotionVisualization';
import { ImageryWordVisualizations } from './components/ImageryWordVisualizations';
import type { ProcessedPoem, GlobalStats, AISettings, UserJudgment } from './types';
import { analyzeImageryEmotion } from './services/aiService';
import { calculateGlobalStats } from './utils/imageryExtractor';
import { GraduationCap, AlertTriangle, Save, Trash2 } from 'lucide-react';

function App() {
  const [poems, setPoems] = useState<ProcessedPoem[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedAISettings, setSavedAISettings] = useState<AISettings | null>(null);
  const [analyzedPoems, setAnalyzedPoems] = useState<ProcessedPoem[]>([]);
  const [userJudgments, setUserJudgments] = useState<UserJudgment[]>([]);
  const [enableJudgment, setEnableJudgment] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 从localStorage加载所有保存的数据
  useEffect(() => {
    try {
      // 加载诗词数据
      const savedPoems = localStorage.getItem('poems');
      if (savedPoems) {
        const parsedPoems = JSON.parse(savedPoems);
        setPoems(parsedPoems);
        setStats(calculateGlobalStats(parsedPoems));
      }

      // 加载已分析的诗词数据
      const savedAnalyzedPoems = localStorage.getItem('analyzedPoems');
      if (savedAnalyzedPoems) {
        setAnalyzedPoems(JSON.parse(savedAnalyzedPoems));
      }

      // 加载AI设置
      const savedSettings = localStorage.getItem('aiSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSavedAISettings(parsedSettings);
        setEnableJudgment(parsedSettings.enableJudgment || false);
      }

      // 加载用户判断结果
      const savedJudgments = localStorage.getItem('userJudgments');
      if (savedJudgments) {
        const parsedJudgments = JSON.parse(savedJudgments);
        setUserJudgments(parsedJudgments);
        if (parsedJudgments.length > 0) {
          setEnableJudgment(true);
        }
      }
    } catch (err) {
      console.error('加载保存的数据失败:', err);
      setError('加载保存的数据失败，请检查浏览器存储权限');
    }
  }, []);

  // 保存所有数据到localStorage
  const saveAllData = useCallback(() => {
    try {
      localStorage.setItem('poems', JSON.stringify(poems));
      localStorage.setItem('analyzedPoems', JSON.stringify(analyzedPoems));
      localStorage.setItem('userJudgments', JSON.stringify(userJudgments));
      if (savedAISettings) {
        localStorage.setItem('aiSettings', JSON.stringify(savedAISettings));
      }
      setHasUnsavedChanges(false);
      setError(null);
    } catch (err) {
      console.error('保存数据失败:', err);
      setError('保存数据失败，请检查浏览器存储权限');
    }
  }, [poems, analyzedPoems, userJudgments, savedAISettings]);

  // 清除所有本地缓存
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem('poems');
      localStorage.removeItem('analyzedPoems');
      localStorage.removeItem('userJudgments');
      localStorage.removeItem('aiSettings');
      setPoems([]);
      setAnalyzedPoems([]);
      setUserJudgments([]);
      setStats(null);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (err) {
      console.error('清除缓存失败:', err);
      setError('清除缓存失败，请检查浏览器存储权限');
    }
  }, []);

  // 保存AI设置
  const handleAISettingsSave = (settings: AISettings) => {
    try {
      setSavedAISettings(settings);
      setEnableJudgment(settings.enableJudgment || false);
      setHasUnsavedChanges(true);
      setError(null);
    } catch {
      setError('保存AI设置失败，请检查浏览器存储权限');
    }
  };

  // 计算AI判断的正确率
  const calculateAccuracy = () => {
    if (!userJudgments || userJudgments.length === 0) return 0;
    const trueCount = userJudgments.filter(j => j.isTrue).length;
    return (trueCount / userJudgments.length) * 100;
  };

  // 处理用户判断结果
  const handleUserJudgment = (poemId: string, imageryEmotionId: string, isTrue: boolean) => {
    const newJudgment: UserJudgment = {
      poemId,
      imageryEmotionId,
      isTrue,
      timestamp: Date.now()
    };

    const updatedJudgments = [...userJudgments];
    const existingIndex = updatedJudgments.findIndex(
      j => j.poemId === poemId && j.imageryEmotionId === imageryEmotionId
    );

    if (existingIndex >= 0) {
      updatedJudgments[existingIndex] = newJudgment;
    } else {
      updatedJudgments.push(newJudgment);
    }

    setUserJudgments(updatedJudgments);
    setHasUnsavedChanges(true);

    const updatedPoems = analyzedPoems.map(poem => {
      if (poem.id === poemId && poem.emotionAnalysis) {
        const updatedImageryEmotions = poem.emotionAnalysis.imageryEmotions.map(emotion => {
          const emotionId = `${poem.id}-${emotion.imagery}-${emotion.emotion}`;
          if (emotionId === imageryEmotionId) {
            return { ...emotion, isTrue };
          }
          return emotion;
        });

        return {
          ...poem,
          emotionAnalysis: {
            ...poem.emotionAnalysis,
            imageryEmotions: updatedImageryEmotions
          }
        };
      }
      return poem;
    });

    setAnalyzedPoems(updatedPoems);
  };

  const handlePoemsProcessed = async (processedPoems: ProcessedPoem[], aiSettings?: AISettings) => {
    try {
      console.log('=== 开始处理诗词数据 ===');
      console.log('AI设置:', aiSettings);
      console.log('诗词数量:', processedPoems.length);

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
      setEnableJudgment(aiSettings?.enableJudgment || false);
      setHasUnsavedChanges(true);

      if (aiSettings?.useAI && aiSettings?.apiKey) {
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        const totalPoems = processedPoems.length;
        let analyzedCount = 0;
        const failedPoems: string[] = [];

        const analyzedResults = await Promise.all(
          processedPoems.map(async (poem) => {
            try {
              const imagery = poem.imagery.map(item => item.word);
              
              if (imagery.length === 0) {
                console.warn(`诗词 "${poem.title}" 没有找到意象词`);
                return {
                  ...poem,
                  emotionAnalysis: {
                    imageryEmotions: []
                  }
                };
              }

              const emotionAnalysis = await analyzeImageryEmotion(
                poem,
                imagery,
                poem.content,
                aiSettings
              );
              
              analyzedCount++;
              setAnalysisProgress((analyzedCount / totalPoems) * 100);
              
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

        if (failedPoems.length > 0) {
          setError(`以下诗词分析失败：${failedPoems.join('、')}`);
        }
        
        setAnalyzedPoems(analyzedResults);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('处理诗词数据失败:', err);
      setError('处理诗词数据失败，请重试');
      setIsAnalyzing(false);
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
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  使用AI进行情感分析
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
            <div className="flex justify-end gap-4 mb-6">
              {hasUnsavedChanges && (
                <button
                  onClick={saveAllData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存分析结果
                </button>
              )}
              <button
                onClick={clearLocalStorage}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清除本地缓存
              </button>
            </div>

            {stats && <Visualizations poems={poems} stats={stats} />}
            <ImageryWordVisualizations poems={poems} />
            {analyzedPoems.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">AI情感分析结果</h2>
                {enableJudgment && userJudgments.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-800 font-medium">AI分析正确率：</span>
                        <span className="text-blue-600 font-bold">{calculateAccuracy().toFixed(1)}%</span>
                        <span className="text-blue-600 text-sm">({userJudgments.filter(j => j.isTrue).length}/{userJudgments.length})</span>
                      </div>
                    </div>
                  </div>
                )}
                <EmotionVisualization poems={analyzedPoems} />
              </div>
            )}
            <PoemList 
              poems={analyzedPoems.length > 0 ? analyzedPoems : poems} 
              enableJudgment={enableJudgment}
              userJudgments={userJudgments}
              onUserJudgment={handleUserJudgment}
            />
          </>
        )}
      </main>

      <footer className="bg-white mt-12 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2024 天津大学汉语言文学专业诗词研究小组</p>
          <p>联系开发人员:petertwo573@gmail.com</p>
          <p className="mt-1">本工具仅供学术研究使用</p>
        </div>
      </footer>
    </div>
  );
}

export default App;