@ECHO OFF
SET REDIS_DISTRIBUTION=3.0.504
SET REDIS_FNAME=Redis-x64-%REDIS_DISTRIBUTION%.msi

PUSHD provision
IF NOT EXIST %REDIS_FNAME% (
curl https://github.com/microsoftarchive/redis/releases/download/win-%REDIS_DISTRIBUTION%/Redis-x64-%REDIS_DISTRIBUTION%.msi -J -L -o %REDIS_FNAME%
CALL %REDIS_FNAME%
)
POPD

PUSHD deploy
CALL init.bat
POPD

PAUSE