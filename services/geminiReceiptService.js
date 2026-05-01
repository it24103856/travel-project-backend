import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the model that is available in your API key – we found "gemini-2.5-flash" works.
const MODEL_NAME = "gemini-2.5-flash";
const GEMINI_API_KEY="AIzaSyA5lBnGckfEIvvv_P_75dcr3g-Q5Wmbip8"

const normalizeMimeType = (contentType = "") => {
    const safeType = contentType.split(";")[0].trim().toLowerCase();
    if (safeType) return safeType;
    return "image/jpeg";
};

const parseJsonFromResponse = (text = "") => {
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
    return JSON.parse(cleaned);
};

const normalizeComparableText = (value = "") =>
    value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\b(mr|mrs|ms|miss|mx|dr|prof|sir|madam|mister|mistress|rev|fr|hon)\b\.?/g, "")
        .replace(/[^a-z0-9]+/g, "")
        .trim();

const stripHonorifics = (value = "") =>
    value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\b(mr|mrs|ms|miss|mx|dr|prof|sir|madam|mister|mistress|rev|fr|hon)\b\.?/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const canonicalizeName = (value = "") => {
    const stripped = stripHonorifics(value);
    if (!stripped) {
        return "";
    }

    const tokenized = stripped.split(/\s+/).filter(Boolean);
    const nameTokens = tokenized.filter(token => token.length > 1);

    return (nameTokens.length > 0 ? nameTokens : tokenized)
        .join("");
};

