pipeline {
  agent any

  stages {
    stage('Test') {
      steps {
        sh 'cd ~/repos/ugli_nestjs'
        sh 'ls'
      }
    }

    stage('Checkout Source') {
      steps {
        git branch: 'master', url: 'https://github.com/UgliFan/ugli_nestjs.git'
      }
    }

    stage('Deploying to k3s') {
      steps {
        kubernetesDeploy(
          kubeconfigId: "kubeconfig",
          configs: "k3s.yaml",
          enableConfigSubstitution: true
        )
      }
    }
  }
}