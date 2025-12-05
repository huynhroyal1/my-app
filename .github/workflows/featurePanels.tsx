/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { h, FunctionalComponent } from 'preact';
import { useState, useMemo, useRef, useEffect } from 'preact/hooks';
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
    CommonSettingsPanelProps,
    HairStyleSettings,
    BabyConceptSettings,
    VideoMarketingSettings,
} from './types';
import { ID_PHOTO_CLOTHING_PRESETS, ID_PHOTO_HAIRSTYLE_OPTIONS, BACKGROUND_PROMPT_SUGGESTIONS, BACKGROUND_LIGHTING_EFFECTS, POSING_STUDIO_SUGGESTIONS, POSING_STUDIO_CUSTOM_SUGGESTIONS, PREDEFINED_TRENDS, HAIR_STYLE_SUGGESTIONS, BABY_CONCEPTS } from './constants';
import { MicIcon, UploadIcon, CloseIcon, NumberButtonGroup, InfoNote, SuggestionLightbox, HotkeysInfo, CollapsibleSection, ActionToast } from './components';
import { analyzeImageForRestoration, describeImageForPrompt } from './api';

const html = htm.bind(h);

const stopEvent = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
};

const requestBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn(`Could not enter fullscreen mode: ${err.message}`);
        });
    }
};

interface IdPhotoSettingsPanelProps extends CommonSettingsPanelProps {
    settings: IdPhotoSettings;
    setSettings: (updater: (s: IdPhotoSettings) => IdPhotoSettings) => void;
    isBatch?: boolean;
}

