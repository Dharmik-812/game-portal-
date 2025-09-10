import { useState, useEffect } from 'react';

// Custom hook for responsive design utilities
export const useResponsive = () => {
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    const [deviceType, setDeviceType] = useState('desktop');
    const [orientation, setOrientation] = useState('portrait');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setScreenSize({ width, height });

            // Determine device type
            if (width < 480) {
                setDeviceType('mobile');
            } else if (width < 768) {
                setDeviceType('tablet');
            } else if (width < 1024) {
                setDeviceType('laptop');
            } else {
                setDeviceType('desktop');
            }

            // Determine orientation
            setOrientation(width > height ? 'landscape' : 'portrait');
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop' || deviceType === 'laptop';
    const isLandscape = orientation === 'landscape';
    const isPortrait = orientation === 'portrait';

    // Dynamic grid columns based on screen size
    const getGridColumns = (baseColumns = 4) => {
        if (isMobile) return 1;
        if (isTablet) return 2;
        if (screenSize.width < 1200) return 3;
        return baseColumns;
    };

    // Dynamic spacing based on screen size
    const getSpacing = (baseSpacing = 20) => {
        if (isMobile) return baseSpacing * 0.6;
        if (isTablet) return baseSpacing * 0.8;
        return baseSpacing;
    };

    // Dynamic font size based on screen size
    const getFontSize = (baseSize = 16) => {
        if (isMobile) return baseSize * 0.875;
        if (isTablet) return baseSize * 0.9375;
        return baseSize;
    };

    // Check if device supports touch
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    // Check if device has reduced motion preference
    const prefersReducedMotion = () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Check if device has high contrast preference
    const prefersHighContrast = () => {
        return window.matchMedia('(prefers-contrast: high)').matches;
    };

    // Get optimal image size based on device
    const getImageSize = (baseSize = 200) => {
        if (isMobile) return baseSize * 0.7;
        if (isTablet) return baseSize * 0.85;
        return baseSize;
    };

    // Get optimal number of items to show
    const getItemsPerPage = (baseItems = 12) => {
        if (isMobile) return Math.floor(baseItems * 0.5);
        if (isTablet) return Math.floor(baseItems * 0.75);
        return baseItems;
    };

    return {
        screenSize,
        deviceType,
        orientation,
        isMobile,
        isTablet,
        isDesktop,
        isLandscape,
        isPortrait,
        getGridColumns,
        getSpacing,
        getFontSize,
        isTouchDevice: isTouchDevice(),
        prefersReducedMotion: prefersReducedMotion(),
        prefersHighContrast: prefersHighContrast(),
        getImageSize,
        getItemsPerPage,
    };
};

// Hook for dynamic content loading
export const useDynamicContent = (baseContent, responsiveConfig) => {
    const responsive = useResponsive();
    const [content, setContent] = useState(baseContent);

    useEffect(() => {
        let newContent = { ...baseContent };

        // Apply responsive modifications
        if (responsiveConfig) {
            if (responsive.isMobile && responsiveConfig.mobile) {
                newContent = { ...newContent, ...responsiveConfig.mobile };
            } else if (responsive.isTablet && responsiveConfig.tablet) {
                newContent = { ...newContent, ...responsiveConfig.tablet };
            } else if (responsive.isDesktop && responsiveConfig.desktop) {
                newContent = { ...newContent, ...responsiveConfig.desktop };
            }
        }

        setContent(newContent);
    }, [baseContent, responsiveConfig, responsive.isMobile, responsive.isTablet, responsive.isDesktop]);

    return content;
};

// Hook for adaptive UI behavior
export const useAdaptiveUI = () => {
    const responsive = useResponsive();
    const [uiConfig, setUIConfig] = useState({});

    useEffect(() => {
        const config = {
            // Animation settings
            animations: {
                enabled: !responsive.prefersReducedMotion,
                duration: responsive.isMobile ? 0.2 : 0.3,
                easing: 'ease-out',
            },

            // Touch settings
            touch: {
                enabled: responsive.isTouchDevice,
                tapHighlight: responsive.isTouchDevice,
                swipeThreshold: responsive.isMobile ? 50 : 100,
            },

            // Layout settings
            layout: {
                gridColumns: responsive.getGridColumns(),
                spacing: responsive.getSpacing(),
                fontSize: responsive.getFontSize(),
                itemsPerPage: responsive.getItemsPerPage(),
            },

            // Performance settings
            performance: {
                reducedParticles: responsive.isMobile,
                simplifiedAnimations: responsive.isMobile || responsive.prefersReducedMotion,
                lazyLoading: responsive.isMobile,
            },

            // Accessibility settings
            accessibility: {
                highContrast: responsive.prefersHighContrast,
                largeText: responsive.isMobile,
                focusVisible: true,
            },
        };

        setUIConfig(config);
    }, [responsive]);

    return uiConfig;
};
