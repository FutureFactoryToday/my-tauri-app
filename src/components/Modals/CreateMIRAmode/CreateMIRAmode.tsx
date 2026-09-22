import { useState, useEffect } from 'react';
import styles from './CreateMIRAmode.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, position: number) => void;
  /** Колбэк при фокусе поля — здесь вы открываете DigitalKeyboard */
  onFieldFocus?: (field: 'name' | 'position', currentValue: string) => void;
}

export default function CreateMIRAmode({ isOpen, onClose, onSubmit, onFieldFocus }: Props) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPosition('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Наименование: любые цифры и точки, максимум 15 символов
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Разрешаем цифры, точку и (опционально) — вообще любые символы.
    // По ТЗ: "какие угодно цифры и точки в любом количестве и порядке, но не более 15 символов"
    if (val.length <= 15) {
      setName(val);
    }
  };

  // Положение: число от 0 до 90, 1 знак после запятой
  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(',', '.');       // запятая → точка
    val = val.replace(/[^0-9.]/g, '');                // только цифры и точка

    // Только одна точка
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    // Не больше 1 знака после запятой
    if (parts[1] !== undefined && parts[1].length > 1) {
      val = parts[0] + '.' + parts[1].slice(0, 1);
    }

    setPosition(val);
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

    // Округляем до 1 знака на всякий случай
    const rounded = Math.round(posNum * 10) / 10;
    onSubmit(name.trim(), rounded);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className={styles.titleBar}>
          <span className={styles.title}>Создание рабочего положения МИРЫ</span>
          <button className={styles.closeBtn} onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.row}>
            <label className={styles.label}>Наименование</label>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={handleNameChange}
              onFocus={() => onFieldFocus?.('name', name)}
              maxLength={15}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Положение</label>
            <input
              className={`${styles.input} ${styles.inputPosition}`}
              type="text"
              inputMode="decimal"
              value={position}
              onChange={handlePositionChange}
              onFocus={() => onFieldFocus?.('position', position)}
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
  );
}