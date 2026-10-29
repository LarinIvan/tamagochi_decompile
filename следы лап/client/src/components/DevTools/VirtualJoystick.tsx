import React, { useState, useEffect, useRef } from 'react';
import { geoService } from '../../services/geoService';

interface VirtualJoystickProps {
  isVisible: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ isVisible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const RADIUS = 40; // максимальный радиус отклонения джойстика

  // 1. Обработка клавиатуры WASD и стрелок на ПК
  useEffect(() => {
    if (!isVisible) return;

    const keysPressed: Record<string, boolean> = {};

    const updateFromKeys = () => {
      let x = 0;
      let y = 0;

      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) y += 1;
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) y -= 1;
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) x -= 1;
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) x += 1;

      // Нормализация вектора по диагонали
      if (x !== 0 && y !== 0) {
        x *= 0.7071;
        y *= 0.7071;
      }

      setKnobPos({ x: x * RADIUS, y: -y * RADIUS });
      geoService.setJoystickVector(x, y);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keysPressed[e.code] = true;
        updateFromKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keysPressed[e.code] = false;
        updateFromKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      geoService.setJoystickVector(0, 0);
    };
  }, [isVisible]);

  // 2. Обработка сенсорного / мышиного перетаскивания
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(RADIUS, distance);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    // Нормализованный вектор для движения (y инвертирован для географии: вверх = север)
    const normX = knobX / RADIUS;
    const normY = -knobY / RADIUS;
    geoService.setJoystickVector(normX, normY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    geoService.setJoystickVector(0, 0);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 sm:left-8 z-40 flex flex-col items-center gap-1 select-none pointer-events-auto">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-28 h-28 rounded-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 shadow-2xl flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
      >
        {/* Направляющие стрелки */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-[10px] text-slate-400 font-bold pointer-events-none">
          <span className="absolute top-1.5">С</span>
          <span className="absolute bottom-1.5">Ю</span>
          <span className="absolute left-2">З</span>
          <span className="absolute right-2">В</span>
        </div>

        {/* Подвижная ручка джойстика */}
        <div
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 shadow-xl border-2 border-white/60 flex items-center justify-center text-lg text-slate-950 pointer-events-none"
        >
          🐾
        </div>
      </div>
      <div className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-900/90 rounded-md border border-slate-800 shadow">
        WASD или тач
      </div>
    </div>
  );
};
