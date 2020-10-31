import os
import json
import copy
from fabric.api import *
from fabric.contrib import files

env.user = 'ubuntu'
env.password = 'tmdgus12!@'
env.port = 22
env.timeout = 60

LOCAL_ROOT = '../..'
REMOTE_ROOT = '/var/io'

CONFIGURATION = {}
ENVIRONMENT = None
ENDPOINTS = {}

@task
def deploy():
    execute(clear_docker)
    execute(auth)
    execute(contents)

@task
def environment(e):
    global CONFIGURATION
    global ENVIRONMENT
    global ENDPOINTS

    with open(f'{e}.json') as f:
        CONFIGURATION = json.load(f)
        deploy = CONFIGURATION['deploy']
        for role in deploy:
            env['roledefs'][role] = {'hosts': []}

            for name, config in deploy[role].items():
                for public_ip in [x['public'] for x in config['hosts']]:
                    if public_ip not in env['roledefs'][role]['hosts']:
                        env['roledefs'][role]['hosts'].append(public_ip)

                    if public_ip not in env['hosts']:
                        env['hosts'].append(public_ip)


        for name, config in deploy['contents'].items():
            if name not in ENDPOINTS:
                ENDPOINTS[name] = []
            for endpoint in [f"{x['private']}:{x['port']}" for x in config['hosts']]:
                if endpoint not in ENDPOINTS[name]:
                    ENDPOINTS[name].append(endpoint)

    ENVIRONMENT = e

@parallel
@roles('auth')
def auth():
    global ENVIRONMENT
    global ENDPOINTS

    sudo(f'mkdir -p {REMOTE_ROOT}')
    for name, config in current().items():
        with cd(REMOTE_ROOT):
            sudo(f'mkdir -p {name}')

        host_pairs = [(x['public'], x['port']) for x in config['hosts']]
        with cd(f'{REMOTE_ROOT}/{name}'):
            for ip, port in host_pairs:
                sudo(f'mkdir -p {port}')
                put(f'{LOCAL_ROOT}/auth/*', f'{port}', use_sudo=True)

                sudo(f'mkdir -p {port}/config')
                context = copy.deepcopy(config)
                context.update({'port': port, 'endpoints': json.dumps(ENDPOINTS)})
                files.upload_template(filename='appsettings.auth.txt',
                                      destination=f'{port}/config/appsettings.{ENVIRONMENT.lower()}.json',
                                      template_dir=f'template',
                                      context=context, use_sudo=True, backup=False, use_jinja=True)

                reset_docker('auth', port)


@parallel
@roles('contents')
def contents():
    sudo(f'mkdir -p {REMOTE_ROOT}')
    for name, config in current().items():
        with cd(REMOTE_ROOT):
            sudo(f'mkdir -p {name}')

        host_pairs = [(x['public'], x['port']) for x in config['hosts']]
        with cd(f'{REMOTE_ROOT}/{name}'):
            for ip, port in host_pairs:
                sudo(f'mkdir -p {port}')
                put(f'{LOCAL_ROOT}/contents/*', f'{port}', use_sudo=True)

                sudo(f'mkdir -p {port}/config')
                context = copy.deepcopy(config)
                context.update({'port': port})
                files.upload_template(filename='appsettings.contents.txt',
                                      destination=f'{port}/config/appsettings.{ENVIRONMENT.lower()}.json',
                                      template_dir=f'template',
                                      context=context, use_sudo=True, backup=False, use_jinja=True)

                reset_docker('contents', port)

def current():
    global  CONFIGURATION

    role = env.effective_roles[0]
    host = env.host
    config = CONFIGURATION['deploy'][role]
    
    return {x: config[x] for x in config if host in list(map(lambda x: x['public'], config[x]['hosts']))}

def clear_docker():
    prefix = 'iopm'
    with settings(warn_only=True):
        sudo(f'docker ps --filter name={prefix}* -aq | xargs docker stop | xargs docker rm')
        sudo(f'docker images --filter=reference={prefix}:* -aq | xargs docker rmi')

def reset_docker(role, port):
    global ENVIRONMENT

    image_name = f'iopm:{role}.{port}'
    container_name = f'iopm-{role}-{port}'

    sudo(f'docker build --tag {image_name} ./{port}')
    sudo(f'docker run -it -d --name {container_name} -e ENVIRONMENT={ENVIRONMENT} -p {port}:{port} {image_name}')