export const IdPhotoSettingsPanel: FunctionalComponent<IdPhotoSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, buttonText, onBackToHome, onChooseAnotherImage, isBatch = false, t }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const dataUrl = loadEvent.target?.result as string;
            setSettings(s => ({
                ...s,
                customClothingImage: dataUrl,
                clothingPrompts: [] // Deselect presets
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const handlePresetClick = (prompt: string) => {
        setSettings(s => {
            const currentPrompts = s.clothingPrompts || [];
            const newPrompts = currentPrompts.includes(prompt)
                ? currentPrompts.filter(p => p !== prompt)
                : [prompt]; // add
            return {
                ...s,
                clothingPrompts: newPrompts,
                customClothingImage: null, // Clear custom image
            };
        });
    };
    
    const handleKeepOriginalClick = () => {
        setSettings(s => ({
            ...s,
            clothingPrompts: [],
            customClothingImage: null, // Also clear custom image here
        }));
    };
    
    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${!isBatch && onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}


            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('backgroundColor')}>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="bg" value="white" checked=${settings.background === 'white'} onChange=${() => setSettings(s => ({...s, background: 'white'}))} />
                            ${t('white')}
                        </label>
                        <label>
                            <input type="radio" name="bg" value="blue" checked=${settings.background === 'blue'} onChange=${() => setSettings(s => ({...s, background: 'blue'}))} />
                            ${t('blue')}
                        </label>
                        <label>
                            <input type="radio" name="bg" value="gray" checked=${settings.background === 'gray'} onChange=${() => setSettings(s => ({...s, background: 'gray'}))} />
                            ${t('gray')}
                        </label>
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('clothing')}>
                    <div class="clothing-grid">
                        ${ID_PHOTO_CLOTHING_PRESETS.map(preset => html`
                            <button 
                                class="clothing-btn ${settings.clothingPrompts.includes(preset.prompt) ? 'active' : ''}"
                                onClick=${() => handlePresetClick(preset.prompt)}
                            >${t(preset.labelKey)}</button>
                        `)}
                         <button 
                            class="clothing-btn ${settings.clothingPrompts.length === 0 && !settings.customClothingImage ? 'active' : ''}"
                            onClick=${handleKeepOriginalClick}
                        >${t('keepOriginal')}</button>
                    </div>
                    <div class="form-group" style=${{marginTop: '1rem'}}>
                        <label class="uploader-label">${t('orUploadTemplate')}</label>
                        <div 
                            class="reference-uploader ${isDragging ? 'drag-over' : ''}"
                            style=${{cursor: 'default', width: '100%', height: '120px'}}
                            onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
                            onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)}
                            onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
                            onDrop=${handleDrop}
                            onPaste=${stopEvent}
                        >
                            ${settings.customClothingImage ? html`
                                <img src=${settings.customClothingImage} alt="Custom Clothing Reference" class="reference-preview"/>
                                <button class="remove-reference-btn" onClick=${(e: MouseEvent) => { e.stopPropagation(); setSettings(s => ({ ...s, customClothingImage: null })); }} title=${t('removeTemplate')}><${CloseIcon}/></button>
                            ` : html`
                                <div class="reference-placeholder" style=${{gap: '0.25rem'}}>
                                   <${UploadIcon} />
                                   <span style=${{fontWeight: 500}}>${t('uploader_drag_drop_prompt')}</span>
                                   <span style=${{fontSize: '0.8em', opacity: 0.7}}>${t('uploader_drag_drop_note')}</span>
                                </div>
                            `}
                        </div>
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('hairStyle')}>
                    <select class="form-group" value=${settings.hairStyle} onChange=${(e: TargetedEvent<HTMLSelectElement>) => setSettings(s => ({ ...s, hairStyle: e.currentTarget.value }))}>
                        ${ID_PHOTO_HAIRSTYLE_OPTIONS.map(option => html`
                            <option value=${option.key}>${t(option.labelKey)}</option>
                        `)}
                    </select>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('detailedEdits')} initialOpen=${true}>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" checked=${settings.preserveHairStyle} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, preserveHairStyle: e.currentTarget.checked}))}/>
                            ${t('preserveHair')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.preserveFaceShape} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, preserveFaceShape: e.currentTarget.checked}))}/>
                            ${t('preserveFaceShape')}
                        </label>
                        <label><input type="checkbox" checked=${settings.preserveFaceDetails} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, preserveFaceDetails: e.currentTarget.checked}))}/> ${t('preserveFaceDetails')}</label>
                        <label><input type="checkbox" checked=${settings.smoothSkin} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, smoothSkin: e.currentTarget.checked}))}/> ${t('smoothSkin')}</label>
                        <label><input type="checkbox" checked=${settings.slightSmile} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, slightSmile: e.currentTarget.checked}))}/> ${t('slightSmile')}</label>
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('otherRequests')} initialOpen=${false}>
                    <div class="textarea-container">
                        <textarea 
                            id="custom-prompt" 
                            placeholder=${t('placeholder_glasses')}
                            value=${settings.customPrompt}
                            onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, customPrompt: e.currentTarget.value }))}
                        ></textarea>
                        ${settings.customPrompt && html`
                            <button class="clear-textarea-btn" onClick=${() => {
                                setSettings(s => ({ ...s, customPrompt: '' }))
                            }} title=${t('clear')}>
                                <${CloseIcon} />
                            </button>
                        `}
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('preservationPrompt')} initialOpen=${false}>
                    <div class="checkbox-group" style=${{marginBottom: '0.5rem'}}>
                        <label>
                            <input 
                                type="checkbox" 
                                checked=${settings.usePreservationPrompt} 
                                onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, usePreservationPrompt: e.currentTarget.checked}))}
                            />
                            <strong>${t('usePrompt')}</strong>
                        </label>
                    </div>
                    <textarea 
                        id="preservation-prompt" 
                        value=${settings.preservationPrompt}
                        onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, preservationPrompt: e.currentTarget.value }))}
                        disabled=${!settings.usePreservationPrompt}
                        rows="6"
                        style=${{
                            opacity: settings.usePreservationPrompt ? 1 : 0.6,
                            backgroundColor: settings.usePreservationPrompt ? 'var(--surface-2)' : 'var(--surface-1)'
                        }}
                    ></textarea>
                </${CollapsibleSection}>
                
                ${!isBatch && html`
                    <${CollapsibleSection} title=${t('section_num_images_id')}>
                        <${NumberButtonGroup}
                            value=${settings.numImages}
                            options=${[1, 2, 3, 4]}
                            onChange=${(num) => {
                                setSettings(s => ({ ...s, numImages: num }))
                            }}
                        />
                    </${CollapsibleSection}>
                `}
            </div>
            
            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !hasImage} style=${{width: '100%'}}>
                ${generating ? t('processing_photo') : (buttonText || t('button_generate_photo'))}
            </button>
        </div>
    `;
};

interface RestorationSettingsPanelProps extends CommonSettingsPanelProps {
    settings: RestorationSettings;
    setSettings: (updater: (s: RestorationSettings) => RestorationSettings) => void;
    isBatch?: boolean;
    currentImage?: string | null;
}

export const RestorationSettingsPanel: FunctionalComponent<RestorationSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, buttonText, onBackToHome, onChooseAnotherImage, isBatch = false, currentImage, t, language }) => {
    const [isDescribing, setIsDescribing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const handleDescribeImage = async () => {
        if (!currentImage) return;
        setIsDescribing(true);
        try {
            const description = await describeImageForPrompt(currentImage, 'general', language);
            setSettings(s => ({ ...s, advancedPrompt: description }));
        } catch (e) {
            console.error("Failed to describe image", e);
            alert(t('error_describe_failed'));
        } finally {
            setIsDescribing(false);
        }
    };

    const handleAnalyzeImage = async () => {
        if (!currentImage) return;
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeImageForRestoration(currentImage);
            setSettings(s => ({ ...s, ...analysis }));
        } catch (e) {
            console.error("Failed to analyze image", e);
            alert(t('error_analyze_failed'));
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const genderOptions = [
        { value: 'unknown', labelKey: 'option_unknown' },
        { value: 'male', labelKey: 'option_male' },
        { value: 'female', labelKey: 'option_female' },
    ];
    
    const ageRangeOptions = [
        { value: 'unknown', labelKey: 'age_range_unknown' },
        { value: '0-5', labelKey: 'age_range_0_5' },
        { value: '6-12', labelKey: 'age_range_6_12' },
        { value: '13-19', labelKey: 'age_range_13_19' },
        { value: '20-30', labelKey: 'age_range_20_30' },
        { value: '31-40', labelKey: 'age_range_31_40' },
        { value: '41-50', labelKey: 'age_range_41_50' },
        { value: '51+', labelKey: 'age_range_over_50' },
    ];
    
    const smileOptions = [
        { value: 'unknown', labelKey: 'option_unknown' },
        { value: 'not_smiling', labelKey: 'option_not_smiling' },
        { value: 'slight_smile', labelKey: 'option_slight_smile' },
        { value: 'big_smile', labelKey: 'option_big_smile' },
    ];
    
    const loading = generating || isDescribing || isAnalyzing;

    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
             ${!isBatch && onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}

            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>

                <div class="form-group" style=${{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                    <button class="btn btn-secondary" onClick=${handleAnalyzeImage} disabled=${loading || !hasImage}>
                        ${isAnalyzing ? t('button_analyzing') : t('button_auto_analyze')}
                    </button>
                    <button class="btn btn-secondary" onClick=${handleDescribeImage} disabled=${loading || !hasImage}>
                        ${isDescribing ? t('button_creating') : t('button_create_description')}
                    </button>
                </div>

                <${CollapsibleSection} title=${t('section_restore_options')}>
                    <div class="checkbox-group" style=${{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                        <label>
                            <input type="checkbox" checked=${settings.colorize} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, colorize: e.currentTarget.checked}))}/>
                            ${t('checkbox_colorize')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.sharpenBackground} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, sharpenBackground: e.currentTarget.checked}))}/>
                            ${t('checkbox_sharpen_bg')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.highQuality} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, highQuality: e.currentTarget.checked}))}/>
                            ${t('checkbox_high_quality')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.isVietnamese} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, isVietnamese: e.currentTarget.checked}))}/>
                            ${t('checkbox_is_vietnamese')}
                        </label>
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('backgroundColor')}>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="restore-bg" value="auto" checked=${settings.background === 'auto'} onChange=${() => setSettings(s => ({...s, background: 'auto'}))} />
                            ${t('auto')}
                        </label>
                        <label>
                            <input type="radio" name="restore-bg" value="white" checked=${settings.background === 'white'} onChange=${() => setSettings(s => ({...s, background: 'white'}))} />
                            ${t('white')}
                        </label>
                        <label>
                            <input type="radio" name="restore-bg" value="blue" checked=${settings.background === 'blue'} onChange=${() => setSettings(s => ({...s, background: 'blue'}))} />
                            ${t('blue')}
                        </label>
                        <label>
                            <input type="radio" name="restore-bg" value="gray" checked=${settings.background === 'gray'} onChange=${() => setSettings(s => ({...s, background: 'gray'}))} />
                            ${t('gray')}
                        </label>
                    </div>
                </${CollapsibleSection}>

                <div class="form-group" style=${{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                        <label for="number-of-people">${t('label_num_people')}</label>
                        <input type="text" class="number-input" id="number-of-people" value=${settings.numberOfPeople} onInput=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({ ...s, numberOfPeople: e.currentTarget.value }))} />
                    </div>
                     <div>
                        <label for="gender">${t('label_gender')}</label>
                        <select id="gender" class="form-group" value=${settings.gender} onChange=${(e: TargetedEvent<HTMLSelectElement>) => setSettings(s => ({ ...s, gender: e.currentTarget.value as RestorationSettings['gender'] }))}>
                            ${genderOptions.map(opt => html`<option value=${opt.value}>${t(opt.labelKey)}</option>`)}
                        </select>
                    </div>
                </div>
                 <div class="form-group" style=${{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                        <label for="age-range">${t('label_age')}</label>
                        <select id="age-range" class="form-group" value=${settings.ageRange} onChange=${(e: TargetedEvent<HTMLSelectElement>) => setSettings(s => ({ ...s, ageRange: e.currentTarget.value }))}>
                            ${ageRangeOptions.map(opt => html`<option value=${opt.value}>${t(opt.labelKey)}</option>`)}
                        </select>
                    </div>
                     <div>
                        <label for="smile">${t('label_smile')}</label>
                        <select id="smile" class="form-group" value=${settings.smile} onChange=${(e: TargetedEvent<HTMLSelectElement>) => setSettings(s => ({ ...s, smile: e.currentTarget.value as RestorationSettings['smile'] }))}>
                            ${smileOptions.map(opt => html`<option value=${opt.value}>${t(opt.labelKey)}</option>`)}
                        </select>
                    </div>
                </div>
                
                <${CollapsibleSection} title=${t('section_clothing_desc')}>
                    <p class="form-note" style=${{marginBottom: '1rem'}}>
                        ${t('note_clothing_override')}
                    </p>
                    <div class="textarea-container">
                        <textarea 
                            id="clothing-prompt-restore" 
                            placeholder=${t('placeholder_clothing_prompt')}
                            value=${settings.clothingPrompt}
                            onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, clothingPrompt: e.currentTarget.value }))}
                            rows="3"
                        ></textarea>
                        ${settings.clothingPrompt && html`
                            <button class="clear-textarea-btn" onClick=${() => {
                                setSettings(s => ({ ...s, clothingPrompt: '' }))
                            }} title=${t('clear')}>
                                <${CloseIcon} />
                            </button>
                        `}
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_advanced_requests')}>
                    <div class="textarea-container">
                        <textarea 
                            id="advanced-prompt-restore" 
                            placeholder=${t('placeholder_advanced_prompt')}
                            value=${settings.advancedPrompt}
                            onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, advancedPrompt: e.currentTarget.value }))}
                            rows="5"
                        ></textarea>
                        ${settings.advancedPrompt && html`
                            <button class="clear-textarea-btn" onClick=${() => {
                                setSettings(s => ({ ...s, advancedPrompt: '' }))
                            }} title=${t('clear')}>
                                <${CloseIcon} />
                            </button>
                        `}
                    </div>
                </${CollapsibleSection}>

                ${!isBatch && html`
                    <div class="form-group">
                        <label for="number-of-results">${t('label_num_results')}</label>
                        <input type="number" min="1" max="5" class="number-input" id="number-of-results" value=${settings.numberOfResults} onInput=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({ ...s, numberOfResults: Math.max(1, Math.min(5, parseInt(e.currentTarget.value) || 1)) }))} />
                    </div>
                `}
            </div>
            
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${loading || !hasImage} style=${{width: '100%', marginTop: 'auto'}}>
                ${loading ? t('processing') : (buttonText || t('button_restore_photo'))}
            </button>
        </div>
    `;
};


