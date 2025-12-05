/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Part, Modality, Type } from "@google/genai";
// FIX: Add missing type imports for new features
import { IdPhotoSettings, RestorationSettings, BackgroundSettings, ClothingChangeSettings, PosingStudioSettings, SymmetrySettings, MockupSettings, AiEditorSettings, HairStyleSettings, BabyConceptSettings, VideoMarketingSettings, Translator, LightingSettings } from "./types";

const getMimeType = (dataUrl: string): string => {
    const parts = dataUrl.split(',')[0].split(':')[1].split(';');
    return parts[0];
};

/**
 * A robust wrapper for calling the Gemini API to generate an image from a prompt and optional source images.
 * Implements exponential backoff retry logic for handling transient API errors and rate limits.
 * @param {string} prompt The primary text prompt for the generation task.
 * @param {string} [imageData] The main source image as a base64 data URL.
 * @param {string[]} [additionalImages] An array of additional reference images as base64 data URLs.
 * @returns {Promise<string>} A promise that resolves to the generated image as a base64 data URL.
 * @throws Will throw an error if all retry attempts fail or if the API returns no image.
 */
export const callGeminiAPI = async (prompt: string, imageData?: string, additionalImages?: string[]): Promise<string> => {
    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    // Determine the model based on user preference
    const modelPreference = localStorage.getItem('haipix_model_preference') || 'free';
    
    let modelName = 'gemini-2.5-flash-image';
    let apiKey = process.env.API_KEY;

    if (modelPreference === 'pro') {
        modelName = 'gemini-3-pro-image-preview';
    } else if (modelPreference === 'custom') {
        modelName = 'gemini-3-pro-image-preview'; // Custom uses the high-end model by default
        const customKey = localStorage.getItem('haipix_custom_api_key');
        if (customKey) {
            apiKey = customKey;
        }
    }
    
    // Check for 4K preference
    const qualityPreference = localStorage.getItem('haipix_quality_preference');
    const is4K = qualityPreference === '4k';

    const parts: Part[] = [];

    // Add main image first, if available
    if (imageData) {
        parts.push({
            inlineData: {
                data: imageData.split(',')[1],
                mimeType: getMimeType(imageData),
            }
        });
    }
    
    // Add the text prompt
    parts.push({ text: prompt });

    // Add any additional images
    if (additionalImages && additionalImages.length > 0) {
        additionalImages.forEach(img => {
            parts.push({
                inlineData: {
                    data: img.split(',')[1],
                    mimeType: getMimeType(img),
                }
            });
        });
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`[callGeminiAPI] Attempt ${attempt + 1}/${maxRetries} using model: ${modelName} ${is4K ? '(4K Mode)' : ''}`);
            const ai = new GoogleGenAI({ apiKey: apiKey });

            const config: any = {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            };

            // Only apply 4K config if using the Pro model
            if ((modelName === 'gemini-3-pro-image-preview') && is4K) {
                config.imageConfig = { imageSize: '4K' };
            }

            const response = await ai.models.generateContent({
                model: modelName,
                contents: { parts },
                config: config,
            });

            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && Array.isArray(candidate.content.parts)) {
                    const imagePart = candidate.content.parts.find((p: Part) => p.inlineData);
                    if (imagePart && imagePart.inlineData) {
                        return `data:image/png;base64,${imagePart.inlineData.data}`;
                    }
                    // If no image, check for text and include it in the error
                    const textPart = candidate.content.parts.find((p: Part) => p.text);
                    if (textPart && textPart.text) {
                        throw new Error(`error_api_text_response:${textPart.text}`);
                    }
                }
            }
            throw new Error('error_api_no_image_response');

        } catch (error) {
            // FIX: Safely handle unknown error type in catch block.
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries - 1) {
                const waitTime = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
                // FIX: Safely handle unknown error type before accessing properties.
                const errorMsg = error instanceof Error ? error.message : String(error);
                if (errorMsg.includes('429') || /rate limit/i.test(errorMsg) || /resource exhausted/i.test(errorMsg)) {
                    console.log(`Đã đạt giới hạn yêu cầu. Thử lại sau ${Math.ceil(waitTime/1000)}s... (${attempt + 1}/${maxRetries})`);
                } else {
                    console.log(`Gọi API thất bại. Thử lại sau ${Math.ceil(waitTime/1000)}s... (${attempt + 1}/${maxRetries})`);
                }
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw lastError || new Error('error_api_retries_failed');
};

