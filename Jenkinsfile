pipeline {
  agent any

  stages {
    stage('Checkout Source') {
      steps {
        git branch: 'master', url: 'https://github.com/UgliFan/ugli_nestjs.git'
      }
    }

    stage('Deploying ugli_nestjs container to k3s') {
      sh 'kubectl apply -f k3s.yaml'
    }
  }
}