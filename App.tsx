import React, { useState, useEffect } from 'react';
import TableEditor from './components/TableEditor';
import DataVisualizer from './components/DataVisualizer';
import GeminiPanel from './components/GeminiPanel';
import FileManager from './components/FileManager';
import { TableData } from './types';
import { TableIcon, BarChartIcon } from './components/Icons';

const DEFAULT_DATA: TableData = {
  title: '',
  headers: ['项目', '数值A', '数值B'],
  rows: [
    ['示例 1', '10', '20'],
    ['示例 2', '15', '25'],
    ['示例 3', '8', '30'],
  ]
};

const App: React.FC = () => {
  const [tableData, setTableData] = useState<TableData>(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState<'editor' | 'visualizer'>('editor');

  // Auto-save draft
  useEffect(() => {
    const draft = localStorage.getItem('smarttable_draft');
    if (draft) {
       try {
           const parsed = JSON.parse(draft);
           // Only load draft if valid structure
           if (parsed.headers && parsed.rows) {
               // Optional: Could prompt user, but for simplicity we load it or use as fallback
           }
       } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smarttable_draft', JSON.stringify(tableData));
  }, [tableData]);

  const handleTitleChange = (title: string) => {
    setTableData(prev => ({ ...prev, title }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
               <TableIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              智能表格大师
            </h1>
            <h1 className="text-xl font-bold text-blue-600 sm:hidden">SmartTable</h1>
          </div>
          
          <FileManager currentData={tableData} onLoad={setTableData} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Generative AI Panel */}
        <GeminiPanel 
          currentTitle={tableData.title} 
          onTitleChange={handleTitleChange}
          onTemplateGenerated={setTableData}
        />

        {/* Tab Navigation (Mobile Sticky) */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg sticky top-16 z-20 sm:static sm:z-0 shadow-sm sm:shadow-none">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 sm:flex-none py-3 px-6 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'editor'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            表格编辑
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex-1 sm:flex-none py-3 px-6 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'visualizer'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChartIcon className="w-4 h-4" />
            数据透视 & 分析
          </button>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100vh-320px)] min-h-[500px]">
          {activeTab === 'editor' ? (
            <TableEditor data={tableData} onChange={setTableData} />
          ) : (
            <DataVisualizer data={tableData} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
