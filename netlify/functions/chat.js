exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    // 调用 DeepSeek 接口 (兼容 OpenAI 格式)
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // 或者 deepseek-reasoner
        messages: [
          {
            role: "system",
            content: "你是一位专业的智能表格大师。请直接返回 JSON 数据，格式如下：{\"headers\":[\"列1\",\"列2\"],\"rows\":[[\"值1\",\"值2\"]]}。不要包含 Markdown 代码块。"
          },
          { role: "user", content: prompt }
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    // 检查 DeepSeek 报错
    if (!response.ok) {
        return { statusCode: response.status, headers, body: JSON.stringify(data) };
    }

    // 提取 DeepSeek 返回的文本内容
    const aiText = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: aiText })
    };

  } catch (error) {
    console.error("DeepSeek Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "DeepSeek 处理失败", details: error.message })
    };
  }
};