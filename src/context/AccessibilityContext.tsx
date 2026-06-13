import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';
export type Contrast = 'normal' | 'high';

interface A11yCtx {
  fontSize: FontSize;
  contrast: Contrast;
  setFontSize: (s: FontSize) => void;
  setContrast: (c: Contrast) => void;
}

const CTX = createContext<A11yCtx>({
  fontSize: 'normal', contrast: 'normal',
  setFontSize: () => {}, setContrast: () => {},
});

const FONT_MAP: Record<FontSize, string> = {
  normal: '',
  large: '112.5%',
  xlarge: '125%',
};

function loadSaved(): { fontSize: FontSize; contrast: Contrast } {
  try {
    const parsed = JSON.parse(localStorage.getItem('froebel_a11y') ?? '{}');
    return {
      fontSize: parsed.fontSize ?? 'normal',
      contrast: parsed.contrast ?? 'normal',
    };
  } catch {
    return { fontSize: 'normal', contrast: 'normal' };
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const saved = loadSaved();
  const [fontSize, setFontSizeState] = useState<FontSize>(saved.fontSize);
  const [contrast, setContrastState] = useState<Contrast>(saved.contrast);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_MAP[fontSize];
  }, [fontSize]);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', contrast === 'high');
  }, [contrast]);

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem('froebel_a11y', JSON.stringify({ fontSize: s, contrast }));
  };

  const setContrast = (c: Contrast) => {
    setContrastState(c);
    localStorage.setItem('froebel_a11y', JSON.stringify({ fontSize, contrast: c }));
  };

  return <CTX.Provider value={{ fontSize, contrast, setFontSize, setContrast }}>{children}</CTX.Provider>;
}

export const useA11y = () => useContext(CTX);
