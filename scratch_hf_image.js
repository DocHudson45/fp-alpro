const { OpenAI } = require("openai");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

async function run() {
  try {
    const response = await client.images.generate({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt: "A beautiful sunset over the ocean",
    });
    console.log(response.data[0].url);
  } catch (err) {
    console.error(err);
  }
}
run();
