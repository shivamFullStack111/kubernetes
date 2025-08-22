# Kubernetes Ingress - Complete Setup Guide

# 1. Introduction

Kubernetes Ingress is a resource that routes HTTP/HTTPS traffic to services inside the cluster.
It allows accessing multiple services using a single IP or domain.

## Features

- Path-based routing (/, /api, /nginx)
- Host-based routing (app1.example.com, app2.example.com)
- TLS/HTTPS termination
- URL rewrite

## Ingress Controller

- Handles actual traffic. Examples: NGINX, Traefik, HAProxy, AWS ALB.

# 2. Minikube Setup for Ingress

## Step 2.1: Start Minikube

```bash
minikube start

- Starts a local Kubernetes cluster using Minikube.
```
## Step 2.2: Enable Ingress Addon
```


```bash
minikube addons enable ingress

- Enables the NGINX ingress controller in your Minikube cluster.
```
## Step 2.3: Verify Ingress Controller
```


```bash
kubectl get pods -n ingress-nginx

Expected output:

```

```text
NAME READY STATUS RESTARTS AGE
ingress-nginx-controller-xxxxxx 1/1 Running 0 1m
ingress-nginx-controller-admission-xxxx 1/1 Running 0 1m

> Note: The ingress-nginx namespace contains all ingress controller pods.
> Note: If pods are not running, check Minikube status or restart the cluster:
```

```bash
minikube status
minikube stop
minikube start
```
# 3. Namespace

## 3.1 Default Namespace

- By default, all resources are deployed in the default namespace.
- View all resources in default namespace:

<<<<<<< HEAD

=======
```
>>>>>>> 1979d9d (statefulSets: create 5 replicas of mysql using statefulSets each pod of mysql assigned a unique name start from 0 to n-1 of replicas)
```bash
kubectl get all
```
## 3.2 Create a Custom Namespace
```
```bash
kubectl create namespace my-ingress
```
```bash
kubectl apply -f deployment.yaml -n my-ingress
```
> Note: Using a separate namespace helps isolate ingress and apps.
> Note: Always check that resources are created in the intended namespace:

```bash
kubectl get pods -n my-ingress
kubectl get svc -n my-ingress
```
# 4. Deployment & Service Examples

## 4.1 NGINX App

```yaml
apiVersion: apps/v1 
kind: Deployment 
metadata: 
  name: nginx-deployment 
spec: 
  selector:
    matchLabels:
      app: nginx-pod 
  template:
    metadata:
      labels:
        app: nginx-pod 
    spec:
      containers:
        - name: nginx 
          image: nginx:latest 
          ports:
            - containerPort: 80 


--- 


apiVersion: v1 
kind: Service 
metadata: 
  name: nginx-service 
spec:
<<<<<<< HEAD
  selector:
    app: nginx-pod      # must match with pod labels 
  ports:
    - port: 80 
      targetPort: 80 
      protocol: TCP
  type: ClusterIP             # this type only work within the cluster 
=======
selector:
app: nginx-pod
ports:

port: 80
targetPort: 80
type: ClusterIP
>>>>>>> 1979d9d (statefulSets: create 5 replicas of mysql using statefulSets each pod of mysql assigned a unique name start from 0 to n-1 of replicas)
```
## 4.2 Website2 App (React Example)

```yaml
apiVersion: apps/v1 
kind: Deployment 
metadata: 
  name: website2-deployment 
spec: 
  selector:
    matchLabels:
      app: website2-pod 
  template:
    metadata:
      labels:
        app: website2-pod 
    spec:
      containers:
        - name: website2 
          image: shivamfullstack111/react-app-test:v6 
          ports:
            - containerPort: 5173

--- 

apiVersion: v1 
kind: Service 
metadata: 
  name: website2-service 
spec:
<<<<<<< HEAD
  selector:
    app: website2-pod      # must match with pod labels 
  ports:
    - port: 5173 
      targetPort: 5173 
      protocol: TCP
  type: ClusterIP             # this type only work within the cluster 
=======
selector:
app: website2-pod
ports:

port: 5173
targetPort: 5173
type: ClusterIP
>>>>>>> 1979d9d (statefulSets: create 5 replicas of mysql using statefulSets each pod of mysql assigned a unique name start from 0 to n-1 of replicas)
```
# 5. Ingress Resource

