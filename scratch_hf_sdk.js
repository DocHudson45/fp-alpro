const { HfInference } = require('@huggingface/inference');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const rawToken = env.match(/HF_TOKEN=(.*)/)[1].trim();
const token = rawToken.replace(/['"]+/g, '');

const hf = new HfInference(token);

async function run() {
  try {
    const blob = await hf.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: 'A beautiful sunset over the ocean',
      parameters: {
        negative_prompt: 'blurry',
      }
    });
    console.log("Success! Blob size:", blob.size, "type:", blob.type);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
