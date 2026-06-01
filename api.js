const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS Headers සැකසීම
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS Request එකක් ආවොත් එතනින්ම Response එක අවසන් කිරීම
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST Request පමණක් බාර ගැනීම
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // නිවැරදි නිල SDK ක්‍රමය (GoogleGenerativeAI)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Screen Printing ප්‍රවීණයෙකු ලෙස පිළිතුරු දීමට හැඩගැස්වීම
    const prompt = `You are Videv Smart AI, an expert screen printing instructor with over 20 years of technical experience. 
    Answer the following user question professionally and helpfully in Sinhala language, focusing strictly on screen printing techniques, mesh, squeegee, inks, and heat press. 
    User Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
