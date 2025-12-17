import React, { useState } from 'react';
import { generateTableTemplate } from '../services/geminiService';
import { TableData } from '../types';
import { SparklesIcon, LoadingSpinner } from './Icons';

interface GeminiPanelProps {
  onTemplateGenerated: (data: TableData) => void;
  currentTitle: string;
  onTitleChange: (title: string) => void;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ onTemplateGenerated, currentTitle, onTitleChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!currentTitle.trim()) {
        setError("请输入表格标题");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTableTemplate(currentTitle);
      onTemplateGenerated({
        title: currentTitle,
        headers: result.headers,
        rows: result.rows
      });
    } catch (e) {
      console.error(e);
      setError("生成失败，请检查网络或更换标题重试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
       <label className="block text-sm font-medium text-gray-700 mb-2">表格标题 / 模板主题</label>
       <div className="flex flex-col sm:flex-row gap-3">
         <input 
           type="text" 
           value={currentTitle}
           onChange={(e) => onTitleChange(e.target.value)}
           placeholder="例如：2024年家庭收支预算表"
           className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
           onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
         />
         <button
           onClick={handleGenerate}
           disabled={isLoading || !currentTitle.trim()}
           className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium whitespace-nowrap shadow-sm"
         >
           {isLoading ? <LoadingSpinner className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5" />}
           <span>生成空模板</span>
         </button>
       </div>
       {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
       <p className="mt-2 text-xs text-gray-400">
         说明：输入主题后 AI 将自动为您构建表格表头，并生成空行供您填写数据。
       </p>
    </div>
  );
};

export default GeminiPanel;