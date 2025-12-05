/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import htm from 'htm';
import { App } from './App';
import { LanguageSelector } from './LanguageSelector';
import { LoginComponent } from './LoginComponent';

const html = htm.bind(h);

const Main = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!sessionStorage.getItem('haipix_auth_session'));
    const [language, setLanguage] = useState<string | null>(() => localStorage.getItem('haipix_language'));

    const handleLoginSuccess = useCallback(() => {
        sessionStorage.setItem('haipix_auth_session', 'true');
        setIsLoggedIn(true);
    }, []);

    const handleLanguageSelect = useCallback((lang: string) => {
        localStorage.setItem('haipix_language', lang);
        setLanguage(lang);
    }, []);

    if (!isLoggedIn) {
        return html`<${LoginComponent} onLoginSuccess=${handleLoginSuccess} />`;
    }

    if (!language) {
        return html`<${LanguageSelector} onSelect=${handleLanguageSelect} />`;
    }

    return html`<${App} language=${language} />`;
};

render(html`<${Main} />`, document.getElementById('app')!);