const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // 1. 初始化 SDK
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // 2. 使用你确认的准确模型名称
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-pro-preview" 
    });

    const body = JSON.parse(event.body);
    const prompt = body.prompt || "生成基础表格";

    // 3. 强化指令，确保返回纯 JSON
    const fullPrompt = `你是一位专业的智能表格大师。
    请根据用户需求生成 JSON 数据。
    必须严格只返回 JSON 格式，不要包含 Markdown 格式（严禁使用 \`\`\`json ）。
    格式示例：{"headers":["项目","数值"],"rows":[["示例1","100"]]}
    用户需求：${prompt}`;

    // 4. 发送请求
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
        details: error.message,
        modelUsed: "gemini-3-pro-preview"
      })
    };
  }
};