@echo off
echo 🚀 PORNIREA TUTUROR SERVICIILOR PENTRU TWA PROJECT
echo ===================================================
echo.

echo 📝 INSTRUCȚIUNI:
echo 1. Acest script va deschide 3 ferestre de comandă separate
echo 2. Fiecare fereastră va porni un serviciu diferit
echo 3. NU închide ferestrele - toate sunt necesare pentru funcționare
echo 4. Pentru a opri serviciile, închide ferestrele sau apasă Ctrl+C în fiecare
echo.

pause

echo 🧠 Pornesc AI MODEL BRIDGE cu modelul antrenat pe portul 5001...
echo    (Folosește modelul antrenat cu 9 categorii + baza de date cu 113+ flori)
start "AI Model Bridge - TRAINED MODEL" cmd /k "cd /d C:\Users\user\Desktop\TWA\AI_Bouquet_Model && ai_env\Scripts\activate && python ai_model_bridge.py"

timeout /t 5

echo 🖥️ Pornesc ASP.NET Core Backend pe portul 5002...
start "ASP.NET Core Backend" cmd /k "cd /d C:\Users\user\Desktop\TWA\Backend\FlowersAPI\FlowersAPI && dotnet run"

timeout /t 5

echo ⚛️ Pornesc React Frontend pe portul 3000...
start "React Frontend" cmd /k "cd /d C:\Users\user\Desktop\TWA\Frontend\flowers-app && npm start"

echo.
echo ✅ TOATE SERVICIILE AU FOST PORNITE CU MODELUL ANTRENAT!
echo.
echo 📍 URL-uri importante:
echo   • Frontend React: http://localhost:3000
echo   • Backend ASP.NET Core: http://localhost:5002
echo   • AI Model Bridge (TRAINED): http://localhost:5001
echo   • Pagina Bouquet: http://localhost:3000/bouquet
echo.
echo 🧪 Teste rapide:
echo   • AI Health: http://localhost:5001/health
echo   • AI Model Info: http://localhost:5001/api/model-info
echo   • Backend Flori: http://localhost:5002/api/flowers
echo   • Test clasificare: curl -X POST http://localhost:5001/api/classify -H "Content-Type: application/json" -d "{\"message\": \"să se odihnească în pace\"}"
echo.
echo 🎯 CONFIGURAȚIA ACTUALIZATĂ - FOLOSEȘTE MODELUL ANTRENAT:
echo   ✅ AI Model Bridge pe 5001 - MODELUL ANTRENAT cu 9 categorii
echo   ✅ ASP.NET Core pe 5002 - backend cu baza de date și API-uri
echo   ✅ React pe 3000 - interfața utilizator cu selector de culori
echo.
echo 🔥 ÎMBUNĂTĂȚIRI MAJORE:
echo   🎯 "să se odihnească în pace" → SYMPATHY (nu mai e GENERAL!)
echo   🎯 Toate 9 categoriile funcționale: romantic, birthday, sympathy, friendship, gratitude, apology, celebration, mothersday, wellness
echo   🎯 113+ flori din baza de date folosite corect
echo   🎯 Mapări inteligente pentru expresii românești
echo   🎯 Prețuri calculate din baza de date reală
echo.

timeout /t 10
echo 🌐 Deschid browser-ul...
start http://localhost:3000/bouquet

echo.
echo 🎉 TOTUL ESTE GATA CU MODELUL ANTRENAT!
echo Acum poți testa funcționalitatea AI îmbunătățită:
echo.
echo 🧪 TESTE IMPORTANTE:
echo   1. Testează "să se odihnească în pace" - ar trebui să fie SYMPATHY
echo   2. Testează "te iubesc" - ar trebui să fie ROMANTIC  
echo   3. Testează "la mulți ani" - ar trebui să fie BIRTHDAY
echo   4. Verifică că AI-ul folosește toate cele 113+ flori
echo.
echo 💡 Pentru debugging:
echo   - Verifică log-urile în fereastra "AI Model Bridge - TRAINED MODEL"
echo   - Ar trebui să vezi "🤖 Model antrenat: ✅ ÎNCĂRCAT"
echo   - Testează endpoint-urile în browser
echo.
echo ⚠️ IMPORTANT: 
echo   Dacă AI Model Bridge nu se încarcă, verifică că:
echo   • ai_model_bridge.py este în C:\Users\user\Desktop\TWA\AI_Bouquet_Model\
echo   • Environment-ul Python ai_env există și funcționează
echo   • Modelul antrenat există în models/latest/ sau models/simple_database_model_20250616_083641/
echo.
pause