#! /bin/bash
helm uninstall delivery-prod
helm install delivery-prod delivery
kubectl get all