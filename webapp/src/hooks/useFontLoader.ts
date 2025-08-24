import { useEffect, useState } from 'react';

interface FontStatus {
  poppins: boolean;
  alice: boolean;
  loading: boolean;
}

export const useFontLoader = () => {
  const [fontStatus, setFontStatus] = useState<FontStatus>({
    poppins: false,
    alice: false,
    loading: true,
  });

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Check if fonts are already loaded
        if (typeof window !== 'undefined' && 'fonts' in document) {
          const poppinsLoaded = await document.fonts.check('1em Poppins');
          const aliceLoaded = await document.fonts.check('1em Alice');
          
          setFontStatus({
            poppins: poppinsLoaded,
            alice: aliceLoaded,
            loading: false,
          });

          // If fonts aren't loaded, try to load them
          if (!poppinsLoaded || !aliceLoaded) {
            // Add fallback CSS
            const style = document.createElement('style');
            style.textContent = `
              .font-poppins { 
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              }
              .font-alice { 
                font-family: 'Alice', Georgia, 'Times New Roman', serif; 
              }
            `;
            document.head.appendChild(style);

            // Try to load Google Fonts again
            const fontLoader = document.createElement('link');
            fontLoader.rel = 'stylesheet';
            fontLoader.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Alice:ital,wght@0,400;1,400;1,600&display=swap';
            
            // Add timeout for font loading
            const timeout = setTimeout(() => {
              setFontStatus((prev: FontStatus) => ({ ...prev, loading: false }));
            }, 3000);

            fontLoader.onload = () => {
              clearTimeout(timeout);
              // Re-check font status after loading
              setTimeout(async () => {
                const poppinsLoaded = await document.fonts.check('1em Poppins');
                const aliceLoaded = await document.fonts.check('1em Alice');
                setFontStatus({
                  poppins: poppinsLoaded,
                  alice: aliceLoaded,
                  loading: false,
                });
              }, 100);
            };

            fontLoader.onerror = () => {
              clearTimeout(timeout);
              setFontStatus((prev: FontStatus) => ({ ...prev, loading: false }));
            };

            document.head.appendChild(fontLoader);
          }
        } else {
          // Fallback for browsers without Font Loading API
          setFontStatus({
            poppins: false,
            alice: false,
            loading: false,
          });
        }
      } catch (error) {
        console.warn('Font loading error:', error);
        setFontStatus({
          poppins: false,
          alice: false,
          loading: false,
        });
      }
    };

    loadFonts();
  }, []);

  return fontStatus;
};
