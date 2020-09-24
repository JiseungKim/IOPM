import os
import json
import copy
import re
import json
import shutil
from fabric.api import *
from fabric.contrib import files

env.user = 'ubuntu'
env.key_filename = 'IO.pem'
env.port = 22
env.timeout = 60

# path
LOCAL_ROOT = '../..'
REMOTE_ROOT = '/var/io'

LOCAL_AUTH_ROOT = f'{LOCAL_ROOT}/auth'
REMOTE_AUTH_ROOT = f'{REMOTE_ROOT}/auth'

LOCAL_CONTENTS_ROOT = f'{LOCAL_ROOT}/contents'
REMOTE_CONTENTS_ROOT = f'{REMOTE_ROOT}/contents'

DATABASE_CONFIG = {'id': 'io', 'pw': 'admin'}
PROVISION_SIGN_PATH = '/var/io'
PROVISION_SIGN_FNAME = 'provision_completed'
CONFIGURATION = {}
ENVIRONMENT = None

@runs_once
@roles('auth')
def migration_auth():
    sudo(f"mysql -se 'CREATE DATABASE IF NOT EXISTS `io_auth`;'")
    migration(LOCAL_AUTH_ROOT)

@runs_once
@roles('contents')
def migration_contents():
    sudo(f"mysql -se 'CREATE DATABASE IF NOT EXISTS `io_contents`;'")
    migration(LOCAL_CONTENTS_ROOT)

@task
def provide(auth, contents):
    if auth.lower() == 'true':
        execute(provide_auth)

    if contents.lower() == 'true':
        execute(provide_contents)

@task
def deploy(auth, contents):
    if auth.lower() == 'true':
        execute(migration_auth)
        execute(deploy_auth)

    if contents.lower() == 'true':
        execute(migration_contents)
        execute(deploy_contents)

@task
def environment(e):
    global CONFIGURATION
    parse_config(e)


@parallel
@roles('auth')
def provide_auth():
    if not provided():
        provide_common()
        sign_provision()
    

@parallel
@roles('contents')
def provide_contents():
    if not provided():
        provide_common()
        sign_provision()
    

@parallel
@roles('auth')
def deploy_auth():
    global ENVIRONMENT
    # local environment
    if os.path.isdir(f'{LOCAL_AUTH_ROOT}/node_modules'):
        shutil.rmtree(f'{LOCAL_AUTH_ROOT}/node_modules')

    sudo(f'mkdir -p {REMOTE_AUTH_ROOT}')
    with cd(REMOTE_AUTH_ROOT):
        # stop pm2
        sudo(f'pm2 stop -s auth || :')

        # deploy source
        put(f'{LOCAL_AUTH_ROOT}/*', '.', use_sudo=True)
        sudo('npm install')

        # update environment file
        context = current_config(env.host)
        endpoints = {}
        for name in CONFIGURATION['deploy']['contents']:
            if name not in endpoints:
                endpoints[name] = []
            endpoints[name] = endpoints[name] + list(map(lambda x: f"{x['private']}:{current_config(x['private'])['port']}", CONFIGURATION['deploy']['contents'][name]['hosts']))
        context['endpoints'] = json.dumps(endpoints)

        files.upload_template(filename='appsettings.auth.txt',
                              destination=f'config/appsettings.{ENVIRONMENT.lower()}.json',
                              template_dir=f'template',
                              context=context, use_sudo=True, backup=False, use_jinja=True)

        # restart pm2
        sudo(f'pm2 start --env {ENVIRONMENT}')

@parallel
@roles('contents')
def deploy_contents():
    global ENVIRONMENT
    # local environment
    if os.path.isdir(f'{LOCAL_CONTENTS_ROOT}/node_modules'):
        shutil.rmtree(f'{LOCAL_CONTENTS_ROOT}/node_modules')

    sudo(f'mkdir -p {REMOTE_CONTENTS_ROOT}')

    with cd(REMOTE_CONTENTS_ROOT):
        # stop pm2
        sudo(f'pm2 stop -s contents || :')

        # deploy source
        put(f'{LOCAL_CONTENTS_ROOT}/*', '.', use_sudo=True)
        sudo('npm install')


        context = current_config(env.host)
        files.upload_template(filename='appsettings.contents.txt',
                              destination=f'config/appsettings.{ENVIRONMENT.lower()}.json',
                              template_dir=f'template',
                              context=context, use_sudo=True, backup=False, use_jinja=True)

        # restart pm2
        sudo(f'pm2 start --env {ENVIRONMENT}')

