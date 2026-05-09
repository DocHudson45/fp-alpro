const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const rawToken = env.match(/HF_TOKEN=(.*)/)[1].trim();
const token = rawToken.replace(/['"]+/g, '');

async function run() {
  const hfResponse = await fetch(
    "https://router.huggingface.co/hf-inference/v1/images/generations",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: "A beautiful sunset"
      }),
    }
  );

  if (!hfResponse.ok) {
    console.log("Failed:", hfResponse.status, hfResponse.statusText);
    console.log(await hfResponse.text());
  } else {
    console.log("Success! Got bytes:", (await hfResponse.text()).substring(0, 100));
  }
}
run();
