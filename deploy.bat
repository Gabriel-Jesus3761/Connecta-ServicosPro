@echo off
echo.
echo ========================================
echo   Deploy Automatico - BarberPro
echo ========================================
echo.

REM Adiciona todas as mudancas
echo [1/3] Adicionando arquivos...
git add .

REM Solicita mensagem de commit
echo.
echo [2/3] Digite a mensagem do commit:
set /p commit_msg="> "

REM Faz o commit
git commit -m "%commit_msg%"

REM Faz o push
echo.
echo [3/3] Enviando para GitHub...
git push origin main

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo   Aguarde 1-2 minutos para o GitHub
echo   Actions fazer o build automatico.
echo ========================================
echo.
pause
