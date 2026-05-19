import { useState } from "react";
import "./App.css";

function App() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="app-viewport">
      {/* iOS Переключатель в углу */}
      <div className="ios-corner-toggle">
        <label className="ios-switch">
          <input 
            type="checkbox" 
            checked={isOn} 
            onChange={() => setIsOn(!isOn)} 
          />
          <span className="ios-slider"></span>
        </label>
      </div>

      {/* Контейнер с плитками */}
      <div className="container">
        
        {/* Первая плитка */}
        <div className="metro-card">
          <div className="card-inner">
            <div className="front">
              <div className="icon">✦</div>
              <div className="label">дизайн</div>
            </div>
            <div className="back">
              <p>Tauri + React позволяют создавать интерфейсы быстрее и легче Electron.</p>
            </div>
          </div>
        </div>

        {/* Вторая плитка */}
        <div className="metro-card" style={{ animationDelay: '0.2s' }}>
          <div className="card-inner">
            <div className="front" style={{ backgroundColor: '#107c10' }}>
              <div className="icon">⚙</div>
              <div className="label">настройки</div>
            </div>
            <div className="back" style={{ backgroundColor: '#0b5a0b' }}>
              <p>Вы можете менять бэкенд на Rust, сохраняя красоту фронтенда.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
