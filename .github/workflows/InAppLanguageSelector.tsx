/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { h, FunctionalComponent } from 'preact';
import htm from 'htm';
import type { TargetedEvent } from 'preact/compat';
import { Translator } from './types';

const html = htm.bind(h);

export const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'th', name: 'ไทย' },
    { code: 'lo', name: 'ລາວ' },
    { code: 'km', name: 'ភាសាខ្មែរ' },
];

interface InAppLanguageSelectorProps {
    currentLanguage: string;
    onLanguageChange: (language: string) => void;
    t: Translator;
}

export const InAppLanguageSelector: FunctionalComponent<InAppLanguageSelectorProps> = ({ currentLanguage, onLanguageChange, t }) => {
    return html`
        <div class="in-app-language-selector">
            <label for="language-switcher">${t('language')}:</label>
            <select 
                id="language-switcher"
                value=${currentLanguage} 
                onChange=${(e: TargetedEvent<HTMLSelectElement>) => onLanguageChange(e.currentTarget.value)}
                aria-label=${t('languageSelector')}
            >
                ${languages.map(lang => html`
                    <option value=${lang.code}>${lang.name}</option>
                `)}
            </select>
        </div>
    `;
};