interface BackgroundSettingsPanelProps extends CommonSettingsPanelProps {
    settings: BackgroundSettings;
    setSettings: (updater: (s: BackgroundSettings) => BackgroundSettings) => void;
    onLaunchRefCrop: (file: File) => void;
    subjectImageUploaded: boolean;
    isBatch?: boolean;
    onUploaderHover?: (isHovering: boolean) => void;
}

export const BackgroundSettingsPanel: FunctionalComponent<BackgroundSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, isBatch = false, onBackToHome, onChooseAnotherImage, t, onLaunchRefCrop, subjectImageUploaded, onUploaderHover }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Trình duyệt không hỗ trợ nhập liệu giọng nói.");
            return;
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSettings(s => ({ ...s, prompt: s.prompt ? `${s.prompt} ${transcript}` : transcript }));
        };
        isRecording ? recognition.stop() : recognition.start();
    };
    
    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            onLaunchRefCrop(file);
        }
    };
    
    const handleSuggestionSelect = (promptText: string) => {
        const finalPrompt = `${t('bg_prompt_prefix')}${promptText}`.trim();
        setSettings(s => ({ ...s, prompt: finalPrompt }));
    };

    const handleLightingEffectChange = (effectKey: string) => {
        setSettings(s => {
            const currentEffects = s.lightingEffects || [];
            const newEffects = currentEffects.includes(effectKey)
                ? currentEffects.filter(e => e !== effectKey) // remove
                : [...currentEffects, effectKey]; // add
            return { ...s, lightingEffects: newEffects };
        });
    };

    const removePart = (prompt: string, partToRemove: string) => {
        return prompt.split(',').map(p => p.trim()).filter(p => p !== partToRemove && p).join(', ');
    };
    const addPart = (prompt: string, partToAdd: string) => {
        const parts = prompt.split(',').map(p => p.trim()).filter(p => p);
        if (!parts.includes(partToAdd)) {
            parts.push(partToAdd);
        }
        return parts.join(', ');
    };
    const hasPart = (prompt: string, part: string) => {
        return prompt.split(',').map(p => p.trim()).includes(part);
    };

    const handleForegroundChange = (optionText: string, isChecked: boolean) => {
        setSettings(s => {
            let currentPrompt = s.prompt;
            const autoText = t('label_foreground_auto');
            const flowerText = t('label_foreground_flower');
            const leafText = t('label_foreground_leaf');

            if (isChecked) {
                if (optionText === autoText) {
                    currentPrompt = addPart(currentPrompt, autoText);
                    currentPrompt = removePart(currentPrompt, flowerText);
                    currentPrompt = removePart(currentPrompt, leafText);
                } else {
                    currentPrompt = addPart(currentPrompt, optionText);
                    currentPrompt = removePart(currentPrompt, autoText);
                }
            } else {
                currentPrompt = removePart(currentPrompt, optionText);
            }

            return { ...s, prompt: currentPrompt };
        });
    };
    
    const handleWeatherChange = (weatherText: string) => {
        setSettings(s => {
            let promptParts = s.prompt.split(',').map(p => p.trim()).filter(Boolean);
            const allWeatherTexts = [
                t('label_weather_sunny'), 
                t('label_weather_harsh'), 
                t('label_weather_sunset'), 
                t('label_weather_night')
            ];
            promptParts = promptParts.filter(p => !allWeatherTexts.includes(p));
            if (weatherText) {
                promptParts.push(weatherText);
            }
            return { ...s, prompt: promptParts.join(', ') };
        });
    };
    
    const canGenerate = useMemo(() => {
        return hasImage && (settings.prompt.trim() !== '' || settings.referenceImage !== null);
    }, [hasImage, settings.prompt, settings.referenceImage]);

    const apertureMap = ['f/16', 'f/11', 'f/8', 'f/5.6', 'f/4', 'f/3.5', 'f/2.8', 'f/2.0', 'f/1.8', 'f/1.4', 'f/1.2'];
    const getApertureLabel = (value: number) => apertureMap[value] || 'f/16';
    
    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && !isBatch && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}

            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_ref_image')}>
                    <div 
                        class="reference-uploader ${isDragging ? 'drag-over' : ''}" 
                        style=${{cursor: 'default'}}
                        onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
                        onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
                        onDrop=${handleDrop}
                        onMouseEnter=${() => onUploaderHover?.(true)}
                        onMouseLeave=${() => onUploaderHover?.(false)}
                        onPaste=${stopEvent}
                        title=${!subjectImageUploaded ? t('error_no_subject_for_ref') : ''}
                    >
                        ${settings.referenceImage ? html`
                            <img src=${settings.referenceImage} alt="Reference" class="reference-preview"/>
                            <button class="remove-reference-btn" onClick=${(e: MouseEvent) => { e.stopPropagation(); 
                                setSettings(s => ({ ...s, referenceImage: null })); 
                            }} title=${t('removeTemplate')}><${CloseIcon}/></button>
                        ` : html`
                            <div class="reference-placeholder" style=${{gap: '0.25rem'}}>
                               <${UploadIcon} />
                               <span style=${{fontWeight: 500}}>${t('uploader_drag_drop_prompt')}</span>
                               <span style=${{fontSize: '0.8em', opacity: 0.7}}>${t('uploader_drag_drop_note')}</span>
                            </div>
                        `}
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_your_prompt')}>
                    <div class="voice-input-container">
                        <textarea 
                            id="bg-prompt" 
                            placeholder=${t('placeholder_bg_prompt')}
                            value=${settings.prompt}
                            onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, prompt: e.currentTarget.value }))}
                        ></textarea>
                        ${settings.prompt && html`
                            <button class="clear-textarea-btn" onClick=${() => {
                                setSettings(s => ({ ...s, prompt: '' }))
                            }} title=${t('clear')}>
                                <${CloseIcon} />
                            </button>
                        `}
                        <button class="voice-btn ${isRecording ? 'recording' : ''}" onClick=${handleVoiceInput} title=${t('button_voice_input')}>
                            <${MicIcon} recording=${isRecording} />
                        </button>
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_visual_effects')} initialOpen=${true}>
                     <div class="form-group" style=${{marginBottom: '0.75rem'}}>
                        <label>${t('foreground_background_options')}</label>
                        <div class="checkbox-group" style=${{marginTop: '0.5rem', display: 'flex', flexDirection: 'row', gap: '1rem'}}>
                            ${[
                                { labelKey: 'label_foreground_auto', text: t('label_foreground_auto') },
                                { labelKey: 'label_foreground_flower', text: t('label_foreground_flower') },
                                { labelKey: 'label_foreground_leaf', text: t('label_foreground_leaf') },
                            ].map(opt => html`
                                <label>
                                    <input 
                                        type="checkbox"
                                        checked=${hasPart(settings.prompt, opt.text)}
                                        onChange=${(e: TargetedEvent<HTMLInputElement>) => handleForegroundChange(opt.text, e.currentTarget.checked)}
                                    />
                                    ${t(opt.labelKey)}
                                </label>
                            `)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="lens-blur-slider">
                            ${t('label_lens_blur')}
                            <span style=${{float: 'right', color: 'var(--text-secondary)'}}>${getApertureLabel(settings.lensBlur)}</span>
                        </label>
                        <input
                            type="range"
                            id="lens-blur-slider"
                            min="0"
                            max="10"
                            step="1"
                            style=${{width: '100%', marginTop: '0.5rem'}}
                            value=${settings.lensBlur}
                            onInput=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({ ...s, lensBlur: parseInt(e.currentTarget.value, 10) }))}
                        />
                    </div>
                    <div class="form-group" style=${{marginBottom: '0.75rem'}}>
                        <label>${t('weather_options')}</label>
                        <div class="radio-group" style=${{marginTop: '0.5rem'}}>
                             <label>
                                <input type="radio" name="weather" checked=${![t('label_weather_sunny'), t('label_weather_harsh'), t('label_weather_sunset'), t('label_weather_night')].some(p => hasPart(settings.prompt, p))} onChange=${() => handleWeatherChange('')} />
                                ${t('option_none')}
                            </label>
                            ${[
                                { labelKey: 'label_weather_sunny', text: t('label_weather_sunny') },
                                { labelKey: 'label_weather_harsh', text: t('label_weather_harsh') },
                                { labelKey: 'label_weather_sunset', text: t('label_weather_sunset') },
                                { labelKey: 'label_weather_night', text: t('label_weather_night') },
                            ].map(opt => html`
                                <label>
                                    <input type="radio" name="weather" checked=${hasPart(settings.prompt, opt.text)} onChange=${() => handleWeatherChange(opt.text)} />
                                    ${t(opt.labelKey)}
                                </label>
                            `)}
                        </div>
                    </div>
                    <${CollapsibleSection} title=${t('section_lighting_effects')} initialOpen=${false}>
                        <div class="suggestions-list">
                            ${Object.entries(BACKGROUND_LIGHTING_EFFECTS).map(([groupKey, options]) => html`
                                <div class="suggestion-sub-category" style=${{marginBottom: '0.5rem'}}>
                                    <h4>${t(groupKey)}</h4>
                                    <div class="checkbox-group" style=${{gap: '0.5rem', paddingLeft: '0.5rem'}}>
                                        ${options.map(opt => html`
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked=${settings.lightingEffects?.includes(opt.key)}
                                                    onChange=${() => handleLightingEffectChange(opt.key)}
                                                />
                                                <span>${t(opt.labelKey)}</span>
                                            </label>
                                        `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </${CollapsibleSection}>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('options')} initialOpen=${false}>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" checked=${settings.keepPose} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, keepPose: e.currentTarget.checked}))} />
                            ${t('checkbox_keep_pose')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.keepComposition} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, keepComposition: e.currentTarget.checked}))} />
                            ${t('checkbox_keep_composition')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.keepFocalLength} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, keepFocalLength: e.currentTarget.checked}))} />
                            ${t('checkbox_keep_focal_length')}
                        </label>
                        <label>
                            <input type="checkbox" checked=${settings.keepAspectRatio} onChange=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({...s, keepAspectRatio: e.currentTarget.checked}))} />
                            ${t('checkbox_keep_aspect_ratio')}
                        </label>
                    </div>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('section_prompt_suggestions')}>
                     ${BACKGROUND_PROMPT_SUGGESTIONS.map(category => html`
                        <${CollapsibleSection} title=${t(category.labelKey)} initialOpen=${false}>
                            <div class="suggestions-list" style=${{resize: 'none', height: '250px', padding: '0.5rem'}}>
                                ${category.subCategories.map(subCat => html`
                                    <div class="suggestion-sub-category">
                                        <h4>${t(subCat.labelKey)}</h4>
                                        <ul>
                                            ${subCat.items.map(item => html`
                                                <li onClick=${() => handleSuggestionSelect(t(item.promptKey))}>
                                                    ${t(item.promptKey)}
                                                </li>
                                            `)}
                                        </ul>
                                    </div>
                                `)}
                            </div>
                        </${CollapsibleSection}>
                    `)}
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_negative_prompt')} initialOpen=${false}>
                    <textarea 
                        id="negative-prompt" 
                        rows="3"
                        disabled
                        value=${settings.negativePrompt}
                        style=${{backgroundColor: 'var(--surface-2)', opacity: 0.7, resize: 'none'}}
                    />
                </${CollapsibleSection}>
                
                ${!isBatch && html`
                    <${CollapsibleSection} title=${t('numberOfImages')}>
                        <${NumberButtonGroup}
                            value=${settings.numImages}
                            options=${[1, 2, 3, 4]}
                            onChange=${(num) => {
                                setSettings(s => ({ ...s, numImages: num }))
                            }}
                        />
                    </${CollapsibleSection}>
                `}
            </div>
            
            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !canGenerate} style=${{width: '100%'}}>
                ${generating ? t('processing') : t('button_generate_photo_enter')}
            </button>
        </div>
    `;
};

interface ClothingChangeSettingsPanelProps extends CommonSettingsPanelProps {
    settings: ClothingChangeSettings;
    setSettings: (updater: (s: ClothingChangeSettings) => ClothingChangeSettings) => void;
    isBatch?: boolean;
}

export const ClothingChangeSettingsPanel: FunctionalComponent<ClothingChangeSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, onBackToHome, onChooseAnotherImage, buttonText, isBatch = false, onEnterFullscreen, t, language }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDescribing, setIsDescribing] = useState(false);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert(t('error_voice_not_supported'));
            return;
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = language;
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSettings(s => ({ ...s, prompt: s.prompt ? `${s.prompt} ${transcript}` : transcript }));
        };
        isRecording ? recognition.stop() : recognition.start();
    };
    
    const handleAutoDescribe = async () => {
        if (!settings.referenceImage) return;
        setIsDescribing(true);
        setNotification('');
        try {
            const description = await describeImageForPrompt(settings.referenceImage, 'clothing', language);
            setSettings(s => ({...s, prompt: description}));
            setNotification(t('toast_analysis_complete_clothing'));
        } catch (e) {
            console.error("Failed to auto-describe image:", e);
            setNotification(t('toast_analysis_error_clothing'));
        } finally {
            setIsDescribing(false);
        }
    };

    const processFile = (file: File) => {
        onEnterFullscreen?.();
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const imageDataUrl = loadEvent.target?.result as string;
            if (imageDataUrl) {
                setSettings(s => ({ ...s, referenceImage: imageDataUrl }));
                handleAutoDescribe();
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        if (e.dataTransfer?.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const canGenerate = useMemo(() => {
        return hasImage && (settings.prompt.trim() !== '' || settings.referenceImage !== null);
    }, [hasImage, settings.prompt, settings.referenceImage]);

    return html`
        ${notification && html`<div class="toast-notification">${notification}</div>`}
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && !isBatch && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}

            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_clothing_description')}>
                    <div class="voice-input-container">
                        <textarea 
                            placeholder=${t('placeholder_clothing_change')}
                            value=${settings.prompt}
                            rows="4"
                            onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, prompt: e.currentTarget.value }))}
                        ></textarea>
                         ${settings.prompt && html`
                            <button class="clear-textarea-btn" onClick=${() => setSettings(s => ({ ...s, prompt: '' }))} title=${t('clear')}>
                                <${CloseIcon} />
                            </button>
                        `}
                        <button class="voice-btn ${isRecording ? 'recording' : ''}" onClick=${handleVoiceInput} title=${t('button_voice_input')}>
                            <${MicIcon} recording=${isRecording} />
                        </button>
                    </div>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('section_clothing_ref')}>
                    <div 
                        class="reference-uploader ${isDragging ? 'drag-over' : ''}" 
                        style=${{cursor: 'default', width: '100%', height: '120px'}}
                        onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
                        onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
                        onDrop=${handleDrop}
                        onPaste=${stopEvent}
                    >
                         ${settings.referenceImage ? html`
                            <img src=${settings.referenceImage} alt="Reference" class="reference-preview"/>
                            <button class="remove-reference-btn" onClick=${(e: MouseEvent) => { e.stopPropagation(); setSettings(s => ({ ...s, referenceImage: null })); }} title=${t('removeTemplate')}><${CloseIcon}/></button>
                        ` : html`
                            <div class="reference-placeholder" style=${{gap: '0.25rem'}}>
                               <${UploadIcon} />
                               <span style=${{fontWeight: 500}}>${t('uploader_drag_drop_prompt')}</span>
                               <span style=${{fontSize: '0.8em', opacity: 0.7}}>${t('uploader_drag_drop_note')}</span>
                            </div>
                        `}
                    </div>
                    <button class="btn btn-secondary" style=${{width: '100%', marginTop: '1rem'}} onClick=${handleAutoDescribe} disabled=${!settings.referenceImage || isDescribing}>
                        ${isDescribing ? t('processing') : t('button_auto_describe_ref')}
                    </button>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_color_optional')} initialOpen=${false}>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="clothing-color" value="" checked=${!settings.color} onChange=${() => setSettings(s => ({...s, color: null}))} />
                            ${t('option_none')}
                        </label>
                        <label>
                            <input type="radio" name="clothing-color" value="red" checked=${settings.color === 'red'} onChange=${() => setSettings(s => ({...s, color: 'red'}))} />
                            ${t('color_red')}
                        </label>
                        <label>
                            <input type="radio" name="clothing-color" value="black" checked=${settings.color === 'black'} onChange=${() => setSettings(s => ({...s, color: 'black'}))} />
                            ${t('color_black')}
                        </label>
                         <label>
                            <input type="radio" name="clothing-color" value="white" checked=${settings.color === 'white'} onChange=${() => setSettings(s => ({...s, color: 'white'}))} />
                            ${t('color_white')}
                        </label>
                    </div>
                </${CollapsibleSection}>
                
                ${!isBatch && html`
                    <${CollapsibleSection} title=${t('numberOfImages')}>
                        <${NumberButtonGroup}
                            value=${settings.numImages}
                            options=${[1, 2, 3, 4]}
                            onChange=${(num) => {
                                setSettings(s => ({ ...s, numImages: num }))
                            }}
                        />
                    </${CollapsibleSection}>
                `}
            </div>

            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || isDescribing || !canGenerate} style=${{width: '100%'}}>
                ${generating || isDescribing ? t('processing') : (buttonText || t('button_generate_photo_enter'))}
            </button>
        </div>
    `;
};

interface HairStyleSettingsPanelProps extends CommonSettingsPanelProps {
    settings: HairStyleSettings;
    setSettings: (updater: (s: HairStyleSettings) => HairStyleSettings) => void;
}

export const HairStyleSettingsPanel: FunctionalComponent<HairStyleSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, onBackToHome, onChooseAnotherImage, t }) => {
    const [suggestionModalCategory, setSuggestionModalCategory] = useState<string | null>(null);

    const handleSuggestionSelect = (prompt: string) => {
        setSettings(s => ({ ...s, prompt: prompt }));
        setSuggestionModalCategory(null);
    };

    const suggestionsForModal = useMemo(() => {
        if (!suggestionModalCategory) return {};
        const suggestions = HAIR_STYLE_SUGGESTIONS[suggestionModalCategory as 'male' | 'female'];
        const translated: Record<string, string[]> = {};
        for (const key in suggestions) {
            translated[key] = suggestions[key];
        }
        return translated;
    }, [suggestionModalCategory, t]);

    return html`
        ${suggestionModalCategory && html`
            <${SuggestionLightbox}
                t=${t}
                category=${t(suggestionModalCategory === 'male' ? 'gender_male' : 'gender_female')}
                suggestions=${suggestionsForModal}
                onSelect=${handleSuggestionSelect}
                onClose=${() => setSuggestionModalCategory(null)}
            />
        `}
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}
            
            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_hair_description')}>
                    <textarea 
                        class="form-group"
                        placeholder=${t('placeholder_hair_style')}
                        value=${settings.prompt}
                        onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, prompt: e.currentTarget.value }))}
                        rows="4"
                    ></textarea>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('section_hair_suggestions')}>
                    <div class="radio-group" style=${{marginBottom: '1rem'}}>
                        <label>
                            <input type="radio" name="gender" value="female" checked=${settings.gender === 'female'} onChange=${() => setSettings(s => ({ ...s, gender: 'female' }))} />
                            ${t('gender_female')}
                        </label>
                        <label>
                            <input type="radio" name="gender" value="male" checked=${settings.gender === 'male'} onChange=${() => setSettings(s => ({ ...s, gender: 'male' }))} />
                            ${t('gender_male')}
                        </label>
                    </div>
                     <button class="btn btn-secondary" style=${{width: '100%'}} onClick=${() => setSuggestionModalCategory(settings.gender)}>
                        ${t('section_hair_suggestions')}...
                    </button>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('numberOfImages')}>
                    <${NumberButtonGroup}
                        value=${settings.numImages}
                        options=${[1, 2, 3, 4]}
                        onChange=${(num) => setSettings(s => ({ ...s, numImages: num }))}
                    />
                </${CollapsibleSection}>
            </div>
            
            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !hasImage || !settings.prompt.trim()} style=${{width: '100%'}}>
                ${generating ? t('processing') : t('button_generate_photo_enter')}
            </button>
        </div>
    `;
};

