
## 🔹 Step 0: Prerequisites

* You have kubectl configured and can reach your cluster.  
* You have cluster-admin rights for applying RBAC objects.  
* You’re comfortable running terminal commands.

---

## 🔹 Step 1: Create a Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: rbac-namespace
```

**Command**
```bash
kubectl apply -f namespace.yaml
```

**Verify**
```bash
kubectl get ns
```

---

## 🔹 Step 2: Create a Role (allow get/list/watch/delete on Pods)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-full-access
  namespace: rbac-namespace
rules:
  - apiGroups: [""]                 # "" * core API group (pods)
    resources: ["pods"]
    verbs: ["get","watch","list","delete"]
```

**Command**
```bash
kubectl apply -f role.yaml
```

**Verify**
```bash
kubectl get role -n rbac-namespace
```

---

## 🔹 Step 3: Create a ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: service-account-1
  namespace: rbac-namespace
```

**Command**
```bash
kubectl apply -f sa.yaml
```

**Verify**
```bash
kubectl get sa -n rbac-namespace
```

---

## 🔹 Step 4: Bind the Role to the ServiceAccount (RoleBinding)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-full-access-bindTo-service-account-1
  namespace: rbac-namespace
subjects:
  - kind: ServiceAccount
    name: service-account-1
    namespace: rbac-namespace
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: pod-full-access
```

**Command**
```bash
kubectl apply -f rolebinding.yaml
```

**Verify**
```bash
kubectl get rolebinding -n rbac-namespace
```

---

## 🔹 Step 5: Test Permissions with *kubectl auth can-i*

**Required identity format for ServiceAccount**
Use 
**--as** with the full identity:  
```bash
kubectl auth can-i get pod --as=system:serviceaccount:<namespace>:<serviceaccount-name>
```

**Examples**
```bash
# Can the ServiceAccount GET pods?
kubectl auth can-i get pods \
  --as=system:serviceaccount:rbac-namespace:service-account-1 \
  -n rbac-namespace

# Can the ServiceAccount LIST pods?
kubectl auth can-i list pods \
  --as=system:serviceaccount:rbac-namespace:service-account-1 \
  -n rbac-namespace

# Can the ServiceAccount WATCH pods?
kubectl auth can-i watch pods \
  --as=system:serviceaccount:rbac-namespace:service-account-1 \
  -n rbac-namespace

# Can the ServiceAccount DELETE pods?
kubectl auth can-i delete pods \
  --as=system:serviceaccount:rbac-namespace:service-account-1 \
  -n rbac-namespace

# Negative test (should return "no"): CREATE is NOT granted
kubectl auth can-i create pods \
  --as=system:serviceaccount:rbac-namespace:service-account-1 \
  -n rbac-namespace
```

---

## 🔹 Step 6 (Optional): Run a Pod using the ServiceAccount

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: rbac-namespace
spec:
  serviceAccountName: service-account-1
  containers:
    - name: mycontainer
      image: nginx
```

**Command**
```bash
kubectl apply -f pod.yaml
```

**Verify**
```bash
kubectl get pods -n rbac-namespace
```

---

## 🔹 Step 7 (Optional): Try an actual DELETE using *--as*

*Warning*: This really deletes a Pod. Use only on test Pods.

```bash
kubectl delete pod test-pod \
  --as=system:serviceaccount:rbac-namespace:service-account-1 \
  -n rbac-namespace
```

If your Role includes *delete* (as above), the delete should succeed.

---

## 🔹 Troubleshooting Cheatsheet

* If ```bash kubectl auth can-i ``` returns “no” unexpectedly:  
* Verify the Role is in the correct namespace.  
* Verify the RoleBinding references the correct Role name.  
* Verify **subjects.kind** is **ServiceAccount** (not User).  
* Verify the **subjects.namespace** matches the ServiceAccount’s namespace.  
* Always use the full **--as** value:  
**system:serviceaccount:<namespace>:<serviceaccount-name>**  
* Check for typos in verbs/resources (e.g., **pods** not **pod**, unless using singular correctly).

---
