docker rmi localhost:5000/ugli_nestjs:latest
docker build -t localhost:5000/ugli_nestjs:latest .
sudo rm -rf ~/docker-registry/data/docker/registry/v2/repositories/ugli_nestjs
docker login localhost:5000 -u uglifan -p 123456
docker push localhost:5000/ugli_nestjs:latest
kubectl patch deployment ugli-nestjs-deployment -p "{\"spec\": {\"template\": {\"metadata\": { \"labels\": {  \"redeploy\": \"$(date +%s)\"}}}}}" -n ugli-nestjs-ns