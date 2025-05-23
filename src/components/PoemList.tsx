import React from 'react';
import type { ProcessedPoem, UserJudgment, WordAssociation } from '../types';
import { CATEGORY_COLORS } from '../utils/imageryCategories';
import { getImageryCategory } from '../utils/imageryCategories';
import { exportToCSV, getFormattedDateTime } from '../utils/exportUtils';
import { CheckCircle, XCircle } from 'lucide-react';

interface PoemListProps {
  poems: ProcessedPoem[];
  enableJudgment?: boolean;
  userJudgments?: UserJudgment[];
  onUserJudgment?: (poemId: string, imageryEmotionId: string, isTrue: boolean) => void;
}

export const PoemList: React.FC<PoemListProps> = ({ 
  poems, 
  enableJudgment = false,
  userJudgments = [],
  onUserJudgment
}) => {
  // 高亮原诗中的意象
  const highlightImageriesInText = (text: string, imageries: Array<{word: string; count: number}>) => {
    // 按长度排序意象词，优先匹配较长的词（避免"江南"被拆分为"江"和"南"）
    const sortedImageries = [...imageries].sort((a, b) => b.word.length - a.word.length);
    
    // 存储所有匹配的位置和对应的意象词信息
    const matches: Array<{start: number; end: number; word: string; color: string}> = [];
    
    // 找出所有意象词的所有出现位置
    sortedImageries.forEach(({word}) => {
      const { mainCategory } = getImageryCategory(word);
      const color = CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS]?.main || CATEGORY_COLORS['其他'].main;
      let pos = 0;
      
      while (true) {
        const index = text.indexOf(word, pos);
        if (index === -1) break;
        
        // 检查是否与已有匹配重叠
        const overlaps = matches.some(match => 
          (index >= match.start && index < match.end) || 
          (index + word.length > match.start && index + word.length <= match.end)
        );
        
        if (!overlaps) {
          matches.push({
            start: index,
            end: index + word.length,
            word,
            color
          });
        }
        
        pos = index + word.length;
      }
    });
    
    // 按位置排序所有匹配项
    matches.sort((a, b) => a.start - b.start);
    
    // 构建最终的文本元素
    const elements: JSX.Element[] = [];
    let lastPos = 0;
    let key = 0;
    
    matches.forEach(({start, end, word, color}) => {
      // 添加前面的未标记文本
      if (start > lastPos) {
        elements.push(
          <span key={`text-${key++}`}>{text.slice(lastPos, start)}</span>
        );
      }
      
      // 添加高亮的意象词
      elements.push(
        <span 
          key={`highlight-${key++}`}
          className="font-medium"
          style={{ 
            backgroundColor: `${color}20`,
            color: color,
            padding: '0 1px'
          }}
        >
          {word}
        </span>
      );
      
      lastPos = end;
    });
    
    // 添加最后一段未标记的文本
    if (lastPos < text.length) {
      elements.push(
        <span key={`text-${key++}`}>{text.slice(lastPos)}</span>
      );
    }
    
    return elements.length ? elements : text;
  };

  // 修改ImageryWordAssociations组件
  const ImageryWordAssociations: React.FC<{ associations: WordAssociation[] }> = ({ associations }) => {
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">意象-词关联分析：</h4>
        <div className="mt-1 space-y-2">
          {associations.map(({ word, count, strength, occurrences }) => (
            <div key={word} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  <span className="font-medium text-blue-600">{word}</span>
                  <span className="text-gray-400 mx-2">←</span>
                  <span className="font-medium text-green-600">{occurrences[0]?.poemId.split('.')[1]}</span>
                </span>
                <span className="text-gray-500">
                  共现{count}次 (关联度: {(strength * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                <div className="font-medium">出处：</div>
                {occurrences.map((occurrence: { poemId: string; sentence: string }, index: number) => (
                  <div key={index} className="ml-2">
                    {occurrence.poemId} - {occurrence.sentence}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const highlightImagery = (line: string, imagery: string) => {
    const regex = new RegExp(`(${imagery})`, 'g');
    return line.replace(regex, '<span class="text-blue-600 font-bold">$1</span>');
  };

  const getImageryContext = (poem: ProcessedPoem, imagery: string) => {
    const lines = poem.content.split('\n');
    for (const line of lines) {
      if (line.includes(imagery)) {
        return line;
      }
    }
    return '';
  };

  // 导出单首诗的意象-情感分析
  const exportEmotionAnalysis = (poem: ProcessedPoem) => {
    if (!poem.emotionAnalysis) return;
    
    const data = poem.emotionAnalysis.imageryEmotions.map(item => {
      const judgment = userJudgments?.find(
        j => j.poemId === poem.id && 
        j.imageryEmotionId === `${poem.id}-${item.imagery}-${item.emotion}`
      );
      
      return {
        '诗词标题': poem.title,
        '意象': item.imagery,
        '情感': item.emotion,
        '情感倾向': item.tendency,
        '情感强度': item.intensity,
        '人工判别': judgment ? (judgment.isTrue ? '正确' : '错误') : '未判别'
      };
    });
    
    const filename = `意象情感分析_${poem.title}_${getFormattedDateTime()}`;
    exportToCSV(data, filename);
  };

  // 导出所有诗的意象-情感分析
  const exportAllEmotionAnalysis = () => {
    const data = poems.flatMap(poem => {
      if (!poem.emotionAnalysis) return [];
      
      return poem.emotionAnalysis.imageryEmotions.map(item => {
        const judgment = userJudgments?.find(
          j => j.poemId === poem.id && 
          j.imageryEmotionId === `${poem.id}-${item.imagery}-${item.emotion}`
        );
        
        return {
          '诗词标题': poem.title,
          '意象': item.imagery,
          '情感': item.emotion,
          '情感倾向': item.tendency,
          '情感强度': item.intensity,
          '人工判别': judgment ? (judgment.isTrue ? '正确' : '错误') : '未判别'
        };
      });
    });
    
    const filename = `意象情感分析_全部诗词_${getFormattedDateTime()}`;
    exportToCSV(data, filename);
  };

  // 获取意象-情感对的判断结果
  const getJudgmentResult = (poemId: string, imagery: string, emotion: string) => {
    const imageryEmotionId = `${poemId}-${imagery}-${emotion}`;
    const judgment = userJudgments.find(j => j.poemId === poemId && j.imageryEmotionId === imageryEmotionId);
    return judgment?.isTrue;
  };

  // 处理用户判断
  const handleJudgment = (poemId: string, imagery: string, emotion: string, isTrue: boolean) => {
    if (onUserJudgment) {
      const imageryEmotionId = `${poemId}-${imagery}-${emotion}`;
      onUserJudgment(poemId, imageryEmotionId, isTrue);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>分析结果</span>
          <span className="text-sm font-normal text-gray-500">
            共 {poems.length} 首诗
          </span>
        </h2>
        <button
          onClick={exportAllEmotionAnalysis}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          导出所有诗词情感分析
        </button>
      </div>
      <div className="space-y-8">
        {poems.map((poem, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{poem.title}</h3>
              <div className="whitespace-pre-line mb-6 text-gray-700 leading-relaxed">
                {highlightImageriesInText(poem.content, poem.imagery)}
              </div>
              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">意象分析：</h4>
                <div className="flex flex-wrap gap-2">
                  {poem.imagery.map((item, i) => {
                    const { mainCategory } = getImageryCategory(item.word);
                    const bgColor = CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS]?.main || CATEGORY_COLORS['其他'].main;
                    return (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: `${bgColor}20`,
                          color: bgColor,
                          border: `1px solid ${bgColor}40`
                        }}
                      >
                        <span>{item.word}</span>
                        <span className="text-xs opacity-75">({item.count})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* 添加意象-词关联分析显示 */}
              {poem.wordAssociations.length > 0 && (
                <ImageryWordAssociations associations={poem.wordAssociations} />
              )}

              {poem.emotionAnalysis && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">意象情感分析</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportEmotionAnalysis(poem)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        导出CSV
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {poem.emotionAnalysis.imageryEmotions.map((analysis, index) => {
                      const context = getImageryContext(poem, analysis.imagery);
                      const isTrue = getJudgmentResult(poem.id, analysis.imagery, analysis.emotion);
                      const opacity = isTrue !== undefined ? 'opacity-60' : '';
                      
                      return (
                        <div key={index} className={`bg-gray-50 rounded-lg p-4 ${opacity}`}>
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="text-gray-700 mb-2">
                                <span className="font-medium text-gray-900">意象：</span>
                                <span dangerouslySetInnerHTML={{ 
                                  __html: highlightImagery(context, analysis.imagery) 
                                }} />
                              </div>
                              <div className="text-gray-700">
                                <span className="font-medium text-gray-900">情感分析：</span>
                                <span className="text-blue-600 font-medium">
                                  {analysis.imagery}-{analysis.emotion}
                                </span>
                                <span className="text-gray-600">
                                  （{analysis.tendency}，强度：{analysis.intensity}）
                                </span>
                              </div>
                            </div>
                            {enableJudgment && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleJudgment(poem.id, analysis.imagery, analysis.emotion, true)}
                                  className={`p-1 rounded-full ${isTrue === true ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                  title="判断为正确"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleJudgment(poem.id, analysis.imagery, analysis.emotion, false)}
                                  className={`p-1 rounded-full ${isTrue === false ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                  title="判断为错误"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">
              诗词编号：{index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};