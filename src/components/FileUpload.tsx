import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Upload, FileType, AlertCircle, Brain, Save, CheckCircle } from 'lucide-react';
import mammoth from 'mammoth';
import { parsePoems } from '../utils/imageryExtractor';
import type { ProcessedPoem, AISettings } from '../types';
import { getAIModels } from '../services/aiService';

interface FileUploadProps {
  onPoemsProcessed: (poems: ProcessedPoem[], aiSettings?: AISettings) => void;
  savedAISettings: AISettings | null;
  onAISettingsSave: (settings: AISettings) => void;
}

// 文件大小限制 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// 支持的文件格式
const SUPPORTED_FORMATS = ['.docx', '.txt'];

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onPoemsProcessed, 
  savedAISettings,
  onAISettingsSave 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useAI, setUseAI] = useState(savedAISettings?.useAI || false);
  const [enableJudgment, setEnableJudgment] = useState(savedAISettings?.enableJudgment || false);
  const [aiSettings, setAISettings] = useState<AISettings>(savedAISettings || {
    model: 'gpt-3.5-turbo',
    apiKey: '',
    useAI: false,
    enableJudgment: false
  });
  const [isAISettingsSaved, setIsAISettingsSaved] = useState(!!savedAISettings);

  // 当savedAISettings变化时更新状态
  useEffect(() => {
    if (savedAISettings) {
      setUseAI(savedAISettings.useAI);
      setEnableJudgment(savedAISettings.enableJudgment || false);
      setAISettings(savedAISettings);
      setIsAISettingsSaved(true);
    }
  }, [savedAISettings]);

  const handleAISettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setAISettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsAISettingsSaved(false);
  };

  const handleAISettingsSave = () => {
    const settings = {
      ...aiSettings,
      useAI: useAI, // 确保保存时包含当前的useAI状态
      enableJudgment: enableJudgment // 确保保存时包含当前的enableJudgment状态
    };
    onAISettingsSave(settings);
    setIsAISettingsSaved(true);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    setError(null);
    setIsProcessing(true);

    try {
      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`);
      }

      // 检查文件格式
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!SUPPORTED_FORMATS.includes(fileExtension)) {
        throw new Error(`不支持的文件格式，请上传 ${SUPPORTED_FORMATS.join(', ')} 格式的文件`);
      }

      let text = '';
      
      if (fileExtension === '.docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (fileExtension === '.txt') {
        text = await file.text();
      }

      // 检查文本是否为空
      if (!text.trim()) {
        throw new Error('文件内容为空或格式不正确');
      }

      const poems = parsePoems(text);
      
      // 检查是否成功解析到诗词
      if (poems.length === 0) {
        throw new Error('未能从文件中解析出诗词，请检查文件格式是否正确');
      }

      const processedPoems = poems.map(poem => ({
        ...poem,
        id: `poem-${Math.random().toString(36).substr(2, 9)}`
      }));

      // 确保传递正确的AI设置
      const settings = useAI ? {
        ...aiSettings,
        useAI: true,
        enableJudgment: enableJudgment
      } : undefined;

      onPoemsProcessed(processedPoems, settings);
    } catch (error: Error | unknown) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : '处理文件时发生错误');
    }
    setIsProcessing(false);
  }, [onPoemsProcessed, useAI, enableJudgment, aiSettings]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setIsProcessing(true);

    try {
      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`);
      }

      // 检查文件格式
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!SUPPORTED_FORMATS.includes(fileExtension)) {
        throw new Error(`不支持的文件格式，请上传 ${SUPPORTED_FORMATS.join(', ')} 格式的文件`);
      }

      let text = '';
      
      if (fileExtension === '.docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (fileExtension === '.txt') {
        text = await file.text();
      }

      // 检查文本是否为空
      if (!text.trim()) {
        throw new Error('文件内容为空或格式不正确');
      }

      const poems = parsePoems(text);
      
      // 检查是否成功解析到诗词
      if (poems.length === 0) {
        throw new Error('未能从文件中解析出诗词，请检查文件格式是否正确');
      }

      const processedPoems = poems.map(poem => ({
        ...poem,
        id: `poem-${Math.random().toString(36).substr(2, 9)}`
      }));

      // 确保传递正确的AI设置
      const settings = useAI ? {
        ...aiSettings,
        useAI: true,
        enableJudgment: enableJudgment
      } : undefined;

      onPoemsProcessed(processedPoems, settings);
    } catch (error: Error | unknown) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : '处理文件时发生错误');
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setIsProcessing(false);
  }, [onPoemsProcessed, useAI, enableJudgment, aiSettings]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div 
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed ${
              error ? 'border-red-300 bg-red-50' : 
              isDragging ? 'border-blue-500 bg-blue-100' : 
              'border-blue-300 bg-blue-50'
            } rounded-lg cursor-pointer hover:bg-blue-100 transition-colors duration-200 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="文件上传区域"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              ) : (
                <Upload className={`w-12 h-12 mb-3 ${error ? 'text-red-500' : 'text-blue-500'}`} />
              )}
              <p className="mb-2 text-lg font-semibold text-gray-700">
                {isProcessing ? '正在处理...' : '点击上传文件'}
              </p>
              <p className="text-sm text-gray-500">或将文件拖拽至此处</p>
              <div className="flex items-center gap-2 mt-4">
                <FileType className="w-5 h-5 text-gray-400" />
                <p className="text-xs text-gray-400">支持 DOCX, TXT 格式（最大 10MB）</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".docx,.txt"
              onChange={handleFileUpload}
              disabled={isProcessing}
              aria-label="选择文件"
              title="选择文件"
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="useAI" className="flex items-center gap-2 text-gray-700">
                <Brain className="w-5 h-5" />
                使用AI进行情感分析
              </label>
            </div>

            {useAI && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableJudgment"
                  checked={enableJudgment}
                  onChange={(e) => setEnableJudgment(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="enableJudgment" className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5" />
                  启用AI分析结果人工判断
                </label>
              </div>
            )}

            {useAI && !isAISettingsSaved && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    AI模型
                  </label>
                  <select
                    id="model"
                    name="model"
                    value={aiSettings.model}
                    onChange={handleAISettingsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getAIModels().map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    API密钥
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    name="apiKey"
                    value={aiSettings.apiKey}
                    onChange={handleAISettingsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入您的API密钥"
                  />
                </div>

                <button
                  onClick={handleAISettingsSave}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Save className="w-4 h-4" />
                  保存AI设置
                </button>
              </div>
            )}

            {useAI && isAISettingsSaved && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">
                      已保存AI设置：{getAIModels().find(m => m.id === aiSettings.model)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAISettingsSaved(false)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    修改设置
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="px-8 py-3 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            文件将在本地进行处理，不会上传至服务器
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600 bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">文件格式说明：</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>支持 .docx 和 .txt 格式的文件</li>
          <li>文件大小不超过 10MB</li>
          <li>诗词格式应为：每首诗以"编号.标题"开头，如"1.登鹳雀楼"</li>
          <li>诗词内容应位于标题下方，与标题之间用换行分隔</li>
          <li>各首诗词之间也应用编号标题分隔</li>
        </ul>
      </div>
    </div>
  );
};