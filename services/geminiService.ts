// services/geminiService.ts
export async function generateTableTemplate(prompt: string) {
  // 注意：这里改为请求你自己的 Netlify 后端代理
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('网络请求失败');
  }

  const data = await response.json();
  
  // 假设后端返回的是字符串，我们需要解析它
  // 如果你的后端 chat.js 已经处理好了 JSON 对象，直接返回即可
  try {
    return typeof data.text === 'string' ? JSON.parse(data.text) : data;
  } catch (e) {
    console.error("解析 AI 响应失败", data);
    throw e;
  }
}