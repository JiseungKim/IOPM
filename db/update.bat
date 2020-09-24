PUSHD ..\auth\db\dump
CALL update.bat
POPD

PUSHD ..\contents\db\dump
CALL update.bat
POPD

PAUSE