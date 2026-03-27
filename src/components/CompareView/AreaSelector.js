'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AreaSelector.module.css';

export default function AreaSelector({ areas, selected, onSelect, label }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const matches = [];
    for (let i = 0; i < areas.length && matches.length < 10; i++) {
      if (areas[i].naziv.toLowerCase().includes(q)) {
        matches.push(areas[i]);
      }
    }
    setResults(matches);
    setIsOpen(matches.length > 0);
    setActiveIndex(-1);
  }, [query, areas]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const selectArea = useCallback((area) => {
    onSelect(area);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  }, [onSelect]);

  function handleKeyDown(e) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectArea(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function clearSelection() {
    onSelect(null);
    setQuery('');
    inputRef.current?.focus();
  }

  const listId = `area-selector-${label}`;

  return (
    <div className={styles.container} ref={containerRef}>
      <span className={styles.label}>{label}</span>
      {selected ? (
        <div className={styles.selected}>
          <div className={styles.selectedInfo}>
            <span className={styles.selectedName}>{selected.naziv}</span>
            <span className={styles.selectedType}>{selected.displayType}</span>
          </div>
          <button
            className={styles.clearBtn}
            onClick={clearSelection}
            aria-label="Ukloni odabir"
          >
            &times;
          </button>
        </div>
      ) : (
        <div className={styles.inputWrapper}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="18" y2="18" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pretraži županije i općine..."
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            autoComplete="off"
          />
        </div>
      )}
      {isOpen && (
        <ul
          id={listId}
          ref={listRef}
          className={styles.dropdown}
          role="listbox"
        >
          {results.map((area, i) => (
            <li
              key={area.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`${styles.option} ${i === activeIndex ? styles.optionActive : ''}`}
              onMouseDown={() => selectArea(area)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className={styles.optionName}>{area.naziv}</span>
              <span className={styles.optionType}>{area.displayType}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
