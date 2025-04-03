/**
 * 导出数据为CSV文件
 * @param data 要导出的数据数组
 * @param filename 文件名
 */
export const exportToCSV = <T extends Record<string, unknown>>(data: T[], filename: string) => {
  if (data.length === 0) {
    console.warn('没有数据可导出');
    return;
  }

  // 获取表头并创建CSV内容
  const csvContent = [
    // 添加表头
    Object.keys(data[0]).join(','),
    // 添加数据行
    ...data.map(row => 
      Object.keys(row).map(header => {
        const value = row[header];
        // 处理包含逗号、引号或换行符的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * 导出多个表格到一个Excel文件
 * @param tables 要导出的表格数组
 * @param filename 文件名
 */
export const exportMultipleTablesToExcel = <T extends Record<string, unknown>>(tables: { name: string; data: T[] }[], filename: string) => {
  // 由于浏览器限制，我们只能导出CSV格式
  // 这里我们将每个表格导出为单独的CSV文件
  tables.forEach(table => {
    const tableFilename = `${filename}_${table.name}`;
    exportToCSV(table.data, tableFilename);
  });
};

/**
 * 格式化日期时间字符串
 * @returns 格式化后的日期时间字符串
 */
export const getFormattedDateTime = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
}; 