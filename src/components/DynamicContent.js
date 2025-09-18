import React, { useState, useEffect, useMemo } from 'react';
import { useResponsive } from '../hooks/useResponsive';

// Dynamic Image Component with lazy loading and responsive sizing
export const DynamicImage = ({
    src,
    alt,
    className = '',
    fallback = '/api/placeholder/200/150',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    // const responsive = useResponsive(); // Not used in this component

    const imageStyle = useMemo(() => ({
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'opacity 0.3s ease',
        opacity: isLoaded ? 1 : 0,
        ...props.style
    }), [isLoaded, props.style]);

    const handleLoad = () => {
        setIsLoaded(true);
        setHasError(false);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    return (
        <div className={`dynamic-image-container ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
            {!isLoaded && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'var(--card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '12px'
                    }}
                >
                    Loading...
                </div>
            )}
            <img
                src={hasError ? fallback : src}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                style={imageStyle}
                loading="lazy"
                {...props}
            />
        </div>
    );
};

// Dynamic List Component with virtualization for large datasets
export const DynamicList = ({
    items,
    renderItem,
    className = '',
    itemHeight = 60,
    overscan = 5,
    ...props
}) => {
    const [visibleItems, setVisibleItems] = useState([]);
    const [containerHeight, setContainerHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const responsive = useResponsive();

    const containerRef = React.useRef(null);

    useEffect(() => {
        const updateVisibleItems = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const height = container.clientHeight;
            setContainerHeight(height);

            const startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(
                startIndex + Math.ceil(height / itemHeight) + overscan,
                items.length
            );

            setVisibleItems(
                items.slice(Math.max(0, startIndex - overscan), endIndex).map((item, index) => ({
                    ...item,
                    index: startIndex - overscan + index
                }))
            );
        };

        updateVisibleItems();
    }, [items, scrollTop, itemHeight, overscan, containerHeight]);

    const handleScroll = (e) => {
        setScrollTop(e.target.scrollTop);
    };

    const totalHeight = items.length * itemHeight;

    // For mobile devices, disable virtualization for better performance
    if (responsive.isMobile && items.length < 50) {
        return (
            <div className={`dynamic-list ${className}`} {...props}>
                {items.map((item, index) => renderItem(item, index))}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`dynamic-list ${className}`}
            style={{
                height: '100%',
                overflow: 'auto',
                position: 'relative'
            }}
            onScroll={handleScroll}
            {...props}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map((item, index) => (
                    <div
                        key={item.index}
                        style={{
                            position: 'absolute',
                            top: item.index * itemHeight,
                            left: 0,
                            right: 0,
                            height: itemHeight
                        }}
                    >
                        {renderItem(item, item.index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Adaptive Search Component with debouncing and suggestions
export const AdaptiveSearch = ({
    value,
    onChange,
    placeholder = "Search...",
    suggestions = [],
    onSuggestionSelect,
    className = '',
    ...props
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState(value);
    const responsive = useResponsive();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    // Filter suggestions based on input
    const filteredSuggestions = useMemo(() => {
        const q = String(debouncedValue || '');
        if (!q || q.length < 2) return [];
        const list = Array.isArray(suggestions) ? suggestions.filter(s => typeof s === 'string') : [];
        return list.filter(suggestion =>
            suggestion.toLowerCase().includes(q.toLowerCase())
        ).slice(0, responsive.isMobile ? 5 : 8);
    }, [debouncedValue, suggestions, responsive.isMobile]);

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion) => {
        onChange(suggestion);
        setShowSuggestions(false);
        onSuggestionSelect?.(suggestion);
    };

    const handleBlur = () => {
        // Delay hiding suggestions to allow clicks
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <div className={`adaptive-search ${className}`} style={{ position: 'relative' }}>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="search-input"
                {...props}
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflow: 'auto'
                    }}
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                padding: responsive.isMobile ? '8px 12px' : '10px 16px',
                                cursor: 'pointer',
                                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Dynamic Pagination Component
export const DynamicPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    ...props
}) => {
    const responsive = useResponsive();
    const [visiblePages, setVisiblePages] = useState([]);

    useEffect(() => {
        const calculateVisiblePages = () => {
            const maxVisible = responsive.isMobile ? 3 : 5;
            const half = Math.floor(maxVisible / 2);

            let start = Math.max(1, currentPage - half);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }

            const pages = [];
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            setVisiblePages(pages);
        };

        calculateVisiblePages();
    }, [currentPage, totalPages, responsive.isMobile]);

    if (totalPages <= 1) return null;

    return (
        <div
            className={`dynamic-pagination ${className}`}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                margin: '20px 0'
            }}
            {...props}
        >
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: responsive.isMobile ? '6px 10px' : '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: currentPage === 1 ? 'var(--card-bg)' : 'var(--bg-secondary)',
                    color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: `${responsive.getFontSize(12)}px`
                }}
            >
                Previous
            </button>

            {visiblePages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={{
                        padding: responsive.isMobile ? '6px 10px' : '8px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: page === currentPage ? 'var(--accent-color)' : 'var(--bg-secondary)',
                        color: page === currentPage ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: `${responsive.getFontSize(12)}px`,
                        minWidth: responsive.isMobile ? '32px' : '40px'
                    }}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: responsive.isMobile ? '6px 10px' : '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: currentPage === totalPages ? 'var(--card-bg)' : 'var(--bg-secondary)',
                    color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: `${responsive.getFontSize(12)}px`
                }}
            >
                Next
            </button>
        </div>
    );
};

// Dynamic Loading States Component
export const DynamicLoading = ({
    type = 'spinner',
    size = 'md',
    text = 'Loading...',
    className = '',
    ...props
}) => {
    const responsive = useResponsive();

    const getSpinnerSize = () => {
        const sizes = { sm: 20, md: 40, lg: 60 };
        return responsive.isMobile ? sizes[size] * 0.8 : sizes[size];
    };

    if (type === 'skeleton') {
        return (
            <div className={`dynamic-loading-skeleton ${className}`} {...props}>
                <div
                    style={{
                        width: '100%',
                        height: '20px',
                        background: 'linear-gradient(90deg, var(--card-bg) 25%, var(--border-color) 50%, var(--card-bg) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-loading 1.5s infinite',
                        borderRadius: '4px',
                        marginBottom: '8px'
                    }}
                />
                <div
                    style={{
                        width: '80%',
                        height: '16px',
                        background: 'linear-gradient(90deg, var(--card-bg) 25%, var(--border-color) 50%, var(--card-bg) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-loading 1.5s infinite',
                        borderRadius: '4px'
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`dynamic-loading ${className}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px'
            }}
            {...props}
        >
            <div
                style={{
                    width: `${getSpinnerSize()}px`,
                    height: `${getSpinnerSize()}px`,
                    border: '3px solid var(--border-color)',
                    borderTop: '3px solid var(--accent-color)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
            />
            {text && (
                <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: `${responsive.getFontSize(14)}px`
                }}>
                    {text}
                </div>
            )}
        </div>
    );
};
