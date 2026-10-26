# Проект декомпиляции Tamagotchi (Tamagotchi Decompile)

Проект для исследования, анализа архитектуры и реверс-инжиниринга прошивок Tamagotchi с интеграцией AI-ассистентов через Model Context Protocol (MCP).

---

## Установленные компоненты

Все компоненты установлены в актуальных (последних) версиях:

### 1. REA — Reverse Engineer Anything (v6.8.0)
* **Репозиторий**: [morluto/rea](https://github.com/morluto/rea) (в папке `rea/`).
* **CLI и рантайм**: установлен глобальный пакет `rea-agents@6.8.0` под управлением **Node.js v26.12.1**.
* **MCP Server**: зарегистрирован stdio-сервер `rea` для анализа бинарников, веб-бандлов, сценариев и рантайма.
* **Запуск CLI**: через скрипт `run-rea.bat` или команду `rea`.

### 2. Ghidra MCP Server (v7.0.0)
* **Репозиторий**: [bethington/ghidra-mcp](https://github.com/bethington/ghidra-mcp) (в папке `ghidra-mcp/`).
* **Python MCP Bridge**: настроено виртуальное окружение `.venv` с пакетом `ghidra-mcp-bridge` 7.0.0 (более 200 MCP-инструментов).
* **Расширение Ghidra (Extension)**: плагин `GhidraMCP-7.0.0.zip` установлен в `Extensions/Ghidra/` и активирован в профиле пользователя `%APPDATA%\ghidra\`.
* **Запуск Bridge**: через скрипт `run-ghidra-mcp.bat`.

### 3. Ghidra SRE Framework
* **Ghidra 12.2 (Latest)**: установлена в папку `ghidra/`, настроена для работы с **JDK 25** (`run-ghidra-12.2.bat`).
* **Ghidra 12.1.4**: установлена в папку `ghidra_12.1.4/`, настроена для работы с **JDK 21 LTS** (`run-ghidra.bat`) для полной совместимости с плагином GhidraMCP.

### 4. Java Development Kits
* **Eclipse Adoptium Temurin OpenJDK 21 LTS** (`C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot`)
* **Oracle OpenJDK 25** (`C:\Users\larin\jdk-25`)

---

## Настроенные скиллы (Agent Skills)

В папке `.agents/skills/` настроены скиллы для AI-ассистента:

1. **`ghidra-reverse-engineering`**:
   * Взаимодействие с Ghidra через MCP Server (порт 8089).
   * Поддержка ленивой загрузки инструментов (`load_tool_group`, `search_tools`).
   * Полноценные пайплайны декомпиляции, типизации, именования по конвенциям (PascalCase для функций, camelCase для переменных, snake_case для меток переходов).
   * Пакетная документация и генерация Plate-комментариев.
   * Полная справочная база в папке `references/`.

2. **`reverse-engineer-anything`**:
   * Скилл глубокого реверс-инжиниринга от REA (нативные бинарники, managed-код, Electron/JS, прошивки, снятие дампов).

3. **Специализированные скиллы REA**:
   * `rea-analysis-optimization`
   * `rea-tool-design`
   * `rea-ci-tests-audit`
   * `rea-changelog-update`

---

## Конфигурация MCP

Файлы конфигурации MCP:
* `mcp_config.json` и `.mcp.json` (в корне проекта)
* `~/.gemini/config/mcp_config.json` (глобальная конфигурация)

Пример конфигурации:
```json
{
  "mcpServers": {
    "ghidra-mcp": {
      "command": "F:\\PROJECTS\\Tamagochi_Decompile_v1\\ghidra-mcp\\.venv\\Scripts\\bridge-mcp-ghidra.exe",
      "args": ["--transport", "stdio"],
      "env": {
        "GHIDRA_MCP_URL": "http://127.0.0.1:8089",
        "PYTHONIOENCODING": "utf-8"
      }
    },
    "rea": {
      "command": "C:\\Users\\larin\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\larin\\AppData\\Roaming\\npm\\node_modules\\rea-agents\\scripts\\rea.mjs",
        "--mcp"
      ],
      "env": {
        "PATH": "C:\\Users\\larin\\nodejs;C:\\Users\\larin\\AppData\\Roaming\\npm;C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.12.101-hotspot\\bin;C:\\Windows\\system32;C:\\Windows"
      }
    }
  }
}
```

---

## Скрипты быстрого запуска

* **`run-ghidra.bat`** — запуск Ghidra 12.1.4 с настроенным плагином GhidraMCP.
* **`run-ghidra-12.2.bat`** — запуск новейшей Ghidra 12.2 с JDK 25.
* **`run-ghidra-mcp.bat`** — запуск Python MCP моста к запущенной Ghidra.
* **`run-rea.bat`** — запуск REA CLI.