/**
 * Analyzes a reference image to generate a descriptive text prompt.
 * This function includes retry logic to handle transient API errors.
 * @param {string} imageData The reference image as a base64 data URL.
 * @param {'background' | 'clothing' | 'general'} mode The aspect of the image to describe.
 * @param {string} language The target language code (e.g., 'vi', 'en').
 * @returns {Promise<string>} A promise that resolves to a short, descriptive text prompt.
 * @throws Will throw an error if all retry attempts fail.
 */
export async function describeImageForPrompt(imageData: string, mode: 'background' | 'clothing' | 'general', language: string): Promise<string> {
    const languageNameMap: { [key: string]: string } = {
        vi: 'Vietnamese',
        en: 'English',
        zh: 'Chinese',
        hi: 'Hindi',
        es: 'Spanish',
        fr: 'French',
        ar: 'Arabic',
        bn: 'Bengali',
        pt: 'Portuguese',
        ru: 'Russian',
        th: 'Thai',
        lo: 'Lao',
        km: 'Cambodian'
    };
    const outputLanguageName = languageNameMap[language.split('-')[0]] || 'Vietnamese';

    let prompt = "";
    if (mode === 'background') {
        prompt = `Describe the background of this image in ${outputLanguageName} in great detail, like an art critic or a high-end AI generator prompt. Describe the shapes, geometry, textures, lighting style, and atmosphere. Be very descriptive about the visual elements. Do not mention the subject/person, focus strictly on the environment.`;
    } else if (mode === 'clothing') {
        prompt = `Analyze this image and provide a short, concise description in ${outputLanguageName} of the person's attire. Detail the type of clothing, color, style, and material. DO NOT describe the person, background, or any text or logos in the image. The description must be suitable for use as a clothing change prompt. IMPORTANT: The description must be strictly limited to 30 words.`;
    } else { // general
        prompt = `Thoroughly analyze this image and respond in ${outputLanguageName}. Describe in detail the gender, attire (including style and material if possible), dominant colors of the attire, and the surrounding context. After the description, append these restoration requests: 'Refresh and improve the overall quality of the photo. Remove all imperfections such as scratches, yellow stains, dust, grit, and smudges. Adjust color and contrast to make the photo vibrant, sharp, and look like new.'`;
    }
    
    // Use the custom key for helper functions if custom mode is selected
    const modelPreference = localStorage.getItem('haipix_model_preference');
    let apiKey = process.env.API_KEY;
    if (modelPreference === 'custom') {
        const customKey = localStorage.getItem('haipix_custom_api_key');
        if (customKey) apiKey = customKey;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const imagePart = {
        inlineData: {
            data: imageData.split(',')[1],
            mimeType: getMimeType(imageData),
        }
    };
    
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
            });
            return response.text;
        } catch (error) {
            // FIX: Safely handle unknown error type in catch block.
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries - 1) {
                const waitTime = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
                console.log(`Mô tả ảnh thất bại. Thử lại sau ${Math.ceil(waitTime/1000)}s... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    throw lastError || new Error('Tất cả các lần thử mô tả ảnh đều thất bại');
}

/**
 * Analyzes an image to extract structured demographic data for photo restoration.
 * @param {string} imageData The image to analyze as a base64 data URL.
 * @returns {Promise<Partial<RestorationSettings>>} A promise that resolves to an object with demographic details.
 * @throws Will throw an error if all retry attempts fail.
 */
// FIX: Implement return value for the function and fix schema definition.
export async function analyzeImageForRestoration(imageData: string): Promise<Partial<RestorationSettings>> {
    // Use the custom key for helper functions if custom mode is selected
    const modelPreference = localStorage.getItem('haipix_model_preference');
    let apiKey = process.env.API_KEY;
    if (modelPreference === 'custom') {
        const customKey = localStorage.getItem('haipix_custom_api_key');
        if (customKey) apiKey = customKey;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `Phân tích hình ảnh được cung cấp và trả về một đối tượng JSON chứa thông tin nhân khẩu học về (các) chủ thể chính.
- numberOfPeople: Chuỗi ước tính số lượng người (ví dụ: '1', '2', '3-5').
- gender: Giới tính cảm nhận của chủ thể chính ('male', 'female', hoặc 'unknown'). Nếu có nhiều người, hãy tập trung vào người nổi bật nhất hoặc mặc định là 'unknown'.
- ageRange: Một chuỗi khoảng tuổi ước tính (ví dụ: '20-30', '51+').
- smile: Nụ cười cảm nhận của chủ thể chính ('not_smiling', 'slight_smile', 'big_smile', hoặc 'unknown').
- isVietnamese: Một giá trị boolean cho biết liệu các chủ thể có vẻ là người Việt Nam hay không.
Chỉ trả về đối tượng JSON.`;
    
    const imagePart = {
        inlineData: {
            data: imageData.split(',')[1],
            mimeType: getMimeType(imageData),
        }
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            numberOfPeople: { type: Type.STRING, description: "Số lượng người trong ảnh" },
            // FIX: Removed invalid 'enum' property from schema definition.
            gender: { type: Type.STRING, description: "Giới tính của chủ thể chính" },
            ageRange: { type: Type.STRING, description: "Khoảng tuổi ước tính" },
            // FIX: Removed invalid 'enum' property from schema definition.
            smile: { type: Type.STRING, description: "Nụ cười cảm nhận" },
            isVietnamese: { type: Type.BOOLEAN, description: "Chủ thể có phải là người Việt Nam không" }
        },
        required: ['numberOfPeople', 'gender', 'ageRange', 'smile', 'isVietnamese']
    };

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });
            const jsonText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
             if (!jsonText) {
                throw new Error("API returned empty text for JSON response.");
            }
            return JSON.parse(jsonText);
        } catch (error) {
            // FIX: Safely handle unknown error type in catch block.
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries - 1) {
                const waitTime = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
                console.log(`Phân tích ảnh thất bại. Thử lại sau ${Math.ceil(waitTime/1000)}s... (${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    throw lastError || new Error('Tất cả các lần thử phân tích ảnh đều thất bại');
}

// FIX: Add all missing function exports to resolve import errors in other files.
export const generateIdPhoto = async (
    originalImage: string,
    settings: IdPhotoSettings,
    clothingPrompt: string
): Promise<string> => {
    const promptParts: string[] = [
        "Tạo một bức ảnh thẻ chân dung chuyên nghiệp, chất lượng cao từ ảnh gốc.",
        `Nền ảnh phải là một màu ${settings.background === 'white' ? 'trắng' : settings.background === 'blue' ? 'xanh dương' : 'ghi xám'} trơn và đồng nhất.`,
        "Chủ thể phải nhìn thẳng vào máy ảnh, biểu cảm trung tính hoặc cười mỉm nhẹ nếu được yêu cầu.",
    ];

    if (settings.customClothingImage) {
        promptParts.push('Thay thế trang phục của chủ thể bằng trang phục từ ảnh tham chiếu thứ hai một cách chính xác và tự nhiên.');
    } else if (clothingPrompt) {
        promptParts.push(`Trang phục: ${clothingPrompt}.`);
    } else {
        promptParts.push('Giữ nguyên trang phục gốc của chủ thể.');
    }

    if (settings.hairStyle && settings.hairStyle !== 'original') {
        const hairPrompts: Record<string, string> = {
            'auto': 'Tự động tạo một kiểu tóc gọn gàng, chuyên nghiệp, phù hợp với ảnh thẻ.',
            'shoulder_front': 'Tóc được để gọn gàng phía trước vai.',
            'shoulder_back': 'Tóc được vuốt gọn ra sau vai.',
            'ponytail': 'Tóc được buộc kiểu đuôi ngựa gọn gàng.',
            'long_straight_smooth': 'Tóc dài, duỗi thẳng và mượt mà.',
            'slicked_back': 'Tóc được vuốt ngược ra sau một cách lịch lãm.',
            'neat_male': 'Một kiểu tóc nam ngắn, gọn gàng và chuyên nghiệp.',
            'tied_back': 'Tóc được buộc lại gọn gàng, để lộ tai.',
            'loose_waves': 'Tóc xoăn sóng lơi nhẹ nhàng nhưng vẫn gọn gàng.',
            'straight_smooth': 'Tóc thẳng và mượt.',
            'low_bun': 'Tóc được búi thấp một cách thanh lịch.',
            'bangs': 'Tóc mái được cắt và tạo kiểu gọn gàng, không che mắt.',
            'thicken': 'Làm cho mái tóc trông dày và đầy đặn hơn một cách tự nhiên.',
        };
        promptParts.push(hairPrompts[settings.hairStyle] || '');
    } else if(settings.preserveHairStyle) {
         promptParts.push('Giữ nguyên tuyệt đối kiểu tóc và hình dáng tóc gốc.');
    }

    if (settings.smoothSkin) promptParts.push('Làm mịn da một cách tự nhiên, loại bỏ các khuyết điểm nhỏ nhưng vẫn giữ lại cấu trúc da.');
    if (settings.slightSmile) promptParts.push('Thêm một nụ cười mỉm nhẹ nhàng và tự nhiên.');
    if (settings.customPrompt) promptParts.push(`Yêu cầu bổ sung: ${settings.customPrompt}.`);
    
    if (settings.preserveFaceShape) {
        promptParts.push('Giữ nguyên hoàn toàn hình dáng khuôn mặt, cấu trúc xương và các đường nét chính.');
    }
    if (settings.preserveFaceDetails) {
        promptParts.push('Bảo toàn các chi tiết nhận dạng độc nhất trên khuôn mặt như nốt ruồi, sẹo nhỏ.');
    }
    if (settings.usePreservationPrompt && settings.preservationPrompt) {
        promptParts.push(`QUAN TRỌNG: ${settings.preservationPrompt}`);
    }

    const finalPrompt = promptParts.filter(p => p).join(' ');
    const additionalImages = settings.customClothingImage ? [settings.customClothingImage] : [];
    return callGeminiAPI(finalPrompt, originalImage, additionalImages);
};

export const restoreImage = async (
    originalImage: string,
    settings: Omit<RestorationSettings, 'numberOfResults'>
): Promise<string> => {
    const promptParts: string[] = [];
    if (settings.advancedPrompt) {
        promptParts.push(settings.advancedPrompt);
    } else {
        promptParts.push('Phục chế bức ảnh cũ này. Cải thiện chất lượng, làm rõ nét, và sửa chữa mọi hư hỏng như vết trầy xước, phai màu, hoặc vết ố.');
    }

    if (settings.colorize) promptParts.push('Tô màu cho ảnh một cách tự nhiên và chân thực, phù hợp với thời đại của bức ảnh.');
    if (settings.sharpenBackground) promptParts.push('Làm rõ nét cả chủ thể và hậu cảnh.');
    if (settings.highQuality) promptParts.push('Nâng cấp ảnh lên chất lượng cao nhất có thể, tăng cường chi tiết và kết cấu.');
    if (settings.isVietnamese) promptParts.push('Lưu ý rằng chủ thể là người Việt Nam để đảm bảo các đặc điểm khuôn mặt được tái tạo chính xác.');
    if (settings.clothingPrompt) promptParts.push(`Thay đổi trang phục thành: ${settings.clothingPrompt}.`);
    if(settings.background !== 'auto') {
        promptParts.push(`Thay đổi nền thành màu ${settings.background === 'white' ? 'trắng' : settings.background === 'blue' ? 'xanh' : 'ghi'} trơn.`);
    }

    const finalPrompt = promptParts.join(' ');
    return callGeminiAPI(finalPrompt, originalImage);
};

export const changeBackground = async (
    originalImage: string,
    settings: Omit<BackgroundSettings, 'numImages'>
): Promise<string> => {
    let prompt = `QUAN TRỌNG: Giữ nguyên tuyệt đối chủ thể trong ảnh gốc (người, vật thể), bao gồm tư thế, biểu cảm, quần áo, ánh sáng trên chủ thể và bố cục tổng thể. Chỉ thay đổi phần nền phía sau chủ thể. `;
    
    if (settings.referenceImage) {
        prompt += `Sử dụng nền từ ảnh tham chiếu. `;
    }
    prompt += `Mô tả nền mới: ${settings.prompt}. `;
    
    if (settings.lightingEffects && settings.lightingEffects.length > 0) {
        prompt += `Thêm các hiệu ứng ánh sáng sau: ${settings.lightingEffects.join(', ')}. `;
    }
    if(settings.lensBlur > 0) {
        const apertureMap = ['f/16', 'f/11', 'f/8', 'f/5.6', 'f/4', 'f/3.5', 'f/2.8', 'f/2.0', 'f/1.8', 'f/1.4', 'f/1.2'];
        prompt += `Mô phỏng hiệu ứng xóa phông của ống kính ở khẩu độ khoảng ${apertureMap[settings.lensBlur]}. `
    }
    
    prompt += `Negative prompt: ${settings.negativePrompt}.`;

    const additionalImages = settings.referenceImage ? [settings.referenceImage] : [];
    return callGeminiAPI(prompt, originalImage, additionalImages);
};

export const changeClothing = async (
    originalImage: string,
    settings: Omit<ClothingChangeSettings, 'numImages'>
): Promise<string> => {
    let prompt = `Giữ nguyên hoàn toàn khuôn mặt, kiểu tóc, tư thế và hậu cảnh của người trong ảnh. Chỉ thay đổi trang phục của họ. `;
    if (settings.referenceImage) {
        prompt += `Sử dụng trang phục từ ảnh tham chiếu. `;
    }
    if (settings.prompt) {
        prompt += `Mô tả trang phục mới: ${settings.prompt}. `;
    }
    if (settings.color) {
        prompt += `Màu chủ đạo của trang phục là ${settings.color}.`;
    }

    const additionalImages = settings.referenceImage ? [settings.referenceImage] : [];
    return callGeminiAPI(prompt, originalImage, additionalImages);
};

export const generatePosedImage = async (
    originalImage: string,
    posePrompt: string,
    faceReferenceImage?: string | null
): Promise<string> => {
    let prompt: string;
    const additionalImages: string[] = [];

    if (faceReferenceImage) {
        prompt = `Sử dụng khuôn mặt từ ảnh tham chiếu và cơ thể từ ảnh gốc. Thay đổi tư thế của người đó thành: "${posePrompt}". Giữ nguyên bối cảnh từ ảnh gốc nếu có thể.`;
        additionalImages.push(faceReferenceImage);
    } else {
        prompt = `Giữ nguyên khuôn mặt, quần áo và bối cảnh của người trong ảnh gốc. Chỉ thay đổi tư thế của họ thành: "${posePrompt}".`;
    }
    
    return callGeminiAPI(prompt, originalImage, additionalImages);
};

export const generateAiEdit = async (
    originalImage: string,
    settings: Omit<AiEditorSettings, 'numImages'>
): Promise<string> => {
    let prompt = settings.prompt;
    const additionalImages = settings.assistantImage ? [settings.assistantImage] : [];
    if (settings.assistantImage) {
        prompt += `\nSử dụng hình ảnh tham chiếu để lấy cảm hứng cho ${settings.assistantMode === 'background' ? 'bối cảnh' : 'trang phục'}.`;
    }
    return callGeminiAPI(prompt, originalImage, additionalImages);
};

export const changeHairStyle = async (
    originalImage: string,
    settings: Omit<HairStyleSettings, 'numImages'>
): Promise<string> => {
    const prompt = `Giữ nguyên hoàn toàn khuôn mặt, quần áo, tư thế và hậu cảnh. Chỉ thay đổi kiểu tóc của người trong ảnh thành: "${settings.prompt}". Giới tính của người đó là ${settings.gender === 'male' ? 'nam' : 'nữ'}.`;
    return callGeminiAPI(prompt, originalImage);
};

export const generateBabyConceptImage = async (
    originalImage: string,
    settings: Omit<BabyConceptSettings, 'numImages'>
): Promise<string> => {
    if (!settings.selectedConceptPrompt) {
        throw new Error("Vui lòng chọn một concept.");
    }
    return callGeminiAPI(settings.selectedConceptPrompt, originalImage);
};

export const generateVideo = async (
    originalImage: string,
    settings: VideoMarketingSettings,
    t: Translator,
    onProgress: (message: string) => void
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        onProgress(t('video_progress_analyzing'));
        let operation = await ai.models.generateVideos({
            // FIX: Updated model name and added missing config parameters as per guidelines.
            model: 'veo-3.1-fast-generate-preview',
            prompt: settings.prompt,
            image: {
                imageBytes: originalImage.split(',')[1],
                mimeType: getMimeType(originalImage),
            },
            config: {
                numberOfVideos: 1,
                aspectRatio: settings.aspectRatio,
                resolution: '720p',
            }
        });

        onProgress(t('video_progress_starting'));

        const progressMessages = [
            t('video_progress_thinking'),
            t('video_progress_rendering'),
            t('video_progress_assembling'),
            t('video_progress_finalizing'),
        ];
        let messageIndex = 0;

        while (!operation.done) {
            onProgress(progressMessages[messageIndex % progressMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        onProgress(t('video_progress_downloading'));

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            const safetyError = operation.error?.message;
            if (safetyError && /sensitive/i.test(safetyError)) {
                 throw new Error('error_sensitive_prompt');
            }
            throw new Error('Không thể tạo video hoặc không có link tải về.');
        }

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Tải video thất bại: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch(e) {
        if(e instanceof Error && e.message.includes('SAFETY')) {
            throw new Error('error_sensitive_prompt');
        }
        throw e;
    }
};

export const correctFacialSymmetry = async (
    originalImage: string,
    settings: SymmetrySettings
): Promise<string> => {
    const activeAdjustments: string[] = [];
    for (const [key, value] of Object.entries(settings.adjustments)) {
        if (value.enabled) {
            activeAdjustments.push(`${key} với cường độ ${value.intensity}%`);
        }
    }

    if (activeAdjustments.length === 0) {
        return originalImage; 
    }
    
    const prompt = `Chỉnh sửa đối xứng khuôn mặt trên ảnh này một cách tinh tế. Áp dụng các điều chỉnh sau: ${activeAdjustments.join(', ')}. Giữ các chi tiết khác của ảnh không thay đổi, bảo toàn nhận dạng của người trong ảnh.`;
    return callGeminiAPI(prompt, originalImage);
};

export const changeImageLighting = async (
    originalImage: string,
    lightingPrompt: string
): Promise<string> => {
    const prompt = `Giữ nguyên hoàn toàn chủ thể, quần áo, và bối cảnh. Chỉ thay đổi và tái tạo ánh sáng của bức ảnh theo mô tả sau: "${lightingPrompt}".`;
    return callGeminiAPI(prompt, originalImage);
};