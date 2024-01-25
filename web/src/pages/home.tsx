import { useState } from "react";

type Messages = { role: "system" | "user" | "assistant"; content: string }[];

export default function Home() {
  const [messages, setMessages] = useState<Messages>([
    {
      role: "system",
      content: "you are a helpful assistant",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const payload = [
      ...messages,
      {
        role: "user",
        ...data,
      },
      {
        role: "assistant",
        content: "",
      },
    ];

    console.log(payload);

    setMessages(payload as Messages);

    try {
      const response = await fetch("http://localhost:5000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.content,
        }),
      });

      // if (!response.body) return;

      // const reader = response.body.getReader();
      // const decoder = new TextDecoder();

      // let isFinish = false;

      // while (!isFinish) {
      //   const { done, value } = await reader.read();
      //   isFinish = done;

      //   const decodedValue = decoder.decode(value);
      //   if (!decodedValue) break;

      //   setMessages((messages) => [
      //     ...messages.slice(0, messages.length - 1),
      //     {
      //       role: "assistant",
      //       content: `${messages[messages.length - 1].content}${decodedValue}`,
      //     },
      //   ]);
      // }

      if (!response.body) return;

      const decodedValue = await response.text(); // Menggunakan response.text() langsung

      setMessages((messages) => [
        ...messages.slice(0, messages.length - 1),
        {
          role: "assistant",
          content: `${messages[messages.length - 1].content}${decodedValue}`,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="container mx-auto pt-12">
        <div className="prose">
          {messages.map((msg, index) => (
            <p key={index}>
              <em>{msg.role}</em> : {msg.content}
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label>
              <span className="label-text">Content</span>
            </label>
            <textarea
              required
              className="textarea textarea-bordered"
              name="content"
              rows={3}
            ></textarea>
          </div>
          <div className="form-control mt-5">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
