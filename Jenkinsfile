pipeline {
  agent {
    dockerfile true
  }
  stages {
    stage('Checkout VTCR') {
      steps {
        dir('depRepo/VTCR') {
          git(url: 'https://github.com/ventureum/VTCR', branch: 'master', poll: true, changelog: true, credentialsId: 'github')
        }
      }
    }
    stage('Migrate Contracts') {
      steps {
        dir('depRepo/VTCR') {
            sh 'truffle migrate --reset'
            sh 'cp -r ./build/contracts ../../contracts'
        }
      }
    }
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
  environment {
    CI = 'true'
  }
}
