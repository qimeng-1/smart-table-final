const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. 初始化，建议不手动指定版本，让最新的 SDK 自动匹配
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // 2. 尝试使用 gemini-pro 或者是 gemini-1.5-flash
    // 如果 flash 报错，通常 gemini-pro 是最兼容的名称
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const body = JSON.parse(event.body);
    const prompt = body.prompt || "请生成一个基础表格模板";

    const fullPrompt = `你是一位专业的智能表格大师。
    请根据需求生成 JSON 数据。
    必须严格只返回 JSON，格式：{"headers":["列1","列2"],"rows":[["数据1","数据2"]]}
    需求：${prompt}`;

    // 3. 执行生成
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({ text })
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "AI 处理失败", 
        details: error.message,
        suggestion: "请检查 API Key 是否拥有访问 Gemini 1.5 Flash 的权限" 
      })
    };
  }
};