/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { h, FunctionalComponent } from 'preact';
import { useState, useMemo, useEffect, useCallback, StateUpdater, useRef } from 'preact/hooks';
import htm from 'htm';
import type { TargetedEvent } from 'preact/compat';

import {
    IdPhotoSettings,
    RestorationSettings,
    BackgroundSettings,
    ClothingChangeSettings,
    PosingStudioSettings,
    AiEditorSettings,
    TrendCreatorSettings,
    ImageItem,
    HairStyleSettings,
    BabyConceptSettings,
    EditorProps,
    BatchEditorProps,
    Translator,
    VideoMarketingSettings,
} from './types';
import { ID_PHOTO_CLOTHING_PRESETS, PREDEFINED_TRENDS } from './constants';
import {
    Loader,
    ImageUploader,
    ImageComparator,
    DownloadIcon,
    RegenerateIcon,
    CompareIcon,
    Lightbox,
    UploadIcon,
    DeleteIcon,
    SliderIcon,
    FullScreenIcon,
    AdjustIcon,
    ImageAdjustmentsPanel,
    ArrowForwardIcon,
    KeyboardIcon,
    HotkeyInfoPanel,
    SideBySideIcon,
    CropIcon,
    CropTool,
    CloseIcon,
    ActionToast,
} from './components';
import {
    IdPhotoSettingsPanel,
    RestorationSettingsPanel,
    BackgroundSettingsPanel,
    ClothingChangeSettingsPanel,
    PosingStudioSettingsPanel,
    AiEditorSettingsPanel,
    TrendCreatorSettingsPanel,
    HairStyleSettingsPanel,
    BabyConceptSettingsPanel,
    VideoMarketingSettingsPanel,
} from './featurePanels';
import {
    generateIdPhoto,
    restoreImage,
    changeBackground,
    changeClothing,
    generatePosedImage,
    generateAiEdit,
    callGeminiAPI,
    changeHairStyle,
    generateBabyConceptImage,
    analyzeImageForRestoration,
    describeImageForPrompt,
    generateVideo,
} from './api';

const html = htm.bind(h);

function handleApiError(error: unknown, t: Translator): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle specific, translatable error keys from api.ts
    if (errorMessage.startsWith('error_api_text_response:')) {
        const aiText = errorMessage.substring('error_api_text_response:'.length);
        return t('error_api_text_response_details', { details: aiText });
    }
    if (errorMessage === 'error_api_no_image_response') {
        return t('error_api_no_image_response');
    }
    if (errorMessage === 'error_api_retries_failed') {
        return t('error_api_retries_failed');
    }

    // Handle standard error keys
    if (errorMessage === 'API_KEY_NOT_FOUND') {
        return t('error_api_key_not_found');
    }
    if (errorMessage === 'INVALID_API_KEY_FORMAT') {
        return t('error_invalid_api_key_format');
    }
    if (/rate limit|429|resource exhausted/i.test(errorMessage) || /giới hạn/i.test(errorMessage)) {
        return t('rateLimitError');
    }
    if (errorMessage === 'error_sensitive_prompt') {
        return t('error_sensitive_prompt');
    }

    // Try to parse JSON errors from the API to show a cleaner message
    try {
        const errorObj = JSON.parse(errorMessage);
        if (errorObj && errorObj.error && errorObj.error.message) {
            if (errorObj.error.code === 500 || /internal error/i.test(errorObj.error.message)) {
                return t('error_gemini_server_error');
            }
            // For other structured errors, show the message cleanly
            return `${t('errorOccurred')}: ${errorObj.error.message}`;
        }
    } catch (e) {
        // Not a JSON string, proceed to default handling
    }

    // Fallback for other errors
    return `${t('errorOccurred')}: ${errorMessage}`;
}


interface SingleImageEditorProps<T> extends EditorProps {
    SettingsPanel: FunctionalComponent<{
        settings: T;
        setSettings: (updater: (s: T) => T) => void;
        onGenerate: () => void;
        generating: boolean;
        hasImage: boolean;
        buttonText?: string;
        onBackToHome: () => void;
        onChooseAnotherImage?: () => void;
        onEnterFullscreen?: () => void;
        currentImage?: string | null;
        isBatch?: boolean;
        t: Translator;
        language: string;
        setLanguage: (lang: string) => void;
    }>;
    initialSettings: T;
    onGenerate: (originalImage: string, settings: T) => Promise<string[]>;
    loaderTextKey: string;
    actionButtonTextKey: string;
    downloadFilename: string;
    keepPanelOpenOnGenerate?: boolean;
    cropAspectRatios?: { label: string; value: number }[];
}

const SingleImageEditor = <T extends {}>({
    initialImage,
    onChooseAnotherImage,
    onBackToHome,
    SettingsPanel,
    initialSettings,
    onGenerate,
    loaderTextKey,
    actionButtonTextKey,
    downloadFilename,
    keepPanelOpenOnGenerate = false,
    onImageUpdate,
    cropAspectRatios,
    t,
    language,
    setLanguage,
}: SingleImageEditorProps<T>) => {
    const [originalImage, setOriginalImage] = useState<string | null>(initialImage);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState<'original' | 'generated'>('generated');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isSliderView, setIsSliderView] = useState(false);
    const [isSideBySideView, setIsSideBySideView] = useState(false);
    const [settings, setSettings] = useState<T>(initialSettings);
    const [isDragging, setIsDragging] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [isCropping, setIsCropping] = useState(false);

    const defaultAdjustments = { brightness: 100, contrast: 100, saturate: 100, sepia: 0, 'hue-rotate': 0 };
    const [adjustments, setAdjustments] = useState(defaultAdjustments);
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const settingsRef = useRef(settings);
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const enterFullscreen = useCallback(() => {}, []);

    useEffect(() => {
        setOriginalImage(initialImage);
        setGeneratedImages([]);
        setSelectedGeneratedImage(null);
        setError('');
        setIsSliderView(false);
        setIsSideBySideView(false);
        setIsEditing(false);
    }, [initialImage]);

    useEffect(() => {
        if (isEditing) {
            setIsEditing(false);
        }
        setAdjustments(defaultAdjustments);
    }, [selectedGeneratedImage]);

    const handleGenerate = useCallback(async () => {
        if (!originalImage) return;
        setGenerating(true);
        setError('');
        setGeneratedImages([]);
        setSelectedGeneratedImage(null);
        setIsSliderView(false);
        setIsSideBySideView(false);
        setIsEditing(false);

        try {
            const results = await onGenerate(originalImage, settingsRef.current);
            if (results.length > 0) {
                setGeneratedImages(results);
                setSelectedGeneratedImage(results[0]);
                setView('generated');
            } else {
                setError(t('imageGenFailed'));
            }
        } catch (err) {
            setError(handleApiError(err, t));
        } finally {
            setGenerating(false);
        }
    }, [originalImage, onGenerate, keepPanelOpenOnGenerate, t]);
    
    const toggleSliderView = () => {
        setIsSliderView(v => {
            const newState = !v;
            if (newState) setIsSideBySideView(false);
            return newState;
        });
    };
    const toggleSideBySideView = () => {
        setIsSideBySideView(v => {
            const newState = !v;
            if (newState) setIsSliderView(false);
            return newState;
        });
    };

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditing || isCropping) return;
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

            if (e.key === 'Enter' && !generating && originalImage) {
                e.preventDefault();
                handleGenerate();
            }
            if (e.code === 'Space' && selectedGeneratedImage && !isSliderView && !isSideBySideView) {
                e.preventDefault();
                setView(v => v === 'original' ? 'generated' : 'original');
            }
            if (e.key === 'Escape') {
                if (lightboxImage) setLightboxImage(null);
            }
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                if (generatedImages.length > 1) {
                    e.preventDefault();
                    const currentIndex = generatedImages.findIndex(img => img === selectedGeneratedImage);
                    
                    let nextIndex;
                    if (e.key === 'ArrowRight') {
                        nextIndex = (currentIndex + 1) % generatedImages.length;
                    } else { 
                        if (currentIndex === -1) {
                            nextIndex = generatedImages.length - 1;
                        } else {
                            nextIndex = (currentIndex - 1 + generatedImages.length) % generatedImages.length;
                        }
                    }
                    setSelectedGeneratedImage(generatedImages[nextIndex]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedGeneratedImage, 
        lightboxImage, 
        generating, 
        originalImage, 
        handleGenerate, 
        isSliderView,
        isSideBySideView, 
        isEditing,
        isCropping,
        generatedImages
    ]);
    
    const fileToDataUrl = (file: File, callback: (dataUrl: string) => void) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) {
                callback(loadEvent.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const downloadImage = (dataUrl: string | null) => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            fileToDataUrl(file, onImageUpdate);
        }
    };

    const handleSaveEdit = useCallback(() => {
        if (!selectedGeneratedImage) return;
        setIsSavingEdit(true);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%) sepia(${adjustments.sepia}%) hue-rotate(${adjustments['hue-rotate']}deg)`;
                ctx.drawImage(img, 0, 0);
                const newImageUrl = canvas.toDataURL('image/png');
                
                const index = generatedImages.findIndex(url => url === selectedGeneratedImage);
                if (index !== -1) {
                    const newGeneratedImages = [...generatedImages];
                    newGeneratedImages[index] = newImageUrl;
                    setGeneratedImages(newGeneratedImages);
                }
                setSelectedGeneratedImage(newImageUrl);
                setIsEditing(false);
            }
            setIsSavingEdit(false);
        };
        img.onerror = () => {
            console.error("Failed to load image for canvas processing.");
            alert(t('saveEditedImageError'));
            setIsSavingEdit(false);
        };
        img.src = selectedGeneratedImage;
    }, [selectedGeneratedImage, adjustments, generatedImages, t]);

    const filterStyle = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%) sepia(${adjustments.sepia}%) hue-rotate(${adjustments['hue-rotate']}deg)`;

    return html`
        ${lightboxImage && originalImage && html`
            <${Lightbox} 
                t=${t}
                originalUrl=${originalImage} 
                generatedUrl=${lightboxImage}
                onClose=${() => setLightboxImage(null)}
                toggleView=${true}
                caption=${t('detailedComparison')}
            />
        `}
        ${isCropping && originalImage && cropAspectRatios && html`
            <${CropTool} 
                t=${t}
                imageUrl=${originalImage} 
                onCrop=${(croppedDataUrl: string) => {
                    setOriginalImage(croppedDataUrl);
                    setGeneratedImages([]);
                    setSelectedGeneratedImage(null);
                    setIsCropping(false);
                }}
                onCancel=${() => setIsCropping(false)}
                aspectRatios=${cropAspectRatios}
            />
        `}
        <div class="editor-layout ${!isPanelVisible ? 'panel-hidden' : ''}">
            <div 
                class="image-panel droppable ${isDragging ? 'drag-over' : ''}"
                onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
                onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)}
                onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
                onDrop=${handleDrop}
            >
                ${originalImage && isDragging && html`
                    <div class="drop-overlay">
                        <div class="drop-overlay-content">
                            <${UploadIcon} />
                            <span>${t('drop_to_replace')}</span>
                        </div>
                    </div>
                `}
                
                ${isEditing && html`
                    <${ImageAdjustmentsPanel}
                        t=${t}
                        adjustments=${adjustments}
                        onAdjust=${(filter, value) => setAdjustments(prev => ({ ...prev, [filter]: parseInt(value, 10) }))}
                        onSave=${handleSaveEdit}
                        onCancel=${() => setIsEditing(false)}
                        onReset=${() => setAdjustments(defaultAdjustments)}
                        isSaving=${isSavingEdit}
                    />
                `}

                ${generating && html`<${Loader} text=${t(loaderTextKey)} />`}
                ${!originalImage ? html`
                    <${ImageUploader} onImageUpload=${onImageUpdate} t=${t} />
                ` : html`
                    <${ImageComparator} 
                        t=${t}
                        original=${originalImage} 
                        generated=${selectedGeneratedImage} 
                        view=${view} 
                        sliderMode=${isSliderView}
                        sideBySideMode=${isSideBySideView}
                        onClick=${() => selectedGeneratedImage && !isEditing && !isSliderView && !isSideBySideView && setLightboxImage(selectedGeneratedImage)} 
                        style=${{ filter: isEditing ? filterStyle : 'none' }}
                    />
                     ${generatedImages.length > 1 && html`
                        <div class="thumbnail-gallery">
                            ${generatedImages.map((url, index) => html`
                                <div class="thumbnail-item">
                                    <img 
                                        src=${url} 
                                        alt="${t('generatedAlt', { index: (index + 1).toString() })}" 
                                        class=${selectedGeneratedImage === url ? 'active' : ''}
                                        onClick=${() => setSelectedGeneratedImage(url)}
                                    />
                                </div>
                            `)}
                        </div>
                    `}
                    ${error && html`<div class="error-message">${error}</div>`}
                    <div class="actions">
                        <button class="btn upload-another-btn" onClick=${onChooseAnotherImage} disabled=${generating}>
                            <${UploadIcon} />
                            <span>${t('uploadNew')}</span>
                        </button>
                        ${cropAspectRatios && html`
                            <button class="btn" onClick=${() => setIsCropping(true)} disabled=${generating || !originalImage}>
                                <${CropIcon} />
                                <span>${t('cropImage')}</span>
                            </button>
                        `}
                        <button class="btn compare-btn" onClick=${() => setView(v => v === 'original' ? 'generated' : 'original')} disabled=${!selectedGeneratedImage || isSliderView || isSideBySideView}>
                            <${CompareIcon} />
                            <span>${t('compare')}</span>
                        </button>
                         <button class="btn slider-btn ${isSliderView ? 'active' : ''}" onClick=${toggleSliderView} disabled=${!selectedGeneratedImage}>
                            <${SliderIcon} />
                            <span>${t('sliderMode')}</span>
                        </button>
                        <button class="btn side-by-side-btn ${isSideBySideView ? 'active' : ''}" onClick=${toggleSideBySideView} disabled=${!selectedGeneratedImage}>
                            <${SideBySideIcon} />
                            <span>${t('sideBySide')}</span>
                        </button>
                        <button class="btn" onClick=${() => setIsEditing(true)} disabled=${!selectedGeneratedImage || generating}>
                            <${AdjustIcon} />
                            <span>${t('adjust')}</span>
                        </button>
                        <button class="btn" onClick=${handleGenerate} disabled=${generating}>
                            <${RegenerateIcon} />
                            <span>${t('regenerate')}</span>
                        </button>
                        <button class="btn" onClick=${() => downloadImage(selectedGeneratedImage)} disabled=${!selectedGeneratedImage}>
                            <${DownloadIcon} />
                            <span>${t('download')}</span>
                        </button>
                        <button class="btn" onClick=${() => { if (selectedGeneratedImage) { onImageUpdate(selectedGeneratedImage); onBackToHome(); } }} disabled=${!selectedGeneratedImage}>
                            <${ArrowForwardIcon} />
                            <span>${t('useThisImage')}</span>
                        </button>
                    </div>
                `}
            </div>
             <${SettingsPanel} 
                settings=${settings} 
                setSettings=${(updater) => setSettings(updater)} 
                onGenerate=${handleGenerate} 
                generating=${generating} 
                hasImage=${!!originalImage} 
                buttonText=${t(actionButtonTextKey)} 
                onBackToHome=${onBackToHome}
                onChooseAnotherImage=${onChooseAnotherImage}
                onEnterFullscreen=${enterFullscreen}
                currentImage=${originalImage}
                t=${t}
                language=${language}
                setLanguage=${setLanguage}
            />
        </div>
    `;
};

