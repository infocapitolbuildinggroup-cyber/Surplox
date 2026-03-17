export const config = {
    api: {
      bodyParser: {
        sizeLimit: "10mb"
      }
    }
  };
  
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  // simple in-memory rate limit
  const RATE_LIMIT = {};
  const LIMIT = 20; // requests
  const WINDOW = 60 * 1000; // 1 minute
  
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
          error: "File type not allowed"
        });
      }
  
      const buffer = Buffer.from(fileBase64, "base64");
  
      if (buffer.length > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: "File too large (max 10MB)"
        });
      }
  
      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model:
              process.env.OPENAI_OCR_MODEL ||
              "gpt-4.1-mini",
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
  
      const data = await response.json();
  
      const text =
        data.output?.[0]?.content?.[0]?.text || "";
  
      return res.status(200).json({
        success: true,
        extractedText: text
      });
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        error: "OCR processing failed"
      });
    }
  }
