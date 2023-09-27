pipeline {
  environment {
    dockerimagename = "uglifan/ugli_nestjs"
    dockerImage = ""
  }

  agent any

  stages {
    stage('Checkout Source') {
      steps {
        git branch: 'master', url: 'https://github.com/UgliFan/ugli_nestjs.git'
      }
    }

    stage('Build image') {
      steps {
        script {
          dockerImage = docker.build dockerimagename
        }
      }
    }

    stage('Pushing Image') {
      environment {
        registryCredential = 'dockerhub-credentials'
      }
      steps {
        script {
          docker.withRegistry('http://localhost:5000', registryCredential) {
            dockerImage.push("latest")
          }
        }
      }
    }

    stage('Deploying ugli_nestjs container to k3s') {
      steps {
        script {
          kubernetesDeploy(configs: "k3s-deployment.yaml", "k3s-service.yaml")
        }
      }
    }
  }
}