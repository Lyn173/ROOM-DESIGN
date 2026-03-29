import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateViralIntro(sampleVideoBase64: string, targetVideoBase64: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Bạn là một chuyên gia sáng tạo nội dung TikTok chuyên về review phòng trọ/bất động sản.
    
    Nhiệm vụ của bạn:
    1. Xem video mẫu (Video 1) để phân tích phong cách nói chuyện, tông giọng, các từ lóng, câu cửa miệng (catchphrases) và cách dẫn dắt (ví dụ: "chào các con vợ", "kinh nghiệm xương máu", "vừa thoáng vừa chill", "làm màu").
    2. Xem video mới (Video 2) - đây là video về một căn phòng khác. Hãy quan sát kỹ các đặc điểm của căn phòng này (nội thất, ánh sáng, ban công, nhà vệ sinh, diện tích, v.v.).
    3. Viết một kịch bản giới thiệu cho Video 2 bằng tiếng Việt, sử dụng CHÍNH XÁC phong cách, năng lượng và các từ lóng viral từ Video 1. 
    
    Yêu cầu kịch bản:
    - Ngôn ngữ: Tiếng Việt, phong cách Gen Z/TikTok viral.
    - Cấu trúc: Mở đầu ấn tượng -> Review các điểm nổi bật của phòng -> Kết thúc kêu gọi.
    - Độ dài: Khoảng 150-200 từ.
    
    Hãy trả về kết quả dưới dạng văn bản thuần túy (Plain text).
  `;

  const contents = [
    {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: sampleVideoBase64,
          },
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: targetVideoBase64,
          },
        },
      ],
    },
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating intro:", error);
    throw error;
  }
}