interface BabyConceptSettingsPanelProps extends CommonSettingsPanelProps {
    settings: BabyConceptSettings;
    setSettings: (updater: (s: BabyConceptSettings) => BabyConceptSettings) => void;
}

export const BabyConceptSettingsPanel: FunctionalComponent<BabyConceptSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, onBackToHome, onChooseAnotherImage, t }) => {
    
    const concepts = useMemo(() => BABY_CONCEPTS[settings.gender], [settings.gender]);
    
    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}
            
            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_select_concept')}>
                    <div class="radio-group" style=${{marginBottom: '1rem'}}>
                        <label>
                            <input type="radio" name="gender-baby" value="boy" checked=${settings.gender === 'boy'} onChange=${() => setSettings(s => ({ ...s, gender: 'boy', selectedConceptPrompt: null }))} />
                            ${t('gender_boy')}
                        </label>
                        <label>
                            <input type="radio" name="gender-baby" value="girl" checked=${settings.gender === 'girl'} onChange=${() => setSettings(s => ({ ...s, gender: 'girl', selectedConceptPrompt: null }))} />
                            ${t('gender_girl')}
                        </label>
                    </div>
                    <div class="clothing-grid">
                        ${concepts.map(concept => html`
                            <button 
                                class="clothing-btn ${settings.selectedConceptPrompt === concept.prompt ? 'active' : ''}"
                                onClick=${() => setSettings(s => ({ ...s, selectedConceptPrompt: concept.prompt }))}
                            >${t(concept.labelKey)}</button>
                        `)}
                    </div>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('numberOfImages')}>
                    <${NumberButtonGroup}
                        value=${settings.numImages}
                        options=${[1, 2, 3, 4]}
                        onChange=${(num) => setSettings(s => ({ ...s, numImages: num }))}
                    />
                </${CollapsibleSection}>
            </div>
            
            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !hasImage || !settings.selectedConceptPrompt} style=${{width: '100%'}}>
                ${generating ? t('processing') : t('button_generate_photo_enter')}
            </button>
        </div>
    `;
};

interface PosingStudioSettingsPanelProps extends CommonSettingsPanelProps {
    settings: PosingStudioSettings;
    setSettings: (updater: (s: PosingStudioSettings) => PosingStudioSettings) => void;
}

export const PosingStudioSettingsPanel: FunctionalComponent<PosingStudioSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, onBackToHome, onChooseAnotherImage, t }) => {
    const [activePoseTab, setActivePoseTab] = useState<'female' | 'male' | 'custom'>('female');
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setSettings(s => ({ ...s, faceReferenceImage: loadEvent.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const togglePredefinedPose = (prompt: string) => {
        setSettings(s => {
            const newPoses = s.selectedPoses.includes(prompt)
                ? s.selectedPoses.filter(p => p !== prompt)
                : [...s.selectedPoses, prompt];
            return { ...s, selectedPoses: newPoses };
        });
    };

    const updateCustomPose = (index: number, value: string) => {
        setSettings(s => {
            const newPrompts = [...s.customPosePrompts];
            newPrompts[index] = value;
            return { ...s, customPosePrompts: newPrompts };
        });
    };
    
    const addCustomPoseField = () => {
        setSettings(s => ({ ...s, customPosePrompts: [...s.customPosePrompts, ''] }));
    };

    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}

             <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_face_ref')}>
                    <div 
                        class="reference-uploader ${isDragging ? 'drag-over' : ''}" 
                        style=${{cursor: 'default'}}
                        onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
                        onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)}
                        onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
                        onDrop=${handleDrop}
                        onPaste=${stopEvent}
                    >
                        ${settings.faceReferenceImage ? html`
                            <img src=${settings.faceReferenceImage} alt="Face Reference" class="reference-preview"/>
                            <button class="remove-reference-btn" onClick=${(e: MouseEvent) => { e.stopPropagation(); setSettings(s => ({ ...s, faceReferenceImage: null })); }} title=${t('removeTemplate')}><${CloseIcon}/></button>
                        ` : html`
                            <div class="reference-placeholder" style=${{gap: '0.25rem'}}>
                               <${UploadIcon} />
                               <span style=${{fontWeight: 500}}>${t('uploader_drag_drop_prompt')}</span>
                               <span style=${{fontSize: '0.8em', opacity: 0.7}}>${t('uploader_drag_drop_note')}</span>
                            </div>
                        `}
                    </div>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('section_select_pose')}>
                    <${InfoNote}>${t('note_posing_studio')}</${InfoNote}>
                    <div class="page-tabs" style=${{marginTop: '1rem'}}>
                        <button class=${`page-tab ${activePoseTab === 'female' ? 'active' : ''}`} onClick=${() => setActivePoseTab('female')}>${t('tab_pose_female')}</button>
                        <button class=${`page-tab ${activePoseTab === 'male' ? 'active' : ''}`} onClick=${() => setActivePoseTab('male')}>${t('tab_pose_male')}</button>
                        <button class=${`page-tab ${activePoseTab === 'custom' ? 'active' : ''}`} onClick=${() => setActivePoseTab('custom')}>${t('tab_pose_custom')}</button>
                    </div>

                    ${activePoseTab !== 'custom' && html`
                        <div class="clothing-grid">
                            ${POSING_STUDIO_SUGGESTIONS[activePoseTab].map(pose => html`
                                <button 
                                    class="clothing-btn ${settings.selectedPoses.includes(pose.prompt) ? 'active' : ''}"
                                    onClick=${() => togglePredefinedPose(pose.prompt)}
                                >
                                    ${t(pose.labelKey)}
                                </button>
                            `)}
                        </div>
                    `}
                    ${activePoseTab === 'custom' && html`
                        <div class="custom-pose-prompts">
                            ${POSING_STUDIO_CUSTOM_SUGGESTIONS.map(sugg => html`
                                <p class="suggestion-text">${t('suggestion_prefix')}<em>${sugg}</em></p>
                            `)}
                            ${settings.customPosePrompts.map((prompt, index) => html`
                                <textarea 
                                    placeholder=${t('placeholder_posing_studio')}
                                    value=${prompt}
                                    onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => updateCustomPose(index, e.currentTarget.value)}
                                ></textarea>
                            `)}
                            <button class="btn btn-secondary" onClick=${addCustomPoseField}>${t('add_description')}</button>
                        </div>
                    `}
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_num_images_posing')}>
                    <${NumberButtonGroup}
                        value=${settings.numImages}
                        options=${[1, 2, 3, 4]}
                        onChange=${(num) => setSettings(s => ({ ...s, numImages: num }))}
                    />
                </${CollapsibleSection}>

             </div>

            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !hasImage || (settings.selectedPoses.length === 0 && settings.customPosePrompts.every(p => p.trim() === ''))} style=${{width: '100%'}}>
                ${generating ? t('processing_posing') : t('button_generate_photo_enter')}
            </button>
        </div>
    `;
};


