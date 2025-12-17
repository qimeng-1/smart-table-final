import React, { useCallback, useRef } from 'react';
import { TableData } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface TableEditorProps {
  data: TableData;
  onChange: (newData: TableData) => void;
}

const TableEditor: React.FC<TableEditorProps> = ({ data, onChange }) => {
  const pasteAreaRef = useRef<HTMLTextAreaElement>(null);

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...data.headers];
    newHeaders[index] = value;
    onChange({ ...data, headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...data.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    onChange({ ...data, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(data.headers.length).fill('');
    onChange({ ...data, rows: [...data.rows, newRow] });
  };

  const addColumn = () => {
    const newHeaders = [...data.headers, `列 ${data.headers.length + 1}`];
    const newRows = data.rows.map(row => [...row, '']);
    onChange({ ...data, headers: newHeaders, rows: newRows });
  };

  const removeRow = (index: number) => {
    const newRows = data.rows.filter((_, i) => i !== index);
    onChange({ ...data, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (data.headers.length <= 1) return;
    const newHeaders = data.headers.filter((_, i) => i !== index);
    const newRows = data.rows.map(row => row.filter((_, i) => i !== index));
    onChange({ ...data, headers: newHeaders, rows: newRows });
  };
  
  const clearData = () => {
      if(!confirm("确定要清空所有数据吗？表头将保留。")) return;
      const newRows = data.rows.map(row => new Array(row.length).fill(''));
      onChange({ ...data, rows: newRows });
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData) return;

    // Detect structure: Tabs for columns, Newlines for rows
    const rows = clipboardData.trim().split(/\r\n|\n|\r/).map(row => row.split('\t'));
    
    if (rows.length === 0) return;

    const isTableEmpty = data.rows.length === 0 || (data.rows.length === 1 && data.rows[0].every(c => !c));

    if (isTableEmpty) {
       const newHeaders = rows[0];
       const newRows = rows.slice(1);
       // Normalize row lengths
       const maxCols = Math.max(newHeaders.length, ...newRows.map(r => r.length));
       
       // Pad headers
       while(newHeaders.length < maxCols) newHeaders.push(`Column ${newHeaders.length + 1}`);

       // Pad rows
       const normalizedRows = newRows.map(r => {
         const newRow = [...r];
         while(newRow.length < maxCols) newRow.push('');
         return newRow;
       });

       onChange({ ...data, headers: newHeaders, rows: normalizedRows });
    } else {
         const maxCols = data.headers.length;
         const newRows = rows.map(r => {
             // Truncate or pad to match current table width
             const mapped = r.slice(0, maxCols);
             while(mapped.length < maxCols) mapped.push('');
             return mapped;
         });
         onChange({ ...data, rows: [...data.rows, ...newRows] });
    }
  }, [data, onChange]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-2">
        <h3 className="font-semibold text-gray-700">表格编辑区</h3>
        <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 hidden sm:flex items-center gap-2">
                <span>提示: 支持 Excel 复制粘贴</span>
            </div>
            <button 
                onClick={clearData}
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
            >
                清空数据
            </button>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto p-4" onPaste={handlePaste}>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="w-10 p-2 border bg-gray-100 text-center text-xs text-gray-400">#</th>
              {data.headers.map((header, i) => (
                <th key={i} className="min-w-[120px] p-0 border border-gray-300 bg-gray-50 group relative">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-full h-full p-2 bg-transparent font-semibold text-center focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 placeholder-gray-300"
                    placeholder="表头"
                  />
                  <button 
                    onClick={() => removeColumn(i)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-opacity"
                    title="删除列"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </th>
              ))}
              <th className="w-10 p-1 border-b border-transparent">
                <button onClick={addColumn} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="添加列">
                  <PlusIcon className="w-5 h-5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                <td className="p-1 border bg-gray-50 text-center text-xs text-gray-400 relative">
                  {rowIndex + 1}
                  <button 
                    onClick={() => removeRow(rowIndex)}
                    className="absolute top-1/2 -left-2 -translate-y-1/2 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-opacity z-10"
                    title="删除行"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-0 border border-gray-300">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors hover:bg-gray-50"
                      placeholder="..."
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-1 border-r border-transparent text-center">
                 <button onClick={addRow} className="p-1 hover:bg-blue-100 rounded text-blue-600 mx-auto" title="添加行">
                  <PlusIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Hidden Text Area for robust mobile paste support */}
      <textarea ref={pasteAreaRef} className="sr-only" aria-hidden="true" />
    </div>
  );
};

export default TableEditor;