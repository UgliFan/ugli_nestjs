pipeline {
  agent any

  stages {
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