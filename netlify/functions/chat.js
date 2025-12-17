const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  // 1. 仅允许 POST 请求
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2. 获取环境变量中的密钥
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "你是一位专业的智能表格大师，负责接收用户的需求并生成结构化的表格数据。请直接返回 JSON 格式，包含 headers 和 rows。" 
    });

    // 3. 解析前端传来的数据
    const { prompt } = JSON.parse(event.body);

    // 4. 调用 Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. 返回给前端（必须是这个格式）
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI 处理失败", details: error.message })
    };
  }
};