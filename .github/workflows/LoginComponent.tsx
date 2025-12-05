/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { h, FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import htm from 'htm';
import type { TargetedEvent } from 'preact/compat';
import { USERS } from './passwords';
import { getTranslator } from './translations';

const html = htm.bind(h);

const ZaloIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M393.5 229.5c-3.2-12.2-11.5-22.5-22.2-28.5c-9.7-5.4-21.2-7.5-32.2-5.9c-11.8 1.7-22.5 7-31 15.5c-1.4 1.4-2.8 2.8-4.1 4.3c-5.8 6.5-12.5 12.1-19.9 17c-21.3 14-45.5 21.2-70.2 20.2c-23.7-.9-46-10-65.5-25.2c-15-11.7-26.8-26.7-34.5-43.5c-2.3-5-4.5-10.1-6.4-15.3c-1.9-5.2-3.6-10.5-5-15.8c-1.2-4.5-2.2-9-3.2-13.5c-.3-1.4-.6-2.8-.8-4.2c-.3-1.6-.5-3.3-.6-5c0-1.2-.1-2.4-.1-3.6c0-4.9.8-9.8 2.3-14.5c2.3-7 6-13.5 10.8-19.1c11.6-13.5 28.2-22.5 46.5-25.2c16.3-2.4 32.8-.2 48.2 6.5c15.2 6.5 28.5 16.5 39.2 29.2c.1.1.2.2.3.3c.1.1.2.2.3.3l.1.1c.1.1.2.2.3.3c.1.1.2.2.3.3c1.2 1.3 2.5 2.6 3.7 3.9c10.8 12.5 19.1 27.2 24.2 42.8c5.4 16.5 7.5 34 6.2 51.5c-1.5 19.5-8.9 38-20.9 53.8c-2.5 3.3-5.2 6.5-8.1 9.5c-10.2 10.8-22.2 19.4-35.2 25.8c-13.3 6.5-27.5 10.2-42 11c-15.2.8-30.2-1.5-44.5-6.8c-13.8-5.1-26.5-12.8-37.5-22.5c-1.3-1.1-2.5-2.2-3.8-3.3c-6.2-5.5-11.5-11.8-15.9-18.5c-4.2-6.5-7.5-13.5-9.8-20.8c-2-6.5-3.3-13.2-3.8-19.9c-.6-7.8.2-15.8 2.2-23.5c2.5-9.5 7-18.5 13-26.5c1.1-1.5 2.2-3 3.3-4.5c1.4-1.9 2.8-3.8 4.3-5.5c11.3-13.5 26.5-23.2 43-28.2c16.3-4.9 33.2-5.4 49.8-1.5c15.5 3.6 29.8 11.2 42 22.2c1.3 1.2 2.5 2.5 3.8 3.8c6.2 6.5 11.5 13.8 15.9 21.8c4.2 7.8 7.5 16.2 9.5 24.8c2.2 8.9 3.2 18.2 2.9 27.5c-.3 8.9-1.9 17.8-4.8 26.2c-5.8 16.8-16.2 31.8-29.8 43.5c-13.8 11.8-30.2 20-47.5 23.8c-17.3 3.8-35.2 3.3-52.5-1.5c-16.8-4.8-32.5-13-46-24.2c-13.8-11.3-25-25.5-32.8-41.2c-7.8-15.8-12-33.2-12.2-51c0-23.2 8.5-45.5 24-63.2C89.4 84.8 111.2 72 135.2 68.2c23.2-3.8 46.8 1.5 67.5 15.2c20.5 13.5 37.2 33.8 47.8 58.5z"/></svg>`;
const FacebookIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.7c-.83 0-1 .42-1 .83V12h2.5l-.33 3H13.3v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>`;

interface LoginComponentProps {
    onLoginSuccess: () => void;
}

export const LoginComponent: FunctionalComponent<LoginComponentProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [selectedModel, setSelectedModel] = useState<'free' | 'pro' | 'custom'>('free');
    const [customApiKey, setCustomApiKey] = useState('');
    const [is4K, setIs4K] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Get translator
    const language = localStorage.getItem('haipix_language') || 'vi';
    const t = getTranslator(language);

    useEffect(() => {
        const savedCreds = localStorage.getItem('login_credentials');
        if (savedCreds) {
            try {
                const { username: savedUser, password: savedPass } = JSON.parse(savedCreds);
                setUsername(savedUser || '');
                setPassword(savedPass || '');
                setRememberMe(true);
            } catch(e) {
                console.error("Failed to parse saved credentials", e);
                localStorage.removeItem('login_credentials');
            }
        }
        
        const savedModel = localStorage.getItem('haipix_model_preference');
        if (savedModel === 'pro') setSelectedModel('pro');
        if (savedModel === 'custom') setSelectedModel('custom');
        
        const savedQuality = localStorage.getItem('haipix_quality_preference');
        if (savedQuality === '4k') setIs4K(true);

        const savedCustomKey = localStorage.getItem('haipix_custom_api_key');
        if (savedCustomKey) setCustomApiKey(savedCustomKey);
    }, []);

    const handleSubmit = async (e: TargetedEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Simulate async login
        await new Promise(resolve => setTimeout(resolve, 500));

        const userPassword = USERS[username.toLowerCase()];
        if (userPassword && userPassword === password) {
            if (rememberMe) {
                localStorage.setItem('login_credentials', JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem('login_credentials');
            }
            // Save model preference
            localStorage.setItem('haipix_model_preference', selectedModel);
            localStorage.setItem('haipix_quality_preference', is4K ? '4k' : 'standard');
            
            if (selectedModel === 'custom') {
                localStorage.setItem('haipix_custom_api_key', customApiKey);
            }
            
            onLoginSuccess();
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }

        setLoading(false);
    };

    const handleSelectApiKey = async () => {
        // Fix: Use type casting to access window.aistudio to avoid conflicting with existing global declarations
        const aistudio = (window as any).aistudio;
        if (aistudio) {
            try {
                await aistudio.openSelectKey();
            } catch (err) {
                console.error("Failed to open key selection", err);
            }
        }
    };

    return html`
        <div class="login-form-container">
            <div class="login-box">
                <div class="login-header">
                    <h1 class="login-title">Hr Studio Ai</h1>
                    <span class="login-version">2025</span>
                </div>

                ${error && html`<div class="login-error">${error}</div>`}

                <form onSubmit=${handleSubmit}>
                    <div class="input-group">
                        <input 
                            type="text" 
                            placeholder="Tên đăng nhập"
                            value=${username}
                            onInput=${(e: TargetedEvent<HTMLInputElement>) => setUsername(e.currentTarget.value)}
                            required
                        />
                    </div>
                    <div class="input-group">
                        <input 
                            type="password"
                            placeholder="Mật khẩu"
                            value=${password}
                            onInput=${(e: TargetedEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
                            required
                        />
                    </div>
                    
                    <div class="input-group" style="margin-top: 0.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #a0a0a0; font-size: 0.9rem;">${t('login_select_model')}</label>
                        <select 
                            style="width: 100%; padding: 0.9rem 1rem; background-color: #1e1e1e; border: 1px solid #555; border-radius: 8px; color: #e0e0e0; font-size: 1rem; cursor: pointer;"
                            value=${selectedModel}
                            onChange=${(e: TargetedEvent<HTMLSelectElement>) => setSelectedModel(e.currentTarget.value as 'free' | 'pro' | 'custom')}
                        >
                            <option value="free">${t('model_free')}</option>
                            <option value="pro">${t('model_pro')}</option>
                            <option value="custom">${t('model_custom')}</option>
                        </select>
                        
                        ${(selectedModel === 'pro' || selectedModel === 'custom') && html`
                            <div style="margin-top: 0.75rem; padding: 0.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; flex-direction: column; gap: 0.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #fff; font-size: 0.9rem;">
                                    <input 
                                        type="checkbox" 
                                        checked=${is4K} 
                                        onChange=${(e: TargetedEvent<HTMLInputElement>) => setIs4K(e.currentTarget.checked)} 
                                        style="width: 1.2rem; height: 1.2rem;"
                                    />
                                    ${t('option_4k')}
                                </label>
                                ${selectedModel === 'pro' && html`
                                    <button 
                                        type="button" 
                                        class="btn btn-secondary" 
                                        style="width: 100%; font-size: 0.9rem; padding: 0.5rem;"
                                        onClick=${handleSelectApiKey}
                                    >
                                        ${t('select_api_key')}
                                    </button>
                                `}
                                ${selectedModel === 'custom' && html`
                                    <input 
                                        type="text" 
                                        class="form-control"
                                        style="width: 100%; padding: 0.75rem; background-color: #1e1e1e; border: 1px solid #555; border-radius: 4px; color: #fff; font-size: 0.9rem;"
                                        placeholder=${t('input_custom_api_placeholder')}
                                        value=${customApiKey}
                                        onInput=${(e: TargetedEvent<HTMLInputElement>) => setCustomApiKey(e.currentTarget.value)}
                                    />
                                `}
                            </div>
                        `}
                    </div>
                    
                    <div class="checkbox-group" style="align-self: flex-start; margin: 0.5rem 0 1rem 0; gap: 0.5rem;">
                        <label>
                            <input 
                                type="checkbox" 
                                checked=${rememberMe} 
                                onChange=${(e: TargetedEvent<HTMLInputElement>) => setRememberMe(e.currentTarget.checked)} 
                            />
                            Lưu tài khoản
                        </label>
                    </div>

                    <button type="submit" class="continue-button" disabled=${loading}>
                        ${loading ? 'Đang đăng nhập...' : 'Tiếp tục'}
                    </button>
                </form>

                <a href="https://docs.google.com/document/d/1JOs1U7hGJounxYzf9tioeLDssBRrh98BXCOTm5R0B4M/edit?usp=sharing" target="_blank" rel="noopener noreferrer" class="gift-button">
                    🎁 Quà tặng mã ưu đãi giảm giá
                </a>
                <a href="https://docs.google.com/document/d/10mP76szYk_1Zir9OEAD_rKKvtMPMLqIHIEKgxZzC79U/edit?usp=sharing" target="_blank" rel="noopener noreferrer" class="guide-button">
                    📖 Hướng dẫn sử dụng
                </a>

                <div class="social-links">
                    <a href="https://zalo.me/g/dindyv634" target="_blank" class="social-link">
                        <${ZaloIcon}/>
                        <span>Zalo Group</span>
                    </a>
                    <a href="https://www.facebook.com/HuynhRoyalWedding" target="_blank" class="social-link">
                         <${FacebookIcon}/>
                        <span>Facebook</span>
                    </a>
                </div>
            </div>
            <div class="login-footer">
                Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản Dịch vụ</a> và <a href="#">Chính sách Bảo mật</a> của chúng tôi.
            </div>
        </div>
    `;
};