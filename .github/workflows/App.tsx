/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, h, FunctionalComponent } from 'preact';
import { useState, useEffect, useMemo, useRef, useCallback } from 'preact/hooks';
import htm from 'htm';
import type { TargetedEvent } from 'preact/compat';
import { TABS_CONFIG } from './constants';
import { InitialImageDisplay, KeyboardIcon, HotkeyInfoPanel, ZaloIcon, MessengerIcon, GuideIcon, GuidePanel } from './components';
import {
    IdPhotoApp,
    RestorationApp,
    ClothingChangeApp,
    PosingStudioApp,
    BatchBackgroundApp,
    BatchClothingChangeApp,
    AiEditorApp,
    TrendCreatorApp,
    HairStyleApp,
    BabyConceptApp,
    // FIX: Import `VideoMarketingApp` which was missing but used in the component's render logic.
    VideoMarketingApp,
} from './featureEditors';
import { getTranslator } from './translations';
import { InAppLanguageSelector } from './InAppLanguageSelector';
import { PrimaryColor } from './types';

const html = htm.bind(h);

type AppView = 'selecting' | 'editing';

export const App: FunctionalComponent<{ language: string }> = ({ language: initialLanguage }) => {
    const [language, setLanguage] = useState<string>(initialLanguage);
    const t = useMemo(() => getTranslator(language), [language]);
    
    const TABS = useMemo(() => TABS_CONFIG.map(tab => ({
        ...tab,
        label: t(tab.labelKey),
        description: t(tab.descriptionKey),
    })), [t]);

    const [mainTab, setMainTab] = useState<string | null>(null);
    const [view, setView] = useState<AppView>('selecting');
    const [globalImage, setGlobalImage] = useState<string | null>(null);
    const [initialBatchFiles, setInitialBatchFiles] = useState<FileList | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showHotkeyInfo, setShowHotkeyInfo] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const activeTabData = useMemo(() => TABS.find(t => t.id === mainTab) || TABS[0], [mainTab, TABS]);
    
    const handleLanguageChange = (newLang: string) => {
        localStorage.setItem('haipix_language', newLang);
        setLanguage(newLang);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                return; // Don't interfere with typing
            }

            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.warn(`Could not enter fullscreen mode: ${err.message}`);
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleBatchImageUpload = (files: FileList) => {
        setInitialBatchFiles(files);
        setMainTab('video-marketing');
        setView('editing');
        document.documentElement.requestFullscreen().catch(err => {
            console.warn(`Could not enter fullscreen mode: ${err.message}`);
        });
    };
    
    const handleBackToHome = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setGlobalImage(null);
            setMainTab(null);
            setView('selecting');
            setInitialBatchFiles(null);
            setIsTransitioning(false);
        }, 300);
    };

    const handleGlobalImageUpload = useCallback((dataUrl: string) => {
        setGlobalImage(dataUrl);

        // Only switch to 'selecting' view if not already in an editor.
        // This allows editors to update their image without navigating away.
        if (view !== 'editing') {
            setView('selecting');
        }

        const isSpecialTab = view === 'editing' && (mainTab === 'restoration' || mainTab === 'ai-editor');
        if (isSpecialTab) {
            document.documentElement.requestFullscreen().catch(err => {
                 console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        } else if (view !== 'editing' && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                 console.warn(`Could not enter fullscreen mode: ${err.message}`);
            });
        }
    }, [view, mainTab]);


    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files) {
            if (files.length > 1) {
                handleBatchImageUpload(files);
            } else if (files.length === 1) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    if (loadEvent.target?.result) {
                        handleGlobalImageUpload(loadEvent.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
            e.currentTarget.value = ''; // Allow re-selecting the same file(s)
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const handleTabClick = (tabId: string) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setMainTab(tabId);
            setView('editing');
            setIsTransitioning(false);
        }, 300);
    };

    const renderPrimaryContent = () => {
        const commonProps = {
            t: t,
            language: language,
            setLanguage: handleLanguageChange,
        };
        
        if (view === 'selecting') {
            return html`<${InitialImageDisplay} ...${commonProps} image=${globalImage} onChooseAnotherImage=${triggerFileSelect} onImageUpload=${handleGlobalImageUpload} onBatchImageUpload=${handleBatchImageUpload} />`;
        }

        if (view === 'editing' && mainTab) {
            const props = { 
                ...commonProps,
                initialImage: globalImage, 
                onChooseAnotherImage: triggerFileSelect,
                onBackToHome: handleBackToHome,
                onImageUpdate: handleGlobalImageUpload,
            };

            switch (mainTab) {
                case 'ai-editor':
                    return html`<${AiEditorApp} key="ai-editor" ...${props} />`;
                case 'id-photo':
                    return html`<${IdPhotoApp} key="id-photo" ...${props} />`;
                case 'restoration':
                    return html`<${RestorationApp} key="restoration" ...${props} />`;
                case 'clothing-change':
                    return html`<${ClothingChangeApp} key="clothing-change" ...${props} />`;
                case 'batch-clothing-change':
                    return html`<${BatchClothingChangeApp} key="batch-clothing-change" ...${props} />`;
                case 'hair-style':
                    return html`<${HairStyleApp} key="hair-style" ...${props} />`;
                case 'baby-concept':
                    return html`<${BabyConceptApp} key="baby-concept" ...${props} />`;
                case 'posing-studio':
                    return html`<${PosingStudioApp} key="posing-studio" ...${props} />`;
                case 'batch-background':
                    return html`<${BatchBackgroundApp} key="batch-background" ...${props} initialFiles=${initialBatchFiles} />`;
                case 'trend-creator':
                    return html`<${TrendCreatorApp} key="trend-creator" ...${props} />`;
                case 'video-marketing':
                    return html`<${VideoMarketingApp} key="video-marketing" ...${props} initialFiles=${initialBatchFiles} />`;
                default:
                    // Fallback, should ideally not be reached if logic is correct
                    return html`<${InitialImageDisplay} ...${commonProps} image=${globalImage} onChooseAnotherImage=${triggerFileSelect} onImageUpload=${handleGlobalImageUpload} onBatchImageUpload=${handleBatchImageUpload} />`;
            }
        }
        // Fallback for any other state
        return html`<${InitialImageDisplay} ...${commonProps} image=${globalImage} onChooseAnotherImage=${triggerFileSelect} onImageUpload=${handleGlobalImageUpload} onBatchImageUpload=${handleBatchImageUpload} />`;
    };
    
    const showSidebar = view === 'selecting';
    const isInFocusMode = view === 'selecting' && !globalImage;

    return html`
        ${showGuide && html`<${GuidePanel} t=${t} onClose=${() => setShowGuide(false)} onShowHotkeys=${() => { setShowGuide(false); setShowHotkeyInfo(true); }} />`}
        ${showHotkeyInfo && html`<${HotkeyInfoPanel} t=${t} onClose=${() => setShowHotkeyInfo(false)} />`}
        <div class="app-container ${isInFocusMode ? 'focus-mode' : ''}">
            <input type="file" ref=${fileInputRef} onChange=${handleFileChange} accept="image/*" style=${{display: 'none'}} multiple />
            
            <main class="main-content">
                <div class="tab-content ${isTransitioning ? 'is-transitioning' : ''}">
                    ${renderPrimaryContent()}
                </div>
            </main>

            <nav class="sidebar-nav ${!showSidebar ? 'hidden' : ''}">
                <div class="sidebar-header">
                    <span class="logo-text">${t('haipixVersion2')}</span>
                </div>

                <div class="main-tabs">
                    ${TABS.map(tab => html`
                        <button 
                            class="main-tab ${mainTab === tab.id ? 'active' : ''}" 
                            onClick=${() => handleTabClick(tab.id)}
                            title=${tab.description}
                        >
                            <span class="tab-icon"><${tab.icon} /></span>
                            <span class="tab-label">${tab.label}</span>
                        </button>
                    `)}
                </div>

                <div class="sidebar-footer">
                   <div class="theme-controls-wrapper">
                        <div class="theme-controls-row">
                            <button class="contact-icon-btn" onClick=${() => setShowGuide(true)} title=${t('guide_title')}>
                                <${GuideIcon} />
                                <span>${t('guide_title')}</span>
                            </button>
                        </div>
                        <${InAppLanguageSelector} 
                            t=${t}
                            currentLanguage=${language}
                            onLanguageChange=${handleLanguageChange}
                        />
                   </div>
                </div>
            </nav>
        </div>
    `;
};