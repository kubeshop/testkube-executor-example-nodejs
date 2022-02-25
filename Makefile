NAME ?= testkube-executor-example-nodejs

docker-build: 
	docker build --platform=linux/amd64 -t kubeshop/$(NAME):latest -f Dockerfile .

docker-push:
	docker push kubeshop/$(NAME):latest
