import { useState, useRef, useEffect } from 'react';
import styles from './ModeSelect.module.css';
import { MiraPosition } from '../../utils/settings';

interface Props {
  positions: MiraPosition[];
  value: string;                        // id выбранной позиции
  onChange: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export default function ModeSelect({ positions, value, onChange, onDelete, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = positions.find((p) => p.id === value);

  // Закрытие при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={styles.triggerText}>
          {selected ? selected.name : '— выберите —'}
        </span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {positions.length === 0 && (
            <div className={styles.empty}>Нет сохранённых положений</div>
          )}
          {positions.map((p) => (
            <div
              key={p.id}
              className={`${styles.option} ${p.id === value ? styles.optionActive : ''}`}
            >
              <span
                className={styles.optionText}
                onClick={() => {
                  onChange(p.id);
                  setIsOpen(false);
                }}
              >
                {p.name}
                <span className={styles.optionPos}> ({p.position.toFixed(1)} мм)</span>
              </span>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
                title="Удалить"
              >
                −
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}