/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { h, FunctionalComponent } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

interface LanguageSelectorProps {
    onSelect: (language: string) => void;
}

const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'pt', name: 'Português (Portuguese)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'th', name: 'ไทย (Thai)' },
    { code: 'lo', name: 'ລາວ (Lao)' },
    { code: 'km', name: 'ភាសាខ្មែរ (Cambodian)' },
];

export const LanguageSelector: FunctionalComponent<LanguageSelectorProps> = ({ onSelect }) => {
    return html`
        <div class="language-selector-container">
            <h1 class="language-selector-title">Chọn ngôn ngữ / Select Language</h1>
            <div class="language-grid">
                ${languages.map(lang => html`
                    <button class="language-btn" onClick=${() => onSelect(lang.code)}>
                        ${lang.name}
                    </button>
                `)}
            </div>
        </div>
    `;
};