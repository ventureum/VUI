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
            sh 'cp -r ./build/contracts ../../public/contracts'
        }
      }
    }
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
        sh 'cp ./react-scripts/config/* ./node_modules/react-scripts/config/'
      }
    }
    stage('Build') {
      steps {
        sh 'CI=false npm run build'
      }
    }
    stage('Deliver to S3') {
      steps {
        sh 'aws s3 sync --delete ./build  s3://alpha.ventureum.io'
      }
    }
  }
  environment {
    CI = 'true'
  }
}