def parse_config(fname):
    global CONFIGURATION
    global ENVIRONMENT
    with open(f'{fname}.json') as f:
        CONFIGURATION = json.load(f)
        deploy = CONFIGURATION['deploy']
        for role in deploy:
            env['roledefs'][role] = {'hosts': []}
            for name in deploy[role]:
                env['roledefs'][role]['hosts'] = env['roledefs'][role]['hosts'] + list(map(lambda x: x['public'], deploy[role][name]['hosts']))

    ENVIRONMENT = fname


def current_config(host):
    global  CONFIGURATION
    for role in CONFIGURATION['deploy']:
        for name in CONFIGURATION['deploy'][role]:
            hosts = CONFIGURATION['deploy'][role][name]['hosts']
            if host in map(lambda x: x['public'], hosts) or host in map(lambda x: x['private'], hosts):
                return copy.deepcopy(CONFIGURATION['deploy'][role][name])

    return None



def provided():
    return files.exists(f'{PROVISION_SIGN_PATH}/{PROVISION_SIGN_FNAME}')


def sign_provision():
    sudo(f'mkdir -p {PROVISION_SIGN_PATH}')
    with cd(PROVISION_SIGN_PATH):
        files.append(PROVISION_SIGN_FNAME, '', use_sudo=True)

def migration(local):
    context = current_config(env.host)
    files.upload_template(filename='shmig.conf.txt',
                          destination=f'shmig/shmig.conf',
                          template_dir='template',
                          context=context, use_sudo=True, backup=False, use_jinja=True)
    put(f'{local}/db/migrations/*', f'shmig/migrations', use_sudo=True, mode='0755')
    with cd('shmig'):
        sudo('shmig migrate')


def provide_common():
    sudo('DEBIAN_FRONTEND=noninteractive apt-get update -y ')
    sudo('DEBIAN_FRONTEND=noninteractive apt-get upgrade -y')
    sudo('apt-get autoremove ')
    sudo('apt-get autoclean')

    # redis
    sudo('apt-get install redis -y')
    sudo('systemctl stop redis')
    put(f'environment/redis.conf', f'/etc/redis/redis.conf', use_sudo=True)
    sudo('systemctl start redis')

    # make
    sudo('apt-get install make -y')

    # shmig
    sudo('rm -rf ./shmig')
    sudo('git clone https://github.com/mbucc/shmig.git')

    with cd('shmig'):
        sudo('make install')
        sudo('mkdir -p migrations')

    # maria db
    sudo('apt-get install software-properties-common -y')
    sudo('apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8')
    sudo('add-apt-repository "deb [arch=amd64,arm64,ppc64el] http://mariadb.mirror.liquidtelecom.com/repo/10.4/ubuntu $(lsb_release -cs) main"')
    sudo('DEBIAN_FRONTEND=noninteractive apt-get install mariadb-server mariadb-client -y')
    sudo(f"mysql -se 'DROP USER IF EXISTS \"{DATABASE_CONFIG['id']}\"@\"%\"'")
    sudo(f"mysql -se 'CREATE USER \"{DATABASE_CONFIG['id']}\"@\"%\" IDENTIFIED BY \"{DATABASE_CONFIG['pw']}\"'")
    sudo(f"mysql -se 'GRANT ALL PRIVILEGES ON *.* TO \"{DATABASE_CONFIG['id']}\"@\"%\"'")
    sudo(f"mysql -se 'FLUSH PRIVILEGES'")
    sudo('systemctl stop mysql')
    put(f'environment/my.cnf', '/etc/mysql/my.cnf', use_sudo=True)
    sudo('systemctl start mysql')

    # node js (v14.04)
    sudo('apt-get install npm -y')
    sudo('apt-get install nodejs -y')
    sudo('npm install pm2 -g')