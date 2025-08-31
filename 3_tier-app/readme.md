
# 0. Quick summary

+ Frontend image: `shivamfullstack111/todo-frontend:v3` → serves UI on container port **5173**.  
+ Backend image: `shivamfullstack111/todo-backend:v2` → API on container port **5000**.  
+ Database: official `mongo:latest` → port **27017**, uses PV/PVC hostPath `/data/todo-mongodb-data/`.  
+ Kubernetes namespace: `todo-app`  
+ Secret name: `todo-secret` (contains `MONGO_URL` and `VITE_BACKEND_URL`)  
+ Apply order (high level): Namespace → PV/PVC → Secret → MongoDB → Backend → Frontend → Ingress

---

# 1. Prerequisites

```bash
# On your laptop (example)
docker --version
kubectl version --client
minikube version
helm version   # optional, only if you use Helm
```

+ Start Minikube with enough resources:  
```bash
minikube start
minikube addons enable ingress
```

**Verify**
```bash
minikube ip
kubectl get nodes
```

---

# 2. Project layout (what lives where) =

This README assumes the repository looks like:

+ `/3_tier_app/` → all Kubernetes YAMLs (namespace, pv-pvc, secret, mongo, backend, frontend, ingress)  
+ `/3_tier_app/backend/` → Node/Express source + `Dockerfile` (exposes port 5000)  
+ `/3_tier_app/frontend/` → React (Vite) source + `Dockerfile` (exposes port 5173)  
+ `/3_tier_app/README.md` → this file

**Navigate to /3_tier_app**

```bash
cd /3_tier_app
```

---

# 3. Docker: build & push images 

You already have images on Docker Hub (`shivamfullstack111/...`). If you want to rebuild locally and push:

```bash
# login to Docker Hub
docker login

# build backend image (example)
docker build -t shivamfullstack111/todo-backend:v2 ./backend

# build frontend image (example)
docker build -t shivamfullstack111/todo-frontend:v3 ./frontend

# push images
docker push shivamfullstack111/todo-backend:v2
docker push shivamfullstack111/todo-frontend:v3
```

+ Note about Vite env (`VITE_BACKEND_URL`):  
  - If you use a **static build** (npm run build → serve `dist`), `VITE_*` values are **baked at build time**. That means set `VITE_BACKEND_URL` before `npm run build`.  
  - If you run Vite **dev/preview server** inside container and read `import.meta.env` at runtime, you must ensure container process has env injected before start. (Common in dev K8s setups.)  
  - For production builds it's safer to set the correct `VITE_BACKEND_URL` at build time or use a small runtime config script in `dist`.

---

# 4. Prepare Kubernetes namespace 

Create a dedicated namespace so resources stay grouped:

```bash
# apply namespace yaml:
kubectl apply -f k8s/namespace.yaml
```

**Verify**
```bash
kubectl get ns
kubectl config set-context --current --namespace=todo-app   # optional: switch context
```

---

# 5. Persistent storage (PV & PVC) 

We use a hostPath PV in Minikube (good enough for local dev). The PV points to Minikube VM path `/data/todo-mongodb-data/`.

+ PV (high level): reserving space on host VM so MongoDB files persist.  
+ PVC: claim that PV for the MongoDB pod.

If you have `k8s/pv-pvc.yaml`, apply it:

```bash
kubectl apply -f ./persistentVolume-AND-Claim.yaml
```

**Verify**
```bash
kubectl get pv -n todo-app
kubectl get pvc -n todo-app
```

+ To inspect actual hostPath in Minikube VM:  
```bash
minikube ssh
ls -la /data/todo-mongodb-data/
exit
```

---

# 6. Secrets: why & how 

We store sensitive things (Mongo connection string, frontend backend URL) in a Kubernetes Secret called `todo-secret`. Two common ways:

A) Create secret using base64 in YAML (if you prefer to keep manifest):  
- Encode strings to base64:  
```bash
echo -n 'mongodb://database-service:27017/todos' | base64
echo -n 'http://todo.local/api' | base64
```

- Put the base64 values into `./secret.yaml` and apply:  
```bash
kubectl apply -f ./secrets.yaml
```

**Verify**
```bash
kubectl get secret todo-secret -n todo-app 
# To decode:
kubectl get secret todo-secret -n todo-app -o jsonpath="{.data.MONGO_URL}" | base64 --decode
```

+ Note: keep secrets out of Git unless encrypted. For production use External Secrets / Vault.

---

# 7. Deploy MongoDB (database)

Why first? Backend depends on DB. Steps:

1) Apply Mongo Deployment + Service that uses `todo-pvc` for `/data/db`.  
```bash
kubectl apply -f ./mongodb.yaml
```

2) Verify pod & service:  
```bash
kubectl -n todo-app get pods,svc
kubectl -n todo-app describe pod -l app=database-pod
```

3) Quick internal test (inside cluster) — run a curl pod or use mongo client image:
```bash
kubectl run -it --rm --image=mongo:4.4 tmp-mongo-client -n todo-app -- bash
# inside container:
mongo --host database-service --eval 'db.getMongo().getDBNames()'
# exit container
```

+ If Mongo didn't start: check logs  
```bash
kubectl logs -n todo-app <mongo-pod-name>
```

---

# 8. Notes & common pitfalls 

+ `hostPath` on Minikube is local to the Minikube VM — not your laptop file system. Use `minikube ssh` to inspect host files.  
+ `VITE_` variables affect static builds — set before building the image if you use built `dist`.  
+ If you rely on Cluster DNS names inside K8s, use service name like `database-service` and port `27017` (e.g., `mongodb://database-service:27017/todos`). That DNS resolves only inside cluster.  
+ When creating secrets via base64 in YAML, make sure no trailing newline in base64 content (`echo -n` not `echo`).  
+ If your frontend cannot reach backend from browser, remember browser cannot resolve `*.svc.cluster.local` — use Ingress or NodePort and map `/etc/hosts` to `minikube ip`.


---


# 10. Ingress for Domain Access 

Ingress allows **domain + path based routing** instead of NodePort.  

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nodejs-ingress
spec:
  rules:
    - host: myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 3000
```

**Verify**

```bash
kubectl get ingress
# use ingress ip to access site or add dns for localhost in /etc/hosts
```

Add domain in `/etc/hosts`:  

```
127.0.0.1 myapp.local
```

Now open **http://myapp.local** in browser.  

---

# 11. Observability 

To debug & monitor app:  

- **Logs**  
  ```bash
  kubectl logs -f pod-name
  ```

- **Events**  
  ```bash
  kubectl get events --sort-by=.metadata.creationTimestamp
  ```

- **Describe Pod**  
  ```bash
  kubectl describe pod pod-name
  ```

For advanced monitoring → use **Prometheus + Grafana** later.  

---

# 13. Best Practices 

- Always keep **separate namespaces**: dev, staging, prod.  
- Use **Horizontal Pod Autoscaler (HPA)** for auto scaling.  
- Use **liveness & readiness probes** in deployments.  
- Don’t store secrets in plain YAML → use **Kubernetes Secrets** or **External Secrets**.  
- Use **Resource Requests & Limits** in deployments.  
- Keep **monitoring stack (Prometheus + Grafana)** in cluster.  

---

# 14. Quick Recap 

- **Frontend** → React/Next.js running in Kubernetes (service + deployment).  
- **Backend** → Node.js Express API connected to MongoDB.  
- **Database** → MongoDB running as StatefulSet with PVC.  
- **Access** → via Service + Ingress.  
- **Config** → handled by ConfigMaps + Secrets.  

---
