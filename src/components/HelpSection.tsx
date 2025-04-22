import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, FileText, BookOpen, Github } from 'lucide-react';

export const HelpSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">帮助与常见问题</h2>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-6">
            {/* 上传文件示例 */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                一、上传文件示例
              </h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 space-y-4">
                <div>
                  <p className="font-medium mb-1">1. 饮马长城窟行</p>
                  <p className="whitespace-pre-line">
                    塞外悲风切，交河冰已结。瀚海百重波，阴山千里雪。迥戍危烽火，层峦引高节。悠悠卷施旌，饮马出长城。寒沙连骑迹，朔吹断边声。胡尘清玉塞，羌笛韵金钲。绝漠干戈戢，车徒振原隰。都尉反龙堆，将军旋马邑。扬麾氛雾静，纪石功名立。荒裔一戎衣，灵一作云台凯歌入。
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">2. 执契静三边</p>
                  <p className="whitespace-pre-line">
                    执契静三边，持衡临万姓。玉彩辉关烛，金华流日镜。无为宇宙清，有美璇玑正。皎佩星连景，飘衣云结庆。戢武一作戈耀七德，升文辉九功。烟波澄旧碧，尘火息前红。霜野韬莲剑，关城罢月弓。钱缀榆天合，新城柳塞空。花销葱岭雪，縠尽流沙雾。秋驾转兢怀，春冰弥轸虑。书绝龙庭羽，烽休凤穴戍。衣宵寝二难，食旰餐三惧。翦暴兴先废，除凶存昔亡。圆盖归天壤一作坏，方舆入地荒。孔海池京邑，双河沼帝乡。循一作修躬思励己，抚俗愧时康。元首伫盐梅，股肱惟辅弼。羽贤崆岭四，翼圣襄城七。浇俗庶反淳，替文聊就质。已知隆至道，共欢区宇一。
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">3. 正日临朝</p>
                  <p className="whitespace-pre-line">
                    条风开献节，灰律动初阳。百蛮奉遐赆，万国朝未央。虽无舜禹迹，幸欣天地康。车轨同八表，书文混四方。赫奕俨冠盖，纷纶盛服章。羽旄飞驰道，钟鼓震岩一作修廊。组练辉霞色，霜戟耀一作照朝光。晨宵怀至理，终愧抚遐荒。
                  </p>
                </div>
              </div>
            </div>
            
            {/* 使用指南 */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                二、使用指南
              </h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 space-y-3">
                <p>1. 上传文件后可以对意象进行分析，包括诗词中的常出现的意象、意象之间的关联、以及自动分析意象与哪些词更常一起出现</p>
                <p>2. 可以连接ai使用ai帮助分析情感（推荐deepseek) api获取方法为：先确保deepseek账户有余额（可以在https://platform.deepseek.com/top_up 充值）在https://platform.deepseek.com/api_keys 网站上设置api并保存密匙 ，输入到相关位置</p>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800 text-xs">
                  <p className="font-medium mb-1">郑重声明：</p>
                  <p>1. 相关密匙以及文件均会保存在本地，不会上传至服务器，请放心使用</p>
                  <p>2. 本网站非盈利，api可以自由选择，并非为deepseek推广</p>
                </div>
                <p>3. 选择人工判别分析可以对ai分析的情感进行判断</p>
                <p>4. 每次分析/判断后可以选择保存，下次进入时会恢复到上次保存时的页面。点击清除缓存将丢失数据</p>
                <p>5. 多个可视化表格支持导出，点击相应按钮即可</p>
              </div>
            </div>
            
            {/* 开源提醒 */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-600" />
                三、开源提醒
              </h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                <p>项目代码已<a href="https://github.com/psq2006/poem_asistant" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">开源</a></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 