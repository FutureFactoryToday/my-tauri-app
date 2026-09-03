import { useState } from 'react';
import styles from './ActuatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';

interface Props {
  label: string;
  onHomeClick?: () => void;
  onModeChange?: (mode: string) => void;
  onPosChange?: (mode: string) => void;
  onPrecisionModeToggle?: (active: boolean) => void;
  onMultiplierChange?: (multiplier: number) => void;
  onPulse?: () => void;
  initializationStatus?: string;
  currentMode?: string;
}

export default function ActuatorWidget({
  label,
  onHomeClick,
  onModeChange,
  onPosChange,
  onPrecisionModeToggle,
  onMultiplierChange,
  onPulse,
  initializationStatus = 'Готов',
  currentMode = 'Режим 1'
}: Props) {
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    if (onModeChange) onModeChange(mode);
  };

  const handlePrecisionModeToggle = () => {
    const newState = !isPrecisionModeOn;
    setIsPrecisionModeOn(newState);
    if (onPrecisionModeToggle) onPrecisionModeToggle(newState);
  };

  const handleMultiplierChange = (newMultiplier: number) => {
    setMultiplier(newMultiplier);
    if (onMultiplierChange) onMultiplierChange(newMultiplier);
  };

  const handlePulse = () => {
    if (onPulse) onPulse();
  };

  const isReady = initializationStatus === 'Готов';

  const moveSteps = [
    { label: "- 0,1 мм", value: "-0.1" },
    { label: "- 1 мм", value: "-1" },
    { label: "- 10 мм", value: "-10" },
    { label: "+ 10 мм", value: "+10" },
    { label: "+ 1 мм", value: "+1" },
    { label: "+ 0,1 мм", value: "+0.1" },
  ];

  return (
    <div className={styles.tile}>
      <div className={styles.header}>{label}</div>

      {/* 1. Панель инициализации */}
      <div className={styles.panel}>
        <div className={styles.statusDisplay}>
          <button
          onClick={handleHomeClick}
          className={styles.homeBtn}
          >
          ДОМОЙ
          </button>
          <span className={styles.statusLabel}>Статус инициализации:</span>
          <span
            className={`${styles.statusValue} ${isReady ? styles.ready : styles.notReady}`}
          >
            {initializationStatus}
          </span>
        </div>
      </div>

      {/* 2. Панель выбора положения */}
      <div className={styles.panel}>
        <select
          value={currentMode}
          onChange={handleModeChange}
          disabled={!isReady}
          className={styles.modeSelect}
        >
          <option value="Режим 1">НУЛЕВОЕ ПОЛОЖЕНИЕ</option>
          <option value="Режим 2">MODE 2</option>
          <option value="Режим 3">MODE 3</option>
        </select>
        <button
          onClick={() => onModeChange?.(currentMode)}
          disabled={!isReady}
          className={styles.goBtn}
        >
          ВЫПОЛНИТЬ
        </button>
      </div>

      {/* 3. Панель управления положением */}
      <div className={styles.panelPos}>
        {moveSteps.map((step) => (
          <button
            key={step.value}
            onClick={() => onPosChange?.(step.value)}
            disabled={!isReady}
            className={styles.goBtn}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* 4. Панель точного управления */}
      <div className={styles.panel}>
        {/* Переключатель режима точного управления */}
        <Iswitch checked={isPrecisionModeOn} onChange={handlePrecisionModeToggle} />  
        <span>ТОЧНЫЙ РЕЖИМ</span>

        {/* Ползунок кратности перемещения */}
        {/* Ползунок кратности перемещения в стиле iOS */}
        <div className={`${styles.multiplierSlider} ${!isPrecisionModeOn ? styles.disabled : ''}`}>
          {/* Плавающий фон (индикатор) */}
          <span className={`
            ${styles.sliderIndicator} 
            ${multiplier === 1 ? styles.pos1 : ''}
            ${multiplier === 10 ? styles.pos2 : ''}
            ${multiplier === 100 ? styles.pos3 : ''}
          `}></span>

          <button
            type="button"
            onClick={() => handleMultiplierChange(1)}
            style={{ color: multiplier === 1 ? '#fff' : 'rgba(255,255,255,0.7)' }}
          >
            x1
          </button>
          <button
            type="button"
            onClick={() => handleMultiplierChange(10)}
            style={{ color: multiplier === 10 ? '#fff' : 'rgba(255,255,255,0.7)' }}
          >
            x10
          </button>
          <button
            type="button"
            onClick={() => handleMultiplierChange(100)}
            style={{ color: multiplier === 100 ? '#fff' : 'rgba(255,255,255,0.7)' }}
          >
            x100
          </button>
        </div>



        {/* Маховик */}
        <div
          className={`${styles.handwheel} ${!isPrecisionModeOn ? styles.disabled : ''}`}
          onMouseDown={handlePulse}
          onTouchStart={handlePulse}
        >
          <div className={styles.handwheelInner}>
            <div className={styles.cursorSpot} />
          </div>
        </div>
      </div>
    </div>
  );
}
