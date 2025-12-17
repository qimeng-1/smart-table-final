// services/geminiService.ts

// 1. 生成表格模板的功能
export async function generateTableTemplate(prompt: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error('网络请求失败');
  const data = await response.json();
  
  try {
    return typeof data.text === 'string' ? JSON.parse(data.text) : data;
  } catch (e) {
    console.error("解析 AI 响应失败", data);
    throw e;
  }
}

// 2. 数据趋势分析功能 (补回这个被删掉的函数)
export async function analyzeDataTrends(tableData: any) {
  const prompt = `请分析以下表格数据并给出趋势总结和建议：${JSON.stringify(tableData)}`;
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error('分析失败');
  const data = await response.json();
  return data.text; // 返回 AI 的分析文字
}