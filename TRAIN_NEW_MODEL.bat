@echo off
echo 🤖 ANTRENARE MODEL NOU PENTRU TWA PROJECT
echo ==========================================
echo.

echo 📋 ACEST SCRIPT VA:
echo   1. Antrena un model nou cu expresii românești
echo   2. Testa că modelul funcționează
echo   3. Îl va salva în models/latest
echo   4. Va permite restart automat al serviciilor
echo.

echo ⚠️ IMPORTANT: 
echo   - Închide AI Model Bridge dacă rulează (Ctrl+C în fereastra respectivă)
echo   - Acest script va lua ~2-3 minute
echo.

set /p continue="Continui cu antrenarea? (Y/N): "
if /i not "%continue%"=="Y" (
    echo ❌ Anulat de utilizator
    pause
    exit /b
)

echo.
echo 🔄 Activez environment-ul Python...
cd /d "C:\Users\user\Desktop\TWA\AI_Bouquet_Model"

if not exist "ai_env\Scripts\activate.bat" (
    echo ❌ Environment-ul Python nu există!
    echo 💡 Rulează mai întâi: python -m venv ai_env
    echo                      ai_env\Scripts\activate
    echo                      pip install scikit-learn pandas flask flask-cors
    pause
    exit /b
)

echo.
echo 🧠 Pornesc antrenarea modelului...
call ai_env\Scripts\activate && python train_new_model.py

echo.
echo 📊 Verificare rezultat...
if exist "models\latest\rf_classifier.pkl" (
    echo ✅ MODELUL A FOST CREAT CU SUCCES!
    echo.
    echo 🔄 Vrei să restartez serviciile automat? (Y/N)
    set /p restart_services="Restart automat: "
    
    if /i "!restart_services!"=="Y" (
        echo.
        echo 🚀 Restartez toate serviciile cu modelul nou...
        timeout /t 2
        start "TWA Services - With NEW MODEL" cmd /k "cd /d C:\Users\user\Desktop\TWA && START_ALL_SERVICES.bat"
        echo ✅ Serviciile au fost repornite!
        echo 📍 Testează: http://localhost:3000/bouquet
    ) else (
        echo.
        echo 💡 Pentru a folosi modelul nou:
        echo    1. Rulează START_ALL_SERVICES.bat
        echo    2. Testează: curl -X POST http://localhost:5001/api/classify -H "Content-Type: application/json" -d "{\"message\": \"să se odihnească în pace\"}"
    )
    
) else (
    echo ❌ MODELUL NU A FOST CREAT!
    echo 🔍 Verifică erorile de mai sus
    echo.
    echo 💡 Posibile probleme:
    echo    - Lipsesc bibliotecile Python (scikit-learn, pandas)
    echo    - Environment-ul Python nu funcționează
    echo    - Probleme cu permisiunile de scriere
)

echo.
echo 🏁 TERMINAT!
pause