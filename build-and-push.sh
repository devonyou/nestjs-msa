#! /bin/bash
docker buildx build --platform linux/amd64,linux/arm64 -t devonyou/fc-nestjs-gateway:$1 -f ./apps/gateway/Dockerfile --target production --push .
docker buildx build --platform linux/amd64,linux/arm64 -t devonyou/fc-nestjs-order:$1 -f ./apps/order/Dockerfile --target production --push .
docker buildx build --platform linux/amd64,linux/arm64 -t devonyou/fc-nestjs-payment:$1 -f ./apps/payment/Dockerfile --target production --push .
docker buildx build --platform linux/amd64,linux/arm64 -t devonyou/fc-nestjs-notification:$1 -f ./apps/notification/Dockerfile --target production --push .
docker buildx build --platform linux/amd64,linux/arm64 -t devonyou/fc-nestjs-product:$1 -f ./apps/product/Dockerfile --target production --push .
docker buildx build --platform linux/amd64,linux/arm64 -t devonyou/fc-nestjs-user:$1 -f ./apps/user/Dockerfile --target production --push .