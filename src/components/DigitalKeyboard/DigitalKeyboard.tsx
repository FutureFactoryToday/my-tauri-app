import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styles from './DigitalKeyboard.module.css';

type Language = 'en' | 'ru';

const LAYOUTS: Record<Language, { row1: string[]; row2: string[]; row3: string[] }> = {
  en: {
    row1: ['Q','W','E','R','T','Y','U','I','O','P'],
    row2: ['A','S','D','F','G','H','J','K','L'],
    row3: ['Z','X','C','V','B','N','M'],
  },
  ru: {
    row1: ['Й','Ц','У','К','Е','Н','Г','Ш','Щ','З','Х','Ъ'],
    row2: ['Ф','Ы','В','А','П','Р','О','Л','Д','Ж','Э'],
    row3: ['Я','Ч','С','М','И','Т','Ь','Б','Ю','Ё'],
  },
};

interface DigitalKeyboardProps<T extends HTMLElement = HTMLElement> {
  open: boolean;
  onClose: () => void;
  onChange: (newValue: string) => void;
  targetRef?: React.RefObject<T | null>;
  onHeightChange?: (height: number) => void;
  initialValue?: string;
  maxLength?: number;
  validate?: (candidate: string) => boolean;
}

const DigitalKeyboard = <T extends HTMLElement = HTMLElement>({
  open,
  onClose,
  onChange,
  targetRef,
  onHeightChange,
  initialValue = '',
  maxLength,
  validate,
}: DigitalKeyboardProps<T>) => {
  const [inputValue, setInputValue] = useState('');
  const [shiftState, setShiftState] = useState<0 | 1 | 2>(0);
  const [language, setLanguage] = useState<Language>('ru');
  const keyboardRef = useRef<HTMLDivElement>(null);

// 1. Сброс inputValue только при открытии (сравниваем предыдущее состояние open)
useEffect(() => {
  if (open) {
    setInputValue(initialValue);
    setShiftState(0);
  }
}, [open, initialValue]);

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
    if (candidate === '') return true;
    if (!/^[0-9]*\.?[0-9]?$/.test(candidate)) return false;

    const num = parseFloat(candidate);
    if (isNaN(num)) return false;

    if (num > 800) return false;

    // Запрет лишних ведущих нулей: "00", "05" — но "0", "0.", "0.5" разрешены
    if (candidate.length > 1 && candidate[0] === '0' && candidate[1] !== '.') {
      return false;
    }

    if (num < 10) {
      // Разрешаем одиночную цифру 0–9 с опциональной точкой и одной цифрой после:
      // "0", "0.", "0.5", "5", "5.", "5.5"
      return /^[0-9]\.?[0-9]?$/.test(candidate);
    }

    return true;
  };

  const handleKeyPress = (char: string): boolean => {
    if (char === 'backspace') {
      setInputValue(prev => prev.slice(0, -1));
      return true;
    }

    let candidate: string;
    if (char === '.') {
      if (inputValue.includes('.')) return false;
      candidate = inputValue === '' ? '0.' : inputValue + '.';
    } else {
      candidate = inputValue + char;
    }

    if (maxLength !== undefined && candidate.length > maxLength) return false;

    const check = validate ?? isValidInput;
    if (check(candidate)) {
      setInputValue(candidate);
      return true;
    }
    return false;
  };

  const handleLetterPress = (letter: string) => {
    // 0 → строчная, 1 и 2 → заглавная
    const char = shiftState === 0 ? letter.toLowerCase() : letter.toUpperCase();
    const ok = handleKeyPress(char);

    // Auto-off только для режима «shift» (1), а не для capslock (2)
    if (ok && shiftState === 1) setShiftState(0);
  };

  const handleShiftToggle = () => {
    // 0 → 1 → 2 → 0
    setShiftState(prev => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const switchLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ru' : 'en'));
    setShiftState(0);   // сбрасываем Shift при смене языка
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

          <div className={styles.keyboardBody}>

            {/* ЛЕВАЯ ЧАСТЬ — БУКВЫ */}
            <div className={styles.lettersBlock} data-lang={language}>

              {/* Ряд 1 */}
              <div className={styles.rowLetters}>
                {LAYOUTS[language].row1.map(l => (
                  <button key={l} className={styles.keyLetter} onClick={() => handleLetterPress(l)}>
                    {shiftState === 0 ? l.toLowerCase() : l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Ряд 2 */}
              <div className={styles.rowLetters}>
                {LAYOUTS[language].row2.map(l => (
                  <button key={l} className={styles.keyLetter} onClick={() => handleLetterPress(l)}>
                    {shiftState === 0 ? l.toLowerCase() : l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Ряд 3: Shift + ZXCVBNM + Backspace */}
              <div className={styles.rowLetters}>
                <button
                  className={`${styles.keyLetter} ${styles.keyModifier} ${
                    shiftState === 1 ? styles.keyShiftActive :
                    shiftState === 2 ? styles.keyCapsActive : ''
                  }`}
                  onClick={handleShiftToggle}
                  title={shiftState === 2 ? 'Caps Lock' : 'Shift'}
                >
                  {shiftState === 2 ? '⇪' : '⇧'}
                </button>

                {LAYOUTS[language].row3.map(l => (
                  <button key={l} className={styles.keyLetter} onClick={() => handleLetterPress(l)}>
                    {shiftState === 0 ? l.toLowerCase() : l.toUpperCase()}
                  </button>
                ))}

                <button
                  className={`${styles.keyLetter} ${styles.keyModifier}`}
                  onClick={() => handleKeyPress('backspace')}
                >
                  ⌫
                </button>
              </div>

              {/* Ряд 4: Язык + Пробел */}
              <div className={styles.rowLetters}>
                <button
                  className={`${styles.keyLetter} ${styles.keyModifier}`}
                  onClick={switchLanguage}
                  title="Сменить язык"
                >
                  {language === 'en' ? 'РУ' : 'EN'}
                </button>
                <button
                  className={`${styles.keyLetter} ${styles.keySpace}`}
                  onClick={() => handleKeyPress(' ')}
                >
                  Пробел
                </button>
              </div>

            </div>

            {/* ПРАВАЯ ЧАСТЬ — ЦИФРЫ */}
            <div className={styles.numbersBlock}>

              <div className={styles.row}>
                <button className={styles.key} onClick={() => handleKeyPress('7')}>7</button>
                <button className={styles.key} onClick={() => handleKeyPress('8')}>8</button>
                <button className={styles.key} onClick={() => handleKeyPress('9')}>9</button>
              </div>

              <div className={styles.row}>
                <button className={styles.key} onClick={() => handleKeyPress('4')}>4</button>
                <button className={styles.key} onClick={() => handleKeyPress('5')}>5</button>
                <button className={styles.key} onClick={() => handleKeyPress('6')}>6</button>
              </div>

              <div className={styles.row}>
                <button className={styles.key} onClick={() => handleKeyPress('1')}>1</button>
                <button className={styles.key} onClick={() => handleKeyPress('2')}>2</button>
                <button className={styles.key} onClick={() => handleKeyPress('3')}>3</button>
              </div>

              <div className={styles.row}>
                <button className={styles.key} onClick={() => handleKeyPress('0')}>0</button>
                <button className={styles.key} onClick={() => handleKeyPress('.')}>.</button>
                <button className={styles.key} onClick={handleSubmit}>↵</button>
              </div>

            </div>

          </div>
      </div>
    </div>
  );
};

export default DigitalKeyboard;