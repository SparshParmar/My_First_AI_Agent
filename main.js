import OpenAI from "openai/index.mjs";
import readlineSync from "readline-sync";

const API_KEY =
  "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";

const client = new OpenAI({
  apiKey: API_KEY,
});

//TOOLS
const getWeatherDetails = (props) => {
  const city = { props };
  switch (city) {
    case "Wroclaw":
      return 10;
    case "warsaw":
      return 15;
    case "Surat":
      return 27;
    case "Baroda":
      return 20;
  }
};

const tools = {
  getWeatherDetails: getWeatherDetails,
};

// client.chat.completions
//   .create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "user",
//         content: "Hey, how are you doing?",
//       },
//     ],
//   })
//   .then((e) => {
//     console.log(e.choices[0].message.content);
//   });

const SYSTEM_PROMPT = `
You are an AI Assistant with START, PLAN, ACTION, OBSERVATION and OUTPUT state,
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with approproate tools and wait for Observation based on Action.
Once you get the obeservation, Returns the AI response based on START prompt and observations

Example:
START
{"type": "user", "user": "What is the sum of weather of Wroclaw and Surat?"}
{"type": "plan", "plan": I will call the getWeatherDetails for Wroclaw"}
{"type": "action", "function": "getWeatherDetails". "input" }"
{"type": "observation", "observation": "10"}
{"type": "plan", "plan": I will call the getWeatherDetails for Surat"}
{"type": "action", "function": "getWeatherDetails". "input" }"
{"type": "observation", "observation": "27"}
{"type": "output", "output": "The sum of weather of Wroclaw and Surat is 37 Degree Celcius". "input" }"
`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

while (true) {
  const query = readlineSync.question(">> ");
  const question = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(question) });

  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      response_format: { type: "json_object" },
    });

    const result = chat.choices[0].message.content;
    messages.push({ role: "assistant", content: result });

    const call = JSON.parse(result);

    if (call.type == "output") {
      console.log(` ${call.output}`);
      break;
    } else if (call.type == "action") {
      const fn = tools[call.function];
      const obeservation = fn(call.input);
      const obs = { type: "observation", obeservation: obeservation };
      messages.push({ role: "developer", content: JSON.stringify(obs) });
    }
  }
}
