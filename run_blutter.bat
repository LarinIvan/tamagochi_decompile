@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
set PATH=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin;C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja;C:\AI\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable\python_embeded;%PATH%
set PYTHONPATH=F:\PROJECTS\Tamagochi_Decompile_v1\blutter;%PYTHONPATH%
python blutter\blutter.py apps\finch\extracted_arm64\lib\arm64-v8a out_blutter
