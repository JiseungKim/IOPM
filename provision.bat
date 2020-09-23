@ECHO OFF
SET REDIS_DISTRIBUTION=3.0.504
SET REDIS_FNAME=Redis-x64-%REDIS_DISTRIBUTION%.msi
SET JENKINS_DISTRIBUTION=2.249.1
SET JENKINS_FNAME=Jenkins0x64-%JENKINS_DISTRIBUTION%.msi

REM Download redis installer
IF NOT EXIST provision MKDIR provision
PUSHD provision
IF NOT EXIST %REDIS_FNAME% (
curl https://github.com/microsoftarchive/redis/releases/download/win-%REDIS_DISTRIBUTION%/Redis-x64-%REDIS_DISTRIBUTION%.msi -J -L -o %REDIS_FNAME%
CALL %REDIS_FNAME%
)

REM Download jenkins installer
IF NOT EXIST %JENKINS_FNAME% (
curl http://ftp-chi.osuosl.org/pub/jenkins/windows-stable/%JENKINS_DISTRIBUTION%/jenkins.msi -J -L -o %JENKINS_FNAME%
CALL %JENKINS_FNAME%
)
POPD

REM Install wsl
PUSHD deploy
IF NOT EXIST ubuntu CALL init.bat
POPD

PAUSE