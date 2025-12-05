/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { h, FunctionalComponent } from 'preact';
import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import htm from 'htm';
import type { TargetedEvent } from 'preact/compat';
import { Theme, PrimaryColor, Translator } from './types';

const html = htm.bind(h);

// --- Navigation Icons ---
export const IdPhotoIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7v10"/><path d="M22 7v10"/><path d="M7 2h10"/><path d="M7 22h10"/><circle cx="12" cy="12" r="4"/><path d="M12 8a8.15 8.15 0 0 0-4 10"/><path d="M12 8c2.29 0 4.28.86 5.5 2.25"/></svg>`;
export const RestorationIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H3v7"/><path d="M3 21h7"/><path d="M21 3h-7"/><path d="M14 21h7"/><line x1="12" y1="3" x2="12" y2="2.5" /><line x1="12" y1="21" x2="12" y2="18.5" /><line x1="3" y1="12" x2="2.5" y2="12" /><line x1="21" y1="12" x2="18.5" y2="12" /><path d="m3 3 2.5 2.5"/><path d="m3 21 2.5-2.5"/><path d="m21 3-2.5 2.5"/><path d="m21 21-2.5-2.5"/></svg>`;
export const BackgroundIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/></svg>`;
export const ClothingIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2l6 6 6-6"/><path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M6 8h12"/></svg>`;
export const BatchBackgroundIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`;
export const PosingStudioIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h-5.277a2 2 0 0 0-1.789 1.106l-1.868 3.734a2 2 0 0 1-1.789 1.106H4"/><path d="m16 15 4-4-4-4"/><circle cx="7" cy="6.5" r="2.5"/><path d="M7 9.5c-1.333-1-2.667-1-4 0"/></svg>`;
export const MagicIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5-8 16.5"/><path d="M15 10.5-8 22.5"/><path d="m9 4.5 8 12"/><path d="m9 10.5 8 12"/><circle cx="7" cy="3" r="1"/><circle cx="17" cy="3" r="1"/><circle cx="7" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>`;
export const HairStyleIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M18.3 12.5a9 9 0 0 1-12.6 0"/><path d="M18.8 17.5a13 13 0 0 1-13.6 0"/><path d="M19 22a16 16 0 0 0-14 0"/></svg>`;
export const VideoMarketingIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
export const SunIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45 1 1zM5.64 5.64c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0 s.39-1.02 0-1.41L5.64 5.64zm12.73 12.73c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.06-1.06zM5.64 18.36c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.06-1.06c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06zm12.73-12.73c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.06-1.06c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06z"/></svg>`;
export const MoonIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
export const MicIcon: FunctionalComponent<{ recording: boolean }> = ({ recording }) => html`<svg class=${recording ? 'recording' : ''} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14q.825 0 1.413-.587T14 12V6q0-.825-.587-1.413T12 4q-.825 0-1.413.587T10 6v6q0 .825.587 1.413T12 14Zm-1 7v-3.075q-2.6-.35-4.3-2.325T5 12H7q0 2.075 1.463 3.538T12 17q2.075 0 3.538-1.463T17 12h2q0 2.25-1.7 4.225T13 20.925V21Zm1-6q1.65 0 2.825-1.175T16 12V6q0-1.65-1.175-2.825T12 2q-1.65 0-2.825 1.175T8 6v6q0 1.65 1.175 2.825T12 15Z"/></svg>`;
export const UploadIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 16V7.85l-2.6 2.6L7 9l5-5 5 5-1.4 1.45-2.6-2.6V16h-2Zm-5 4q-.825 0-1.413-.587T4 18V6q0-.825.587-1.413T6 4h4V2H6q-1.65 0-2.825 1.175T2 6v12q0 1.65 1.175 2.825T6 22h12q1.65 0 2.825-1.175T22 18V9h-2v9q0 .825-.587 1.413T18 20H6Z"/></svg>`;
export const DownloadIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16.5l-4-4h2.5v-6h3v6H15l-3 4.5M6 20h12v-2H6v2Z"/></svg>`;
export const RegenerateIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`;
export const DeleteIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
export const CloseIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/></svg>`;
export const FullScreenIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-2-4V5h-3v2h3v3h2V5z"/></svg>`;
export const ExitFullScreenIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
export const CompareIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/></svg>`;
export const InfoIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`;
export const SliderIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0 4.41 3.59 8 8 8V4c-4.41 0-8 3.59-8 8z"/></svg>`;
export const ArrowForwardIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>`;
export const AdjustIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>`;
export const EyeIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
export const EyeOffIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75C21.27 7.61 17 4.5 12 4.5c-1.77 0-3.39.53-4.79 1.4L8.83 7.53C9.57 7.19 10.74 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;
export const KeyboardIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`;
export const SideBySideIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h8V3H3v18zM13 3v18h8V3h-8z"/></svg>`;
export const CropIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z"/></svg>`;
export const SettingsIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38 2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07.49-.12.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
export const ZaloIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M393.5 229.5c-3.2-12.2-11.5-22.5-22.2-28.5c-9.7-5.4-21.2-7.5-32.2-5.9c-11.8 1.7-22.5 7-31 15.5c-1.4 1.4-2.8 2.8-4.1 4.3c-5.8 6.5-12.5 12.1-19.9 17c-21.3 14-45.5 21.2-70.2 20.2c-23.7-.9-46-10-65.5-25.2c-15-11.7-26.8-26.7-34.5-43.5c-2.3-5-4.5-10.1-6.4-15.3c-1.9-5.2-3.6-10.5-5-15.8c-1.2-4.5-2.2-9-3.2-13.5c-.3-1.4-.6-2.8-.8-4.2c-.3-1.6-.5-3.3-.6-5c0-1.2-.1-2.4-.1-3.6c0-4.9.8-9.8 2.3-14.5c2.3-7 6-13.5 10.8-19.1c11.6-13.5 28.2-22.5 46.5-25.2c16.3-2.4 32.8-.2 48.2 6.5c15.2 6.5 28.5 16.5 39.2 29.2c.1.1.2.2.3.3c.1.1.2.2.3.3l.1.1c.1.1.2.2.3.3c.1.1.2.2.3.3c1.2 1.3 2.5 2.6 3.7 3.9c10.8 12.5 19.1 27.2 24.2 42.8c5.4 16.5 7.5 34 6.2 51.5c-1.5 19.5-8.9 38-20.9 53.8c-2.5 3.3-5.2 6.5-8.1 9.5c-10.2 10.8-22.2 19.4-35.2 25.8c-13.3 6.5-27.5 10.2-42 11c-15.2.8-30.2-1.5-44.5-6.8c-13.8-5.1-26.5-12.8-37.5-22.5c-1.3-1.1-2.5-2.2-3.8-3.3c-6.2-5.5-11.5-11.8-15.9-18.5c-4.2-6.5-7.5-13.5-9.8-20.8c-2-6.5-3.3-13.2-3.8-19.9c-.6-7.8.2-15.8 2.2-23.5c2.5-9.5 7-18.5 13-26.5c1.1-1.5 2.2-3 3.3-4.5c1.4-1.9 2.8-3.8 4.3-5.5c11.3-13.5 26.5-23.2 43-28.2c16.3-4.9 33.2-5.4 49.8-1.5c15.5 3.6 29.8 11.2 42 22.2c1.3 1.2 2.5 2.5 3.8 3.8c6.2 6.5 11.5 13.8 15.9 21.8c4.2 7.8 7.5 16.2 9.5 24.8c2.2 8.9 3.2 18.2 2.9 27.5c-.3 8.9-1.9 17.8-4.8 26.2c-5.8 16.8-16.2 31.8-29.8 43.5c-13.8 11.8-30.2 20-47.5 23.8c-17.3 3.8-35.2 3.3-52.5-1.5c-16.8-4.8-32.5-13-46-24.2c-13.8-11.3-25-25.5-32.8-41.2c-7.8-15.8-12-33.2-12.2-51c0-23.2 8.5-45.5 24-63.2C89.4 84.8 111.2 72 135.2 68.2c23.2-3.8 46.8 1.5 67.5 15.2c20.5 13.5 37.2 33.8 47.8 58.5z"/></svg>`;
export const MessengerIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 5.82 2 10.15c0 2.45.98 4.68 2.58 6.34L4 22l5.4-2.28c1.1.28 2.26.43 3.46.43c5.52 0 10-3.82 10-8.15C22.86 5.82 17.52 2 12 2zm1.45 12.25L10.3 11.1L5.5 14.25l7.65-3.15l3.15 3.15l4.8-3.15l-7.65 3.15z"/></svg>`;
export const GuideIcon: FunctionalComponent = () => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`;

// --- Reusable Components ---

const fileToDataUrl = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
            callback(loadEvent.target.result as string);
        }
    };
    reader.readAsDataURL(file);
};

interface LandingPageProps {
    onImageUpload: (dataUrl: string) => void;
    onBatchImageUpload: (files: FileList) => void;
    t: Translator;
}
export const LandingPage: FunctionalComponent<LandingPageProps> = ({ onImageUpload, onBatchImageUpload, t }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files || files.length === 0) return;

        if (files.length > 1) {
            onBatchImageUpload(files);
        } else {
            fileToDataUrl(files[0], onImageUpload);
        }
        e.currentTarget.value = '';
    };

    const handleClick = () => fileInputRef.current?.click();

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
            if (imageFiles.length > 1) {
                onBatchImageUpload(files);
            } else if (imageFiles.length === 1) {
                fileToDataUrl(imageFiles[0], onImageUpload);
            }
        }
    };

    return html`
        <div 
            class="landing-container ${isDragging ? 'drag-over' : ''}"
            onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
            onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)}
            onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
            onDrop=${handleDrop}
        >
            <input id="landing-file-input" type="file" onChange=${handleFileChange} accept="image/*" style=${{ display: 'none' }} ref=${fileInputRef} multiple />
            <div class="landing-title-container">
                <h1 class="main-title">Hr Studio Ai</h1>
            </div>
            <p class="landing-tagline">${t('haisoft')}</p>
            <button class="landing-upload-btn" onClick=${handleClick}>
                ${t('landing_upload_button')}
            </button>
            <a 
                href="https://docs.google.com/document/d/1JOs1U7hGJounxYzf9tioeLDssBRrh98BXCOTm5R0B4M/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                class="gift-link"
            >
                ${t('gift_link_text')}
            </a>

            <div class="language-hint">${t('language_hint')}</div>
        </div>
    `;
};

interface ThemeToggleProps {
    theme: Theme;
    onToggle: () => void;
    t: Translator;
}
export const ThemeToggle: FunctionalComponent<ThemeToggleProps> = ({ theme, onToggle, t }) => {
    return html`
        <button class="theme-toggle" onClick=${onToggle} title=${t('changeTheme')}>
            <span class="tab-icon">${theme === 'dark' ? html`<${SunIcon} />` : html`<${MoonIcon} />`}</span>
        </button>
    `;
};

interface InitialImageDisplayProps {
    image: string | null;
    onChooseAnotherImage?: () => void;
    onImageUpload?: (dataUrl: string) => void;
    onBatchImageUpload?: (files: FileList) => void;
    t: Translator;
}
export const InitialImageDisplay: FunctionalComponent<InitialImageDisplayProps> = ({ image, onChooseAnotherImage, onImageUpload, onBatchImageUpload, t }) => {
    
    return html`
        <div class="initial-image-view">
            <div class="static-title-header initial-view-logo">
                <h1 class="title">Hr Studio Ai</h1>
            </div>
            ${image && html`<img src=${image} alt=${t('uploadedImageAlt')} />`}
            <p class="initial-image-subtitle">${image ? t('selectFunctionPrompt') : ''}</p>
            
            ${image && onChooseAnotherImage && html`
                <button
                    class="btn btn-primary upload-another-btn"
                    onClick=${onChooseAnotherImage}
                >
                    <${UploadIcon} />
                    <span>${t('initial_display_upload_another')}</span>
                </button>
            `}

            <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', width: '100%', maxWidth: '450px' }}>
                <a href="https://www.facebook.com/HuynhRoyalWedding/" target="_blank" rel="noopener noreferrer" class="discount-toggle-btn" style=${{textDecoration: 'none', display: 'block'}}>
                    ${t('get_discounts_button')}
                </a>
            </div>

            <p class="api-limit-note">${t('initial_display_note_title')} ${t('initial_display_note_content')}</p>
        </div>
    `;
};

interface ImageUploaderProps {
    onImageUpload: (dataUrl: string) => void;
    t: Translator;
}
export const ImageUploader: FunctionalComponent<ImageUploaderProps> = ({ onImageUpload, t }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: TargetedEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (file) fileToDataUrl(file, onImageUpload);
    };

    const handleClick = () => fileInputRef.current?.click();

    const handleDragEvents = (e: DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent) => {
        handleDragEvents(e, false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            fileToDataUrl(file, onImageUpload);
        }
    };

    return html`
        <div 
            class="upload-placeholder ${isDragging ? 'drag-over' : ''}"
            onClick=${handleClick}
            onDragOver=${(e: DragEvent) => handleDragEvents(e, true)}
            onDragEnter=${(e: DragEvent) => handleDragEvents(e, true)}
            onDragLeave=${(e: DragEvent) => handleDragEvents(e, false)}
            onDrop=${handleDrop}
        >
            <input type="file" ref=${fileInputRef} onChange=${handleFileChange} accept="image/*" style=${{ display: 'none' }} />
            <${UploadIcon} />
            <strong>${t('clickToUpload')}</strong>
            <p>${t('dragAndDrop')}</p>
        </div>
    `;
};

interface ImageComparatorProps {
    original: string;
    generated: string | null;
    t: Translator;
    view?: 'original' | 'generated';
    sliderMode?: boolean;
    sideBySideMode?: boolean;
    onClick?: () => void;
    style?: any;
    isSpaceDown?: boolean;
}
export const ImageComparator: FunctionalComponent<ImageComparatorProps> = ({ original, generated, t, view = 'generated', sliderMode = false, sideBySideMode = false, onClick, style, isSpaceDown = false }) => {
    const hasResult = !!generated;

    // --- Zoom & Pan State ---
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const pinchStartRef = useRef({ distance: 0, zoom: 1, pan: {x: 0, y: 0}, midpoint: {x: 0, y: 0} });
    
    // --- Slider State ---
    const [dividerPos, setDividerPos] = useState(50);
    const isSliderDragging = useRef(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Reset state when the image source or mode changes
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setDividerPos(50);
    }, [original, generated, sliderMode, sideBySideMode]);

    // --- Slider Logic ---
    const handleSliderMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        let percentage = (x / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        setDividerPos(percentage);
    }, []);

    const handleSliderMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isSliderDragging.current = true;
    };
    
    const handleSliderTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isSliderDragging.current = true;
    };

    // --- Zoom & Pan Logic ---
    const clampPan = useCallback((x: number, y: number, currentZoom: number) => {
        if (!containerRef.current || !imageRef.current || currentZoom <= 1) {
            return { x: 0, y: 0 };
        }
        const containerRect = containerRef.current.getBoundingClientRect();
        const { naturalWidth, naturalHeight } = imageRef.current; 
        
        const imageAspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        let displayWidthAtZoom1, displayHeightAtZoom1;
        if (imageAspectRatio > containerAspectRatio) {
            displayWidthAtZoom1 = containerRect.width;
            displayHeightAtZoom1 = containerRect.width / imageAspectRatio;
        } else {
            displayHeightAtZoom1 = containerRect.height;
            displayWidthAtZoom1 = containerRect.height * imageAspectRatio;
        }

        const maxPanX = Math.max(0, (displayWidthAtZoom1 * currentZoom - containerRect.width) / 2);
        const maxPanY = Math.max(0, (displayHeightAtZoom1 * currentZoom - containerRect.height) / 2);
        
        return {
            x: Math.max(-maxPanX, Math.min(maxPanX, x)),
            y: Math.max(-maxPanY, Math.min(maxPanY, y)),
        };
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!containerRef.current || !hasResult || sliderMode || sideBySideMode) return;
        e.preventDefault();

        const rect = containerRef.current.getBoundingClientRect();
        const scaleMultiplier = 1 - e.deltaY * 0.001;
        const newZoom = Math.max(1, Math.min(zoom * scaleMultiplier, 8));

        if (Math.abs(newZoom - zoom) < 0.001) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mouseRelativeToCenter = { x: mouseX - rect.width / 2, y: mouseY - rect.height / 2 };

        const newPanX = mouseRelativeToCenter.x - ((mouseRelativeToCenter.x - pan.x) / zoom) * newZoom;
        const newPanY = mouseRelativeToCenter.y - ((mouseRelativeToCenter.y - pan.y) / zoom) * newZoom;

        setZoom(newZoom);
        setPan(clampPan(newPanX, newPanY, newZoom));

    }, [zoom, pan, hasResult, clampPan, sliderMode, sideBySideMode]);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (zoom <= 1 || !hasResult || sliderMode || sideBySideMode) return;
        e.preventDefault();
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        setIsPanning(true);
    }, [zoom, pan, hasResult, sliderMode, sideBySideMode]);

    const handleDoubleClick = useCallback(() => {
        if (!hasResult || sliderMode || sideBySideMode) return;
        setZoom(1);
        setPan({x: 0, y: 0});
    }, [hasResult, sliderMode, sideBySideMode]);

    // --- Global Event Listeners ---
    useEffect(() => {
        const handleMouseUp = () => {
            isSliderDragging.current = false;
            setIsPanning(false);
        };
        const handleMouseMove = (e: MouseEvent) => {
            if (isSliderDragging.current) {
                handleSliderMove(e.clientX);
            }
            if (isPanning) {
                 e.preventDefault();
                const newPanX = e.clientX - panStartRef.current.x;
                const newPanY = e.clientY - panStartRef.current.y;
                setPan(clampPan(newPanX, newPanY, zoom));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isPanning, handleSliderMove, zoom, clampPan]);

    // Touch events for both slider and pan/zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !hasResult) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (sliderMode) {
                isSliderDragging.current = true;
                handleSliderMove(e.touches[0].clientX);
                return;
            }
            if (e.touches.length === 1 && zoom > 1 && !sideBySideMode) {
                e.preventDefault();
                panStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
                setIsPanning(true);
            } else if (e.touches.length === 2 && !sideBySideMode) {
                e.preventDefault();
                setIsPanning(false);
                const getDistance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
                const getMidpoint = (touches: TouchList) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 });
                pinchStartRef.current = {
                    distance: getDistance(e.touches),
                    zoom: zoom,
                    pan: { ...pan },
                    midpoint: getMidpoint(e.touches)
                };
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (sliderMode && isSliderDragging.current) {
                 e.preventDefault();
                 handleSliderMove(e.touches[0].clientX);
                 return;
            }
            if (e.touches.length === 1 && isPanning && !sideBySideMode) {
                e.preventDefault();
                const newPanX = e.touches[0].clientX - panStartRef.current.x;
                const newPanY = e.touches[0].clientY - panStartRef.current.y;
                setPan(clampPan(newPanX, newPanY, zoom));
            } else if (e.touches.length === 2 && !sideBySideMode) {
                e.preventDefault();
                 const getDistance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
                
                const newDistance = getDistance(e.touches);
                const scale = newDistance / pinchStartRef.current.distance;
                const newZoom = Math.max(1, Math.min(pinchStartRef.current.zoom * scale, 8));
                
                setZoom(newZoom);
            }
        };
        
        const handleTouchEnd = () => {
            isSliderDragging.current = false;
            setIsPanning(false);
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchmove', handleTouchMove);
        container.addEventListener('touchend', handleTouchEnd);
        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        }
    }, [containerRef.current, hasResult, zoom, pan, clampPan, handleSliderMove, sliderMode, sideBySideMode]);
    
    useEffect(() => {
        const el = containerRef.current;
        if(el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
            el.addEventListener('mousedown', handleMouseDown);
            el.addEventListener('dblclick', handleDoubleClick);
            return () => {
                el.removeEventListener('wheel', handleWheel);
                el.removeEventListener('mousedown', handleMouseDown);
                el.removeEventListener('dblclick', handleDoubleClick);
            }
        }
    }, [handleWheel, handleMouseDown, handleDoubleClick]);

    if (sideBySideMode && generated) {
        return html`
            <div class="image-comparator side-by-side-container">
                <div class="side-by-side-item">
                    <img src=${original} alt=${t('original')} />
                    <div class="image-label">${t('original')}</div>
                </div>
                <div class="side-by-side-item">
                    <img src=${generated} alt=${t('edited')} />
                    <div class="image-label">${t('edited')}</div>
                </div>
            </div>
        `;
    }

    const displayImage = sliderMode ? original : (view === 'original' ? original : (generated || original));

    return html`
        <div class="image-comparator" ref=${containerRef}>
            <div 
                class="image-container ${hasResult ? 'has-result' : ''}"
                style=${{
                    cursor: hasResult && !sliderMode && zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : (hasResult && !sliderMode ? 'zoom-in' : 'default'),
                }}
            >
                <img 
                    ref=${imageRef}
                    src=${displayImage} 
                    alt="Image for comparison" 
                    onClick=${!sliderMode && zoom === 1 ? onClick : undefined}
                    style=${{
                        ...style,
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        transition: isPanning || zoom === 1 ? 'none' : 'transform 0.1s ease-out',
                    }}
                />
                ${!sliderMode && html`<div class="image-label">${view === 'original' ? t('original') : t('edited')}</div>`}

                ${hasResult && sliderMode && html`
                    <div class="comparison-slider-wrapper" style=${{ clipPath: isSpaceDown ? 'none' : `inset(0 ${100 - dividerPos}% 0 0)` }}>
                        <img 
                            src=${generated} 
                            style=${{
                                ...style,
                                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                transition: isPanning || zoom === 1 ? 'none' : 'transform 0.1s ease-out',
                            }}
                        />
                    </div>
                    <div 
                        class="comparison-slider-line" 
                        style=${{ left: `${dividerPos}%`, opacity: isSpaceDown ? 0 : 1 }}
                        onMouseDown=${handleSliderMouseDown}
                        onTouchStart=${handleSliderTouchStart}
                    >
                        <div class="comparison-slider-handle"></div>
                    </div>
                `}
            </div>
        </div>
    `;
};

export const Loader: FunctionalComponent<{ text?: string; subtext?: string; t: Translator }> = ({ text, subtext, t }) => {
    return html`
        <div class="loader-overlay">
            <div class="spinner"></div>
            <div>
                <span class="loader-text">${text || t('defaultLoaderText')}</span>
                ${subtext && html`<br/><span class="loader-text" style="font-size: 0.9em; opacity: 0.8;">${subtext}</span>`}
            </div>
        </div>
    `;
};

export const NumberButtonGroup: FunctionalComponent<{
    value: number;
    options: number[];
    onChange: (value: number) => void;
}> = ({ value, options, onChange }) => {
    return html`
        <div class="num-images-group">
            ${options.map(num => html`
                <button 
                    class="num-images-btn ${value === num ? 'active' : ''}"
                    onClick=${() => onChange(num)}
                >${num}</button>
            `)}
        </div>
    `;
};

interface LightboxProps {
  onClose: () => void;
  t: Translator;
  caption?: string;
  singleImageUrl?: string;
  originalUrl?: string;
  generatedUrl?: string;
  fullscreen?: boolean;
  toggleView?: boolean;
}
export const Lightbox: FunctionalComponent<LightboxProps> = ({ originalUrl, generatedUrl, singleImageUrl, onClose, t, caption, fullscreen = false, toggleView = false }) => {

    const [showOriginal, setShowOriginal] = useState(false);
    const [isSpaceDown, setIsSpaceDown] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            if (toggleView) {
                setShowOriginal(s => !s);
            } else {
                setIsSpaceDown(true);
            }
        }
    }, [onClose, toggleView]);
    
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            if (!toggleView) {
                setIsSpaceDown(false);
            }
        }
    }, [toggleView]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, [handleKeyDown, handleKeyUp]);

    if (singleImageUrl && !originalUrl) {
        return html`
            <div class="lightbox-overlay" onClick=${onClose}>
                <div class="lightbox-content single-image-view" onClick=${(e: MouseEvent) => e.stopPropagation()}>
                    <div class="lightbox-header">
                        <h3>${caption || t('viewImage')}</h3>
                        <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                    </div>
                    <div class="lightbox-single-image-wrapper">
                        <img src=${singleImageUrl} alt=${caption || t('zoomedImageAlt')} />
                    </div>
                </div>
            </div>
        `;
    }

    if (toggleView && originalUrl && generatedUrl) {
        return html`
            <div class="lightbox-overlay" onClick=${onClose}>
                <div class="lightbox-content single-image-view" onClick=${(e: MouseEvent) => e.stopPropagation()}>
                    <div class="lightbox-header">
                        <h3>${showOriginal ? t('original') : (caption || t('edited'))}</h3>
                        <div style=${{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                            <button class="lightbox-toggle-view-btn" onClick=${() => setShowOriginal(s => !s)} title=${t('toggleOriginalSpace')}>
                                ${showOriginal ? html`<${EyeOffIcon} />` : html`<${EyeIcon} />`}
                            </button>
                            <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                        </div>
                    </div>
                    <div class="lightbox-single-image-wrapper">
                        <div class="lightbox-image-sizer">
                            <img 
                                src=${generatedUrl} 
                                alt=${caption || t('edited')}
                            />
                            <img 
                                src=${originalUrl} 
                                alt=${t('original')}
                                class="overlay-image"
                                style=${{
                                    opacity: showOriginal ? 1 : 0,
                                    pointerEvents: showOriginal ? 'auto' : 'none',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Default slider view
    return html`
        <div class="lightbox-overlay" onClick=${onClose}>
            <div class="lightbox-content ${fullscreen ? 'single-image-view' : ''}" onClick=${(e: MouseEvent) => e.stopPropagation()}>
                <div class="lightbox-header">
                    <h3>${caption || t('detailedComparison')}</h3>
                    <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                </div>
                <div class="lightbox-comparator-container">
                    <${ImageComparator}
                        t=${t}
                        original=${originalUrl}
                        generated=${generatedUrl}
                        sliderMode=${true}
                        isSpaceDown=${isSpaceDown}
                    />
                </div>
                ${!fullscreen && html`<p class="lightbox-slider-caption">${t('dragToCompare')}</p>`}
            </div>
        </div>
    `;
};

interface GuidePanelProps {
    onClose: () => void;
    onShowHotkeys: () => void;
    t: Translator;
}

export const GuidePanel: FunctionalComponent<GuidePanelProps> = ({ onClose, onShowHotkeys, t }) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return html`
        <div class="lightbox-overlay" onClick=${onClose}>
            <div class="hotkey-info-panel-content" onClick=${(e: MouseEvent) => e.stopPropagation()} style=${{maxWidth: '350px'}}>
                <div class="lightbox-header">
                    <h3>${t('guide_title')}</h3>
                    <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                </div>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                    <button class="btn" onClick=${onShowHotkeys} style=${{justifyContent: 'flex-start', gap: '1rem'}}>
                        <${KeyboardIcon} />
                        <span>${t('shortcuts')}</span>
                    </button>
                    <a href="https://docs.google.com/document/d/10mP76szYk_1Zir9OEAD_rKKvtMPMLqIHIEKgxZzC79U/edit?usp=sharing" target="_blank" rel="noopener noreferrer" class="btn" style=${{justifyContent: 'flex-start', gap: '1rem'}}>
                        <${GuideIcon} />
                        <span>${t('view_guide_full')}</span>
                    </a>
                </div>
            </div>
        </div>
    `;
};

interface HotkeyInfoPanelProps {
    onClose: () => void;
    t: Translator;
}
export const HotkeyInfoPanel: FunctionalComponent<HotkeyInfoPanelProps> = ({ onClose, t }) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const hotkeys = [
        { key: 'F', descKey: 'hk_f' },
        { key: '*', descKey: 'hk_asterisk' },
        { key: 'Enter', descKey: 'hk_enter' },
        { key: 'Space', descKey: 'hk_space' },
        { key: '← / →', descKey: 'hk_arrows' },
        { key: 'Esc', descKey: 'hk_esc' },
    ];

    return html`
        <div class="lightbox-overlay" onClick=${onClose}>
            <div class="hotkey-info-panel-content" onClick=${(e: MouseEvent) => e.stopPropagation()}>
                <div class="lightbox-header">
                    <h3>${t('hotkeyGuide')}</h3>
                    <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                </div>
                <dl class="hotkey-info-list">
                    ${hotkeys.map(hk => html`
                        <div class="hotkey-item">
                            <dt><kbd>${hk.key}</kbd></dt>
                            <dd>${t(hk.descKey)}</dd>
                        </div>
                    `)}
                </dl>
            </div>
        </div>
    `;
};

export const InfoNote: FunctionalComponent<{ children: any }> = ({ children }) => {
    return html`
        <div class="info-note">
            <${InfoIcon} />
            <div>
                ${children}
            </div>
        </div>
    `;
}

interface SuggestionLightboxProps {
    category: string;
    suggestions: Record<string, string[]>;
    onSelect: (prompt: string) => void;
    onClose: () => void;
    t: Translator;
}
export const SuggestionLightbox: FunctionalComponent<SuggestionLightboxProps> = ({ category, suggestions, onSelect, onClose, t }) => {
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    const PlusIcon = () => html`<svg class="suggestion-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2v-6Z"/></svg>`;

     return html`
        <div class="lightbox-overlay" onClick=${onClose}>
            <div class="suggestion-lightbox-content" onClick=${(e: MouseEvent) => e.stopPropagation()}>
                <div class="lightbox-header">
                    <h3>${t('suggestionsForTopic', { category })}</h3>
                    <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                </div>
                <div class="suggestion-lightbox-body">
                    ${Object.entries(suggestions).map(([subCat, items]) => html`
                        <div class="suggestion-sub-category">
                            <h4>${subCat}</h4>
                            <ul>
                                ${(items as string[]).map(item => html`
                                    <li onClick=${() => onSelect(item)}>
                                        <${PlusIcon} />
                                        <span>${item}</span>
                                    </li>
                                `)}
                            </ul>
                        </div>
                    `)}
                </div>
            </div>
        </div>
    `;
}

interface HotkeysInfoProps {
    t: Translator;
}
export const HotkeysInfo: FunctionalComponent<HotkeysInfoProps> = ({ t }) => {
    return html`
        <div class="hotkey-tips">
            <strong>${t('hotkeyInfo')}</strong> 
            <kbd>${t('hotkey_f')}</kbd> ${t('hotkey_f_desc')} - 
            <kbd>${t('hotkey_asterisk')}</kbd> ${t('hotkey_asterisk_desc')} - 
            <kbd>${t('hotkey_enter')}</kbd> ${t('hotkey_enter_desc')} - 
            <kbd>${t('hotkey_space')}</kbd> ${t('hotkey_space_desc')}
        </div>
    `;
}

interface CollapsibleSectionProps {
    title: string;
    children: any;
    initialOpen?: boolean;
}

export const CollapsibleSection: FunctionalComponent<CollapsibleSectionProps> = ({ title, children, initialOpen = true }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);

    return html`
        <div class="collapsible-section">
            <button class="collapsible-header-btn" onClick=${() => setIsOpen(o => !o)} aria-expanded=${isOpen}>
                <span>${title}</span>
                <svg class="chevron-icon ${isOpen ? 'open' : ''}" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
            </button>
            <div class="collapsible-content ${isOpen ? 'open' : ''}">
                <div class="collapsible-content-inner">
                    ${children}
                </div>
            </div>
        </div>
    `;
};