// --- Feature Implementations ---

const CheckmarkIcon = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

const PRESERVATION_PROMPT_DEFAULT = `Giữ nguyên khuôn mặt, mắt, mũi, miệng và các chi tiết da gốc một cách chính xác.
Giữ nguyên hình dáng tóc, đường chân tóc và kiểu tóc ban đầu mà không có bất kỳ thay đổi nào.
Duy trì bố cục, khung hình, góc máy, vị trí, kích thước và góc nhìn của chủ thể ban đầu.`;

const SingleIdPhotoEditor: FunctionalComponent<EditorProps> = (props) => {
    const initialSettings: IdPhotoSettings = {
        background: 'white',
        clothingPrompts: [ID_PHOTO_CLOTHING_PRESETS[0].prompt],
        customClothingImage: null,
        customPrompt: '',
        preserveFaceDetails: true,
        smoothSkin: true,
        slightSmile: false,
        hairStyle: 'original',
        numImages: 1,
        keepOriginalLayout: true,
        keepOriginalRatio: true,
        preserveHairStyle: true,
        preserveFaceShape: true,
        usePreservationPrompt: true,
        preservationPrompt: PRESERVATION_PROMPT_DEFAULT,
    };

    const handleGenerate = async (originalImage: string, settings: IdPhotoSettings): Promise<string[]> => {
        let clothingChoices: string[];

        if (settings.customClothingImage) {
            clothingChoices = ['use_custom_image_placeholder'];
        } else {
            clothingChoices = settings.clothingPrompts.length > 0 ? settings.clothingPrompts : [''];
        }
        
        const allResults: string[] = [];
        for (const clothingPrompt of clothingChoices) {
            const promises = Array.from({ length: settings.numImages }, () => generateIdPhoto(originalImage, settings, clothingPrompt));
            const results = await Promise.all(promises);
            allResults.push(...results);
        }
        return allResults;
    };

    return html`<${SingleImageEditor}
        ...${props}
        SettingsPanel=${IdPhotoSettingsPanel}
        initialSettings=${initialSettings}
        onGenerate=${handleGenerate}
        loaderTextKey="loader_id_photo"
        actionButtonTextKey="button_generate_photo"
        downloadFilename="id-photo.png"
        keepPanelOpenOnGenerate=${true}
        cropAspectRatios=${[{label: '3:4', value: 3/4}, {label: '2:3', value: 2/3}]}
    />`;
};

