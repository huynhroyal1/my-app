/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// General types
export type Theme = 'light' | 'dark';
export type PrimaryColor = 'red' | 'green' | 'yellow' | 'brown';
export type Translator = (key: string, params?: Record<string, string>) => string;

// Settings for ID Photo feature
export interface IdPhotoSettings {
    background: 'white' | 'blue' | 'gray';
    clothingPrompts: string[];
    customClothingImage?: string | null;
    customPrompt: string;
    preserveFaceDetails: boolean;
    smoothSkin: boolean;
    slightSmile: boolean;
    hairStyle: string;
    numImages: number;
    keepOriginalLayout: boolean;
    keepOriginalRatio: boolean;
    preserveHairStyle: boolean;
    preserveFaceShape: boolean;
    usePreservationPrompt: boolean;
    preservationPrompt: string;
}

// Settings for Restoration feature
export interface RestorationSettings {
    background: 'auto' | 'white' | 'blue' | 'gray';
    colorize: boolean;
    sharpenBackground: boolean;
    highQuality: boolean;
    isVietnamese: boolean;
    numberOfPeople: string;
    gender: 'unknown' | 'male' | 'female';
    ageRange: string;
    smile: 'unknown' | 'not_smiling' | 'slight_smile' | 'big_smile';
    clothingPrompt: string;
    advancedPrompt: string;
    numberOfResults: number;
}


// Settings for Background feature
export interface BackgroundSettings {
    prompt: string;
    negativePrompt: string;
    referenceImage: string | null;
    keepPose: boolean;
    keepComposition: boolean;
    keepFocalLength: boolean;
    keepAspectRatio: boolean;
    lightingEffects: string[];
    numImages: number;
    lensBlur: number;
}

// Settings for Clothing Change feature
export interface ClothingChangeSettings {
    prompt: string;
    referenceImage: string | null;
    numImages: number;
    color?: 'red' | 'black' | 'white' | null;
}

// Settings for Hair Style Change feature
export interface HairStyleSettings {
    prompt: string;
    gender: 'male' | 'female';
    numImages: number;
    color?: string | null;
}

// Settings for Posing Studio feature
export interface PosingStudioSettings {
    faceReferenceImage: string | null;
    selectedPoses: string[]; // Prompts from predefined options
    customPosePrompts: string[]; // Prompts from user text areas
    numImages: number;
}

// Settings for AI Editor feature
export interface AiEditorSettings {
    prompt: string;
    assistantImage: string | null;
    assistantMode: 'background' | 'clothing';
    numImages: number;
}

// Settings for Baby Concept feature
export interface BabyConceptSettings {
    selectedConceptPrompt: string | null;
    numImages: number;
    gender: 'boy' | 'girl';
}

// Settings for Video Marketing feature
export interface VideoMarketingSettings {
    prompt: string;
    aspectRatio: '9:16' | '16:9' | '1:1';
}

// FIX: Add missing type definitions for new features
// Settings for Facial Symmetry feature
export interface SymmetryAdjustment {
    enabled: boolean;
    intensity: number;
}

export interface SymmetrySettings {
    adjustments: Record<string, SymmetryAdjustment>;
}

// Settings for Lighting feature
export interface LightingSettings {
    selectedStyles: string[];
    customPrompt: string;
}

// Settings for Mockup feature
export interface MockupSettings {
    productImage: string | null;
    characterImage: string | null;
    characterPrompt: string;
    scenePrompt: string;
}

// Settings for Trend Creator feature
export interface TrendCreatorSettings {
    subjectImage: string | null;
    selectedTrends: string[];
    prompt: string;
    numImages: number;
    shopName: string;
    sceneDescription: string;
}

// Props for common components
export interface CommonSettingsPanelProps {
    onGenerate: () => void;
    generating: boolean;
    hasImage: boolean;
    buttonText?: string;
    onBackToHome: () => void;
    onChooseAnotherImage?: () => void;
    onEnterFullscreen?: () => void;
    t: Translator;
    language: string;
    setLanguage: (lang: string) => void;
}

export interface ImageItem {
    id: number;
    file: File;
    original: string;
    generated: string | null;
    // FIX: Added 'analyzing' status for the auto-analysis step in batch restoration.
    status: 'pending' | 'processing' | 'done' | 'error' | 'analyzing';
    generatingProgress?: string | null; // For video polling status
    selected?: boolean;
    settings?: RestorationSettings | null;
}

export interface EditorProps {
    initialImage: string | null;
    onChooseAnotherImage: () => void;
    onBackToHome: () => void;
    onImageUpdate: (dataUrl: string) => void;
    t: Translator;
    language: string;
    setLanguage: (lang: string) => void;
}

export interface BatchEditorProps extends EditorProps {
    initialFiles?: FileList | null;
}