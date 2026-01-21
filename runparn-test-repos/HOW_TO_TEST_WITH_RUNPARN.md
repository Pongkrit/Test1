# How to test these demo repos with RunParn-lite-reduced

Your RunParn UI only accepts GitHub repo URLs, so you must push these demo folders to GitHub first.

## Step 1 — Create 2 repos on GitHub
- Repo A: `frontend-static-demo`
- Repo B: `node-mysql-demo`

## Step 2 — Push each folder as its own repo
Example (Windows PowerShell) inside each folder:

```powershell
git init
git add .
git commit -m "init demo"
git branch -M main
git remote add origin https://github.com/<YOURNAME>/<REPO>.git
git push -u origin main
```

## Step 3 — Test in RunParn

### A) Frontend demo
- Submit `https://github.com/<YOURNAME>/frontend-static-demo`
- Click **Launch Frontend**
- Preview should show the static page

### B) Backend + DB demo
- Submit `https://github.com/<YOURNAME>/node-mysql-demo`
- Click **Launch Backend (with DB)**
- Preview should show HTML page and "Load notes" button should fetch from DB
- You can POST a note:
  - open DevTools Console and run:
    ```js
    fetch('/api/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'new note'})})
    ```

## Extra verification
In a terminal on the RunParn machine:
- `docker ps`
- `docker exec -it runparn-db mysql -uroot -prunparnroot -e "SHOW DATABASES;"`

You should see a DB like `rp_s<sessionId>`.
