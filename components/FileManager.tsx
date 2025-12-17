import React, { useEffect, useState } from 'react';
import { TableData, SavedFile } from '../types';
import { SaveIcon, TrashIcon, FileIcon, FolderOpenIcon } from './Icons';

interface FileManagerProps {
  currentData: TableData;
  onLoad: (data: TableData) => void;
}

const STORAGE_KEY = 'smarttable_files';

const FileManager: React.FC<FileManagerProps> = ({ currentData, onLoad }) => {
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSavedFiles(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse saved files", e);
      }
    }
  };

  const saveCurrent = () => {
    if (!currentData.title) {
        alert("请先设置表格标题");
        return;
    }
    
    const newFile: SavedFile = {
      id: Date.now().toString(),
      name: currentData.title,
      data: currentData,
      lastModified: Date.now()
    };

    // Check if name exists, if so replace, else add
    const existingIndex = savedFiles.findIndex(f => f.name === newFile.name);
    let newFiles = [...savedFiles];
    
    if (existingIndex >= 0) {
        if(!confirm(`文件 "${newFile.name}" 已存在，是否覆盖？`)) return;
        newFiles[existingIndex] = newFile;
    } else {
        newFiles.push(newFile);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
    setSavedFiles(newFiles);
    alert("保存成功！");
  };

  const deleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定要删除此文件吗？")) return;
    const newFiles = savedFiles.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
    setSavedFiles(newFiles);
  };

  const loadFile = (file: SavedFile) => {
    onLoad(file.data);
    setIsOpen(false);
  };

  const exportCSV = () => {
      const headers = currentData.headers.join(',');
      const rows = currentData.rows.map(r => r.join(',')).join('\n');
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${currentData.title || 'data'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={saveCurrent}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
        title="保存到本地"
      >
        <SaveIcon className="w-4 h-4" />
        <span className="hidden sm:inline">保存</span>
      </button>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors relative"
        title="打开文件列表"
      >
        <FolderOpenIcon className="w-4 h-4" />
        <span className="hidden sm:inline">打开</span>
      </button>
      
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
        title="导出为 CSV"
      >
          <span className="font-bold text-xs">CSV</span>
          <span className="hidden sm:inline">导出</span>
      </button>

      {/* File List Dropdown/Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-16 right-4 sm:right-auto z-20 w-72 bg-white rounded-lg shadow-xl border border-gray-200 animate-fadeIn max-h-[80vh] overflow-y-auto">
             <div className="p-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">本地文件</div>
             {savedFiles.length === 0 ? (
                 <div className="p-4 text-center text-gray-400 text-sm">暂无保存的文件</div>
             ) : (
                 <ul>
                     {savedFiles.sort((a,b) => b.lastModified - a.lastModified).map(file => (
                         <li 
                            key={file.id} 
                            onClick={() => loadFile(file)}
                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group border-b last:border-0 border-gray-100"
                         >
                             <div className="flex items-center gap-3 overflow-hidden">
                                 <FileIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                 <div className="truncate">
                                     <div className="text-sm font-medium text-gray-800 truncate">{file.name}</div>
                                     <div className="text-xs text-gray-400">{new Date(file.lastModified).toLocaleDateString()}</div>
                                 </div>
                             </div>
                             <button 
                                onClick={(e) => deleteFile(file.id, e)}
                                className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-colors"
                             >
                                 <TrashIcon className="w-4 h-4" />
                             </button>
                         </li>
                     ))}
                 </ul>
             )}
          </div>
        </>
      )}
    </div>
  );
};

export default FileManager;
