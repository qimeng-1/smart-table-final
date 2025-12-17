const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // 增加简单的跨域支持
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // 关键修正：使用 gemini-1.5-pro
    // 这是 Google AI Studio 生成的密钥最通用的 Pro 模型标识
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const body = JSON.parse(event.body);
    const prompt = body.prompt || "请生成一个基础表格模板";

    const fullPrompt = `你是一位专业的智能表格大师。
    请根据需求生成表格数据。
    必须严格只返回 JSON 格式，不要包含 Markdown 代码块（如 \`\`\`json ）。
    格式：{"headers":["列1","列2"],"rows":[["数据1","数据2"]]}
    用户需求：${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text })
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "AI 处理失败", 
        details: error.message 
      })
    };
  }
};