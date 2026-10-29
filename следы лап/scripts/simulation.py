"""
Модуль симуляции ключевых игровых механик проекта «След Лапы»:
1. Расчет кинематики выгула и валидация скорости (античит).
2. Затухание Очков Запаха (Daily Decay).
3. Экономика начисления «Сахарных косточек».
"""

import sys
import math
from typing import List, Tuple, Dict

# Обеспечение корректного вывода UTF-8 на Windows консоли
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')


class DogWalkSimulator:
    def __init__(self):
        # Пороговые значения скорости (м/с)
        self.MIN_SPEED_MS = 1.5 / 3.6  # 0.42 м/с (~1.5 км/ч)
        self.MAX_SPEED_MS = 12.0 / 3.6  # 3.33 м/с (~12 км/ч)
        self.CUTOFF_SPEED_MS = 18.0 / 3.6  # 5.0 м/с (~18 км/ч)

        # Константы H3 Res 10
        self.HEX_DIAMETER_METERS = 114.1
        self.MIN_HEX_VISIT_METERS = 40.0

        # Экономика
        self.BONES_PER_KM = 10
        self.BONES_PER_HEX = 5
        self.BONES_PER_ENCLOSED_HEX = 25

    def validate_segment_speed(self, dist_meters: float, time_seconds: float) -> Tuple[bool, str]:
        """Проверка сегмента перемещения на античит по скорости."""
        if time_seconds <= 0:
            return False, "Некорректное время"

        speed_ms = dist_meters / time_seconds
        speed_kmh = speed_ms * 3.6

        if speed_ms > self.CUTOFF_SPEED_MS:
            return False, f"Транспортное средство ({speed_kmh:.1f} км/ч > 18 км/ч). Отсечка!"
        elif speed_ms < self.MIN_SPEED_MS:
            return True, f"Остановка / обнюхивание ({speed_kmh:.1f} км/ч). Зачет времени."
        elif speed_ms <= self.MAX_SPEED_MS:
            return True, f"Обычный шаг выгула ({speed_kmh:.1f} км/ч). Валидно."
        else:
            return True, f"Быстрый бег собаки ({speed_kmh:.1f} км/ч). Валидно."

    def simulate_decay(self, initial_sp: int = 100, days: int = 7) -> List[Dict[str, any]]:
        """Симуляция суточного выветривания запаха (-33.3% в сутки)."""
        history = []
        sp = initial_sp
        for day in range(days + 1):
            status = "Владение (Активен)" if sp >= 50 else ("Ослаблен" if sp > 0 else "Нейтральный")
            history.append({
                "day": day,
                "sp": sp,
                "status": status
            })
            # Пересчет на следующий день
            sp = max(0, int(sp * 0.667))
        return history

    def calculate_walk_rewards(self, distance_km: float, hexes_visited: int, enclosed_loops_hexes: int = 0) -> Dict[str, int]:
        """Расчет наград за завершенный выгул."""
        bones_distance = int(distance_km * self.BONES_PER_KM)
        bones_hexes = hexes_visited * self.BONES_PER_HEX
        bones_loops = enclosed_loops_hexes * self.BONES_PER_ENCLOSED_HEX

        total_bones = bones_distance + bones_hexes + bones_loops
        return {
            "bones_distance": bones_distance,
            "bones_hexes": bones_hexes,
            "bones_loops": bones_loops,
            "total_bones": total_bones
        }


if __name__ == "__main__":
    sim = DogWalkSimulator()

    print("=== 1. ТЕСТ АНТИЧИТА СКОРОСТИ ===")
    test_cases = [
        (50, 40, "Пешая прогулка"),
        (100, 30, "Легкая пробежка"),
        (300, 15, "Поездка на самокате/авто"),
    ]
    for dist, sec, desc in test_cases:
        valid, msg = sim.validate_segment_speed(dist, sec)
        print(f"[{desc}] Дистанция: {dist}м, Время: {sec}с -> Валидно: {valid} ({msg})")

    print("\n=== 2. СИМУЛЯЦИЯ ЗАТУХАНИЯ ЗАПАХА (DECAY) ===")
    decay_log = sim.simulate_decay(initial_sp=100, days=6)
    for entry in decay_log:
        bar = "█" * (entry["sp"] // 10)
        print(f"День {entry['day']}: {entry['sp']:3d} SP | {entry['status']:20s} | {bar}")

    print("\n=== 3. ЭКОНОМИКА ВЫГУЛА (2.5 КМ, 12 СОТ, 3 ЗАМКНУТЫЕ СОТЫ) ===")
    rewards = sim.calculate_walk_rewards(distance_km=2.5, hexes_visited=12, enclosed_loops_hexes=3)
    for k, v in rewards.items():
        print(f"  {k}: +{v} косточек")
