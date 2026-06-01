// විදෙව් ස්මාර්ට් AI - සැබෑ Backend මොළය (Node.js)
const { GoogleGenAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // CORS Security නිවේදන (ඕනෑම තැනක සිට ඇප් එකට සම්බන්ධ වීමට)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { query, imageBase64 } = req.body;

            // 1. Google AI Studio එකෙන් ගන්නා ඔයාගේ රහස් API Key එක මෙතනට සෙට් වෙනවා
            const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            // 2. රූප සහ අකුරු දෙකම කියවිය හැකි බුද්ධිමත්ම Gemini 1.5 Pro මොළය තෝරාගැනීම
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            // 3. වසර 20ක පළපුරුද්ද AI එකට උගන්වන ප්‍රධාන නීති පද්ධතිය (System Instructions)
            const systemPrompt = `ඔබ වසර 20ක ප්‍රායෝගික පළපුරුද්දක් ඇති 'විදෙව් ස්ක්‍රීන් ප්‍රින්ටින්' (Videv Screen Printing) පුහුණු මධ්‍යස්ථානයේ ප්‍රධාන තාක්ෂණික විශේෂඥයායි. 
            පරිශීලකයා අසන ප්‍රශ්න මුද්‍රණ ක්ෂේත්‍රයට (Screen Printing) අදාළව පමණක් වෘත්තීය මට්ටමෙන් විශ්ලේෂණය කරන්න. 
            පිළිතුර සරල සිංහලෙන් හෝ ඉංග්‍රීසියෙන් (ප්‍රශ්නය අසන ලද භාෂාව අනුව) කරුණු (Bullet points) සහිතව ලස්සනට සකස් කර දෙන්න. 
            පින්තූරයක් ඇත්නම් එහි Registration, Ink Opacity, සහ Edge Sharpness ගැන විශේෂයෙන් සඳහන් කරන්න.`;

            let promptParts = [systemPrompt, query];

            // පින්තූරයක් එවා ඇත්නම් එය AI එකට කියවිය හැකි පරිදි සකස් කිරීම
            if (imageBase64) {
                const imageBuffer = {
                    inlineData: {
                        data: imageBase64.split(",")[1],
                        mimeType: "image/jpeg"
                    },
                };
                promptParts.push(imageBuffer);
            }

            // සජීවීව AI එකෙන් පිළිතුර ලබාගැනීම
            const result = await model.generateContent(promptParts);
            const responseText = result.response.text();

            // පිළිතුර නැවත අපේ වෙබ් පිටුවට යැවීම
            res.status(200).json({ answer: responseText });

        } catch (error) {
            res.status(500).json({ error: "AI පද්ධතිය සම්බන්ධ වීමේ දෝෂයකි: " + error.message });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
