@ECHO OFF
SET NOW=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%
SET FNAME=Dump%NOW%.sql

ECHO MYSQL DATABASE DUMP TOOL MADE BY INOUT TEAM
mysqldump.exe --user=io  --password=admin --host=localhost --protocol=tcp --port=3306 --default-character-set=utf8 --no-data --skip-triggers --result-file="%FNAME%" "io"
ECHO.
ECHO.
ECHO.
ECHO 'DUMP COMPLETE : %FNAME%'
pause
