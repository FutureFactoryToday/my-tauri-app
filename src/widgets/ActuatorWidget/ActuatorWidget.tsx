import { useState, useRef, useEffect } from 'react';
import styles from './ActuatorWidget.module.css';
import Iswitch from '../../components/Iswitch/Iswitch';
import ModeSelect from '../../components/ModeSelect/ModeSelect';
import CreateMIRAmode from '../../components/Modals/CreateMIRAmode/CreateMIRAmode';
import {
  loadSettings,
  saveSettings,
  generateId,
  MiraPosition,
} from '../../utils/settings';

interface Props {
  label: string;
  onHomeClick?: () => void;
  onModeChange?: (modeId: string) => void;      // выбор в списке (без отправки)
  onExecute?: (command: string) => void;         // нажатие «ВЫПОЛНИТЬ»
  onPosChange?: (mode: string) => void;
  onStepModeToggle?: (active: boolean) => void;
  onPrecisionModeToggle?: (active: boolean) => void;
  onPulse?: () => void;
  currentMode?: string;                          // id выбранной позиции (снаружи)
  send?: (cmd: string) => void;
  lastMessage?: string | null;
  isConnected?: boolean;
}

export default function ActuatorWidget({
  label,
  onHomeClick,
  onModeChange,
  onExecute,
  onPosChange,
  onStepModeToggle,
  onPrecisionModeToggle,
  currentMode = '',
  send,
  lastMessage,
  isConnected = false,
}: Props) {
  const [isPrecisionModeOn, setIsPrecisionModeOn] = useState(false);
  const [isStepModeOn, setIsStepModeOn] = useState(false);
  const [currentPos, setCurrentPos] = useState(0);
  const [initializationStatus, setInitializationStatus] = useState("Готов");
  const [isHoming, setIsHoming] = useState(false);

  // ↓ Список сохранённых позиций
  const [positions, setPositions] = useState<MiraPosition[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Загрузка settings.json при старте
  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setPositions(s.positions);
      console.log('[ActuatorWidget] Loaded positions:', s.positions);
    })();
  }, []);

  // Парсинг ответов МК
  useEffect(() => {
    if (!lastMessage) return;
    console.log('[ActuatorWidget] Received:', lastMessage);

    if (lastMessage.startsWith('Mpos is')) {
      const raw = lastMessage.replace('Mpos is ', '').trim();
      const microns = parseInt(raw, 10);
      if (!isNaN(microns)) {
        setCurrentPos(microns / 1000);
      }
    }
    if (isHoming && lastMessage.includes('is_home = true')) {
      console.log('[ActuatorWidget] Homing complete');
      setIsHoming(false);
      setInitializationStatus("Готов");
    }
  }, [lastMessage, isHoming]);

  // Опрос позиции
  useEffect(() => {
    if (!isConnected) return;
    sendRef.current?.("amove current");
    const interval = setInterval(() => {
      sendRef.current?.("amove current");
    }, 500);
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
    if (isConnected) {
      sendRef.current?.("amove home");
      setIsHoming(true);
      setInitializationStatus("Инициализация...");
    }
  };

  const isMovingRef = useRef(false);

  const handleModeSelect = (id: string) => {
    if (onModeChange) onModeChange(id);
  };

  const handleExecute = () => {
    const pos = positions.find((p) => p.id === currentMode);
    if (!pos) return;
    onExecute?.(`amove ${pos.position.toFixed(1)}`);
  };
  // --- Работа со списком позиций ---

  const handleCreatePosition = async (name: string, position: number) => {
    const newPos: MiraPosition = { id: generateId(), name, position };
    const updated = [...positions, newPos];
    setPositions(updated);
    await saveSettings({ positions: updated });
    setIsModalOpen(false);
    // Автоматически выбираем созданную позицию
    if (onModeChange) onModeChange(newPos.id);
  };

  const handleDeletePosition = async (id: string) => {
    const updated = positions.filter((p) => p.id !== id);
    setPositions(updated);
    await saveSettings({ positions: updated });

    // Если удалили выбранную — сбросим выбор
    if (id === currentMode && updated.length > 0 && onModeChange) {
      onModeChange(updated[0].id);
    }
    if (updated.length === 0 && onModeChange) {
      onModeChange('');
    }
  };

  const handleStepModeToggle = () => {
    const newState = !isStepModeOn;
    setIsStepModeOn(newState);
    onStepModeToggle?.(newState);
  };

  const handlePrecisionModeToggle = () => {
    const newState = !isPrecisionModeOn;
    setIsPrecisionModeOn(newState);
    onPrecisionModeToggle?.(newState);
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
          <button onClick={handleHomeClick} className={styles.homeBtn}>
            ДОМОЙ
          </button>
          <span className={styles.statusLabel}>Статус инициализации:</span>
          <span className={`${styles.statusValue} ${isReady ? styles.ready : styles.notReady}`}>
            {initializationStatus}
          </span>
          <div className={styles.DroGroup}>
            <span className={styles.DroValue}>{currentPos.toFixed(1)}</span>
            <span className={styles.DroLabel}>mm</span>
          </div>
        </div>
      </div>

      {/* 2. Панель выбора положения */}
      <div className={styles.panel}>
        <ModeSelect
          positions={positions}
          value={currentMode}
          onChange={handleModeSelect}
          onDelete={handleDeletePosition}
          disabled={!isReady}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!isReady}
          className={styles.addBtn}
          title="Создать положение"
        >
          +
        </button>
        <button
          onClick={handleExecute}
          disabled={!isReady || !currentMode}
          className={styles.goBtn}
        >
          ВЫПОЛНИТЬ
        </button>
      </div>

      {/* 3. Панель управления положением */}
      <div className={`${styles.panel} ${!isStepModeOn ? styles.disabled : ''}`}>
        <Iswitch checked={isStepModeOn} onChange={handleStepModeToggle} disabled={!isReady} />
        <span>ШАГОВЫЙ РЕЖИМ</span>

        <div className={styles.panelPos}>
          {moveSteps.map((step) => (
            <button
              key={step.value}
              onClick={() => onPosChange?.(step.value)}
              disabled={!isReady || !isStepModeOn}
              className={styles.goBtn}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Панель плавного управления */}
      <div className={`${styles.panel} ${!isPrecisionModeOn ? styles.disabled : ''}`}>
        <Iswitch checked={isPrecisionModeOn} onChange={handlePrecisionModeToggle} disabled={!isReady} />
        <span>ПЛАВНЫЙ РЕЖИМ</span>

        <div className={styles.panelPos}>
          <button
            onMouseDown={() => {
              if (!isMovingRef.current) {
                isMovingRef.current = true;
                onPosChange?.("-500");
              }
            }}
            onMouseUp={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            onMouseLeave={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            onTouchStart={() => {
              if (!isMovingRef.current) {
                isMovingRef.current = true;
                onPosChange?.("-500");
              }
            }}
            onTouchEnd={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            onTouchCancel={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            className={styles.goBtn}
            disabled={!isReady || !isPrecisionModeOn}
          >
            &lt;&lt;
          </button>

          <button
            onMouseDown={() => {
              if (!isMovingRef.current) {
                isMovingRef.current = true;
                onPosChange?.("+500");
              }
            }}
            onMouseUp={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            onMouseLeave={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            onTouchStart={() => {
              if (!isMovingRef.current) {
                isMovingRef.current = true;
                onPosChange?.("+500");
              }
            }}
            onTouchEnd={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            onTouchCancel={() => {
              if (isMovingRef.current) {
                isMovingRef.current = false;
                onPosChange?.("0");
              }
            }}
            className={styles.goBtn}
            disabled={!isReady || !isPrecisionModeOn}
          >
            &gt;&gt;
          </button>
        </div>
      </div>

      {/* Модальное окно создания положения */}
      <CreateMIRAmode
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePosition}
      />
    </div>
  );
}