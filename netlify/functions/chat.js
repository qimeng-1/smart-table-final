const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // 💡 切换到目前免费额度最慷慨的模型
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const body = JSON.parse(event.body);
    const prompt = body.prompt || "生成基础表格";

    const fullPrompt = `你是一位专业的智能表格大师。请直接返回 JSON 数据。
    格式：{"headers":["项目","数值"],"rows":[["示例1","100"]]}
    需求：${prompt}`;

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