```yaml
apiVersion: networking.k8s.io/v1                                            # API version. "networking.k8s.io/v1" is the current stable version for Ingress resources.
kind: Ingress                                                               # Resource type. Ingress is used to route external HTTP/S traffic to internal services.
metadata:
  name: example-ingress                                                     # Name of this Ingress resource. Must be unique in the namespace.
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /    # Special instruction for NGINX ingress controller.   # It rewrites the URL path before sending it to backend services.  # Example: if user visits "/nginx", the backend will receive "/".
    
spec:
<<<<<<< HEAD
  ingressClassName: nginx                                                    # Specifies which ingress controller should handle this Ingress. # Here "nginx" means NGINX Ingress Controller.
 
  rules:                                                                     # Defines how incoming HTTP requests should be routed.
    - http:                                                                  # HTTP rules (can have multiple hosts if needed)
        paths:                                                               # List of path-based rules.
          - path: /                                                          # Path to match incoming requests. "/" means the root path.
            pathType: Prefix                                                 # "Prefix" means all URLs starting with "/" will match.
            backend:                                                         # Where to send the traffic if this path matches.
              service:
                name: website2-service                                           # The Kubernetes Service name to forward traffic to.
                port:
                  number: 5173                                                   # The port of the service that should receive traffic.   # Must match the port exposed by the Service.

    - http:
        paths:
          - path: /nginx                                                      # Path to match "/nginx" for NGINX application.
            pathType: Prefix                                                  # Match all requests that start with "/nginx".
            backend:
              service:
                name: nginx-service                                           # Kubernetes Service name for NGINX app.
                port:
                  number: 80                                                  # Port on which NGINX Service is exposed inside the cluster.

=======
ingressClassName: nginx
rules:
- http:
paths:
- path: /
pathType: Prefix
backend:
service:
name: website2-service
port:
number: 5173
- path: /nginx
pathType: Prefix
backend:
service:
name: nginx-service
port:
number: 80
>>>>>>> 1979d9d (statefulSets: create 5 replicas of mysql using statefulSets each pod of mysql assigned a unique name start from 0 to n-1 of replicas)
```
> Note: / routes to website2-service
> Note: /nginx routes to nginx-service
> Note: rewrite-target: / ensures requests to /nginx are forwarded correctly

# 6. Apply Resources

```bash
kubectl apply -f nginx-deployment.yaml
kubectl apply -f website2-deployment.yaml
kubectl apply -f example-ingress.yaml
```
# 7. Accessing Ingress

## Using Minikube IP

- http://<minikube-ip>/ -> website2 app
- http://<minikube-ip>/nginx -> nginx app

# 8. Debugging & Logs

```bash
kubectl get ingress
kubectl describe ingress example-ingress
kubectl get svc
kubectl get endpoints
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```
# 9. Common Issues

- 404 Not Found on /nginx -> Add annotation rewrite-target: /
- Service not found -> Check service selector matches pod labels
- Ingress IP empty -> Use minikube tunnel

# 10. Commands Summary

```bash
minikube start
minikube addons enable ingress
kubectl get pods -n ingress-nginx
kubectl apply -f <file>.yaml
kubectl get ingress
kubectl describe ingress <name>
kubectl get svc
kubectl get endpoints
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
minikube tunnel
```
# 11. Notes

- ClusterIP service type is sufficient for Ingress
- Rewrite rule is mandatory for path-based forwarding if pod serves only /
- Always check pod labels vs service selector match
