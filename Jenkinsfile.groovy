pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                dir('deploy/fabric') {
                    sh 'fab environment:${ENVIRONMENT} deploy'
                }
            }
        }
    }
}
