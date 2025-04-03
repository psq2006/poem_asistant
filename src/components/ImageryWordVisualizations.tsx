import React from 'react';
import type { ProcessedPoem } from '../types';
import { extractWordRelationships, NATURAL_IMAGERY, COMMON_WORDS } from '../utils/imageryExtractor';
import { exportToCSV, exportToExcel, exportMultipleTablesToExcel, getFormattedDateTime } from '../utils/exportUtils';

interface ImageryWordVisualizationsProps {
  poems: ProcessedPoem[];
}

interface ImageryWordTable {
  imagery: string;
  associations: Array<{
    word: string;
    count: number;
  }>;
}

export const ImageryWordVisualizations: React.FC<ImageryWordVisualizationsProps> = ({ poems }) => {
  // 统计意象-关联词关系
  const imageryWordStats = React.useMemo(() => {
    const stats = new Map<string, Map<string, number>>();
    
    poems.forEach(poem => {
      // 只使用预定义的意象词
      const imageryWords = poem.imagery
        .map(item => item.word)
        .filter(word => NATURAL_IMAGERY.includes(word));
      
      const relationships = extractWordRelationships(poem.content, imageryWords);
      
      relationships.forEach(({ imagery, word, count }) => {
        // 只统计预定义的意象词和常用词的关联
        if (NATURAL_IMAGERY.includes(imagery) && COMMON_WORDS.includes(word)) {
          if (!stats.has(imagery)) {
            stats.set(imagery, new Map());
          }
          const currentCount = stats.get(imagery)?.get(word) || 0;
          stats.get(imagery)?.set(word, currentCount + count);
        }
      });
    });
    
    return stats;
  }, [poems]);

  // 准备表格数据
  const tableData = React.useMemo(() => {
    const data: ImageryWordTable[] = [];
    imageryWordStats.forEach((wordMap, imagery) => {
      const associations = Array.from(wordMap.entries())
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count);
      
      if (associations.length > 0) {
        data.push({ imagery, associations });
      }
    });
    return data.sort((a, b) => b.associations.length - a.associations.length);
  }, [imageryWordStats]);

  // 选中的意象
  const [selectedImagery, setSelectedImagery] = React.useState<string | null>(null);
  // 是否显示更多选项
  const [showMore, setShowMore] = React.useState(false);
  // 显示的意象数量
  const VISIBLE_COUNT = 5;
  // 每个意象显示的最大关联词数量
  const MAX_ASSOCIATIONS = 10;

  // 获取排序后的意象列表
  const sortedImageries = React.useMemo(() => {
    const allImageries = tableData.map(item => item.imagery);
    if (!selectedImagery) return allImageries;
    
    // 将选中的意象移到第一位
    const selectedIndex = allImageries.indexOf(selectedImagery);
    if (selectedIndex === -1) return allImageries;
    
    const result = [...allImageries];
    result.splice(selectedIndex, 1);
    result.unshift(selectedImagery);
    
    return result;
  }, [tableData, selectedImagery]);

  // 获取可见的意象列表
  const visibleImageries = React.useMemo(() => {
    return showMore ? sortedImageries : sortedImageries.slice(0, VISIBLE_COUNT);
  }, [sortedImageries, showMore]);

  // 获取选中意象的数据
  const selectedImageryData = React.useMemo(() => {
    if (!selectedImagery) return null;
    return tableData.find(item => item.imagery === selectedImagery);
  }, [tableData, selectedImagery]);

  // 获取选中意象的关联词列表（限制数量）
  const selectedAssociations = React.useMemo(() => {
    return selectedImageryData?.associations.slice(0, MAX_ASSOCIATIONS) || [];
  }, [selectedImageryData]);

  // 添加导出功能
  const handleExport = (format: 'csv' | 'excel') => {
    if (!selectedImageryData) return;

    const exportData = selectedImageryData.associations.map(({ word, count }) => ({
      '意象': selectedImagery,
      '关联词': word,
      '共现次数': count
    }));

    const filename = `意象关联分析_${selectedImagery}_${getFormattedDateTime()}`;
    
    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      exportToExcel(exportData, filename);
    }
  };

  // 导出所有意象关联表
  const handleExportAll = (format: 'csv' | 'excel') => {
    if (format === 'csv') {
      // CSV格式不支持多表格，所以只导出当前选中的意象
      if (selectedImageryData) {
        handleExport('csv');
      } else {
        console.warn('请先选择一个意象再导出CSV');
      }
    } else {
      // 导出所有意象关联表到一个Excel文件
      const tables = tableData.map(item => ({
        name: item.imagery,
        data: item.associations.map(({ word, count }) => ({
          '意象': item.imagery,
          '关联词': word,
          '共现次数': count
        }))
      }));

      const filename = `所有意象关联分析_${getFormattedDateTime()}`;
      exportMultipleTablesToExcel(tables, filename);
    }
  };

  if (tableData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">暂无意象-关联词数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 意象选择器 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">选择意象查看关联词</h2>
          <button
            onClick={() => handleExportAll('excel')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            导出所有意象关联表
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {visibleImageries.map((imagery) => (
            <button
              key={imagery}
              onClick={() => setSelectedImagery(imagery)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedImagery === imagery
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {imagery}
            </button>
          ))}
          {sortedImageries.length > VISIBLE_COUNT && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {showMore ? '收起' : '更多'}
            </button>
          )}
        </div>
      </div>

      {/* 关联词表格 */}
      {selectedImagery && selectedImageryData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedImagery} 的关联词统计
              {selectedImageryData.associations.length > MAX_ASSOCIATIONS && (
                <span className="text-sm text-gray-500 ml-2">
                  （显示前{MAX_ASSOCIATIONS}个最常用关联词）
                </span>
              )}
            </h2>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">关联词</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">共现次数</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedAssociations.map(({ word, count }, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{word}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 