const BatchIdPhotoEditor: FunctionalComponent<BatchEditorProps> = (props) => {
    const { onBackToHome, initialFiles, t, language, setLanguage } = props;
    const [images, setImages] = useState<ImageItem[]>([]);
    const [settings, setSettings] = useState<IdPhotoSettings>({
        background: 'white',
        clothingPrompts: [ID_PHOTO_CLOTHING_PRESETS[0].prompt],
        customClothingImage: null,
        customPrompt: '',
        preserveFaceDetails: true,
        smoothSkin: true,
        slightSmile: false,
        hairStyle: 'original',
        numImages: 1,
        keepOriginalLayout: true,
        keepOriginalRatio: true,
        preserveHairStyle: true,
        preserveFaceShape: true,
        usePreservationPrompt: true,
        preservationPrompt: PRESERVATION_PROMPT_DEFAULT,
    });
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);
    const initialFilesProcessed = useRef(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        if (imageFiles.length > 0 && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                 console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }
        const newImages: ImageItem[] = imageFiles.map(file => ({
            id: Date.now() + Math.random(), file, original: URL.createObjectURL(file), generated: null, status: 'pending', selected: true
        }));
        setImages(current => [...current, ...newImages]);
    }, []);

    useEffect(() => {
        if (initialFiles && initialFiles.length > 0 && !initialFilesProcessed.current) {
            handleFiles(initialFiles);
            initialFilesProcessed.current = true;
        }
    }, [initialFiles, handleFiles]);
    
    const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const processQueue = async (tasks: ImageItem[], concurrency: number, processFn: (task: ImageItem) => Promise<void>) => {
        let completed = 0;
        setTotalTasks(tasks.length);
        setCompletedCount(0);
        const queue = [...tasks];
        const worker = async () => {
            while(queue.length > 0) {
                const task = queue.shift();
                if (task) {
                    await processFn(task);
                    completed++;
                    setCompletedCount(c => c + 1);
                    setProgress(Math.round((completed / tasks.length) * 100));
                    if (queue.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
        };
        await Promise.all(Array(concurrency).fill(null).map(() => worker()));
    };

    const handleBatchGenerate = useCallback(async () => {
        setProcessing(true);
        setProgress(0);
        setError('');
        const tasks = images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error'));
        setTotalTasks(tasks.length);
        
        const processTask = async (img: ImageItem) => {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'processing' } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const clothingPrompt = settings.clothingPrompts[0] || '';
                const result = await generateIdPhoto(originalDataUrl, settings, clothingPrompt);
                setImages(current => current.map(i => i.id === img.id ? { ...i, generated: result, status: 'done' } : i));
            } catch (err) {
                setError(handleApiError(err, t));
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
                throw err;
            }
        };
        
        try {
            await processQueue(tasks, 1, processTask);
        } catch (e) {
            console.error(t('batch_processing_stopped'), e);
        } finally {
            setProcessing(false);
        }
    }, [images, settings, t]);

    const regenerateImage = (id: number) => handleBatchGenerate();

    const deleteImage = (id: number) => setImages(current => current.filter(i => i.id !== id));
    const deleteAll = () => setImages([]);
    const toggleSelection = (id: number) => setImages(current => current.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
    const selectAll = () => setImages(current => current.map(img => ({ ...img, selected: true })));
    const deselectAll = () => setImages(current => current.map(img => ({ ...img, selected: false })));
    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ''; };
    const handleDragEvents = (e: DragEvent, dragging: boolean) => { e.preventDefault(); e.stopPropagation(); setIsDragging(dragging); };
    const handleDrop = (e: DragEvent) => { handleDragEvents(e, false); handleFiles(e.dataTransfer?.files || null); };
    const handleDownloadAll = () => {
        images.forEach((img) => {
            if (img.generated) {
                const link = document.createElement('a');
                link.href = img.generated;
                link.download = `${img.file.name.split('.')[0]}-id.png`;
                link.click();
            }
        });
    };

    const selectedForProcessingCount = useMemo(() => images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error')).length, [images]);
    const buttonText = selectedForProcessingCount > 0 ? t('button_generate_batch_id', {count: selectedForProcessingCount.toString()}) : t('button_select_to_generate_id');
    
    return html`
        ${lightboxImage && lightboxImage.generated && html`
            <${Lightbox}
                t=${t}
                originalUrl=${lightboxImage.original}
                generatedUrl=${lightboxImage.generated}
                onClose=${() => setLightboxImage(null)}
                caption=${t('detailedComparison')}
                toggleView=${true}
            />
        `}
        <div class="editor-layout batch-background-view ${!isPanelVisible ? 'panel-hidden' : ''}">
             <div class="image-panel droppable ${isDragging ? 'drag-over' : ''}" onDragOver=${(e: DragEvent) => handleDragEvents(e, true)} onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)} onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)} onDrop=${handleDrop}>
                <div style=${{width: '100%', display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem'}}>
                    <div class="actions" style=${{position: 'relative', bottom: 'auto', right: 'auto', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <button class="btn" onClick=${() => document.getElementById('batch-id-file-input')?.click()}><${UploadIcon} /> ${t('add_images')}</button>
                        <div style=${{display: 'flex', gap: '0.5rem'}}><button class="btn btn-secondary" onClick=${selectAll}>${t('select_all')}</button><button class="btn btn-secondary" onClick=${deselectAll}>${t('deselect_all')}</button><button class="btn btn-secondary" onClick=${deleteAll} disabled=${images.length === 0}>${t('delete_all')}</button></div>
                        <input type="file" id="batch-id-file-input" multiple accept="image/*" style=${{display: 'none'}} onChange=${handleFileChange} />
                        <button class="btn btn-primary" onClick=${handleDownloadAll} disabled=${images.every(img => !img.generated)}><${DownloadIcon} /> ${t('download_all')}</button>
                    </div>
                    ${processing && html`<div class="progress-container"><div class="progress-bar"><div class="progress-bar-inner" style=${{ width: `${progress}%` }}></div><span class="progress-label">${progress}%</span></div><span class="progress-counter">${completedCount} / ${totalTasks}</span></div>`}
                    ${error && html`<div class="error-message" style=${{marginTop: '1rem'}}>${error}</div>`}
                    <div class="batch-grid" style=${{ flex: 1, overflowY: 'auto', alignContent: 'flex-start' }}>
                        ${images.length === 0 ? html`
                            <div class="upload-placeholder" onClick=${() => document.getElementById('batch-id-file-input')?.click()} style=${{ gridColumn: '1 / -1', height: '100%', minHeight: '400px', alignSelf: 'stretch' }}>
                                <${UploadIcon} /><strong>${t('upload_multiple_prompt_title')}</strong><p>${t('upload_id_photo_prompt')}</p>
                            </div>`
                        : images.map(img => html`
                            <div class="batch-item ${img.selected ? 'selected' : ''} ${img.generated ? 'has-generated' : ''} ${img.status === 'error' ? 'error' : ''}">
                                <div class="selection-checkbox" onClick=${() => toggleSelection(img.id)}><div class="checkbox-visual"><${CheckmarkIcon} /></div></div>
                                <div class="image-comparator" style=${{ display: 'block' }} onClick=${() => img.generated && setLightboxImage(img)}>
                                    <div class="image-container ${img.generated ? 'has-result' : ''}">
                                        <img src=${img.generated || img.original} onMouseEnter=${(e: any) => { if (img.generated) e.target.src = img.original; }} onMouseLeave=${(e: any) => { if (img.generated) e.target.src = img.generated; }} />
                                        ${img.status === 'processing' && html`<div class="batch-item-status-overlay"><div class="spinner"></div><span>${t('processing')}</span></div>`}
                                        ${img.status === 'done' && html`<div class="batch-item-status-icon"><${CheckmarkIcon} /></div>`}
                                        ${img.status === 'error' && html`<div class="error-badge">${t('error')}</div>`}
                                    </div>
                                </div>
                                <div class="batch-item-actions">
                                    <button class="batch-item-btn" title=${t('regenerate')} onClick=${() => regenerateImage(img.id)}><${RegenerateIcon} /></button>
                                    <button class="batch-item-btn" title=${t('delete')} onClick=${() => deleteImage(img.id)}><${DeleteIcon} /></button>
                                </div>
                            </div>`
                        )}
                    </div>
                </div>
            </div>
            <${IdPhotoSettingsPanel} settings=${settings} setSettings=${setSettings} onGenerate=${handleBatchGenerate} generating=${processing} hasImage=${selectedForProcessingCount > 0} buttonText=${buttonText} isBatch=${true} onBackToHome=${onBackToHome} onChooseAnotherImage=${() => document.getElementById('batch-id-file-input')?.click()} t=${t} language=${language} setLanguage=${setLanguage} />
        </div>
    `;
};

export const IdPhotoApp: FunctionalComponent<EditorProps> = (props) => {
    const [activeTab, setActiveTab] = useState('single');
    const { t } = props;

    return html`
        <div style=${{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div class="page-tabs">
                <button class="page-tab ${activeTab === 'single' ? 'active' : ''}" onClick=${() => setActiveTab('single')}>${t('singlePhoto')}</button>
                <button class="page-tab ${activeTab === 'batch' ? 'active' : ''}" onClick=${() => setActiveTab('batch')}>${t('batchPhoto')}</button>
            </div>
            <div style=${{flex: 1, minHeight: 0}}>
                ${activeTab === 'single' ? html`<${SingleIdPhotoEditor} ...${props} />` : html`<${BatchIdPhotoEditor} ...${props} />`}
            </div>
        </div>
    `;
};

const SingleRestorationEditor: FunctionalComponent<EditorProps> = (props) => {
    const { initialImage, onChooseAnotherImage, onBackToHome, onImageUpdate, t, language, setLanguage } = props;

    const initialSettings: RestorationSettings = {
        background: 'auto',
        colorize: false,
        sharpenBackground: true,
        highQuality: false,
        isVietnamese: true,
        numberOfPeople: '',
        gender: 'unknown',
        ageRange: 'unknown',
        smile: 'unknown',
        clothingPrompt: '',
        advancedPrompt: '',
        numberOfResults: 1,
    };

    const [originalImage, setOriginalImage] = useState<string | null>(initialImage);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState<'original' | 'generated'>('generated');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isSliderView, setIsSliderView] = useState(false);
    const [isSideBySideView, setIsSideBySideView] = useState(false);
    const [settings, setSettings] = useState<RestorationSettings>(initialSettings);
    const [isDragging, setIsDragging] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [toastMessage, setToastMessage] = useState('');
    const [loaderText, setLoaderText] = useState(t('loader_analyzing'));

    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    
    useEffect(() => {
        const autoAnalyzeAndDescribe = async () => {
            if (!initialImage) return;

            setLoaderText(t('loader_analyzing'));
            setGenerating(true);
            setError('');
            try {
                const analysis = await analyzeImageForRestoration(initialImage);
                setSettings(s => ({ ...s, ...analysis }));

                const description = await describeImageForPrompt(initialImage, 'general', language);
                setSettings(s => ({ ...s, advancedPrompt: description }));
                
                setToastMessage(t('toast_analysis_complete_restore'));

            } catch (err) {
                setError(handleApiError(err, t));
            } finally {
                setGenerating(false);
            }
        };

        autoAnalyzeAndDescribe();
    }, [initialImage, t, language]);
    
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const handleGenerate = useCallback(async () => {
        if (!originalImage) return;
        setLoaderText(t('loader_restoration'));
        setGenerating(true);
        setError('');
        setGeneratedImages([]);
        setSelectedGeneratedImage(null);
        setIsSliderView(false);
        setIsSideBySideView(false);

        try {
            const { numberOfResults, ...apiSettings } = settingsRef.current;
            const promises = Array.from({ length: numberOfResults }, () => restoreImage(originalImage, apiSettings));
            const results = await Promise.all(promises);
            
            if (results.length > 0) {
                setGeneratedImages(results);
                setSelectedGeneratedImage(results[0]);
                setView('generated');
            } else {
                setError(t('imageGenFailed'));
            }
        } catch (err) {
            setError(handleApiError(err, t));
        } finally {
            setGenerating(false);
        }
    }, [originalImage, t]);

    const toggleSliderView = () => {
        setIsSliderView(v => {
            const newState = !v;
            if (newState) setIsSideBySideView(false);
            return newState;
        });
    };
    const toggleSideBySideView = () => {
        setIsSideBySideView(v => {
            const newState = !v;
            if (newState) setIsSliderView(false);
            return newState;
        });
    };

    useEffect(() => {
        setOriginalImage(initialImage);
        setGeneratedImages([]);
        setSelectedGeneratedImage(null);
        setError('');
        setIsSliderView(false);
        setIsSideBySideView(false);
    }, [initialImage]);

    const fileToDataUrl = (file: File, callback: (dataUrl: string) => void) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) callback(loadEvent.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            fileToDataUrl(file, onImageUpdate);
        }
    };
    
     const downloadImage = (dataUrl: string | null) => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'restored-photo.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return html`
        ${toastMessage && html`<div class="toast-notification">${toastMessage}</div>`}
        ${lightboxImage && originalImage && html`
            <${Lightbox} 
                t=${t}
                originalUrl=${originalImage} 
                generatedUrl=${lightboxImage}
                onClose=${() => setLightboxImage(null)}
                toggleView=${true}
                caption=${t('detailedComparison')}
            />
        `}
        <div class="editor-layout ${!isPanelVisible ? 'panel-hidden' : ''}">
            <div 
                class="image-panel droppable ${isDragging ? 'drag-over' : ''}"
                onDragOver=${(e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragEnter=${(e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave=${(e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop=${handleDrop}
            >
                ${generating && html`<${Loader} text=${loaderText} />`}
                ${!originalImage ? html`
                    <${ImageUploader} onImageUpload=${onImageUpdate} t=${t} />
                ` : html`
                    <${ImageComparator} 
                        t=${t}
                        original=${originalImage} 
                        generated=${selectedGeneratedImage} 
                        view=${view} 
                        sliderMode=${isSliderView}
                        sideBySideMode=${isSideBySideView}
                        onClick=${() => selectedGeneratedImage && !isSliderView && !isSideBySideView && setLightboxImage(selectedGeneratedImage)} 
                    />
                     ${generatedImages.length > 1 && html`
                        <div class="thumbnail-gallery">
                            ${generatedImages.map((url, index) => html`
                                <div class="thumbnail-item">
                                    <img 
                                        src=${url} 
                                        alt="${t('generatedAlt', { index: (index + 1).toString() })}" 
                                        class=${selectedGeneratedImage === url ? 'active' : ''}
                                        onClick=${() => setSelectedGeneratedImage(url)}
                                    />
                                </div>
                            `)}
                        </div>
                    `}
                    ${error && html`<div class="error-message">${error}</div>`}
                    <div class="actions">
                         <button class="btn upload-another-btn" onClick=${onChooseAnotherImage} disabled=${generating}>
                            <${UploadIcon} />
                            <span>${t('uploadNew')}</span>
                        </button>
                        <button class="btn compare-btn" onClick=${() => setView(v => v === 'original' ? 'generated' : 'original')} disabled=${!selectedGeneratedImage || isSliderView || isSideBySideView}>
                            <${CompareIcon} />
                            <span>${t('compare')}</span>
                        </button>
                         <button class="btn slider-btn ${isSliderView ? 'active' : ''}" onClick=${toggleSliderView} disabled=${!selectedGeneratedImage}>
                            <${SliderIcon} />
                            <span>${t('sliderMode')}</span>
                        </button>
                        <button class="btn side-by-side-btn ${isSideBySideView ? 'active' : ''}" onClick=${toggleSideBySideView} disabled=${!selectedGeneratedImage}>
                            <${SideBySideIcon} />
                            <span>${t('sideBySide')}</span>
                        </button>
                        <button class="btn" onClick=${handleGenerate} disabled=${generating}>
                            <${RegenerateIcon} />
                            <span>${t('regenerate')}</span>
                        </button>
                        <button class="btn" onClick=${() => downloadImage(selectedGeneratedImage)} disabled=${!selectedGeneratedImage}>
                            <${DownloadIcon} />
                            <span>${t('download')}</span>
                        </button>
                         <button class="btn" onClick=${() => { if (selectedGeneratedImage) { onImageUpdate(selectedGeneratedImage); onBackToHome(); } }} disabled=${!selectedGeneratedImage}>
                            <${ArrowForwardIcon} />
                            <span>${t('useThisImage')}</span>
                        </button>
                    </div>
                `}
            </div>
             <${RestorationSettingsPanel} 
                settings=${settings} 
                setSettings=${(updater) => setSettings(updater)} 
                onGenerate=${handleGenerate} 
                generating=${generating} 
                hasImage=${!!originalImage} 
                buttonText=${t('button_restore_photo_enter')}
                onBackToHome=${onBackToHome}
                onChooseAnotherImage=${onChooseAnotherImage}
                currentImage=${originalImage}
                t=${t}
                language=${language}
                setLanguage=${setLanguage}
            />
        </div>
    `;
}

const BatchRestorationEditor: FunctionalComponent<BatchEditorProps> = (props) => {
    const { onBackToHome, onChooseAnotherImage, t, language, setLanguage } = props;
    const [images, setImages] = useState<ImageItem[]>([]);
    const initialSettings: RestorationSettings = {
        background: 'auto',
        colorize: false,
        sharpenBackground: true,
        highQuality: false,
        isVietnamese: true,
        numberOfPeople: '',
        gender: 'unknown',
        ageRange: 'unknown',
        smile: 'unknown',
        clothingPrompt: '',
        advancedPrompt: '',
        numberOfResults: 1,
    };
    const [settings, setSettings] = useState<RestorationSettings>(initialSettings);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const autoAnalyzeImages = async (newImages: ImageItem[]) => {
        for (const img of newImages) {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'analyzing' } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const analysis = await analyzeImageForRestoration(originalDataUrl);
                const description = await describeImageForPrompt(originalDataUrl, 'general', language);
                const specificSettings: RestorationSettings = { ...initialSettings, ...analysis, advancedPrompt: description };
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'pending', settings: specificSettings } : i));
            } catch (err) {
                console.error(`Error auto-analyzing image ${img.id}:`, err);
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
            }
        }
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        if (files.length > 0 && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                 console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }
        const newImages: ImageItem[] = Array.from(files).map(file => ({
            id: Date.now() + Math.random(), file, original: URL.createObjectURL(file), generated: null, status: 'pending', selected: true
        }));
        setImages(current => [...current, ...newImages]);
        autoAnalyzeImages(newImages);
    };
    
    const processQueue = async (tasks: ImageItem[], concurrency: number, processFn: (task: ImageItem) => Promise<void>) => {
        let completed = 0;
        setTotalTasks(tasks.length);
        setCompletedCount(0);
        const queue = [...tasks];
        const worker = async () => {
            while(queue.length > 0) {
                const task = queue.shift();
                if (task) {
                    await processFn(task);
                    completed++;
                    setCompletedCount(c => c + 1);
                    setProgress(Math.round((completed / tasks.length) * 100));
                    if (queue.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
        };
        await Promise.all(Array(concurrency).fill(null).map(() => worker()));
    };

    const handleBatchGenerate = useCallback(async () => {
        setProcessing(true);
        setProgress(0);
        setError('');
        const tasks = images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error'));
        setTotalTasks(tasks.length);
        
        const processTask = async (img: ImageItem) => {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'processing' } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const currentSettings = img.settings || settings;
                const { numberOfResults, ...apiSettings } = currentSettings;
                const result = await restoreImage(originalDataUrl, apiSettings);
                setImages(current => current.map(i => i.id === img.id ? { ...i, generated: result, status: 'done' } : i));
            } catch (err) {
                setError(handleApiError(err, t));
                console.error(`Error processing image ${img.id}:`, err);
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
                throw err;
            }
        };
        
        try {
            await processQueue(tasks, 1, processTask);
        } catch (e) {
            console.error(t('batch_processing_stopped'), e);
        } finally {
            setProcessing(false);
        }
    }, [images, settings, t]);
    
    const regenerateImage = async (id: number) => {
        const imageToRegen = images.find(i => i.id === id);
        if (!imageToRegen) return;
        setError('');
        setImages(current => current.map(i => i.id === id ? { ...i, status: 'processing' } : i));
        try {
            const originalDataUrl = await readFileAsDataURL(imageToRegen.file);
            const currentSettings = imageToRegen.settings || settings;
            const { numberOfResults, ...apiSettings } = currentSettings;
            const result = await restoreImage(originalDataUrl, apiSettings);
            setImages(current => current.map(i => i.id === id ? { ...i, generated: result, status: 'done' } : i));
        } catch (err) {
            setError(handleApiError(err, t));
            setImages(current => current.map(i => i.id === id ? { ...i, status: 'error' } : i));
        }
    };

    const deleteImage = (id: number) => setImages(current => current.filter(i => i.id !== id));
    const deleteAll = () => setImages([]);
    const toggleSelection = (id: number) => setImages(current => current.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
    const selectAll = () => setImages(current => current.map(img => ({ ...img, selected: true })));
    const deselectAll = () => setImages(current => current.map(img => ({ ...img, selected: false })));
    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ''; };
    const handleDragEvents = (e: DragEvent, dragging: boolean) => { e.preventDefault(); e.stopPropagation(); setIsDragging(dragging); };
    const handleDrop = (e: DragEvent) => { handleDragEvents(e, false); handleFiles(e.dataTransfer?.files || null); };
    const handleDownloadAll = () => {
        images.forEach((img) => {
            if (img.generated) {
                const link = document.createElement('a');
                link.href = img.generated;
                link.download = `${img.file.name.split('.')[0]}-restored.png`;
                link.click();
            }
        });
    };

    const selectedForProcessingCount = useMemo(() => images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error')).length, [images]);
    const buttonText = selectedForProcessingCount > 0 ? t('button_restore_batch', {count: selectedForProcessingCount.toString()}) : t('button_select_to_restore');
    
    return html`
        ${lightboxImage && lightboxImage.generated && html`
            <${Lightbox}
                t=${t}
                originalUrl=${lightboxImage.original}
                generatedUrl=${lightboxImage.generated}
                onClose=${() => setLightboxImage(null)}
                caption=${t('detailedComparison')}
                toggleView=${true}
            />
        `}
        <div class="editor-layout batch-background-view ${!isPanelVisible ? 'panel-hidden' : ''}">
             <div class="image-panel droppable ${isDragging ? 'drag-over' : ''}" onDragOver=${(e: DragEvent) => handleDragEvents(e, true)} onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)} onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)} onDrop=${handleDrop}>
                <div style=${{width: '100%', display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem'}}>
                    <div class="actions" style=${{position: 'relative', bottom: 'auto', right: 'auto', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <button class="btn" onClick=${() => document.getElementById('batch-restore-file-input')?.click()}><${UploadIcon} /> ${t('add_images')}</button>
                        <div style=${{display: 'flex', gap: '0.5rem'}}><button class="btn btn-secondary" onClick=${selectAll}>${t('select_all')}</button><button class="btn btn-secondary" onClick=${deselectAll}>${t('deselect_all')}</button><button class="btn btn-secondary" onClick=${deleteAll} disabled=${images.length === 0}>${t('delete_all')}</button></div>
                        <input type="file" id="batch-restore-file-input" multiple accept="image/*" style=${{display: 'none'}} onChange=${handleFileChange} />
                        <button class="btn btn-primary" onClick=${handleDownloadAll} disabled=${images.every(img => !img.generated)}><${DownloadIcon} /> ${t('download_all')}</button>
                    </div>
                    ${processing && html`<div class="progress-container"><div class="progress-bar"><div class="progress-bar-inner" style=${{ width: `${progress}%` }}></div><span class="progress-label">${progress}%</span></div><span class="progress-counter">${completedCount} / ${totalTasks}</span></div>`}
                    ${error && html`<div class="error-message" style=${{marginTop: '1rem'}}>${error}</div>`}
                    <div class="batch-grid" style=${{ flex: 1, overflowY: 'auto', alignContent: 'flex-start' }}>
                        ${images.length === 0 ? html`
                            <div class="upload-placeholder" onClick=${() => document.getElementById('batch-restore-file-input')?.click()} style=${{ gridColumn: '1 / -1', height: '100%', minHeight: '400px', alignSelf: 'stretch' }}>
                                <${UploadIcon} /><strong>${t('upload_multiple_prompt_title')}</strong><p>${t('upload_restore_prompt')}</p>
                            </div>`
                        : images.map(img => html`
                            <div class="batch-item ${img.selected ? 'selected' : ''} ${img.generated ? 'has-generated' : ''} ${img.status === 'error' ? 'error' : ''}">
                                <div class="selection-checkbox" onClick=${() => toggleSelection(img.id)}><div class="checkbox-visual"><${CheckmarkIcon} /></div></div>
                                <div class="image-comparator" style=${{ display: 'block' }} onClick=${() => img.generated && setLightboxImage(img)}>
                                    <div class="image-container ${img.generated ? 'has-result' : ''}">
                                        <img src=${img.generated || img.original} onMouseEnter=${(e: any) => { if (img.generated) e.target.src = img.original; }} onMouseLeave=${(e: any) => { if (img.generated) e.target.src = img.generated; }} />
                                        ${(img.status === 'processing' || img.status === 'analyzing') && html`<div class="batch-item-status-overlay"><div class="spinner"></div><span>${img.status === 'analyzing' ? t('analyzing') : t('processing')}</span></div>`}
                                        ${img.status === 'done' && html`<div class="batch-item-status-icon"><${CheckmarkIcon} /></div>`}
                                        ${img.status === 'error' && html`<div class="error-badge">${t('error')}</div>`}
                                    </div>
                                </div>
                                <div class="batch-item-actions">
                                    <button class="batch-item-btn" title=${t('regenerate')} onClick=${() => regenerateImage(img.id)}><${RegenerateIcon} /></button>
                                    <button class="batch-item-btn" title=${t('delete')} onClick=${() => deleteImage(img.id)}><${DeleteIcon} /></button>
                                </div>
                            </div>`
                        )}
                    </div>
                </div>
            </div>
            <${RestorationSettingsPanel} settings=${settings} setSettings=${setSettings} onGenerate=${handleBatchGenerate} generating=${processing} hasImage=${selectedForProcessingCount > 0} buttonText=${buttonText} isBatch=${true} onBackToHome=${onBackToHome} onChooseAnotherImage=${() => document.getElementById('batch-restore-file-input')?.click()} t=${t} language=${language} setLanguage=${setLanguage} />
        </div>
    `;
};

export const RestorationApp: FunctionalComponent<EditorProps> = (props) => {
    const [activeTab, setActiveTab] = useState('single');
    const { t } = props;

    return html`
        <div style=${{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div class="page-tabs">
                <button class="page-tab ${activeTab === 'single' ? 'active' : ''}" onClick=${() => setActiveTab('single')}>${t('singlePhoto')}</button>
                <button class="page-tab ${activeTab === 'batch' ? 'active' : ''}" onClick=${() => setActiveTab('batch')}>${t('batchPhoto')}</button>
            </div>
            <div style=${{flex: 1, minHeight: 0}}>
                ${activeTab === 'single' ? html`<${SingleRestorationEditor} ...${props} />` : html`<${BatchRestorationEditor} ...${props} />`}
            </div>
        </div>
    `;
};

export const ClothingChangeApp: FunctionalComponent<EditorProps> = (props) => {
    const initialSettings: ClothingChangeSettings = {
        prompt: '',
        referenceImage: null,
        numImages: 1,
        color: null,
    };

    const handleGenerate = async (originalImage: string, settings: ClothingChangeSettings): Promise<string[]> => {
        const promises = Array.from({ length: settings.numImages }, () => changeClothing(originalImage, settings));
        return await Promise.all(promises);
    };
    
    return html`<${SingleImageEditor}
        ...${props}
        SettingsPanel=${ClothingChangeSettingsPanel}
        initialSettings=${initialSettings}
        onGenerate=${handleGenerate}
        loaderTextKey="loader_clothing"
        actionButtonTextKey="button_generate_photo_enter"
        downloadFilename="clothing-changed.png"
    />`;
}

// FIX: Add missing BatchClothingChangeApp component.
export const BatchClothingChangeApp: FunctionalComponent<BatchEditorProps> = (props) => {
    const { onBackToHome, initialFiles, t, language, setLanguage } = props;
    const [images, setImages] = useState<ImageItem[]>([]);
    const [settings, setSettings] = useState<ClothingChangeSettings>({
        prompt: '',
        referenceImage: null,
        numImages: 1,
        color: null,
    });
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);
    const initialFilesProcessed = useRef(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        if (imageFiles.length > 0 && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                 console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }
        const newImages: ImageItem[] = imageFiles.map(file => ({
            id: Date.now() + Math.random(), file, original: URL.createObjectURL(file), generated: null, status: 'pending', selected: true
        }));
        setImages(current => [...current, ...newImages]);
    }, []);

    useEffect(() => {
        if (initialFiles && initialFiles.length > 0 && !initialFilesProcessed.current) {
            handleFiles(initialFiles);
            initialFilesProcessed.current = true;
        }
    }, [initialFiles, handleFiles]);
    
    const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const processQueue = async (tasks: ImageItem[], concurrency: number, processFn: (task: ImageItem) => Promise<void>) => {
        let completed = 0;
        setTotalTasks(tasks.length);
        setCompletedCount(0);
        const queue = [...tasks];
        const worker = async () => {
            while(queue.length > 0) {
                const task = queue.shift();
                if (task) {
                    await processFn(task);
                    completed++;
                    setCompletedCount(c => c + 1);
                    setProgress(Math.round((completed / tasks.length) * 100));
                    if (queue.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
        };
        await Promise.all(Array(concurrency).fill(null).map(() => worker()));
    };

    const handleBatchGenerate = useCallback(async () => {
        setProcessing(true);
        setProgress(0);
        setError('');
        const tasks = images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error'));
        setTotalTasks(tasks.length);
        
        const processTask = async (img: ImageItem) => {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'processing' } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const { numImages, ...apiSettings } = settings;
                const result = await changeClothing(originalDataUrl, apiSettings);
                setImages(current => current.map(i => i.id === img.id ? { ...i, generated: result, status: 'done' } : i));
            } catch (err) {
                setError(handleApiError(err, t));
                console.error(`Error processing image ${img.id}:`, err);
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
                throw err;
            }
        };
        
        try {
            await processQueue(tasks, 1, processTask);
        } catch (e) {
            console.error(t('batch_processing_stopped'), e);
        } finally {
            setProcessing(false);
        }
    }, [images, settings, t]);
    
    const regenerateImage = (id: number) => handleBatchGenerate();
    
    const deleteImage = (id: number) => setImages(current => current.filter(i => i.id !== id));
    const deleteAll = () => setImages([]);
    const toggleSelection = (id: number) => setImages(current => current.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
    const selectAll = () => setImages(current => current.map(img => ({ ...img, selected: true })));
    const deselectAll = () => setImages(current => current.map(img => ({ ...img, selected: false })));
    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ''; };
    const handleDragEvents = (e: DragEvent, dragging: boolean) => { e.preventDefault(); e.stopPropagation(); setIsDragging(dragging); };
    const handleDrop = (e: DragEvent) => { handleDragEvents(e, false); handleFiles(e.dataTransfer?.files || null); };
    const handleDownloadAll = () => {
        images.forEach((img) => {
            if (img.generated) {
                const link = document.createElement('a');
                link.href = img.generated;
                link.download = `${img.file.name.split('.')[0]}-clothing.png`;
                link.click();
            }
        });
    };

    const selectedForProcessingCount = useMemo(() => images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error')).length, [images]);
    const buttonText = selectedForProcessingCount > 0 ? t('button_change_clothing_batch', {count: selectedForProcessingCount.toString()}) : t('button_select_to_change_clothing');

    return html`
        ${lightboxImage && lightboxImage.generated && html`
            <${Lightbox}
                t=${t}
                originalUrl=${lightboxImage.original}
                generatedUrl=${lightboxImage.generated}
                onClose=${() => setLightboxImage(null)}
                caption=${t('detailedComparison')}
                toggleView=${true}
            />
        `}
        <div class="editor-layout batch-background-view ${!isPanelVisible ? 'panel-hidden' : ''}">
             <div class="image-panel droppable ${isDragging ? 'drag-over' : ''}" onDragOver=${(e: DragEvent) => handleDragEvents(e, true)} onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)} onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)} onDrop=${handleDrop}>
                <div style=${{width: '100%', display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem'}}>
                    <div class="actions" style=${{position: 'relative', bottom: 'auto', right: 'auto', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <button class="btn" onClick=${() => document.getElementById('batch-clothing-file-input')?.click()}><${UploadIcon} /> ${t('add_images')}</button>
                        <div style=${{display: 'flex', gap: '0.5rem'}}><button class="btn btn-secondary" onClick=${selectAll}>${t('select_all')}</button><button class="btn btn-secondary" onClick=${deselectAll}>${t('deselect_all')}</button><button class="btn btn-secondary" onClick=${deleteAll} disabled=${images.length === 0}>${t('delete_all')}</button></div>
                        <input type="file" id="batch-clothing-file-input" multiple accept="image/*" style=${{display: 'none'}} onChange=${handleFileChange} />
                        <button class="btn btn-primary" onClick=${handleDownloadAll} disabled=${images.every(img => !img.generated)}><${DownloadIcon} /> ${t('download_all')}</button>
                    </div>
                    ${processing && html`<div class="progress-container"><div class="progress-bar"><div class="progress-bar-inner" style=${{ width: `${progress}%` }}></div><span class="progress-label">${progress}%</span></div><span class="progress-counter">${completedCount} / ${totalTasks}</span></div>`}
                    ${error && html`<div class="error-message" style=${{marginTop: '1rem'}}>${error}</div>`}
                    <div class="batch-grid" style=${{ flex: 1, overflowY: 'auto', alignContent: 'flex-start' }}>
                        ${images.length === 0 ? html`
                            <div class="upload-placeholder" onClick=${() => document.getElementById('batch-clothing-file-input')?.click()} style=${{ gridColumn: '1 / -1', height: '100%', minHeight: '400px', alignSelf: 'stretch' }}>
                                <${UploadIcon} /><strong>${t('upload_multiple_prompt_title')}</strong><p>${t('upload_clothing_change_prompt')}</p>
                            </div>`
                        : images.map(img => html`
                            <div class="batch-item ${img.selected ? 'selected' : ''} ${img.generated ? 'has-generated' : ''} ${img.status === 'error' ? 'error' : ''}">
                                <div class="selection-checkbox" onClick=${() => toggleSelection(img.id)}><div class="checkbox-visual"><${CheckmarkIcon} /></div></div>
                                <div class="image-comparator" style=${{ display: 'block' }} onClick=${() => img.generated && setLightboxImage(img)}>
                                    <div class="image-container ${img.generated ? 'has-result' : ''}">
                                        <img src=${img.generated || img.original} onMouseEnter=${(e: any) => { if (img.generated) e.target.src = img.original; }} onMouseLeave=${(e: any) => { if (img.generated) e.target.src = img.generated; }} />
                                        ${img.status === 'processing' && html`<div class="batch-item-status-overlay"><div class="spinner"></div><span>${t('processing')}</span></div>`}
                                        ${img.status === 'done' && html`<div class="batch-item-status-icon"><${CheckmarkIcon} /></div>`}
                                        ${img.status === 'error' && html`<div class="error-badge">${t('error')}</div>`}
                                    </div>
                                </div>
                                <div class="batch-item-actions">
                                    <button class="batch-item-btn" title=${t('regenerate')} onClick=${() => regenerateImage(img.id)}><${RegenerateIcon} /></button>
                                    <button class="batch-item-btn" title=${t('delete')} onClick=${() => deleteImage(img.id)}><${DeleteIcon} /></button>
                                </div>
                            </div>`
                        )}
                    </div>
                </div>
            </div>
            <${ClothingChangeSettingsPanel} 
                settings=${settings} 
                setSettings=${setSettings} 
                onGenerate=${handleBatchGenerate} 
                generating=${processing} 
                hasImage=${selectedForProcessingCount > 0} 
                buttonText=${buttonText} 
                isBatch=${true} 
                onBackToHome=${onBackToHome} 
                onChooseAnotherImage=${() => document.getElementById('batch-clothing-file-input')?.click()} 
                t=${t} 
                language=${language} 
                setLanguage=${setLanguage}
            />
        </div>
    `;
};

export const HairStyleApp: FunctionalComponent<EditorProps> = (props) => {
    const initialSettings: HairStyleSettings = {
        prompt: '',
        gender: 'female',
        numImages: 1,
    };

    const handleGenerate = async (originalImage: string, settings: HairStyleSettings): Promise<string[]> => {
        const promises = Array.from({ length: settings.numImages }, () => changeHairStyle(originalImage, settings));
        return await Promise.all(promises);
    };
    
    return html`<${SingleImageEditor}
        ...${props}
        SettingsPanel=${HairStyleSettingsPanel}
        initialSettings=${initialSettings}
        onGenerate=${handleGenerate}
        loaderTextKey="loader_hair"
        actionButtonTextKey="button_generate_photo_enter"
        downloadFilename="hair-style-changed.png"
    />`;
}

export const BabyConceptApp: FunctionalComponent<EditorProps> = (props) => {
    const initialSettings: BabyConceptSettings = {
        selectedConceptPrompt: null,
        numImages: 1,
        gender: 'boy',
    };

    const handleGenerate = async (originalImage: string, settings: BabyConceptSettings): Promise<string[]> => {
        const promises = Array.from({ length: settings.numImages }, () => generateBabyConceptImage(originalImage, settings));
        return await Promise.all(promises);
    };
    
    return html`<${SingleImageEditor}
        ...${props}
        SettingsPanel=${BabyConceptSettingsPanel}
        initialSettings=${initialSettings}
        onGenerate=${handleGenerate}
        loaderTextKey="loader_baby"
        actionButtonTextKey="button_generate_photo_enter"
        downloadFilename="baby-concept.png"
    />`;
}

export const PosingStudioApp: FunctionalComponent<EditorProps> = (props) => {
    const initialSettings: PosingStudioSettings = {
        faceReferenceImage: null,
        selectedPoses: [],
        customPosePrompts: [],
        numImages: 1,
    };

    const handleGenerate = async (originalImage: string, settings: PosingStudioSettings): Promise<string[]> => {
        const allPosePrompts = [...settings.selectedPoses, ...settings.customPosePrompts.filter(p => p.trim() !== '')];
        if (allPosePrompts.length === 0) {
            throw new Error(props.t('error_select_pose'));
        }
        const allResults: string[] = [];
        for (const posePrompt of allPosePrompts) {
            const promises = Array.from({ length: settings.numImages }, () => 
                generatePosedImage(originalImage, posePrompt, settings.faceReferenceImage)
            );
            const results = await Promise.all(promises);
            allResults.push(...results);
        }
        return allResults;
    };
    
    return html`<${SingleImageEditor}
        ...${props}
        SettingsPanel=${PosingStudioSettingsPanel}
        initialSettings=${initialSettings}
        onGenerate=${handleGenerate}
        loaderTextKey="loader_posing"
        actionButtonTextKey="button_generate_photo_enter"
        downloadFilename="posed-image.png"
    />`;
};


export const AiEditorApp: FunctionalComponent<EditorProps> = (props) => {
    const initialSettings: AiEditorSettings = {
        prompt: '',
        assistantImage: null,
        assistantMode: 'background',
        numImages: 1,
    };

    const handleGenerate = async (originalImage: string, settings: AiEditorSettings): Promise<string[]> => {
        const promises = Array.from({ length: settings.numImages }, () => generateAiEdit(originalImage, settings));
        return await Promise.all(promises);
    };

    return html`<${SingleImageEditor}
        ...${props}
        SettingsPanel=${AiEditorSettingsPanel}
        initialSettings=${initialSettings}
        onGenerate=${handleGenerate}
        loaderTextKey="loader_ai_edit"
        actionButtonTextKey="button_generate_photo_enter"
        downloadFilename="ai-edited-image.png"
    />`;
};

// --- New Trend Creator App ---
// FIX: Add missing EditorProps to TrendCreatorApp to receive translations and other essential props.
export const TrendCreatorApp: FunctionalComponent<EditorProps> = (props) => {
    const { initialImage, onChooseAnotherImage, onBackToHome, onImageUpdate, t, language, setLanguage } = props;
    const [settings, setSettings] = useState<TrendCreatorSettings>({
        subjectImage: initialImage,
        selectedTrends: [],
        prompt: '',
        numImages: 1,
        shopName: '',
        sceneDescription: '',
    });
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    useEffect(() => {
        setSettings(s => ({ ...s, subjectImage: initialImage }));
    }, [initialImage]);
    
    const handleGenerate = async () => {
        if (!settings.subjectImage) return;
        setGenerating(true);
        setError('');

        try {
            const allResults: string[] = [];
            const promptsToRun: string[] = [];

            if (settings.selectedTrends.length > 0) {
                 promptsToRun.push(...settings.selectedTrends.map(key => PREDEFINED_TRENDS[key as keyof typeof PREDEFINED_TRENDS]?.prompt || ''));
            } else {
                promptsToRun.push(settings.prompt);
            }
            
            for (const prompt of promptsToRun.filter(p => p.trim() !== '')) {
                let processedPrompt = prompt;
                const shopNameReplacement = settings.shopName.trim() || 'Hải soft';
                const sceneDescriptionReplacement = settings.sceneDescription.trim();

                processedPrompt = processedPrompt.replace(/\{\{shop_name\}\}/g, shopNameReplacement);
                
                if (sceneDescriptionReplacement) {
                    processedPrompt = processedPrompt.replace(/\{\{scene_description\}\}/g, sceneDescriptionReplacement);
                } else {
                    processedPrompt = processedPrompt.replace(/\{\{scene_description\}\}, /g, '');
                }


                for (let i = 0; i < settings.numImages; i++) {
                    const result = await callGeminiAPI(processedPrompt, settings.subjectImage);
                    allResults.push(result);
                }
            }
            setGeneratedImages(prev => [...prev, ...allResults]);

        } catch (err) {
            setError(handleApiError(err, t));
        } finally {
            setGenerating(false);
        }
    };
    
    const toggleSelection = (url: string) => {
        setSelectedImages(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    };

    const downloadSelectedImages = () => {
        selectedImages.forEach((dataUrl, index) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `trend-image-${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };
    
    return html`
        ${lightboxImage && settings.subjectImage && html`
            <${Lightbox} 
                t=${t}
                originalUrl=${settings.subjectImage}
                generatedUrl=${lightboxImage}
                caption=${t('compareTrend')}
                onClose=${() => setLightboxImage(null)}
                toggleView=${true}
            />
        `}
        <div class="editor-layout ${!isPanelVisible ? 'panel-hidden' : ''}">
            <div class="image-panel">
                ${generating && html`<${Loader} text=${t('loader_trend')} />`}
                ${!settings.subjectImage ? html`
                    <${ImageUploader} onImageUpload=${onImageUpdate} t=${t} />
                ` : html`
                    <div class="trend-results-container">
                        <div class="results-actions">
                            <button class="btn btn-secondary" onClick=${() => setGeneratedImages([])} disabled=${generatedImages.length === 0}>${t('delete_all')}</button>
                            <button class="btn btn-primary" onClick=${downloadSelectedImages} disabled=${selectedImages.length === 0}>
                                <${DownloadIcon} /> ${t('download_selected', { count: selectedImages.length.toString() })}
                            </button>
                        </div>
                         ${error && html`<div class="error-message" style=${{textAlign: 'left', whiteSpace: 'pre-wrap'}}>${error}</div>`}
                        <div class="trend-grid">
                            ${generatedImages.map(url => html`
                                <div class=${`batch-item ${selectedImages.includes(url) ? 'selected' : ''}`} onClick=${() => setLightboxImage(url)}>
                                    <div class="selection-checkbox" onClick=${(e: MouseEvent) => { e.stopPropagation(); toggleSelection(url); }}>
                                        <div class="checkbox-visual"><${CheckmarkIcon}/></div>
                                    </div>
                                    <div class="image-container has-result">
                                       <img src=${url} alt=${t('generatedTrendAlt')} />
                                    </div>
                                    <div class="batch-item-actions">
                                        <button class="batch-item-btn" title=${t('useThisImage')} onClick=${(e: MouseEvent) => { e.stopPropagation(); onImageUpdate(url); onBackToHome(); }}>
                                            <${ArrowForwardIcon} />
                                        </button>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                `}
            </div>
             <${TrendCreatorSettingsPanel} 
                settings=${settings} 
                setSettings=${(updater) => setSettings(updater)} 
                onGenerate=${handleGenerate} 
                generating=${generating} 
                hasImage=${!!settings.subjectImage} 
                onBackToHome=${onBackToHome}
                onChooseAnotherImage=${onChooseAnotherImage}
                t=${t}
                language=${language}
                setLanguage=${setLanguage}
            />
        </div>
    `;
};


// --- Batch Editors ---

// FIX: Implement reference image cropping workflow for BatchBackgroundApp.
export const BatchBackgroundApp: FunctionalComponent<BatchEditorProps> = (props) => {
    const { onBackToHome, onImageUpdate, initialFiles, onChooseAnotherImage, t, language, setLanguage } = props;
    const [images, setImages] = useState<ImageItem[]>([]);
    const [settings, setSettings] = useState<BackgroundSettings>(() => ({
        prompt: t('label_foreground_auto'),
        negativePrompt: t('negative_prompt_default'),
        referenceImage: null,
        keepPose: true,
        keepComposition: true,
        keepFocalLength: true,
        keepAspectRatio: true,
        lightingEffects: [],
        numImages: 1,
        lensBlur: 6,
    }));
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);
    const initialFilesProcessed = useRef(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [isHoveringRefUploader, setIsHoveringRefUploader] = useState(false);

    // New state for cropping and analysis flow
    const [isCroppingRefImage, setIsCroppingRefImage] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [subjectAspectRatio, setSubjectAspectRatio] = useState<number | null>(null);
    const [isAnalyzingRef, setIsAnalyzingRef] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{prompt: string, image: string} | null>(null);

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        if (imageFiles.length > 0 && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                 console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }
        const newImages: ImageItem[] = imageFiles.map(file => ({
            id: Date.now() + Math.random(), file, original: URL.createObjectURL(file), generated: null, status: 'pending', selected: true
        }));
        setImages(current => [...current, ...newImages]);
    }, []);

    useEffect(() => {
        if (initialFiles && initialFiles.length > 0 && !initialFilesProcessed.current) {
            handleFiles(initialFiles);
            initialFilesProcessed.current = true;
        }
    }, [initialFiles, handleFiles]);

    // FIX: Moved `handleLaunchRefCrop` before its usage in the `useEffect` hook for `handlePaste` to resolve the "used before declaration" error. Also wrapped in useCallback.
    const handleLaunchRefCrop = useCallback((file: File) => {
        if (!subjectAspectRatio) {
            setError(t('error_no_subject_for_ref'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageToCrop(e.target!.result as string);
            setIsCroppingRefImage(true);
        }
        reader.readAsDataURL(file);
    }, [subjectAspectRatio, t]);

    useEffect(() => {
        if (images.length > 0 && !subjectAspectRatio) {
            const img = new Image();
            img.onload = () => {
                setSubjectAspectRatio(img.naturalWidth / img.naturalHeight);
            };
            img.src = images[0].original;
        }
        if (images.length === 0) {
            setSubjectAspectRatio(null);
        }
    }, [images]);
    
    const handleCropConfirm = async (croppedDataUrl: string) => {
        setIsCroppingRefImage(false);
        setImageToCrop(null);
        
        setIsAnalyzingRef(true);
        setError('');
        try {
            const description = await describeImageForPrompt(croppedDataUrl, 'background', language);
            const finalPrompt = `${t('bg_prompt_prefix')}${description}`;
            setAnalysisResult({ prompt: finalPrompt, image: croppedDataUrl });
        } catch (e) {
            setError(handleApiError(e, t));
        } finally {
            setIsAnalyzingRef(false);
        }
    };

    const handleCropCancel = () => {
        setIsCroppingRefImage(false);
        setImageToCrop(null);
    };

    const deleteAll = () => setImages([]);
    const toggleSelection = (id: number) => setImages(current => current.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
    const selectAll = () => setImages(current => current.map(img => ({ ...img, selected: true })));
    const deselectAll = () => setImages(current => current.map(img => ({ ...img, selected: false })));

    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => {
        handleFiles(e.currentTarget.files);
        if (e.currentTarget) e.currentTarget.value = '';
    };

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        handleFiles(e.dataTransfer?.files || null);
    };
    
    const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const processQueue = async (tasks: ImageItem[], concurrency: number, processFn: (task: ImageItem) => Promise<void>) => {
        let completed = 0;
        setTotalTasks(tasks.length);
        setCompletedCount(0);
        const queue = [...tasks];
        const worker = async () => {
            while(queue.length > 0) {
                const task = queue.shift();
                if (task) {
                    await processFn(task);
                    completed++;
                    setCompletedCount(c => c + 1);
                    setProgress(Math.round((completed / tasks.length) * 100));
                    if (queue.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
        };
        await Promise.all(Array(concurrency).fill(null).map(() => worker()));
    };

    const handleBatchGenerate = useCallback(async () => {
        setProcessing(true);
        setProgress(0);
        setError('');
        const tasks = images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error'));
        setTotalTasks(tasks.length);
        
        const processTask = async (img: ImageItem) => {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'processing' } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const { numImages, ...apiSettings } = settings;
                const result = await changeBackground(originalDataUrl, apiSettings);
                setImages(current => current.map(i => i.id === img.id ? { ...i, generated: result, status: 'done' } : i));
            } catch (err) {
                setError(handleApiError(err, t));
                console.error(`Error processing image ${img.id}:`, err);
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
                throw err;
            }
        };
        
        try {
            await processQueue(tasks, 1, processTask);
        } catch (e) {
            console.error(t('batch_processing_stopped'), e);
        } finally {
            setProcessing(false);
        }
    }, [images, settings, t]);
    
    const regenerateImage = async (id: number) => {
        const imageToRegen = images.find(i => i.id === id);
        if (!imageToRegen) return;

        setError('');
        setImages(current => current.map(i => i.id === id ? { ...i, status: 'processing' } : i));

        try {
            const originalDataUrl = await readFileAsDataURL(imageToRegen.file);
            const { numImages, ...apiSettings } = settings;
            const result = await changeBackground(originalDataUrl, apiSettings);
            setImages(current => current.map(i => i.id === id ? { ...i, generated: result, status: 'done' } : i));
        } catch (err) {
            setError(handleApiError(err, t));
            setImages(current => current.map(i => i.id === id ? { ...i, status: 'error' } : i));
        }
    };

    const handleRegenerateAll = useCallback(async () => {
        setProcessing(true);
        setProgress(0);
        setError('');
        const tasks = images.filter(img => img.selected && img.status === 'done');
        setTotalTasks(tasks.length);
        if (tasks.length === 0) {
            setProcessing(false);
            return;
        }

        const processTask = async (img: ImageItem) => {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'processing' } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const { numImages, ...apiSettings } = settings;
                const result = await changeBackground(originalDataUrl, apiSettings);
                setImages(current => current.map(i => i.id === img.id ? { ...i, generated: result, status: 'done' } : i));
            } catch (err) {
                setError(handleApiError(err, t));
                console.error(`Error re-processing image ${img.id}:`, err);
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
                throw err;
            }
        };

        try {
            await processQueue(tasks, 1, processTask);
        } catch(e) {
            console.error(t('batch_processing_stopped'), e);
        } finally {
            setProcessing(false);
        }
    }, [images, settings, t]);

    const deleteImage = (id: number) => {
        setImages(current => current.filter(i => i.id !== id));
    };

    const handleDownloadAll = () => {
        images.forEach((img) => {
            if (img.generated) {
                const link = document.createElement('a');
                link.href = img.generated;
                link.download = `${img.file.name.split('.')[0]}-background.png`;
                link.click();
            }
        });
    };

    const selectedForProcessingCount = useMemo(() => images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error')).length, [images]);
    const selectedDoneCount = useMemo(() => images.filter(img => img.selected && img.status === 'done').length, [images]);
    
    const buttonText = selectedForProcessingCount > 0 
        ? t('button_change_bg_batch', {count: selectedForProcessingCount.toString()}) 
        : t('button_select_to_change_bg');
    
    return html`
        ${isAnalyzingRef && html`<${Loader} text="Đang phân tích ảnh tham chiếu..." />`}
        ${analysisResult && html`
            <${ActionToast}
                message=${t('toast_analysis_complete')}
                actions=${[
                    { label: t('toast_action_no'), onClick: () => {
                        setSettings(s => ({ ...s, prompt: analysisResult.prompt, referenceImage: null }));
                        setAnalysisResult(null);
                    }},
                    { label: t('toast_action_yes'), isPrimary: true, onClick: () => {
                        setSettings(s => ({ ...s, prompt: analysisResult.prompt, referenceImage: analysisResult.image }));
                        setAnalysisResult(null);
                    }}
                ]}
            />
        `}
        ${isCroppingRefImage && imageToCrop && subjectAspectRatio && html`
            <${CropTool} 
                t=${t}
                imageUrl=${imageToCrop} 
                onCrop=${handleCropConfirm}
                onCancel=${handleCropCancel}
                aspectRatios=${[{ label: t('subject_aspect_ratio'), value: subjectAspectRatio }, {label: '16:9', value: 16/9}, {label: '4:3', value: 4/3}, {label: '1:1', value: 1}, {label: '3:4', value: 3/4}, {label: '9:16', value: 9/16}]}
            />
        `}
        ${lightboxImage && lightboxImage.generated && html`
            <${Lightbox}
                t=${t}
                originalUrl=${lightboxImage.original}
                generatedUrl=${lightboxImage.generated}
                onClose=${() => setLightboxImage(null)}
                caption=${t('detailedComparison')}
                toggleView=${true}
            />
        `}
        <div class="editor-layout batch-background-view ${!isPanelVisible ? 'panel-hidden' : ''}">
             <div class="image-panel droppable ${isDragging ? 'drag-over' : ''}" onDragOver=${(e: DragEvent) => handleDragEvents(e, true)} onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)} onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)} onDrop=${handleDrop}>
                <div style=${{width: '100%', display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem'}}>
                    <div class="actions" style=${{position: 'relative', bottom: 'auto', right: 'auto', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <div style=${{display: 'flex', gap: '0.5rem'}}>
                            <button class="btn btn-secondary" onClick=${selectAll}>${t('select_all')}</button>
                            <button class="btn btn-secondary" onClick=${deselectAll}>${t('deselect_all')}</button>
                            <button class="btn btn-secondary" onClick=${deleteAll} disabled=${images.length === 0}>${t('delete_all')}</button>
                            <button class="btn" onClick=${handleRegenerateAll} disabled=${processing || selectedDoneCount === 0}><${RegenerateIcon} /> ${t('regenerate_all')}</button>
                        </div>
                        <input type="file" id="batch-bg-file-input" multiple accept="image/*" style=${{display: 'none'}} onChange=${handleFileChange} />
                        <button class="btn btn-primary" onClick=${handleDownloadAll} disabled=${images.every(img => !img.generated)}><${DownloadIcon} /> ${t('download_all')}</button>
                    </div>
                    ${processing && html`<div class="progress-container"><div class="progress-bar"><div class="progress-bar-inner" style=${{ width: `${progress}%` }}></div><span class="progress-label">${progress}%</span></div><span class="progress-counter">${completedCount} / ${totalTasks}</span></div>`}
                    ${error && html`<div class="error-message" style=${{marginTop: '1rem'}}>${error}</div>`}
                    <div class="batch-grid" style=${{ flex: 1, overflowY: 'auto', alignContent: 'flex-start' }}>
                        ${images.length === 0 ? html`
                            <div class="upload-placeholder" style=${{ gridColumn: '1 / -1', height: '100%', minHeight: '400px', alignSelf: 'stretch', cursor: 'default' }}>
                                <strong>${t('upload_multiple_prompt_title')}</strong>
                                <p>${t('upload_multiple_prompt_note')}</p>
                                ${isDragging && html`<div class="drop-overlay"><div><${UploadIcon}/><span>${t('drop_to_add')}</span></div></div>`}
                            </div>`
                        : images.map(img => html`
                            <div class="batch-item ${img.selected ? 'selected' : ''} ${img.generated ? 'has-generated' : ''} ${img.status === 'error' ? 'error' : ''}">
                                <div class="selection-checkbox" onClick=${() => toggleSelection(img.id)}><div class="checkbox-visual"><${CheckmarkIcon} /></div></div>
                                <div class="image-comparator" style=${{ display: 'block' }} onClick=${() => img.generated && setLightboxImage(img)}>
                                    <div class="image-container ${img.generated ? 'has-result' : ''}">
                                        <img src=${img.generated || img.original} onMouseEnter=${(e: any) => { if (img.generated) e.target.src = img.original; }} onMouseLeave=${(e: any) => { if (img.generated) e.target.src = img.generated; }} />
                                        ${img.status === 'processing' && html`<div class="batch-item-status-overlay"><div class="spinner"></div><span>${t('processing')}</span></div>`}
                                        ${img.status === 'done' && html`<div class="batch-item-status-icon"><${CheckmarkIcon} /></div>`}
                                        ${img.status === 'error' && html`<div class="error-badge">${t('error')}</div>`}
                                    </div>
                                </div>
                                <div class="batch-item-actions">
                                    <button class="batch-item-btn" title=${t('regenerate')} onClick=${() => regenerateImage(img.id)}><${RegenerateIcon} /></button>
                                    <button class="batch-item-btn" title=${t('use_this_image_action')} onClick=${() => { if (img.generated) { onImageUpdate(img.generated); onBackToHome(); } }}><${ArrowForwardIcon} /></button>
                                    <button class="batch-item-btn" title=${t('delete')} onClick=${() => deleteImage(img.id)}><${DeleteIcon} /></button>
                                </div>
                            </div>`
                        )}
                    </div>
                </div>
            </div>
            <${BackgroundSettingsPanel} settings=${settings} setSettings=${setSettings} onGenerate=${handleBatchGenerate} generating=${processing} hasImage=${selectedForProcessingCount > 0} buttonText=${buttonText} isBatch=${true} onBackToHome=${onBackToHome} onChooseAnotherImage=${() => document.getElementById('batch-bg-file-input')?.click()} t=${t} language=${language} setLanguage=${setLanguage} onLaunchRefCrop=${handleLaunchRefCrop} subjectImageUploaded=${images.length > 0} onUploaderHover=${setIsHoveringRefUploader} />
        </div>
    `;
};

// FIX: Add missing VideoMarketingApp component.
export const VideoMarketingApp: FunctionalComponent<BatchEditorProps> = (props) => {
    const { onBackToHome, initialFiles, t, onImageUpdate, language, setLanguage, onChooseAnotherImage } = props;
    const [images, setImages] = useState<ImageItem[]>([]);
    const [settings, setSettings] = useState<VideoMarketingSettings>({
        prompt: '',
        aspectRatio: '9:16',
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxItem, setLightboxItem] = useState<ImageItem | null>(null);
    const initialFilesProcessed = useRef(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        const handlePanelToggle = (e: KeyboardEvent) => {
            if (e.key === '*') {
                const target = e.target as HTMLElement;
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    e.preventDefault();
                    setIsPanelVisible(v => !v);
                }
            }
        };
        window.addEventListener('keydown', handlePanelToggle);
        return () => window.removeEventListener('keydown', handlePanelToggle);
    }, []);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        if (imageFiles.length > 0 && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }
        const newImages: ImageItem[] = imageFiles.map(file => ({
            id: Date.now() + Math.random(), file, original: URL.createObjectURL(file), generated: null, status: 'pending', selected: true
        }));
        setImages(current => [...current, ...newImages]);
    }, []);

    useEffect(() => {
        if (initialFiles && initialFiles.length > 0 && !initialFilesProcessed.current) {
            handleFiles(initialFiles);
            initialFilesProcessed.current = true;
        }
    }, [initialFiles, handleFiles]);

    const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleGenerate = async () => {
        const tasks = images.filter(img => img.selected && (img.status === 'pending' || img.status === 'error'));
        if (tasks.length === 0) return;

        setProcessing(true);
        setError('');

        for (const img of tasks) {
            setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'processing', generatingProgress: t('loader_video') } : i));
            try {
                const originalDataUrl = await readFileAsDataURL(img.file);
                const onProgress = (message: string) => {
                    setImages(current => current.map(i => i.id === img.id ? { ...i, generatingProgress: message } : i));
                };
                const videoUrl = await generateVideo(originalDataUrl, settings, t, onProgress);
                setImages(current => current.map(i => i.id === img.id ? { ...i, generated: videoUrl, status: 'done', generatingProgress: null } : i));
            } catch (err) {
                setError(handleApiError(err, t));
                setImages(current => current.map(i => i.id === img.id ? { ...i, status: 'error', generatingProgress: null } : i));
                break; // Stop on first error
            }
        }
        setProcessing(false);
    };

    const deleteImage = (id: number) => {
        const image = images.find(i => i.id === id);
        if (image && image.generated) {
            URL.revokeObjectURL(image.generated);
        }
        setImages(current => current.filter(i => i.id !== id));
    };
    
    const deleteAll = () => {
        images.forEach(img => {
            if (img.generated) URL.revokeObjectURL(img.generated);
        });
        setImages([]);
    };

    const toggleSelection = (id: number) => setImages(current => current.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
    const selectAll = () => setImages(current => current.map(img => ({ ...img, selected: true })));
    const deselectAll = () => setImages(current => current.map(img => ({ ...img, selected: false })));
    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ''; };
    const handleDragEvents = (e: DragEvent, dragging: boolean) => { e.preventDefault(); e.stopPropagation(); setIsDragging(dragging); };
    const handleDrop = (e: DragEvent) => { handleDragEvents(e, false); handleFiles(e.dataTransfer?.files || null); };
    const handleDownloadAll = () => {
        images.forEach((img) => {
            if (img.generated) {
                const link = document.createElement('a');
                link.href = img.generated;
                link.download = `${img.file.name.split('.')[0]}-video.mp4`;
                link.click();
            }
        });
    };

    const canGenerate = useMemo(() => images.some(img => img.selected && (img.status === 'pending' || img.status === 'error')) && settings.prompt.trim() !== '', [images, settings.prompt]);

    return html`
        ${lightboxItem && lightboxItem.generated && html`
            <div class="lightbox-overlay" onClick=${() => setLightboxItem(null)}>
                <div class="lightbox-content single-image-view" onClick=${(e: MouseEvent) => e.stopPropagation()}>
                     <div class="lightbox-header">
                        <h3>${lightboxItem.file.name}</h3>
                        <button class="lightbox-close-btn" onClick=${() => setLightboxItem(null)} title=${t('closeEsc')}><${CloseIcon} /></button>
                    </div>
                    <div class="lightbox-single-image-wrapper">
                        <video src=${lightboxItem.generated} controls autoplay loop style=${{ maxWidth: '100%', maxHeight: '80vh' }} />
                    </div>
                </div>
            </div>
        `}
        <div class="editor-layout batch-background-view ${!isPanelVisible ? 'panel-hidden' : ''}">
             <div class="image-panel droppable ${isDragging ? 'drag-over' : ''}" onDragOver=${(e: DragEvent) => handleDragEvents(e, true)} onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)} onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)} onDrop=${handleDrop}>
                <div style=${{width: '100%', display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem'}}>
                    <div class="actions" style=${{position: 'relative', bottom: 'auto', right: 'auto', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <button class="btn" onClick=${() => document.getElementById('batch-video-file-input')?.click()}><${UploadIcon} /> ${t('add_images')}</button>
                        <div style=${{display: 'flex', gap: '0.5rem'}}><button class="btn btn-secondary" onClick=${selectAll}>${t('select_all')}</button><button class="btn btn-secondary" onClick=${deselectAll}>${t('deselect_all')}</button><button class="btn btn-secondary" onClick=${deleteAll} disabled=${images.length === 0}>${t('delete_all')}</button></div>
                        <input type="file" id="batch-video-file-input" multiple accept="image/*" style=${{display: 'none'}} onChange=${handleFileChange} />
                        <button class="btn btn-primary" onClick=${handleDownloadAll} disabled=${images.every(img => !img.generated)}><${DownloadIcon} /> ${t('download_all')}</button>
                    </div>
                    ${error && html`<div class="error-message" style=${{marginTop: '1rem'}}>${error}</div>`}
                    <div class="batch-grid" style=${{ flex: 1, overflowY: 'auto', alignContent: 'flex-start' }}>
                        ${images.length === 0 ? html`
                            <div class="upload-placeholder" onClick=${() => document.getElementById('batch-video-file-input')?.click()} style=${{ gridColumn: '1 / -1', height: '100%', minHeight: '400px', alignSelf: 'stretch' }}>
                                <${UploadIcon} /><strong>${t('upload_multiple_prompt_title')}</strong><p>${t('upload_video_marketing_prompt')}</p>
                            </div>`
                        : images.map(img => html`
                            <div class="batch-item ${img.selected ? 'selected' : ''} ${img.generated ? 'has-generated' : ''} ${img.status === 'error' ? 'error' : ''}">
                                <div class="selection-checkbox" onClick=${() => toggleSelection(img.id)}><div class="checkbox-visual"><${CheckmarkIcon} /></div></div>
                                <div class="image-comparator" style=${{ display: 'block' }} onClick=${() => img.generated && setLightboxItem(img)}>
                                    <div class="image-container ${img.generated ? 'has-result' : ''}">
                                        ${img.generated ? html`<video src=${img.generated} muted loop />` : html`<img src=${img.original} />`}
                                        ${img.status === 'processing' && html`<div class="batch-item-status-overlay"><div class="spinner"></div><span>${img.generatingProgress || t('processing')}</span></div>`}
                                        ${img.status === 'done' && html`<div class="batch-item-status-icon video"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>`}
                                        ${img.status === 'error' && html`<div class="error-badge">${t('error')}</div>`}
                                    </div>
                                </div>
                                <div class="batch-item-actions">
                                    <button class="batch-item-btn" title=${t('regenerate')} onClick=${() => handleGenerate()}><${RegenerateIcon} /></button>
                                    <button class="batch-item-btn" title=${t('delete')} onClick=${() => deleteImage(img.id)}><${DeleteIcon} /></button>
                                </div>
                            </div>`
                        )}
                    </div>
                </div>
            </div>
             <${VideoMarketingSettingsPanel}
                settings=${settings}
                setSettings=${setSettings}
                onGenerate=${handleGenerate}
                generating=${processing}
                hasImage=${canGenerate}
                onBackToHome=${onBackToHome}
                onChooseAnotherImage=${() => document.getElementById('batch-video-file-input')?.click()}
                t=${t}
                language=${language}
                setLanguage=${setLanguage}
            />
        </div>
    `;
};