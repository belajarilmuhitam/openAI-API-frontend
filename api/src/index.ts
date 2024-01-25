import cors from "cors";
import express from "express";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/", async (req, res) => {
  try {
    const { content } = req.body;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "youre a helpful system",
          },
          {
            role: "user",
            content: content,
          },
        ],
        stream: true,
      }),
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let isFinished = false;
    const bags: string[] = [];
    while (!isFinished) {
      const { value, done } = await reader.read();
      isFinished = done;

      const decodedValue = decoder.decode(value);
      if (!decodedValue) break;

      for (const chunk of decodedValue.split("\n\n")) {
        if (chunk.trim() === "data: [DONE]") continue;

        bags.push(chunk);
        try {
          const json = JSON.parse(bags.join("").split("data: ").at(-1) || "{}");
          const text = json.choices?.[0]?.delta?.content;
          if (text) {
            res.write(text);
          }
        } catch (error) {
          // ignore
        }
      }
    }

    res.end();
  } catch (err) {
    console.log(err);
  }
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});

//
