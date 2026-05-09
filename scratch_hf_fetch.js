const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const token = env.match(/HF_TOKEN=(.*)/)[1].trim();

async function run() {
  const hfResponse = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: "A beautiful sunset" }),
    }
  );

  if (!hfResponse.ok) {
    console.log("Failed:", hfResponse.status, hfResponse.statusText);
    console.log(await hfResponse.text());
  } else {
    console.log("Success! Got bytes:", (await hfResponse.arrayBuffer()).byteLength);
  }
}
run();
