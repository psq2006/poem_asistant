import type { AISettings, EmotionAnalysis } from '../types';
import type { ProcessedPoem } from '../types';

const API_TIMEOUT = 30000; // 30秒超时

export const AI_MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'claude-2', name: 'Claude 2', provider: 'anthropic' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' }
];

export const getAIModels = () => AI_MODELS;

const getAPIEndpoint = (model: string) => {
  const modelConfig = AI_MODELS.find(m => m.id === model);
  if (!modelConfig) throw new Error('不支持的AI模型');

  switch (modelConfig.provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'deepseek':
      return 'https://api.deepseek.com/chat/completions';
    default:
      throw new Error('不支持的AI提供商');
  }
};

const getRequestConfig = (model: string, prompt: string, apiKey: string): RequestInit => {
  const modelConfig = AI_MODELS.find(m => m.id === model);
  if (!modelConfig) throw new Error('不支持的AI模型');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  switch (modelConfig.provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      return {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的古诗词意象分析专家，擅长分析诗词中的意象情感。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 100000
        })
      };
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      return {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100000
        })
      };
    case 'deepseek':
      headers['Authorization'] = `Bearer ${apiKey}`;
      return {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的古诗词意象分析专家。请严格按照指定的JSON格式返回分析结果，不要添加任何其他文字说明。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          stream: false,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      };
    default:
      throw new Error('不支持的AI提供商');
  }
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const analyzeImageryEmotion = async (
  poem: ProcessedPoem,
  imagery: string[],
  content: string,
  settings: AISettings
): Promise<EmotionAnalysis> => {
  console.log('=== 开始调用AI分析 ===');
  console.log('诗词标题:', poem.title);
  console.log('意象数量:', imagery.length);
  console.log('使用的模型:', settings.model);

  // 参数验证
  if (!poem || !imagery || !content || !settings) {
    console.error('参数验证失败:', { poem, imagery, content, settings });
    throw new Error('分析参数不完整');
  }

  if (!settings.apiKey) {
    console.error('API密钥未设置');
    throw new Error('API密钥未设置');
  }

  if (imagery.length === 0) {
    console.error('意象列表为空');
    throw new Error('意象列表为空');
  }

  const prompt = `请分析以下古诗词中的意象情感：

诗词内容：
${content}

意象列表：
${imagery.join('、')}

请为每个意象提供以下分析：
1. 情感倾向（积极/消极/中性）
2. 情感强度（1-5分）
3. 具体情感描述（如：喜悦、悲伤、思念等）

请以JSON格式返回，格式如下：
{
  "imageryEmotions": [
    {
      "imagery": "意象名称",
      "emotion": "情感描述",
      "tendency": "积极/消极/中性",
      "intensity": 1-5
    }
  ]
}`;

  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1秒

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`=== 第 ${retryCount + 1} 次尝试 ===`);
      console.log('准备发送API请求...');

      const endpoint = getAPIEndpoint(settings.model);
      const requestConfig = getRequestConfig(settings.model, prompt, settings.apiKey);
      
      console.log('API端点:', endpoint);
      console.log('请求配置:', {
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: 'Bearer ***' // 隐藏API密钥
        }
      });

      const response = await fetchWithTimeout(endpoint, requestConfig, API_TIMEOUT);
      console.log('收到API响应:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        const status = response.status;
        
        console.error('API请求失败:', {
          status,
          error: errorMessage,
          retryCount,
          errorData
        });
        
        // 根据不同的错误状态码处理
        switch (status) {
          case 401:
            throw new Error('API密钥无效或已过期');
          case 429:
            if (retryCount < MAX_RETRIES - 1) {
              console.log('达到速率限制，等待后重试...');
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
              retryCount++;
              continue;
            }
            throw new Error('API调用次数超限，请稍后再试');
          case 503:
            if (retryCount < MAX_RETRIES - 1) {
              console.log('服务暂时不可用，等待后重试...');
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
              retryCount++;
              continue;
            }
            throw new Error('AI服务暂时不可用，请稍后再试');
          default:
            throw new Error(`AI分析请求失败: ${errorMessage}`);
        }
      }

      const data = await response.json();
      console.log('API返回数据:', data);
      
      let result;
      
      // 根据不同提供商处理响应
      const modelConfig = AI_MODELS.find(m => m.id === settings.model);
      if (!modelConfig) throw new Error('不支持的AI模型');

      try {
        let content: string;
        switch (modelConfig.provider) {
          case 'openai':
            content = data.choices[0].message.content;
            break;
          case 'anthropic':
            content = data.content[0].text;
            break;
          case 'deepseek':
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
              console.error('DeepSeek API返回数据格式异常:', data);
              throw new Error('DeepSeek API返回数据格式异常');
            }
            content = data.choices[0].message.content;
            if (!content) {
              console.error('DeepSeek API返回内容为空');
              throw new Error('DeepSeek API返回内容为空');
            }
            break;
          default:
            throw new Error('不支持的AI提供商');
        }

        console.log('提取的响应内容:', content);

        // 尝试解析JSON
        try {
          result = JSON.parse(content);
          console.log('解析后的JSON结果:', result);
        } catch (parseError) {
          console.error('JSON解析错误:', parseError);
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              result = JSON.parse(jsonMatch[0]);
              console.log('提取并解析后的JSON结果:', result);
            } catch (e) {
              console.error('提取的JSON解析错误:', e);
              console.error('DeepSeek返回的原始内容:', content);
              throw new Error('无法解析AI返回的JSON数据');
            }
          } else {
            console.error('DeepSeek返回的原始内容:', content);
            throw new Error('AI返回的数据中未找到有效的JSON格式');
          }
        }

        // 验证返回的数据结构
        if (!result || !Array.isArray(result.imageryEmotions)) {
          console.error('数据结构验证失败:', result);
          throw new Error('AI返回的数据格式不符合要求');
        }

        // 验证每个意象情感数据的格式
        for (const item of result.imageryEmotions) {
          if (!item.imagery || !item.emotion || !item.tendency || !item.intensity) {
            console.error('意象情感数据缺少必要字段:', item);
            throw new Error('意象情感数据缺少必要字段');
          }
          if (!['积极', '消极', '中性'].includes(item.tendency)) {
            console.error('情感倾向无效:', item.tendency);
            throw new Error('情感倾向必须是"积极"、"消极"或"中性"');
          }
          if (typeof item.intensity !== 'number' || item.intensity < 1 || item.intensity > 5) {
            console.error('情感强度无效:', item.intensity);
            throw new Error('情感强度必须是1-5之间的数字');
          }
        }

        console.log('=== AI分析成功完成 ===');
        return result;
      } catch (parseError) {
        console.error('AI返回数据解析错误:', parseError);
        if (retryCount < MAX_RETRIES - 1) {
          console.log('解析错误，等待后重试...');
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          retryCount++;
          continue;
        }
        throw new Error('AI返回的数据格式不正确，请重试');
      }
    } catch (error) {
      console.error('AI分析过程发生错误:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (retryCount < MAX_RETRIES - 1) {
            console.log('请求超时，等待后重试...');
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            retryCount++;
            continue;
          }
          throw new Error('请求超时，请检查网络连接后重试');
        }
        if (retryCount < MAX_RETRIES - 1) {
          console.log('发生错误，等待后重试...');
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          retryCount++;
          continue;
        }
        throw error;
      }
      throw new Error('AI分析过程中发生未知错误');
    }
  }

  throw new Error('达到最大重试次数，分析失败');
}; 