interface ImageAdjustmentsPanelProps {
    onSave: () => void;
    onCancel: () => void;
    onReset: () => void;
    isSaving: boolean;
    adjustments: { brightness: number; contrast: number; saturate: number; sepia: number; 'hue-rotate': number };
    onAdjust: (filter: keyof ImageAdjustmentsPanelProps['adjustments'], value: string) => void;
    t: Translator;
}

export const ImageAdjustmentsPanel: FunctionalComponent<ImageAdjustmentsPanelProps> = ({ onSave, onCancel, onReset, isSaving, adjustments, onAdjust, t }) => {
    const adjustmentConfig = {
        brightness: { labelKey: 'adj_brightness', min: 0, max: 200, unit: '%' },
        contrast: { labelKey: 'adj_contrast', min: 0, max: 200, unit: '%' },
        saturate: { labelKey: 'adj_saturation', min: 0, max: 200, unit: '%' },
        sepia: { labelKey: 'adj_warmth', min: 0, max: 100, unit: '%' },
        'hue-rotate': { labelKey: 'adj_tint', min: 0, max: 360, unit: 'deg' },
    };

    return html`
        <div class="adjustments-panel-overlay">
            <div class="adjustments-panel">
                <div class="adjustments-grid">
                    ${Object.entries(adjustmentConfig).map(([key, config]) => html`
                        <div class="slider-group">
                            <label for=${key}>
                                ${t(config.labelKey)}
                                <span>${adjustments[key as keyof typeof adjustments]}${config.unit}</span>
                            </label>
                            <input
                                type="range"
                                id=${key}
                                min=${config.min}
                                max=${config.max}
                                value=${adjustments[key as keyof typeof adjustments]}
                                onInput=${(e: TargetedEvent<HTMLInputElement>) => onAdjust(key as keyof typeof adjustments, e.currentTarget.value)}
                            />
                        </div>
                    `)}
                </div>
                <div class="editor-buttons">
                    <button class="btn btn-secondary" onClick=${onReset}>${t('button_reset')}</button>
                    <div>
                        <button class="btn btn-secondary" style=${{marginRight: '0.5rem'}} onClick=${onCancel}>${t('button_cancel')}</button>
                        <button class="btn btn-primary" onClick=${onSave} disabled=${isSaving}>${isSaving ? t('button_saving') : t('button_save')}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

interface ActionToastProps {
    message: string;
    actions: { label: string; onClick: () => void; isPrimary?: boolean; }[];
}

export const ActionToast: FunctionalComponent<ActionToastProps> = ({ message, actions }) => {
    return html`
        <div class="toast-with-actions">
            <span>${message}</span>
            <div style=${{display: 'flex', gap: '0.5rem'}}>
                ${actions.map(action => html`
                    <button 
                        class="btn ${action.isPrimary ? 'btn-primary' : 'btn-secondary'}"
                        onClick=${action.onClick}
                    >${action.label}</button>
                `)}
            </div>
        </div>
    `;
};

interface CropToolProps {
    imageUrl: string;
    onCrop: (croppedImageUrl: string) => void;
    onCancel: () => void;
    aspectRatios: { label: string; value: number }[];
    t: Translator;
}

export const CropTool: FunctionalComponent<CropToolProps> = ({ imageUrl, onCrop, onCancel, aspectRatios, t }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [dragState, setDragState] = useState<{
        type: 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl';
        startX: number;
        startY: number;
        startCrop: typeof crop;
    } | null>(null);
    const [cursor, setCursor] = useState('default');
    const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatios[0].value);
    const currentAspectRatioLabel = useMemo(() => aspectRatios.find(r => r.value === currentAspectRatio)?.label || '', [currentAspectRatio, aspectRatios]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = canvas.width / image.naturalWidth;
        const scaleY = canvas.height / image.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const cropCanvas = {
            x: crop.x * scaleX,
            y: crop.y * scaleY,
            width: crop.width * scaleX,
            height: crop.height * scaleY,
        };

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, cropCanvas.y);
        ctx.fillRect(0, cropCanvas.y, cropCanvas.x, cropCanvas.height);
        ctx.fillRect(cropCanvas.x + cropCanvas.width, cropCanvas.y, canvas.width - (cropCanvas.x + cropCanvas.width), cropCanvas.height);
        ctx.fillRect(0, cropCanvas.y + cropCanvas.height, canvas.width, canvas.height - (cropCanvas.y + cropCanvas.height));

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropCanvas.x, cropCanvas.y, cropCanvas.width, cropCanvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const handleSize = 10;
        const handles = [
            { x: cropCanvas.x, y: cropCanvas.y }, // tl
            { x: cropCanvas.x + cropCanvas.width, y: cropCanvas.y }, // tr
            { x: cropCanvas.x, y: cropCanvas.y + cropCanvas.height }, // bl
            { x: cropCanvas.x + cropCanvas.width, y: cropCanvas.y + cropCanvas.height } // br
        ];
        handles.forEach(h => ctx.fillRect(h.x - handleSize/2, h.y - handleSize/2, handleSize, handleSize));
    }, [crop]);
    
    useEffect(() => {
        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            imageRef.current = image;
            const container = containerRef.current;
            if (!container) return;
            const { clientWidth, clientHeight } = container;
            const imgAspectRatio = image.naturalWidth / image.naturalHeight;
            const containerAspectRatio = clientWidth / clientHeight;
            let canvasWidth, canvasHeight;
            if (imgAspectRatio > containerAspectRatio) {
                canvasWidth = clientWidth;
                canvasHeight = clientWidth / imgAspectRatio;
            } else {
                canvasHeight = clientHeight;
                canvasWidth = clientHeight * imgAspectRatio;
            }
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            }

            let initialCropWidth, initialCropHeight;

            // Compare the image's aspect ratio to the crop's aspect ratio
            if (imgAspectRatio > currentAspectRatio) {
                // Image is WIDER than the crop box shape. Height is the limiting dimension.
                // Set crop height to image height and calculate width from that.
                initialCropHeight = image.naturalHeight;
                initialCropWidth = initialCropHeight * currentAspectRatio;
            } else {
                // Image is TALLER than or same shape as the crop box. Width is the limiting dimension.
                // Set crop width to image width and calculate height from that.
                initialCropWidth = image.naturalWidth;
                initialCropHeight = initialCropWidth / currentAspectRatio;
            }

            setCrop({
                x: (image.naturalWidth - initialCropWidth) / 2,
                y: (image.naturalHeight - initialCropHeight) / 2,
                width: initialCropWidth,
                height: initialCropHeight,
            });
        };
    }, [imageUrl, currentAspectRatio]);

    useEffect(() => {
        draw();
    }, [draw, crop]);
    
    // FIX: Added explicit return type to fix type inference issues with string literals.
    const getActionFromPos = (mouseX: number, mouseY: number): { type: 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl'; cursor: string; } | null => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return null;
        const scaleX = canvas.width / image.naturalWidth;
        const scaleY = canvas.height / image.naturalHeight;
        const cropCanvas = { x: crop.x * scaleX, y: crop.y * scaleY, width: crop.width * scaleX, height: crop.height * scaleY };
        const handleHitbox = 12;
        
        if (Math.abs(mouseX - cropCanvas.x) < handleHitbox && Math.abs(mouseY - cropCanvas.y) < handleHitbox) return { type: 'resize-tl', cursor: 'nwse-resize' };
        if (Math.abs(mouseX - (cropCanvas.x + cropCanvas.width)) < handleHitbox && Math.abs(mouseY - cropCanvas.y) < handleHitbox) return { type: 'resize-tr', cursor: 'nesw-resize' };
        if (Math.abs(mouseX - cropCanvas.x) < handleHitbox && Math.abs(mouseY - (cropCanvas.y + cropCanvas.height)) < handleHitbox) return { type: 'resize-bl', cursor: 'nesw-resize' };
        if (Math.abs(mouseX - (cropCanvas.x + cropCanvas.width)) < handleHitbox && Math.abs(mouseY - (cropCanvas.y + cropCanvas.height)) < handleHitbox) return { type: 'resize-br', cursor: 'nwse-resize' };
        
        if (mouseX > cropCanvas.x && mouseX < cropCanvas.x + cropCanvas.width && mouseY > cropCanvas.y && mouseY < cropCanvas.y + cropCanvas.height) {
            return { type: 'move', cursor: 'move' };
        }
        
        return null;
    };
    
    const handleMouseDown = (e: TargetedEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        // FIX: Cast event to MouseEvent correctly to access mouse-specific properties.
        const mouseX = (e as unknown as MouseEvent).clientX - rect.left;
        const mouseY = (e as unknown as MouseEvent).clientY - rect.top;
        const action = getActionFromPos(mouseX, mouseY);
        
        if (action) {
            setDragState({
                // FIX: Added explicit return type to getActionFromPos to resolve this type error.
                type: action.type,
                startX: mouseX,
                startY: mouseY,
                startCrop: { ...crop },
            });
        }
    };
    
    const handleMouseMove = (e: TargetedEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return;
        const rect = canvas.getBoundingClientRect();
        // FIX: Cast event to MouseEvent correctly to access mouse-specific properties.
        const mouseX = (e as unknown as MouseEvent).clientX - rect.left;
        const mouseY = (e as unknown as MouseEvent).clientY - rect.top;

        if (dragState) {
            const dx = (mouseX - dragState.startX) / (canvas.width / image.naturalWidth);
            const dy = (mouseY - dragState.startY) / (canvas.height / image.naturalHeight);
            let newCrop = { ...dragState.startCrop };

            if (dragState.type === 'move') {
                newCrop.x += dx;
                newCrop.y += dy;
            } else {
                 if (dragState.type.includes('l')) {
                    newCrop.x += dx;
                    newCrop.width -= dx;
                } else if (dragState.type.includes('r')) {
                    newCrop.width += dx;
                }
                if (dragState.type.includes('t')) {
                    newCrop.y += dy;
                    newCrop.height -= dy;
                } else if (dragState.type.includes('b')) {
                    newCrop.height += dy;
                }

                if (currentAspectRatio !== 0) {
                     if (dragState.type.includes('l') || dragState.type.includes('r')) {
                        newCrop.height = newCrop.width / currentAspectRatio;
                    } else {
                        newCrop.width = newCrop.height * currentAspectRatio;
                    }
                }
            }

            // Boundary checks
            newCrop.width = Math.max(20, newCrop.width);
            newCrop.height = Math.max(20, newCrop.height);
            newCrop.x = Math.max(0, Math.min(newCrop.x, image.naturalWidth - newCrop.width));
            newCrop.y = Math.max(0, Math.min(newCrop.y, image.naturalHeight - newCrop.height));

            setCrop(newCrop);
            
        } else {
            const action = getActionFromPos(mouseX, mouseY);
            setCursor(action ? action.cursor : 'default');
        }
    };

    const handleMouseUp = () => {
        setDragState(null);
    };

    const handleConfirmCrop = () => {
        const image = imageRef.current;
        if (!image) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = crop.width;
        tempCanvas.height = crop.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(
            image,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        onCrop(tempCanvas.toDataURL());
    };

    return html`
        <div class="crop-tool-overlay">
            <div class="crop-tool-container">
                <div class="lightbox-header">
                    <h3>${t('cropImageTitle', { ratio: currentAspectRatioLabel })}</h3>
                    <div style=${{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                        ${aspectRatios.map(r => html`
                            <button class="btn btn-secondary" onClick=${() => setCurrentAspectRatio(r.value)}>${r.label}</button>
                        `)}
                    </div>
                </div>
                <div class="crop-canvas-container" ref=${containerRef}>
                    <canvas 
                        ref=${canvasRef} 
                        style=${{ cursor }}
                        onMouseDown=${handleMouseDown}
                        onMouseMove=${handleMouseMove}
                        onMouseUp=${handleMouseUp}
                        onMouseLeave=${handleMouseUp}
                    />
                </div>
                <div class="editor-buttons" style=${{padding: '1rem', borderTop: '1px solid var(--surface-3)'}}>
                     <button class="btn btn-secondary" onClick=${onCancel}>${t('button_cancel')}</button>
                     <button class="btn btn-primary" onClick=${handleConfirmCrop}>${t('button_save')}</button>
                </div>
            </div>
        </div>
    `;
};

// FIX: Add missing SettingsModal component to resolve import error in App.tsx.
export const SettingsModal: FunctionalComponent<{
    onClose: () => void;
    t: Translator;
}> = ({ onClose, t }) => {
    // State for API key management
    const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('haipix_api_key') || '');
    const [isSaving, setIsSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [apiMessage, setApiMessage] = useState('');

    const handleClearCache = () => {
        if (confirm(t('confirm_clear_cache'))) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleApiKeySave = (e: TargetedEvent) => {
        e.preventDefault();
        if (!apiKeyInput || apiKeyInput.trim() === '') {
            setApiStatus('error');
            setApiMessage(t('api_input_error_empty'));
            return;
        }

        setIsSaving(true);
        setApiStatus('idle');
        setApiMessage('');

        localStorage.setItem('haipix_api_key', apiKeyInput);
        setApiStatus('success');
        setApiMessage(t('api_key_save_success'));
        
        setTimeout(() => {
            setIsSaving(false);
            onClose(); 
        }, 1500);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return html`
        <div class="lightbox-overlay" onClick=${onClose}>
            <div class="hotkey-info-panel-content" onClick=${(e: MouseEvent) => e.stopPropagation()} style=${{minWidth: '500px'}}>
                <div class="lightbox-header">
                    <h3>${t('settings_modal_title')}</h3>
                    <button class="lightbox-close-btn" onClick=${onClose} title=${t('closeEsc')}><${CloseIcon} /></button>
                </div>
                <div style=${{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <${CollapsibleSection} title=${t('api_key_management_title')} initialOpen=${true}>
                        <p class="form-note" style=${{fontSize: '0.9rem', marginBottom: '1rem', borderLeftColor: 'var(--warning-border)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)'}}>${t('api_key_management_desc')}</p>
                        <form onSubmit=${handleApiKeySave}>
                            <div class="form-group">
                                <label for="api-key-input">${t('api_key_current')}</label>
                                <input 
                                    type="password"
                                    id="api-key-input"
                                    value=${apiKeyInput}
                                    onInput=${(e: TargetedEvent<HTMLInputElement>) => setApiKeyInput(e.currentTarget.value)}
                                    placeholder=${t('api_input_placeholder')}
                                />
                            </div>
                            ${apiStatus === 'success' && html`<div class="success-message" style=${{marginBottom: '1rem', marginTop: '0'}}>${apiMessage}</div>`}
                            ${apiStatus === 'error' && html`<div class="error-message" style=${{marginBottom: '1rem', marginTop: '0'}}>${apiMessage}</div>`}
                             <a href="https://docs.google.com/document/d/1QxHQa1bq6Wwa8cDyoWgIXELjufhL6xTgCwb3E7A2kPk/edit?usp=sharing" target="_blank" rel="noopener noreferrer" style=${{display: 'block', marginBottom: '1rem'}}>${t('api_key_guide_link')}</a>
                            <button type="submit" class="btn btn-primary" style=${{width: '100%'}} disabled=${isSaving}>
                                ${isSaving ? t('settings_modal_button_saving') : t('api_key_save_button')}
                            </button>
                        </form>
                    </${CollapsibleSection}>

                   <${CollapsibleSection} title=${t('system')}>
                        <p class="settings-description" style=${{fontSize: '0.9rem', marginBottom: '1rem'}}>${t('clear_cache_desc')}</p>
                        <button class="btn" onClick=${handleClearCache} style=${{width: '100%', backgroundColor: 'var(--primary-base)', color: 'white', borderColor: 'var(--primary-base)'}}>
                            ${t('clear_cache_button')}
                        </button>
                    </${CollapsibleSection}>
                </div>
            </div>
        </div>
    `;
};