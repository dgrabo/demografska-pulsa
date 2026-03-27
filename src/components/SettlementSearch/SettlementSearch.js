'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SettlementSearch.module.css';

export default function SettlementSearch({ naselja }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const term = query.toLowerCase();
    const matches = [];
    for (let i = 0; i < naselja.length && matches.length < 10; i++) {
      if (naselja[i].naziv.toLowerCase().includes(term)) {
        matches.push(naselja[i]);
      }
    }
    setResults(matches);
    setIsOpen(matches.length > 0);
    setActiveIndex(-1);
  }, [query, naselja]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectResult = useCallback(
    (naselje) => {
      setQuery('');
      setIsOpen(false);
      router.push(`/naselje/${naselje.id}`);
    },
    [router]
  );

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          selectResult(results[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Pronađi svoje naselje..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="settlement-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `settlement-option-${activeIndex}` : undefined
          }
          aria-label="Pretraži naselja u Hrvatskoj"
          autoComplete="off"
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="settlement-listbox"
          ref={listRef}
          className={styles.dropdown}
          role="listbox"
        >
          {results.map((naselje, index) => (
            <li
              key={naselje.id}
              id={`settlement-option-${index}`}
              className={`${styles.option} ${index === activeIndex ? styles.optionActive : ''}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectResult(naselje)}
            >
              <span className={styles.optionName}>{naselje.naziv}</span>
              <span className={styles.optionContext}>
                {naselje.opcina_naziv}, {naselje.zupanija_naziv}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