interface AiEditorSettingsPanelProps extends CommonSettingsPanelProps {
    settings: AiEditorSettings;
    setSettings: (updater: (s: AiEditorSettings) => AiEditorSettings) => void;
}

export const AiEditorSettingsPanel: FunctionalComponent<AiEditorSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, onBackToHome, onChooseAnotherImage, t, language }) => {
    const [isDescribing, setIsDescribing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setSettings(s => ({ ...s, assistantImage: loadEvent.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };
    
    const handleAutoDescribe = async () => {
        if (!settings.assistantImage) return;
        setIsDescribing(true);
        try {
            const description = await describeImageForPrompt(settings.assistantImage, settings.assistantMode, language);
            setSettings(s => ({ ...s, prompt: s.prompt ? `${s.prompt} ${description}` : description }));
        } catch (e) {
            console.error(e);
            alert(t('error_describe_failed'));
        } finally {
            setIsDescribing(false);
        }
    };

    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}
            
            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_edit_request')}>
                    <textarea 
                        class="form-group"
                        placeholder=${t('placeholder_ai_editor')}
                        value=${settings.prompt}
                        onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, prompt: e.currentTarget.value }))}
                        rows="6"
                    ></textarea>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('section_ai_assistant')}>
                    <${InfoNote}>${t('note_ai_assistant')}</${InfoNote}>
                     <div 
                        class="reference-uploader ${isDragging ? 'drag-over' : ''}" 
                        style=${{cursor: 'default'}}
                        onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
                        onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)}
                        onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
                        onDrop=${handleDrop}
                        onPaste=${stopEvent}
                    >
                        ${settings.assistantImage ? html`
                            <img src=${settings.assistantImage} alt="Assistant Image" class="reference-preview"/>
                            <button class="remove-reference-btn" onClick=${(e: MouseEvent) => { e.stopPropagation(); setSettings(s => ({ ...s, assistantImage: null })); }} title=${t('removeTemplate')}><${CloseIcon}/></button>
                        ` : html`
                            <div class="reference-placeholder" style=${{gap: '0.25rem'}}>
                               <${UploadIcon} />
                               <span style=${{fontWeight: 500}}>${t('uploader_drag_drop_prompt')}</span>
                               <span style=${{fontSize: '0.8em', opacity: 0.7}}>${t('uploader_drag_drop_note')}</span>
                            </div>
                        `}
                    </div>
                    <div class="radio-group" style=${{margin: '1rem 0'}}>
                        <label>
                            <input type="radio" name="describe-mode" value="background" checked=${settings.assistantMode === 'background'} onChange=${() => setSettings(s => ({...s, assistantMode: 'background'}))} />
                            ${t('label_describe_background')}
                        </label>
                        <label>
                            <input type="radio" name="describe-mode" value="clothing" checked=${settings.assistantMode === 'clothing'} onChange=${() => setSettings(s => ({...s, assistantMode: 'clothing'}))} />
                            ${t('label_describe_clothing')}
                        </label>
                    </div>
                    <button class="btn btn-secondary" style=${{width: '100%'}} onClick=${handleAutoDescribe} disabled=${!settings.assistantImage || isDescribing}>
                        ${isDescribing ? t('processing') : t('button_auto_describe')}
                    </button>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('numberOfImages')}>
                    <${NumberButtonGroup}
                        value=${settings.numImages}
                        options=${[1, 2, 3, 4]}
                        onChange=${(num) => setSettings(s => ({ ...s, numImages: num }))}
                    />
                </${CollapsibleSection}>
            </div>
            
            <${HotkeysInfo} t=${t} />
            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !hasImage || !settings.prompt.trim()} style=${{width: '100%'}}>
                ${generating ? t('processing') : t('button_generate_photo_enter')}
            </button>
        </div>
    `;
};


interface TrendCreatorSettingsPanelProps extends CommonSettingsPanelProps {
    settings: TrendCreatorSettings;
    setSettings: (updater: (s: TrendCreatorSettings) => TrendCreatorSettings) => void;
}

export const TrendCreatorSettingsPanel: FunctionalComponent<TrendCreatorSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage: hasSubjectImage, onBackToHome, onChooseAnotherImage, t, language, setLanguage }) => {
    
    const handleSelectPredefinedTrend = (trendKey: string) => {
        setSettings(s => {
            const newSelectedTrends = s.selectedTrends.includes(trendKey)
                ? s.selectedTrends.filter(k => k !== trendKey)
                : [...s.selectedTrends, trendKey];

            return { ...s, selectedTrends: newSelectedTrends };
        });
    };
    
    useEffect(() => {
        const combinedPrompt = settings.selectedTrends
            .map(key => PREDEFINED_TRENDS[key as keyof typeof PREDEFINED_TRENDS]?.prompt || '')
            .filter(p => p)
            .join('\n\n---\n\n');
        
        if (settings.selectedTrends.length > 0) {
            setSettings(s => ({ ...s, prompt: combinedPrompt }));
        }
    }, [settings.selectedTrends]);

    const canGenerate = useMemo(() => hasSubjectImage && (settings.prompt.trim() !== '' || settings.selectedTrends.length > 0), [hasSubjectImage, settings.prompt, settings.selectedTrends]);

    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}
            
            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <${CollapsibleSection} title=${t('section_select_trend')}>
                    <div class="clothing-grid">
                        ${Object.entries(PREDEFINED_TRENDS).map(([key, trend]) => html`
                            <button key=${key} onClick=${() => handleSelectPredefinedTrend(key)} class="clothing-btn ${settings.selectedTrends.includes(key) ? 'active' : ''}">
                                ${t(trend.labelKey)}
                            </button>
                        `)}
                    </div>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_create_trend')}>
                    <div class="form-group">
                        <label for="shop-name">${t('label_shop_name')}</label>
                        <input id="shop-name" type="text" placeholder=${t('placeholder_shop_name')} value=${settings.shopName} onInput=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({ ...s, shopName: e.currentTarget.value }))} />
                    </div>
                     <div class="form-group">
                        <label for="scene-desc">${t('label_scene_desc')}</label>
                        <input id="scene-desc" type="text" placeholder=${t('placeholder_scene_desc')} value=${settings.sceneDescription} onInput=${(e: TargetedEvent<HTMLInputElement>) => setSettings(s => ({ ...s, sceneDescription: e.currentTarget.value }))} />
                    </div>
                    <div class="form-group">
                        <label for="trend-prompt">Prompt</label>
                        <textarea id="trend-prompt" value=${settings.prompt} onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, prompt: e.currentTarget.value }))} placeholder=${t('placeholder_trend_prompt')} rows="6"></textarea>
                    </div>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('numberOfImages')}>
                    <${NumberButtonGroup}
                        value=${settings.numImages}
                        options=${[1, 2, 3, 4]}
                        onChange=${(num) => setSettings(s => ({ ...s, numImages: num }))}
                    />
                </${CollapsibleSection}>
            </div>

            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !canGenerate} style=${{width: '100%'}}>
                ${generating ? t('processing') : t('button_generate_photo_enter')}
            </button>
        </div>
    `;
};


