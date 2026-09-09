import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styles from './DigitalKeyboard.module.css';

interface DigitalKeyboardProps {
  open: boolean;
  onClose: () => void;
  onChange: (newValue: string) => void;
  targetRef?: React.RefObject<HTMLElement>;
  onHeightChange?: (height: number) => void;
}

const DigitalKeyboard: React.FC<DigitalKeyboardProps> = ({
  open,
  onClose,
  onChange,
  targetRef,
  onHeightChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const keyboardRef = useRef<HTMLDivElement>(null);

// 1. Сброс inputValue только при открытии (сравниваем предыдущее состояние open)
useEffect(() => {
  if (open) {
    setInputValue('');
  }
}, [open]); // теперь только open

// 2. Обработка стилей targetRef (без сброса inputValue)
useEffect(() => {
  if (open && targetRef?.current) {
    const el = targetRef.current;
    const origPos = el.style.position;
    const origZ = el.style.zIndex;
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    el.style.zIndex = '1001';
    (el as any).__origPos = origPos;
    (el as any).__origZ = origZ;
    // cleanup при закрытии или при изменении targetRef
    return () => {
      const origPos2 = (el as any).__origPos;
      const origZ2 = (el as any).__origZ;
      if (origPos2 !== undefined) el.style.position = origPos2;
      if (origZ2 !== undefined) el.style.zIndex = origZ2;
      else el.style.zIndex = '';
      delete (el as any).__origPos;
      delete (el as any).__origZ;
    };
  }
  // Если open === false, тоже нужно восстановить стили
  if (!open && targetRef?.current) {
    const el = targetRef.current;
    const origPos = (el as any).__origPos;
    const origZ = (el as any).__origZ;
    if (origPos !== undefined) el.style.position = origPos;
    if (origZ !== undefined) el.style.zIndex = origZ;
    else el.style.zIndex = '';
    delete (el as any).__origPos;
    delete (el as any).__origZ;
  }
}, [open, targetRef]); // оставляем targetRef, но теперь он не сбрасывает inputValue

  // Измерение высоты
  useLayoutEffect(() => {
    if (open && keyboardRef.current) {
      setTimeout(() => {
        if (keyboardRef.current) {
          const height = keyboardRef.current.getBoundingClientRect().height;
          if (onHeightChange) onHeightChange(height);
        }
      }, 50);
    }
  }, [open, onHeightChange]);

  // Валидация (копия из родителя)
const isValidInput = (candidate: string): boolean => {
  if (candidate === '') return true;                     // разрешаем очистку поля
  // допустимы только цифры, одна точка и не более одной цифры после неё
  if (!/^[0-9]*\.?[0-9]?$/.test(candidate)) return false;
  const num = parseFloat(candidate);
  if (isNaN(num)) return false;                          // например, одиночная '.' – запрещена
  // верхняя граница
  if (num > 800) return false;
  // нижняя граница: числа меньше 10 разрешаем только как одиночные цифры 1..9 (префиксы)
  if (num < 10) {
    if (candidate.length === 1 && candidate >= '1' && candidate <= '9') {
      return true;
    }
    return false;
  }
  // дополнительно защита от ведущих нулей (для чисел >=10 они не встречаются, но оставлено для единообразия)
  if (candidate.startsWith('0') && candidate.length > 1 && candidate[1] !== '.') {
    return false;
  }
  return true;
};

  // Нажатие клавиши – только локальное обновление, onChange НЕ вызываем
  const handleKeyPress = (char: string) => {
    if (char === 'backspace') {
      setInputValue(prev => prev.slice(0, -1));
      return;
    }

    if (char === '.') {
      if (inputValue.includes('.')) return;
      const newValue = inputValue === '' ? '0.' : inputValue + '.';
      if (isValidInput(newValue)) {
        setInputValue(newValue);
      }
      return;
    }

    const candidate = inputValue + char;
    if (isValidInput(candidate)) {
      setInputValue(candidate);
    }
  };

  // Подтверждение (Enter)
  const handleSubmit = () => {
    onChange(inputValue); // передаём текущее значение родителю
    onClose();
  };

  // Закрытие (крестик или оверлей)
  const handleClose = () => {
    onChange(inputValue); // передаём текущее значение (может быть пустым)
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.keyboard} ref={keyboardRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <span className={styles.title}>Ввод</span>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>

        <div className={styles.previewRow}>
          <span className={styles.previewValue}>{inputValue}</span>
        </div>

        <div className={styles.row}>
          <button className={styles.key} onClick={() => handleKeyPress('7')}>7</button>
          <button className={styles.key} onClick={() => handleKeyPress('8')}>8</button>
          <button className={styles.key} onClick={() => handleKeyPress('9')}>9</button>
          <button className={styles.key} onClick={() => handleKeyPress('backspace')}>⌫</button>
        </div>

        <div className={styles.row}>
          <button className={styles.key} onClick={() => handleKeyPress('4')}>4</button>
          <button className={styles.key} onClick={() => handleKeyPress('5')}>5</button>
          <button className={styles.key} onClick={() => handleKeyPress('6')}>6</button>
          <span className={styles.empty} />
        </div>

        <div className={styles.row}>
          <button className={styles.key} onClick={() => handleKeyPress('1')}>1</button>
          <button className={styles.key} onClick={() => handleKeyPress('2')}>2</button>
          <button className={styles.key} onClick={() => handleKeyPress('3')}>3</button>
          <span className={styles.empty} />
        </div>

        <div className={styles.row}>
          <button className={styles.key} onClick={() => handleKeyPress('0')}>0</button>
          <button className={styles.key} onClick={() => handleKeyPress('.')}>.</button>
          <span className={styles.empty} />
          <button className={styles.key} onClick={handleSubmit}>↵</button>
        </div>
      </div>
    </div>
  );
};

export default DigitalKeyboard;