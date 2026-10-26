@echo off
set GHIDRA_MCP_URL=http://127.0.0.1:8089
set PYTHONIOENCODING=utf-8
"%~dp0ghidra-mcp\.venv\Scripts\bridge-mcp-ghidra.exe" %*
