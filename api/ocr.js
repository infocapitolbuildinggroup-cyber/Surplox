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
  ]; // ❌ removed PDF for now (fix later properly)
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // rate limit
  const RATE_LIMIT = {};
  const LIMIT = 20;
  const WINDOW = 60 * 1000;
  
  function rateLimit(ip) {
    const now = Date.now();
  
    if (!RATE_LIMIT[ip]) {
      RATE_LIMIT[ip] = [];
    }
  
    RATE_LIMIT[ip] = RATE_LIMIT[ip].filter(
      (time) => now - time < WINDOW
    );
  
    if (RATE_LIMIT[ip].length >= LIMIT) {
      return false;
    }
  
    RATE_LIMIT[ip].push(now);
    return true;
  }
  
  export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }
  
      // 🔑 CHECK API KEY FIRST
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          error: "Missing OpenAI API key"
        });
      }
  
      const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "unknown";
  
      if (!rateLimit(ip)) {
        return res.status(429).json({
          error: "Too many OCR requests. Please wait."
        });
      }
  
      const { fileBase64, mimeType } = req.body;
  
      if (!fileBase64 || !mimeType) {
        return res.status(400).json({
          error: "Missing file data"
        });
      }
  
      if (!ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({
          error: "Only PNG/JPG supported for now"
        });
      }
  
      const buffer = Buffer.from(fileBase64, "base64");
  
      if (buffer.length > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: "File too large (max 10MB)"
        });
      }
  
      // 🚀 CALL OPENAI
      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text:
                      "Extract all readable text from this construction blueprint or document."
                  },
                  {
                    type: "input_image",
                    image_base64: fileBase64
                  }
                ]
              }
            ]
          })
        }
      );
  
      // ❗ CRITICAL FIX
      if (!response.ok) {
        const err = await response.text();
        console.error("OpenAI Error:", err);
  
        return res.status(500).json({
          error: "OpenAI OCR failed",
          details: err
        });
      }
  
      const data = await response.json();
  
      // ✅ SAFE TEXT EXTRACTION
      const text =
        data.output_text ||
        data.output?.map(o =>
          o.content?.map(c => c.text).join(" ")
        ).join(" ") ||
        "";
  
      if (!text || text.trim().length === 0) {
        return res.status(200).json({
          success: false,
          error: "No text detected in image"
        });
      }
  
      return res.status(200).json({
        success: true,
        extractedText: text
      });
  
    } catch (error) {
      console.error("OCR ERROR:", error);
  
      return res.status(500).json({
        error: "OCR processing failed"
      });
    }
  }