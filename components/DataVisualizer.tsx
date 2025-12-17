import React, { useMemo, useState } from 'react';
import { TableData, ChartType, AnalysisResult } from '../types';
import { analyzeDataTrends } from '../services/geminiService';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { SparklesIcon, LoadingSpinner, DownloadIcon } from './Icons';
import html2canvas from 'html2canvas';

interface DataVisualizerProps {
  data: TableData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DataVisualizer: React.FC<DataVisualizerProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!data || data.rows.length === 0) return [];
    
    // Try to identify the "Label" column (usually first non-numeric string column)
    // and "Value" columns (numeric columns)
    
    return data.rows.map((row, index) => {
      const obj: any = { name: `Row ${index + 1}` };
      let labelFound = false;

      data.headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        const numValue = parseFloat(value);
        
        // If it looks like a number, treat as data
        if (!isNaN(numValue) && value.trim() !== '') {
           obj[header] = numValue;
        } else if (!labelFound) {
           // First string column becomes the 'name'
           obj.name = value || `Row ${index + 1}`;
           labelFound = true;
        }
      });
      return obj;
    });
  }, [data]);

  // Identify numeric keys for plotting
  const dataKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    const keys = Object.keys(chartData[0]).filter(k => k !== 'name');
    return keys;
  }, [chartData]);

  const handleAnalyze = async () => {
    if (data.rows.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeDataTrends(data);
      setAnalysis(result);
    } catch (e) {
      setError("分析失败，请稍后重试。");
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportChart = async () => {
    if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const url = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `${data.title || 'chart'}_viz.png`;
        link.href = url;
        link.click();
    }
  }

  const renderChart = () => {
    if (chartData.length === 0 || dataKeys.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p>请输入包含数值的数据以生成图表</p>
        </div>
      );
    }

    const CommonProps = { data: chartData, margin: { top: 5, right: 30, left: 20, bottom: 5 } };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} />
            ))}
          </LineChart>
        );
      case 'area':
         // Simplified Area chart logic
         return (
          <LineChart {...CommonProps}> 
             {/* Using LineChart as placeholder or implement AreaChart similarly */}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
            ))}
          </LineChart>
         );
      case 'pie':
        // Pie usually only visualizes one data series effectively at a time. We'll take the first numeric column.
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKeys[0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case 'radar':
         return (
             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                {dataKeys.map((key, i) => (
                    <Radar key={key} name={key} dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.6} />
                ))}
                <Legend />
                <Tooltip />
             </RadarChart>
         )
      case 'bar':
      default:
        return (
          <BarChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="font-semibold text-gray-700 text-lg">数据透视</h3>
          
          <div className="flex items-center gap-2">
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="border rounded-md px-3 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="bar">柱状图 (Bar)</option>
              <option value="line">折线图 (Line)</option>
              <option value="pie">饼图 (Pie)</option>
              <option value="radar">雷达图 (Radar)</option>
            </select>
            <button onClick={exportChart} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md" title="导出图表">
                <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="h-80 w-full" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
             <SparklesIcon className="w-5 h-5 text-purple-600" />
             AI 趋势分析
           </h3>
           <button
             onClick={handleAnalyze}
             disabled={isAnalyzing || chartData.length === 0}
             className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
           >
             {isAnalyzing ? <><LoadingSpinner className="w-4 h-4" /> 分析中...</> : '开始分析'}
           </button>
        </div>

        {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mb-4">{error}</div>
        )}

        {analysis && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-purple-50 rounded-md border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-1">数据摘要</h4>
              <p className="text-sm text-purple-800 leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                 <h4 className="font-medium text-blue-900 mb-2">关键趋势</h4>
                 <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                   {analysis.trends.map((t, i) => <li key={i}>{t}</li>)}
                 </ul>
               </div>
               
               <div className="p-4 bg-green-50 rounded-md border border-green-100">
                 <h4 className="font-medium text-green-900 mb-1">建议</h4>
                 <p className="text-sm text-green-800 leading-relaxed">{analysis.suggestion}</p>
               </div>
            </div>
          </div>
        )}
        
        {!analysis && !isAnalyzing && !error && (
            <div className="text-center py-8 text-gray-400 text-sm">
                点击上方按钮，让 AI 为您解读数据背后的故事。
            </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizer;
