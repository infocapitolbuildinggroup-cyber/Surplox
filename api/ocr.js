export const config = {
    api: {
      bodyParser: {
        sizeLimit: "10mb"
      }
    }
  };
  
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // simple in-memory rate limit
  const RATE_LIMIT = {};
  const LIMIT = 20;
  const WINDOW = 60 * 1000;
  
  function rateLimit(ip) {
    const now = Date.now();
  
    if (!RATE_LIMIT[ip]) {
      RATE_LIMIT[ip] = [];
    }
  
    RATE_LIMIT[ip] = RATE_LIMIT[ip].filter((time) => now - time < WINDOW);
  
    if (RATE_LIMIT[ip].length >= LIMIT) {
      return false;
    }
  
    RATE_LIMIT[ip].push(now);
    return true;
  }
  
  function extractOutputText(data) {
    if (typeof data?.output_text === "string" && data.output_text.trim()) {
      return data.output_text.trim();
    }
  
    const pieces = [];
  
    for (const outputItem of data?.output || []) {
      for (const contentItem of outputItem?.content || []) {
        if (typeof contentItem?.text === "string" && contentItem.text.trim()) {
          pieces.push(contentItem.text.trim());
        }
      }
    }
  
    return pieces.join("\n").trim();
  }
  
  export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }
  
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          error: "Missing OpenAI API key"
        });
      }
  
      const forwardedFor = req.headers["x-forwarded-for"];
      const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : String(forwardedFor || req.socket.remoteAddress || "unknown")
            .split(",")[0]
            .trim();
  
      if (!rateLimit(ip)) {
        return res.status(429).json({
          error: "Too many OCR requests. Please wait."
        });
      }
  
      const { fileBase64, mimeType } = req.body || {};
  
      if (!fileBase64 || !mimeType) {
        return res.status(400).json({
          error: "Missing file data"
        });
      }
  
      if (!ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({
          error: "Only PNG and JPG images are supported for OCR right now."
        });
      }
  
      const buffer = Buffer.from(fileBase64, "base64");
  
      if (!buffer.length) {
        return res.status(400).json({
          error: "Uploaded image is empty"
        });
      }
  
      if (buffer.length > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: "File too large (max 10MB)"
        });
      }
  
      const imageDataUrl = `data:${mimeType};base64,${fileBase64}`;
  
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_OCR_MODEL || "gpt-4.1-mini",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: "Extract all readable text from this construction blueprint or document. Return only the extracted text."
                },
                {
                  type: "input_image",
                  image_url: imageDataUrl
                }
              ]
            }
          ]
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI OCR failed:", errorText);
  
        return res.status(response.status).json({
          error: "OpenAI OCR failed",
          details: errorText
        });
      }
  
      const data = await response.json();
      const text = extractOutputText(data);
  
      if (!text) {
        return res.status(200).json({
          success: false,
          error: "No text detected in image",
          extractedText: ""
        });
      }
  
      return res.status(200).json({
        success: true,
        extractedText: text
      });
    } catch (error) {
      console.error("OCR processing failed:", error);
  
      return res.status(500).json({
        error: "OCR processing failed"
      });
    }
  }