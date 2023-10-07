node {
  stage('Preparation') {
    // Install kubectl in Jenkins agent
    sh 'curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl'
    sh 'chmod +x ./kubectl && mv kubectl /usr/local/sbin'
  }

  stage('Checkout source') {
    git url: 'https://github.com/UgliFan/ugli_nestjs.git'
  }

  stage('Integration') {
    sh 'kubectl apply -f k3s.yaml'
  }
}