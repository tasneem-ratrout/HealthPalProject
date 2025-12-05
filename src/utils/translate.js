import axios from "axios";

export async function translateSmart(text) {
  try {
    if (!text || text.trim() === "") return text;

    const cleanText = text.trim().replace(/[!?.]+$/g, "");
    const isArabic = /[\u0600-\u06FF]/.test(cleanText);
    const source = isArabic ? "ar" : "en";
    const target = isArabic ? "en" : "ar";

    //  Google Translate Api
    const url = "https://translate.googleapis.com/translate_a/single";
    const params = {
      client: "gtx",
      sl: source,
      tl: target,
      dt: "t",
      q: cleanText,
    };

    const res = await axios.get(url, { params });
    const translated = res.data?.[0]?.[0]?.[0];

    return translated || cleanText;
  } catch (err) {
    console.error("⚠️ Translation Error:", err.message);
    return text;
  }
}
