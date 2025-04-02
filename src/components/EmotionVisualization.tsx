import React from 'react';
import type { ProcessedPoem } from '../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

  // 准备图表数据
  const chartData = emotionData.map(item => ({
    name: `${item.imagery}-${item.emotion}`,
    intensity: item.intensity,
    count: item.count,
    tendency: item.tendency
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">意象情感分析可视化</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              name="意象-情感" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              dataKey="intensity" 
              name="情感强度" 
              domain={[1, 5]}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'count') return [`出现次数：${value}`, '出现次数'];
                return [value, name];
              }}
            />
            <Legend />
            <Scatter 
              name="情感强度" 
              data={chartData} 
              fill="#8884d8"
              dataKey="intensity"
            />
            <Scatter 
              name="出现次数" 
              data={chartData} 
              fill="#82ca9d"
              dataKey="count"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">积极情感</h3>
          <ul className="space-y-1">
            {emotionData
              .filter(item => item.tendency === '积极')
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