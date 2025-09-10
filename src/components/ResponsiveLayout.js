import React, { useState, useEffect } from 'react';
import { useResponsive, useAdaptiveUI } from '../hooks/useResponsive';

// Dynamic Grid Component
export const ResponsiveGrid = ({
    children,
    minItemWidth = 200,
    gap = 20,
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const [gridStyle, setGridStyle] = useState({});

    useEffect(() => {
        const calculateGrid = () => {
            const containerWidth = responsive.screenSize.width;
            const availableWidth = containerWidth - (responsive.getSpacing() * 2); // Account for padding
            const itemWidth = Math.max(minItemWidth, responsive.getImageSize(minItemWidth));

            // More responsive column calculation
            let columns;
            if (responsive.isMobile) {
                columns = Math.max(1, Math.floor(availableWidth / (itemWidth + gap)));
            } else if (responsive.isTablet) {
                columns = Math.max(2, Math.floor(availableWidth / (itemWidth + gap)));
            } else {
                columns = Math.max(3, Math.floor(availableWidth / (itemWidth + gap)));
            }

            setGridStyle({
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${itemWidth}px, 1fr))`,
                gap: `${responsive.getSpacing(gap)}px`,
                width: '100%',
            });
        };

        calculateGrid();
    }, [responsive.screenSize.width, minItemWidth, gap, children.length, responsive]);

    return (
        <div
            className={`responsive-grid ${className}`}
            style={gridStyle}
            {...props}
        >
            {children}
        </div>
    );
};

// Adaptive Container Component
export const AdaptiveContainer = ({
    children,
    maxWidth = '100%',
    padding = 'auto',
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const [containerStyle, setContainerStyle] = useState({});

    useEffect(() => {
        const calculateContainer = () => {
            const style = {
                width: '100%',
                maxWidth: maxWidth,
                margin: '0 auto',
                padding: typeof padding === 'string'
                    ? padding
                    : `${responsive.getSpacing(padding)}px`,
            };

            // Add responsive adjustments
            if (responsive.isMobile) {
                style.padding = `${responsive.getSpacing(12)}px`;
                style.maxWidth = '100%';
            } else if (responsive.isTablet) {
                style.padding = `${responsive.getSpacing(20)}px`;
                style.maxWidth = '100%';
            } else {
                style.padding = `${responsive.getSpacing(24)}px`;
                style.maxWidth = maxWidth;
            }

            setContainerStyle(style);
        };

        calculateContainer();
    }, [responsive, maxWidth, padding]);

    return (
        <div
            className={`adaptive-container ${className}`}
            style={containerStyle}
            {...props}
        >
            {children}
        </div>
    );
};

// Dynamic Typography Component
export const ResponsiveText = ({
    children,
    as: Component = 'p',
    size = 'base',
    weight = 'normal',
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const [textStyle, setTextStyle] = useState({});

    useEffect(() => {
        const calculateText = () => {
            const baseSizes = {
                xs: 12,
                sm: 14,
                base: 16,
                lg: 18,
                xl: 20,
                '2xl': 24,
                '3xl': 30,
                '4xl': 36,
            };

            const baseWeights = {
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800,
            };

            const fontSize = responsive.getFontSize(baseSizes[size] || baseSizes.base);
            const fontWeight = baseWeights[weight] || baseWeights.normal;

            setTextStyle({
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                lineHeight: responsive.isMobile ? 1.4 : 1.6,
            });
        };

        calculateText();
    }, [responsive, size, weight]);

    return (
        <Component
            className={`responsive-text ${className}`}
            style={textStyle}
            {...props}
        >
            {children}
        </Component>
    );
};

// Adaptive Button Component
export const ResponsiveButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    disabled = false,
    ...props
}) => {
    const responsive = useResponsive();
    const [buttonStyle, setButtonStyle] = useState({});

    useEffect(() => {
        const calculateButton = () => {
            const baseSizes = {
                sm: { padding: '6px 12px', fontSize: 12 },
                md: { padding: '8px 16px', fontSize: 14 },
                lg: { padding: '12px 24px', fontSize: 16 },
            };

            const variants = {
                primary: {
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                },
                secondary: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                },
                ghost: {
                    background: 'transparent',
                    color: 'var(--accent-color)',
                    border: '1px solid var(--accent-color)',
                },
            };

            const sizeConfig = baseSizes[size] || baseSizes.md;
            const variantConfig = variants[variant] || variants.primary;

            const style = {
                ...variantConfig,
                padding: responsive.isMobile
                    ? `${Math.max(8, parseInt(sizeConfig.padding.split(' ')[0]))}px ${Math.max(12, parseInt(sizeConfig.padding.split(' ')[1]))}px`
                    : sizeConfig.padding,
                fontSize: `${responsive.getFontSize(sizeConfig.fontSize)}px`,
                borderRadius: '8px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.2s ease',
                minHeight: responsive.isMobile ? '44px' : 'auto',
                minWidth: responsive.isMobile ? '44px' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
            };

            setButtonStyle(style);
        };

        calculateButton();
    }, [responsive, variant, size, disabled]);

    const handleClick = (e) => {
        if (!disabled && onClick) {
            onClick(e);
        }
    };

    return (
        <button
            className={`responsive-button ${className}`}
            style={buttonStyle}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

// Adaptive Modal Component
export const ResponsiveModal = ({
    isOpen,
    onClose,
    children,
    title,
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const [modalStyle, setModalStyle] = useState({});

    useEffect(() => {
        const calculateModal = () => {
            const style = {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: responsive.isMobile ? 'flex-start' : 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: responsive.isMobile ? '20px 10px' : '20px',
                paddingTop: responsive.isMobile ? '40px' : '20px',
            };

            setModalStyle(style);
        };

        calculateModal();
    }, [responsive]);

    const [contentStyle, setContentStyle] = useState({});

    useEffect(() => {
        const calculateContent = () => {
            const style = {
                background: 'var(--bg-secondary)',
                borderRadius: responsive.isMobile ? '12px' : '20px',
                padding: responsive.isMobile ? '16px' : '24px',
                width: responsive.isMobile ? '100%' : '90%',
                maxWidth: responsive.isMobile ? '400px' : '600px',
                maxHeight: responsive.isMobile ? '80vh' : '90vh',
                overflow: 'auto',
                position: 'relative',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            };

            setContentStyle(style);
        };

        calculateContent();
    }, [responsive]);

    if (!isOpen) return null;

    return (
        <div
            className={`responsive-modal ${className}`}
            style={modalStyle}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            {...props}
        >
            <div style={contentStyle}>
                {title && (
                    <ResponsiveText
                        as="h2"
                        size="xl"
                        weight="bold"
                        style={{ marginBottom: '16px', textAlign: 'center' }}
                    >
                        {title}
                    </ResponsiveText>
                )}
                {children}
            </div>
        </div>
    );
};

// Adaptive Loading Component
export const ResponsiveLoading = ({
    size = 'md',
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const [loadingStyle, setLoadingStyle] = useState({});

    useEffect(() => {
        const calculateLoading = () => {
            const sizes = {
                sm: 20,
                md: 40,
                lg: 60,
            };

            const spinnerSize = responsive.isMobile
                ? sizes[size] * 0.8
                : sizes[size] || sizes.md;

            setLoadingStyle({
                width: `${spinnerSize}px`,
                height: `${spinnerSize}px`,
                border: '3px solid var(--border-color)',
                borderTop: '3px solid var(--accent-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            });
        };

        calculateLoading();
    }, [responsive, size]);

    return (
        <div
            className={`responsive-loading ${className}`}
            style={loadingStyle}
            {...props}
        />
    );
};

// Main Responsive Layout Component
export const ResponsiveLayout = ({
    children,
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const uiConfig = useAdaptiveUI();
    const [layoutStyle, setLayoutStyle] = useState({});

    useEffect(() => {
        const calculateLayout = () => {
            const style = {
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontSize: `${responsive.getFontSize()}px`,
                lineHeight: responsive.isMobile ? 1.4 : 1.6,
            };

            // Apply performance optimizations
            if (uiConfig.performance?.reducedParticles) {
                style.background = 'var(--bg-primary)';
            }

            setLayoutStyle(style);
        };

        calculateLayout();
    }, [responsive, uiConfig]);

    return (
        <div
            className={`responsive-layout ${className}`}
            style={layoutStyle}
            data-device-type={responsive.deviceType}
            data-orientation={responsive.orientation}
            data-touch-device={responsive.isTouchDevice}
            {...props}
        >
            {children}
        </div>
    );
};