interface VideoMarketingSettingsPanelProps extends CommonSettingsPanelProps {
    settings: VideoMarketingSettings;
    setSettings: (updater: (s: VideoMarketingSettings) => VideoMarketingSettings) => void;
}

export const VideoMarketingSettingsPanel: FunctionalComponent<VideoMarketingSettingsPanelProps> = ({ settings, setSettings, onGenerate, generating, hasImage, onBackToHome, onChooseAnotherImage, t }) => {
    
    const cameraMovements: Record<string, { labelKey: string; prompt: string }> = {
        none: { labelKey: 'option_none', prompt: '' },
        pan_left: { labelKey: 'camera_pan_left', prompt: 'chuyển động máy quay lia chậm sang trái' },
        pan_right: { labelKey: 'camera_pan_right', prompt: 'chuyển động máy quay lia chậm sang phải' },
        zoom_in: { labelKey: 'camera_zoom_in', prompt: 'chuyển động máy quay zoom chậm vào' },
        zoom_out: { labelKey: 'camera_zoom_out', prompt: 'chuyển động máy quay zoom chậm ra' },
        tilt_up: { labelKey: 'camera_tilt_up', prompt: 'chuyển động máy quay ngước chậm lên' },
        dolly: { labelKey: 'camera_dolly', prompt: 'chuyển động máy quay đẩy chậm tới' },
    };

    const envEffects: Record<string, { labelKey: string; prompt: string }> = {
        none: { labelKey: 'option_none', prompt: '' },
        wind: { labelKey: 'effect_wind', prompt: 'với hiệu ứng gió nhẹ thổi' },
        sun: { labelKey: 'effect_sun', prompt: 'với hiệu ứng tia nắng điện ảnh' },
        rain: { labelKey: 'effect_rain', prompt: 'với hiệu ứng mưa rơi nhẹ' },
        snow: { labelKey: 'effect_snow', prompt: 'với hiệu ứng tuyết rơi nhẹ' },
        auto: { labelKey: 'effect_auto', prompt: 'với hiệu ứng môi trường tự động' },
    };

    const handleSuggestionChange = (allSuggestions: Record<string, { prompt: string }>, newPromptValue: string) => {
        const allPrompts = Object.values(allSuggestions).map(v => v.prompt).filter(Boolean);
        setSettings(s => {
            let currentParts = s.prompt.split(',').map(p => p.trim()).filter(p => !allPrompts.includes(p) && p);
            if (newPromptValue) {
                currentParts.push(newPromptValue);
            }
            return { ...s, prompt: currentParts.join(', ') };
        });
    };

    return html`
        <div class="settings-panel">
            <button onClick=${onBackToHome} class="back-button">${t('backButton')}</button>
            ${onChooseAnotherImage && html`<button class="btn btn-secondary" onClick=${onChooseAnotherImage} style=${{width: '100%', marginBottom: '1rem'}}>${t('selectAnotherImage')}</button>`}

            <div style=${{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
                 <${CollapsibleSection} title=${t('section_video_description')}>
                    <textarea 
                        class="form-group"
                        placeholder=${t('placeholder_video_marketing')}
                        value=${settings.prompt}
                        onInput=${(e: TargetedEvent<HTMLTextAreaElement>) => setSettings(s => ({ ...s, prompt: e.currentTarget.value }))}
                        rows="4"
                    ></textarea>
                </${CollapsibleSection}>

                <${CollapsibleSection} title=${t('section_camera_movement')}>
                    <div class="radio-group">
                        ${Object.values(cameraMovements).map(value => html`
                            <label>
                                <input 
                                    type="radio" 
                                    name="camera-movement"
                                    checked=${value.prompt ? settings.prompt.includes(value.prompt) : !Object.values(cameraMovements).some(v => v.prompt && settings.prompt.includes(v.prompt))}
                                    onChange=${() => handleSuggestionChange(cameraMovements, value.prompt)}
                                />
                                ${t(value.labelKey)}
                            </label>
                        `)}
                    </div>
                </${CollapsibleSection}>
                
                <${CollapsibleSection} title=${t('section_env_effects')}>
                    <div class="radio-group">
                        ${Object.values(envEffects).map(value => html`
                            <label>
                                <input 
                                    type="radio" 
                                    name="env-effect" 
                                    checked=${value.prompt ? settings.prompt.includes(value.prompt) : !Object.values(envEffects).some(v => v.prompt && settings.prompt.includes(v.prompt))}
                                    onChange=${() => handleSuggestionChange(envEffects, value.prompt)}
                                />
                                ${t(value.labelKey)}
                            </label>
                        `)}
                    </div>
                </${CollapsibleSection}>

                 <${CollapsibleSection} title=${t('section_aspect_ratio')}>
                     <div class="radio-group">
                        <label>
                            <input type="radio" name="aspect-ratio" value="9:16" checked=${settings.aspectRatio === '9:16'} onChange=${() => setSettings(s => ({...s, aspectRatio: '9:16'}))} />
                            ${t('aspect_ratio_vertical')}
                        </label>
                        <label>
                            <input type="radio" name="aspect-ratio" value="16:9" checked=${settings.aspectRatio === '16:9'} onChange=${() => setSettings(s => ({...s, aspectRatio: '16:9'}))} />
                            ${t('aspect_ratio_horizontal')}
                        </label>
                        <label>
                            <input type="radio" name="aspect-ratio" value="1:1" checked=${settings.aspectRatio === '1:1'} onChange=${() => setSettings(s => ({...s, aspectRatio: '1:1'}))} />
                            ${t('aspect_ratio_square')}
                        </label>
                    </div>
                 </${CollapsibleSection}>
            </div>

            <button class="btn btn-primary" onClick=${onGenerate} disabled=${generating || !hasImage || !settings.prompt.trim()} style=${{width: '100%', marginTop: 'auto'}}>
                ${generating ? t('creating_video') : t('create_video')}
            </button>
        </div>
    `;
};
