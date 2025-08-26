
# Step 1: What is a CRD?  

- A **CustomResourceDefinition (CRD)** tells Kubernetes about a **new resource type**.  
- Example: Kubernetes already knows resources like **Pod, Service, Deployment**.  
- If we want Kubernetes to also understand **Database**, we need to create a CRD.  

So CRD  **teaching Kubernetes a new word**.  

---

# Step 2: Create the CRD file  

We create a file → `database-crd.yaml`.  

```yaml  
apiVersion: apiextensions.k8s.io/v1  
kind: CustomResourceDefinition  
metadata:  
  name: databases.shivam.dev             # Must be plural + group  

spec:  
  group: shivam.dev                      # Custom API group name  
  scope: Namespaced                      # Object belongs to a namespace  
  names:  
    singular: database                   # One item is called "database"  
    plural: databases                    # Many items called "databases"  
    kind: Database                       # Used in "kind" field of YAML  
    shortNames: ["db"]                   # Shortcut for kubectl  

  versions:  
    - name: v1  
      served: true  
      storage: true  
      schema:  
        openAPIV3Schema:  
          type: object  
          properties:  
            spec:  
              type: object  
              properties:  
                DB_NAME:  
                  type: string           # Database name must be text  
                replicas:  
                  type: integer          # Must be a number  
                DB_ROOT_PASS:  
                  type: string           # Must be text  
```  

## Verify Command  

```bash  
kubectl apply -f database-crd.yaml        # Create CRD in cluster  
kubectl get crd                           # Check if CRD is created  
```  

You should see something like:  
```
NAME                      CREATED AT  
databases.shivam.dev      2025-08-26T05:30:00Z  
```  

# Step 3: Create a Custom Resource (CR)  

Now that Kubernetes knows "Database", let’s create one database object.  

File name → `students-db.yaml`  

```yaml  
apiVersion: shivam.dev/v1  
kind: Database  
metadata:  
  name: students-database  

spec:  
  DB_ROOT_PASS: addjhbfjnkm              # Fake root password  
  replicas: 3                            # 3 replicas  
  DB_NAME: students                      # Database name  
```  

## Verify Command  

```bash  
kubectl apply -f students-db.yaml         # Apply the CR  
kubectl get databases                     # Check custom resources  
kubectl get db                            # Same but using shortName  
```  

Expected output:  
```
NAME                AGE  
students-database   10s  
```  

--- 

# Step 4: How it works  

- When you run `kubectl get databases`, Kubernetes shows your custom object.  
- But right now → it is **just stored in etcd** (cluster memory).  
- It will NOT create Pods or Services automatically.  

For real action → you need an **Operator/Controller** that watches CR and creates real objects (like MySQL pods).  

--- 

# Step 5: Clean up  

If you don’t need it anymore:  

```bash  
kubectl delete -f students-db.yaml        # Delete custom resource  
kubectl delete -f database-crd.yaml       # Delete CRD definition  
```  

