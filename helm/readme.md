
# 1. Install Helm 

```bash
# On Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Verify**  
```bash
helm version
```

---

# 2. Create a Chart 

```bash
helm create nginx-app
```

This will create a structure:  

- `Chart.yaml` → Metadata of chart (name, version, appVersion).  
- `values.yaml` → Default config values (replicas, image, resources, etc.).  
- `templates/` → All Kubernetes YAML templates.  
- `charts/` → Sub-charts (if dependency).  

---

# 3. Install a Release 

A **release** is an instance of a chart running in a namespace.  

```bash
helm install dev-nginx ./nginx-app -n dev
```

- `dev-nginx` → Release name  
- `./nginx-app` → Path of chart  
- `-n dev` → Namespace  

**Verify**  
```bash
helm list -n dev
```

---

# 4. Upgrade Release 

```bash
helm upgrade dev-nginx ./nginx-app -n dev
```

If you change `values.yaml` (e.g., replicas = 3), upgrade applies the new config.  

---

# 5. Rollback Release 

```bash
helm history dev-nginx -n dev
helm rollback dev-nginx 1 -n dev
```

- `1` = Revision number from history.  

---

# 6. Uninstall Release 

```bash
helm uninstall dev-nginx -n dev
```

This removes all Kubernetes resources created by the release.  

---

# 7. Multiple Environments (dev/prod) 

We create separate values files:  

```yaml
# values-dev.yaml
replicaCount: 2
image:
  repository: nginx
  tag: "1.16.0"
```

```yaml
# values-prod.yaml
replicaCount: 4
image:
  repository: nginx
  tag: "1.21.0"
```

Install with environment specific values:  

```bash
helm install dev-nginx ./nginx-app -f values-dev.yaml -n dev
helm install prod-nginx ./nginx-app -f values-prod.yaml -n prod
```

---

# 8. Package a Chart =

```bash
helm package ./nginx-app
```

It creates `nginx-app-0.1.0.tgz` → distributable chart package.  

**Verify**  
```bash
ls
```

---

# 9. Push Chart to Artifact Hub =

Steps:  
- Create account on [Artifact Hub](https://artifacthub.io).  
- Host your Helm repo (GitHub Pages / S3 / GCS).  
- Run:  

```bash
helm repo index .
helm repo add my-repo https://username.github.io/helm-charts
```

Then submit repo on Artifact Hub.  

---

# 10. Helm History & Revision =

```bash
helm history dev-nginx -n dev
```

Shows revisions with: `REVISION | UPDATED | STATUS | CHART | APP VERSION`.  

---

# 11. Helm Template (Dry Run) =

To see rendered Kubernetes YAML before applying:  

```bash
helm template ./nginx-app -f values-dev.yaml
```

---

# 12. Fake Operator Example (Custom Resource) =

You can create your own **fake CRD style object** in Helm templates for learning:  

```yaml
apiVersion: shivam.dev/v1
kind: Database
metadata:
  name: student-db
spec:
  user: admin
  password: pass123
  storage: true
```

Helm will package it just like normal manifests.  
This is just for practice, not real operator.  

---

# 13. Best Practices 

- Always version bump in `Chart.yaml` when publishing.  
- Don’t keep secrets in values.yaml → use Secrets Manager or External Secrets.  
- Separate `dev`, `staging`, `prod` values files.  
- Use `helm lint` before packaging.  

---

# 14. Common Commands Quick Recap =

- `helm create chartName` → Create new chart  
- `helm install release ./chart -n namespace` → Install release  
- `helm upgrade release ./chart -f values.yaml` → Upgrade release  
- `helm rollback release REV -n ns` → Rollback release  
- `helm uninstall release -n ns` → Delete release  
- `helm list -n ns` → List all releases  
- `helm package ./chart` → Package chart  
- `helm repo add` → Add repo  
- `helm history release -n ns` → Release history  



# END 
