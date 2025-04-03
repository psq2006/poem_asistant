import React, { useState } from 'react';
import type { ProcessedPoem } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { exportToCSV, getFormattedDateTime } from '../utils/exportUtils';

interface EmotionVisualizationProps {
  poems: ProcessedPoem[];
}

interface EmotionData {
  imagery: string;
  emotion: string;
  tendency: string;
  intensity: number;
  count: number;
}

export const EmotionVisualization: React.FC<EmotionVisualizationProps> = ({ poems }) => {
  // 收集所有意象情感数据
  const emotionData = poems.reduce((acc: EmotionData[], poem) => {
    if (!poem.emotionAnalysis?.imageryEmotions) return acc;

    poem.emotionAnalysis.imageryEmotions.forEach(analysis => {
      const existingData = acc.find(item => 
        item.imagery === analysis.imagery && 
        item.emotion === analysis.emotion
      );

      if (existingData) {
        existingData.count++;
      } else {
        acc.push({
          ...analysis,
          count: 1
        });
      }
    });

    return acc;
  }, []);

  // 按情感倾向分组统计
  const tendencyStats = React.useMemo(() => {
    const stats = {
      '积极': 0,
      '中性': 0,
      '消极': 0
    };
    
    emotionData.forEach(item => {
      stats[item.tendency as keyof typeof stats]++;
    });
    
    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
      color: name === '积极' ? '#4CAF50' : name === '中性' ? '#9E9E9E' : '#F44336'
    }));
  }, [emotionData]);

  // 按情感强度分组统计
  const intensityStats = React.useMemo(() => {
    const stats = {
      '弱': 0,
      '中': 0,
      '强': 0
    };
    
    emotionData.forEach(item => {
      if (item.intensity <= 2) stats['弱']++;
      else if (item.intensity <= 4) stats['中']++;
      else stats['强']++;
    });
    
    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
      color: name === '弱' ? '#90CAF9' : name === '中' ? '#42A5F5' : '#1976D2'
    }));
  }, [emotionData]);

  // 获取前20个最常见的意象-情感对
  const topEmotionPairs = React.useMemo(() => {
    return [...emotionData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(item => ({
        name: `${item.imagery}-${item.emotion}`,
        count: item.count,
        intensity: item.intensity,
        tendency: item.tendency
      }));
  }, [emotionData]);

  // 添加导出功能
  const handleExport = (format: 'csv' | 'excel') => {
    const exportData = emotionData.map(item => ({
      '意象': item.imagery,
      '情感': item.emotion,
      '倾向': item.tendency,
      '强度': item.intensity,
      '出现次数': item.count
    }));

    const filename = `意象情感分析统计_${getFormattedDateTime()}`;
    
    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      console.warn('导出Excel功能未实现');
    }
  };

  // 添加状态控制显示方式
  const [viewMode, setViewMode] = useState<'tendency' | 'intensity' | 'top'>('tendency');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">意象情感分析可视化</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            导出CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            导出Excel
          </button>
        </div>
      </div>

      {/* 视图切换按钮 */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setViewMode('tendency')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              viewMode === 'tendency'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            情感倾向分布
          </button>
          <button
            type="button"
            onClick={() => setViewMode('intensity')}
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'intensity'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            情感强度分布
          </button>
          <button
            type="button"
            onClick={() => setViewMode('top')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              viewMode === 'top'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            常见意象-情感对
          </button>
        </div>
      </div>

      {/* 情感倾向分布 */}
      {viewMode === 'tendency' && (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tendencyStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {tendencyStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}个`, '数量']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 情感强度分布 */}
      {viewMode === 'intensity' && (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={intensityStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {intensityStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}个`, '数量']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 常见意象-情感对 */}
      {viewMode === 'top' && (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topEmotionPairs}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name="出现次数" 
                fill="#8884d8"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">积极情感</h3>
          <ul className="space-y-1">
            {emotionData
              .filter(item => item.tendency === '积极')
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((item, index) => (
                <li key={index} className="text-sm text-blue-700">
                  {item.imagery}-{item.emotion} ({item.count}次)
                </li>
              ))}
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">中性情感</h3>
          <ul className="space-y-1">
            {emotionData
              .filter(item => item.tendency === '中性')
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((item, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {item.imagery}-{item.emotion} ({item.count}次)
                </li>
              ))}
          </ul>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">消极情感</h3>
          <ul className="space-y-1">
            {emotionData
              .filter(item => item.tendency === '消极')
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((item, index) => (
                <li key={index} className="text-sm text-red-700">
                  {item.imagery}-{item.emotion} ({item.count}次)
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}; 