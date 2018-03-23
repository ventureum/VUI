pipeline {
    agent { dockerfile true }
    environment {
        CI = 'true'
    }
    stages {
        stage('Install Dependencies') { 
            steps {
                sh './jenkins/scripts/dep.sh'  
            }
        }
        stage('Test') { 
            steps {
                sh './jenkins/scripts/test.sh' 
            }
        }
        stage('Build') {
            steps {
                sh './jenkins/scripts/build.sh'
            }
        }
        stage('Deliver to S3') {
            steps {
                sh './jenkins/scripts/deliver.sh'
            }
        }
    }
}
