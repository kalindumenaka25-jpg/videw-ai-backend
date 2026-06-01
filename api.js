const { GoogleGenAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 1. CORS Headers සෘජුවම කෝඩ් එක ඇතුළෙන්ම ලබා දීම
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. බ්‍රවුසර් එකෙන් එවන OPTIONS Request එකට කෙළින්ම සාර්ථක ප්‍රතිචාරයක් දීම
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. අපිට අවශ්‍ය POST Request එක පමණක් බාර ගැනීම
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Gemini API එක සම්බන්ධ කිරීම
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Screen Printing ප්‍රවීණයෙකු ලෙස පිළිතුරු දීමට පද්ධතිය හැඩගැස්වීම (System Instruction)
    const prompt = `You are Videv Smart AI, an expert screen printing instructor with over 20 years of technical experience. 
    Answer the following user question professionally and helpfully in Sinhala language, focusing strictly on screen printing techniques, mesh, squeegee, inks, and heat press. 
    User Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Crashed Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
