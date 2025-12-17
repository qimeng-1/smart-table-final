const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. 确保环境变量正确读取
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // 2. 修正点：直接使用 gemini-1.5-flash，不带额外的版本前缀
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const { prompt } = JSON.parse(event.body);

    // 3. 构建强化的 System Instruction
    const fullPrompt = `你是一位专业的智能表格大师。
    请根据用户的要求生成表格数据。
    必须严格只返回 JSON 格式，不要包含 Markdown 代码块（如 \`\`\`json ）。
    格式示例：{"headers":["列1","列2"],"rows":[["数据1","数据2"]]}
    用户需求：${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // 返回详细错误方便调试
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI 处理失败", details: error.message })
    };
  }
};