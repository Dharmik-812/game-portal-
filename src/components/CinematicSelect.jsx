import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// A lightweight, accessible custom select with cinematic styling.
// Props:
// - options: Array<{ value: string, label: string, group?: string }>
// - value: string
// - onChange: (value: string) => void
// - placeholder?: string
// - ariaLabel?: string
export default function CinematicSelect({ options = [], value, onChange, placeholder = 'Select…', ariaLabel = 'Select' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const idBaseRef = useRef(`cine-${Math.random().toString(36).slice(2)}`);

  // Group by language (or provided group)
  const grouped = useMemo(() => {
    const map = new Map();
    for (const opt of options) {
      const g = opt.group || 'Voices';
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(opt);
    }
    const groups = Array.from(map.entries()).map(([group, items]) => ({
      group,
      items: items.slice().sort((a, b) => (a.label || '').localeCompare(b.label || '')),
    }));
    groups.sort((a, b) => (a.group || '').localeCompare(b.group || ''));
    return groups;
  }, [options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    return grouped
      .map(({ group, items }) => ({ group, items: items.filter(o => (o.label || '').toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0);
  }, [grouped, query]);

  const flat = useMemo(() => filtered.flatMap(g => g.items), [filtered]);

  const selectedLabel = useMemo(() => options.find(o => o.value === value)?.label || '', [options, value]);

  // Close when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Update highlight when opening or when options change
  useEffect(() => {
    if (!open) return;
    const idx = flat.findIndex(o => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  }, [open, flat, value]);

  // Ensure highlighted option remains in view
  useEffect(() => {
    if (!open || highlight < 0) return;
    const el = listRef.current?.querySelector(`[data-index="${highlight}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const selectIndex = (idx) => {
    const opt = flat[idx];
    if (!opt) return;
    onChange && onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(flat.length - 1, (h < 0 ? 0 : h + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(0, (h < 0 ? 0 : h - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectIndex(highlight < 0 ? 0 : highlight);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div
      className={`cine-select ${open ? 'open' : ''}`}
      ref={rootRef}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={`${idBaseRef.current}-list`}
      aria-activedescendant={open && highlight >= 0 ? `${idBaseRef.current}-opt-${highlight}` : undefined}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <button type="button" className="cine-btn" onClick={() => setOpen(o => !o)} aria-label={ariaLabel}>
        <span className="cine-label">{selectedLabel || placeholder}</span>
        <span className="cine-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="cine-menu" role="listbox" ref={listRef} id={`${idBaseRef.current}-list`}>
          <div className="cine-search-wrap">
            <input className="cine-search" type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search voices…" aria-label="Search voices" />
          </div>
          <div className="cine-list">
            {filtered.length === 0 && (
              <div className="cine-empty">No voices found</div>
            )}
            {filtered.map((group, gi) => (
              <div className="cine-group" key={`g-${gi}`}>
                <div className="cine-group-title">{group.group}</div>
                {group.items.map((opt, oi) => {
                  const idx = filtered.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0) + oi;
                  const selected = value === opt.value;
                  const active = idx === highlight;
                  return (
                    <div
                      key={opt.value}
                      id={`${idBaseRef.current}-opt-${idx}`}
                      className={`cine-option ${selected ? 'selected' : ''} ${active ? 'active' : ''}`}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      data-index={idx}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={(e) => { e.preventDefault(); selectIndex(idx); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectIndex(idx); }
                      }}
                    >
                      <span className="cine-option-label">{opt.label}</span>
                      {selected && <span className="cine-check" aria-hidden="true">✓</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

CinematicSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    group: PropTypes.string,
  })),
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  ariaLabel: PropTypes.string,
};
