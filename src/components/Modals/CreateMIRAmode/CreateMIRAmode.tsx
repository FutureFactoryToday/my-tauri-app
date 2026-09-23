import { useState, useEffect, useRef } from 'react';
import styles from './CreateMIRAmode.module.css';
import DigitalKeyboard from '../../DigitalKeyboard/DigitalKeyboard'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, position: number) => void;
}

export default function CreateMIRAmode({ isOpen, onClose, onSubmit }: Props) {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [activeField, setActiveField] = useState<'name' | 'position' | null>(null);

    const nameRef = useRef<HTMLInputElement>(null);
    const positionRef = useRef<HTMLInputElement>(null);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPosition('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // «Наименование»: только цифры и точки, до 15 символов
const validateName = (candidate: string): boolean => {
    return /^[A-Za-zА-Яа-я0-9.\s]*$/.test(candidate);
};

    // «Положение»: 0..90, один знак после запятой
const validatePosition = (candidate: string): boolean => {
    if (candidate === '') return true;
    if (!/^[0-9]*\.?[0-9]?$/.test(candidate)) return false;

    const num = parseFloat(candidate);
    if (isNaN(num)) return false;
    if (num < 0 || num > 90) return false;

    // запрет лишних ведущих нулей: "00", "05" — но "0", "0.", "0.5" разрешены
    if (candidate.length > 1 && candidate[0] === '0' && candidate[1] !== '.') {
        return false;
    }
    return true;
};

const handleSubmit = () => {
    setError(null);

    if (!name.trim()) {
        setError('Введите наименование');
        return;
    }

    const posNum = parseFloat(position);
    if (isNaN(posNum)) {
        setError('Введите корректное положение');
        return;
    }
    if (posNum < 0 || posNum > 90) {
        setError('Положение должно быть от 0 до 90 мм');
        return;
    }

    const rounded = Math.round(posNum * 10) / 10;
    onSubmit(name.trim(), rounded);
};

return (
  <>                                                              {/* ← Fragment */}
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleBar}>
          <span className={styles.title}>Создание рабочего положения МИРЫ</span>
          <button className={styles.closeBtn} onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <label className={styles.label}>Наименование</label>
            <input
              ref={nameRef}
              className={styles.input}
              type="text"
              value={name}
              readOnly
              onFocus={() => setActiveField('name')}
              maxLength={15}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Положение</label>
            <input
              ref={positionRef}
              className={`${styles.input} ${styles.inputPosition}`}
              type="text"
              value={position}
              readOnly
              onFocus={() => setActiveField('position')}
            />
            <span className={styles.unit}>мм</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.footer}>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    </div>

    <DigitalKeyboard
      open={activeField !== null}
      targetRef={
        activeField === 'name' ? nameRef :
        activeField === 'position' ? positionRef :
        undefined
      }
      initialValue={
        activeField === 'name' ? name :
        activeField === 'position' ? position :
        ''
      }
      maxLength={activeField === 'name' ? 15 : undefined}
      validate={
        activeField === 'name' ? validateName :
        activeField === 'position' ? validatePosition :
        undefined
      }
      onChange={(value) => {
        if (activeField === 'name') setName(value);
        if (activeField === 'position') setPosition(value);
      }}
      onClose={() => setActiveField(null)}
    />
  </>
);
}