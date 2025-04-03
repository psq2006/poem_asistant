import * as XLSX from 'xlsx';

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
 * 导出数据为Excel文件
 * @param data 要导出的数据数组
 * @param filename 文件名
 */
export const exportToExcel = <T extends Record<string, unknown>>(data: T[], filename: string) => {
  if (data.length === 0) {
    console.warn('没有数据可导出');
    return;
  }

  // 创建工作表数据
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * 导出多个表格到一个Excel文件
 * @param tables 表格数据数组，每个元素包含表格名称和数据
 * @param filename 文件名
 */
export const exportMultipleTablesToExcel = <T extends Record<string, unknown>>(
  tables: Array<{ name: string; data: T[] }>,
  filename: string
) => {
  if (tables.length === 0) {
    console.warn('没有数据可导出');
    return;
  }

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 为每个表格创建工作表
  tables.forEach(({ name, data }) => {
    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    }
  });
  
  // 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * 格式化日期时间字符串
 * @returns 格式化后的日期时间字符串
 */
export const getFormattedDateTime = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
}; 