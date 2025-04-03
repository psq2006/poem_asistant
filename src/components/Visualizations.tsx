import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { GlobalStats, ProcessedPoem } from '../types';
import { CATEGORY_COLORS, IMAGERY_CATEGORIES } from '../utils/imageryCategories';
import { Download } from 'lucide-react';
import { exportToCSV, exportMultipleTablesToExcel, getFormattedDateTime } from '../utils/exportUtils';

interface VisualizationsProps {
  stats: GlobalStats;
  poems: ProcessedPoem[];
}

interface EChartsParams {
  dataType: 'node' | 'edge';
  data: {
    name: string;
    category: string;
    source?: string;
    target?: string;
    value?: number;
  };
}

export const Visualizations: React.FC<VisualizationsProps> = ({ stats, poems }) => {
  // 添加状态用于跟踪当前选中的类别
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImagery, setSelectedImagery] = useState<string | null>(null);

  const networkOptions = {
    title: {
      text: '意象共现网络',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { dataType?: string; name?: string; value?: number; source?: string; target?: string }) => {
        if (params.dataType === 'node') {
          return `${params.name}<br/>出现次数: ${params.value}`;
        }
        return `${params.source} → ${params.target}<br/>共现次数: ${params.value}`;
      }
    },
    legend: {
      data: stats.coOccurrenceNetwork.categories.map(c => c.name),
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12
      },
      selectedMode: 'single',
      selected: Object.fromEntries(
        stats.coOccurrenceNetwork.categories.map(c => [
          c.name,
          selectedCategory ? c.name === selectedCategory : true
        ])
      )
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: stats.coOccurrenceNetwork.nodes.map(node => {
        const [mainCategory, subCategory] = node.category.split('/');
        const categoryColor = subCategory
          ? (CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS] as Record<string, string>)?.[subCategory] || CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS]?.main
          : CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS]?.main;
        return {
          ...node,
          symbolSize: Math.sqrt(node.value) * 10,
          itemStyle: {
            color: categoryColor || CATEGORY_COLORS['其他'].main
          }
        };
      }),
      links: stats.coOccurrenceNetwork.links,
      categories: stats.coOccurrenceNetwork.categories,
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        fontSize: 12
      },
      force: {
        repulsion: 200,
        edgeLength: 100
      },
      emphasis: {
        focus: 'adjacency',
        scale: 1.2
      }
    }]
  };

  const timelineOptions = {
    title: {
      text: '意象时间分布',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { axisValue: string; seriesName: string; value: number }[]) => {
        let result = `组 ${params[0].axisValue}<br/>`;
        params.forEach((param: { axisValue: string; seriesName: string; value: number }) => {
          result += `${param.seriesName}: ${param.value}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: stats.timeline.map(item => item.imagery),
      orient: 'vertical',
      right: 0,
      top: 'middle',
      type: 'scroll',
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      right: '15%',
      left: '5%',
      top: '15%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: Array.from(
        { length: stats.timeline[0]?.counts.length || 0 },
        (_, i) => `${i + 1}`
      ),
      name: '诗歌组',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '出现次数',
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: {
        fontSize: 12
      }
    },
    series: stats.timeline.map(item => ({
      name: item.imagery,
      type: 'line',
      data: item.counts,
      smooth: true,
      symbolSize: 6,
      lineStyle: {
        width: 2
      }
    }))
  };

  const getCategoryData = (categoryAnalysis: GlobalStats['categoryAnalysis'], selectedCategory: string | null) => {
    return categoryAnalysis
      .filter(({ category }) => {
        if (!selectedCategory) {
          // 在总览模式下只显示主类
          return !category.includes('/');
        }
        // 在主类模式下显示该主类的所有子类
        return category.startsWith(`${selectedCategory}/`);
      })
      .map(({ category, imageryCount }) => {
        const [mainCategory, subCategory] = category.split('/');
        const displayName = subCategory || mainCategory;
        const categoryColor = subCategory
          ? (CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS] as Record<string, string>)?.[subCategory] || CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS]?.main
          : CATEGORY_COLORS[mainCategory as keyof typeof CATEGORY_COLORS]?.main;
        
        // 计算该类别下所有意象的总出现次数
        const totalCount = Object.values(imageryCount).reduce((a, b) => a + b, 0);
        
        return {
          name: displayName,
          value: totalCount,
          itemStyle: {
            color: categoryColor || CATEGORY_COLORS['其他'].main
          }
        };
      });
  };
  const categoryOptions = {
    title: {
      text: selectedCategory ? `${selectedCategory}类意象分布` : '意象主类分布',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}',
        fontSize: 12
      },
      data: getCategoryData(stats.categoryAnalysis, selectedCategory)
    }]
  };

  // 添加状态控制显示更多意象
  const [showAllImageries, setShowAllImageries] = useState(false);
  const VISIBLE_IMAGERIES_COUNT = 5;

  // 获取所有不同的意象词，使用与ImageryWordVisualizations相同的数据源
  const allImageries = React.useMemo(() => {
    // 从 wordRelationships 中获取所有意象，并按出现频率排序
    const imageryCounts = stats.wordRelationships.reduce((acc, { imagery, count }) => {
      acc[imagery] = (acc[imagery] || 0) + count;
      return acc;
    }, {} as Record<string, number>);

    // 按出现频率从高到低排序
    return Object.entries(imageryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([imagery]) => imagery);
  }, [stats.wordRelationships]);

  // 获取要显示的意象列表
  const visibleImageries = React.useMemo(() => {
    return showAllImageries ? allImageries : allImageries.slice(0, VISIBLE_IMAGERIES_COUNT);
  }, [allImageries, showAllImageries]);

  // 计算意象关联词的图表数据
  const imageryRelationOptions = () => {
    // 如果没有选择特定意象词，选择出现频率最高的那个
    const currentImagery = selectedImagery || (allImageries.length > 0 ? allImageries[0] : null);
    
    // 为选定的意象词筛选关联词数据，只取前10个
    const filteredRelations = currentImagery 
      ? stats.wordRelationships
        .filter(r => r.imagery === currentImagery)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // 只显示前10个关联词
      : [];
        
    return {
      title: {
        text: '意象关联词分析',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        },
        subtext: currentImagery ? `当前意象: "${currentImagery}"` : '请选择意象'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: filteredRelations.map(r => r.word),
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '共现次数'
      },
      series: [{
        name: '共现次数',
        type: 'bar',
        data: filteredRelations.map(r => ({
          value: r.count,
          itemStyle: {
            color: getBarColor(r.count, filteredRelations)
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };
  
  // 根据数值获取渐变颜色
  const getBarColor = (value: number, data: Array<{count: number}>) => {
    const max = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
    const min = data.length > 0 ? Math.min(...data.map(d => d.count)) : 0;
    const range = max - min;
    const normalizedValue = range > 0 ? (value - min) / range : 0.5;
    
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [{
        offset: 0,
        color: `rgba(66, 153, 225, ${0.3 + normalizedValue * 0.7})` // 浅蓝到深蓝
      }, {
        offset: 1,
        color: `rgba(49, 130, 206, ${0.3 + normalizedValue * 0.7})`
      }]
    };
  };

  // 添加导出功能
  const handleExport = (format: 'csv' | 'excel') => {
    if (format === 'csv') {
      // 导出共现网络数据
      const networkData = stats.coOccurrenceNetwork.nodes.map(node => ({
        '意象': node.name,
        '类别': node.category,
        '出现次数': node.value
      }));

      const filename = `意象共现网络_${getFormattedDateTime()}`;
      exportToCSV(networkData, filename);
    } else {
      // 导出多个表格到一个Excel文件
      const tables = [
        {
          name: '意象共现网络',
          data: stats.coOccurrenceNetwork.nodes.map(node => ({
            '意象': node.name,
            '类别': node.category,
            '出现次数': node.value
          }))
        },
        {
          name: '意象时间分布',
          data: stats.timeline.map(item => ({
            '意象': item.imagery,
            ...item.counts.reduce((acc, count, index) => ({
              ...acc,
              [`组${index + 1}`]: count
            }), {})
          }))
        },
        {
          name: '意象类别分布',
          data: stats.categoryAnalysis.map(item => ({
            '意象': item.category,
            '意象数量': Object.keys(item.imageryCount).length,
            '总出现次数': Object.values(item.imageryCount).reduce((a, b) => a + b, 0)
          }))
        }
      ];

      const filename = `意象分析数据_${getFormattedDateTime()}`;
      exportMultipleTablesToExcel(tables, filename);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">数据可视化</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={20} />
            导出CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            导出Excel
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <select
              aria-label="选择意象类别"
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">所有类别</option>
              {Object.keys(IMAGERY_CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <ReactECharts option={categoryOptions} style={{ height: '400px' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最常见意象搭配</h3>
          <div className="space-y-2">
            {stats.topPairs.map(({ pair, count }, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700 font-medium">{pair.join(' + ')}</span>
                <span className="text-gray-500 bg-white px-3 py-1 rounded-full text-sm">
                  共现 {count} 次
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
        <ReactECharts option={networkOptions} style={{ height: '600px' }} />
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
        <ReactECharts option={timelineOptions} style={{ height: '400px' }} />
      </div>
      
      {/* 修改意象关联词分析部分 */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-gray-700 font-medium">选择意象: </span>
          <div className="flex flex-wrap gap-2 flex-1">
            {visibleImageries.map(imagery => (
              <button
                key={imagery}
                onClick={() => setSelectedImagery(imagery)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedImagery === imagery 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {imagery}
              </button>
            ))}
            {allImageries.length > VISIBLE_IMAGERIES_COUNT && (
              <button
                onClick={() => setShowAllImageries(!showAllImageries)}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {showAllImageries ? '收起' : '更多'}
              </button>
            )}
          </div>
        </div>
        <ReactECharts option={imageryRelationOptions()} style={{ height: '400px' }} />
        
        {/* 意象关联词表格显示 */}
        {selectedImagery && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">"{selectedImagery}"的关联词详情</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                      关联词
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                      共现次数
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.wordRelationships
                    .filter(r => r.imagery === selectedImagery)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10) // 只显示前10个关联词
                    .map((relation, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700 border border-gray-200">
                          {relation.word}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-200">
                          {relation.count}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};