@echo off
echo.
echo ===============================================================
echo   Deccan Origin - Python FastAPI Backend (Port 8000)
echo ===============================================================
echo.
cd /d "%~dp0"
pip install -r requirements.txt --quiet
echo.
echo Starting FastAPI server...
echo Swagger UI: http://localhost:8000/docs
echo Health:     http://localhost:8000/v1/health
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
