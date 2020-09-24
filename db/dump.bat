PUSHD ..\auth\db\dump
CALL dump.bat
POPD

PUSHD ..\contents\db\dump
CALL dump.bat
POPD