const getConsonantSkeleton = (name = "") => {
    return name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\b(mr|mrs|ms|miss|mx|dr|prof|sir|madam|mister|mistress|rev|fr|hon)\b\.?/g, "")
        .replace(/[aeiouäëïöü]/gi, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

const compareReceiptNames = (expectedName, extractedName) => {
    const expected = canonicalizeName(expectedName) || normalizeComparableText(expectedName);
    const extracted = canonicalizeName(extractedName) || normalizeComparableText(extractedName);

    if (!expected || !extracted) {
        return { matches: false, reason: "Missing expected or extracted payer name." };
    }

    if (expected === extracted) {
        return { matches: true, reason: "Payer name matches after normalization." };
    }

    if (expected.includes(extracted) || extracted.includes(expected)) {
        return { matches: true, reason: "Payer name matches with punctuation or spacing differences." };
    }

    // Fallback: compare consonant skeletons (removes vowels and titles)
    const expectedConsonants = getConsonantSkeleton(expectedName);
    const extractedConsonants = getConsonantSkeleton(extractedName);

    if (expectedConsonants && extractedConsonants && expectedConsonants === extractedConsonants) {
        return { matches: true, reason: "Payer name matches (consonant structure matches, ignoring vowels and titles)." };
    }

    return { matches: false, reason: `Name mismatch: expected '${expectedName}' but found '${extractedName}'.` };
};

// Helper function with retry logic
const callGeminiWithRetry = async (model, payload, modelName, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`📤 Attempt ${attempt + 1}/${maxRetries} with model ${modelName}...`);
            const result = await model.generateContent(payload);
            return result;
        } catch (error) {
            const isServerError = error.status === 503 || error.message?.includes("503") || error.message?.includes("high demand");
            const isLastAttempt = attempt === maxRetries - 1;

            if (isServerError && !isLastAttempt) {
                const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
                console.log(`⏳ Server busy (${modelName}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
};

export const analyzeReceiptWithGemini = async ({ receiptUrl, expectedAmount, expectedCurrency, expectedRemark, expectedPayerName }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing. Add it to your environment variables.");
    }

    // Step 1: Download the image from the public URL
    console.log("Downloading receipt image from:", receiptUrl);
    const imageResponse = await axios.get(receiptUrl, { responseType: "arraybuffer" });
    const mimeType = normalizeMimeType(imageResponse.headers["content-type"]);
    const base64Image = Buffer.from(imageResponse.data).toString("base64");
    console.log("Image downloaded, size:", imageResponse.data.length, "bytes");

    // Step 2: Build the prompt
    const prompt = `You are verifying a travel booking payment receipt.
Return ONLY valid JSON (no markdown block) using this exact schema:
{
  "isReceipt": boolean,
  "paymentConfirmed": boolean,
  "extractedAmount": number | null,
  "extractedCurrency": string | null,
  "extractedRemark": string | null,
    "extractedPayerName": string | null,
  "transactionId": string | null,
  "paymentDate": string | null,
  "confidence": number,
  "reason": string
}

Rules:
- expectedAmount: ${expectedAmount}
- expectedCurrency: ${expectedCurrency || "LKR"}
- expectedRemark: ${expectedRemark} (Verify if this or something very similar is written on the receipt).
- expectedPayerName: ${expectedPayerName || ""} (Verify whether the sender/customer/account holder name on the receipt matches the provided name, ignoring case and punctuation differences such as dots, commas, or spaces).
- paymentConfirmed should be true only when a payment receipt is visible, the amount matches the expected amount, and the payer name matches when one is provided.
- confidence should be a number between 0 and 1.
- If a field is missing in the image, return null for that field.`;

    const payload = [
        prompt,
        {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        },
    ];

    // Step 3: Initialize Gemini and try primary model with retry
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let result;
    const fallbackModels = ["gemini-1.5-pro", "gemini-pro", "gemini-pro-vision"];

    try {
        console.log(`🚀 Trying primary model: ${MODEL_NAME}`);
        const primaryModel = genAI.getGenerativeModel({ model: MODEL_NAME });
        // More aggressive retry for primary model (5 attempts, longer initial delay for busy servers)
        result = await callGeminiWithRetry(primaryModel, payload, MODEL_NAME, 5, 2000);
    } catch (primaryError) {
        console.warn(`⚠️ Primary model (${MODEL_NAME}) failed after retries:`, primaryError.message);
        
        // Try fallback models in sequence
        for (const fallbackModel of fallbackModels) {
            console.log(`🔄 Trying fallback model: ${fallbackModel}`);
            try {
                const fallbackModelInstance = genAI.getGenerativeModel({ model: fallbackModel });
                result = await callGeminiWithRetry(fallbackModelInstance, payload, fallbackModel, 3, 1000);
                console.log(`✅ Fallback model (${fallbackModel}) succeeded`);
                break; // Success, exit the loop
            } catch (fallbackError) {
                console.warn(`⚠️ Fallback model (${fallbackModel}) failed:`, fallbackError.message);
                // Continue to next fallback model
            }
        }

        if (!result) {
            throw new Error(`AI verification failed with all models (${MODEL_NAME} + fallbacks). Primary error: ${primaryError.message}`);
        }
    }

    const text = result?.response?.text?.() || "";
    console.log("Raw Gemini response text:", text);
    const parsed = parseJsonFromResponse(text);
    console.log("Parsed JSON:", parsed);

    // Step 5: Validate remark if expected remark is provided
    let paymentConfirmed = Boolean(parsed.paymentConfirmed);
    let validationReason = parsed.reason || "No reason provided by model";

    if (expectedRemark && parsed.extractedRemark) {
        const remarkMatch = parsed.extractedRemark.toLowerCase().trim() === expectedRemark.toLowerCase().trim();
        if (!remarkMatch) {
            paymentConfirmed = false;
            validationReason = `Remark mismatch: Expected '${expectedRemark}' but found '${parsed.extractedRemark}'. Amount matched but remark validation failed.`;
            console.log("❌ Remark mismatch - paymentConfirmed set to false:", validationReason);
        } else {
            console.log("✅ Remark matched!");
        }
    }

    if (expectedPayerName) {
        const payerNameComparison = compareReceiptNames(expectedPayerName, parsed.extractedPayerName);
        if (!payerNameComparison.matches) {
            paymentConfirmed = false;
            validationReason = payerNameComparison.reason;
            console.log("❌ Payer name mismatch - paymentConfirmed set to false:", validationReason);
        } else {
            console.log("✅ Payer name matched:", payerNameComparison.reason);
        }
    }

    // Step 6: Return structured result
    return {
        isReceipt: Boolean(parsed.isReceipt),
        paymentConfirmed: paymentConfirmed,
        extractedAmount: typeof parsed.extractedAmount === "number" ? parsed.extractedAmount : null,
        extractedCurrency: parsed.extractedCurrency || null,
        extractedRemark: parsed.extractedRemark || null,
        extractedPayerName: parsed.extractedPayerName || null,
        transactionId: parsed.transactionId || null,
        paymentDate: parsed.paymentDate || null,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
        reason: validationReason,
    };
};