import { GoogleGenAI } from '@google/genai';

// 1. 获取密钥：从 Vercel/系统环境变量中安全地读取密钥
const apiKey = process.env.VITE_GEMINI_API_KEY;

// 2. 初始化 Gemini 客户端
// 确保 @google/genai 库已安装 (在你的 npm install 步骤中应该已经安装了)
const ai = new GoogleGenAI({ apiKey });

// 3. 定义你的 Serverless Function 处理器
export default async function handler(req, res) {
  // 仅处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 从前端接收用户输入和聊天历史
  const { userPrompt, history } = req.body;

  try {
    // 你的系统指令 (人设) 应该在这里定义，或者从配置中读取
    const systemInstruction = `你是一位专业的智能表格大师，负责接收用户的需求并生成结构化的表格数据。`;

    const chat = ai.chats.create({
      model: "gemini-1.5-flash", 
      history: history || [], // 接收聊天历史
      config: {
          systemInstruction: systemInstruction,
      }
    });

    // 发送消息给 Gemini
    const response = await chat.sendMessage({ message: userPrompt });

    // 4. 将 AI 的回复返回给前端
    res.status(200).json({ text: response.text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "无法连接AI服务或AI处理失败" });
  }
}