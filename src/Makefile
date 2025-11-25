.phony: default build-ui docker-build docker-run docker-push

default:
	@echo "nada"

build-ui:
	cd frontend && bun run build
	rm -rf static
	mkdir static
	cp -r frontend/dist/* static/

NAME=am8850/portainerdash
VERSION=0.0.1
docker-build: build-ui
	docker build -t $(NAME):$(VERSION) .

docker-run:
	docker run --rm -p 8000:8000 --name portainerdash --env-file=./.env $(NAME):$(VERSION)

docker-push: docker-build
	docker push $(NAME):$(VERSION)

NAME=am8850/goportdash
docker-build-go: build-ui
	 docker build . -t $(NAME):$(VERSION) -f ./Dockerfile.go

docker-push-go: docker-build-go
	docker push $(NAME):$(VERSION)
