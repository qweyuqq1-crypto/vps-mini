
import React from 'react';

export const PROTOCOLS = ['tcp', 'udp', 'socks5', 'http', 'ss', 'relay+tls', 'relay+ws', 'mwss', 'relay+wss'];

// Fix: Added missing export constants required by components/CodeGenerator.tsx
export const BACKEND_STRUCTURE = `mini-panel/
├── app/
│   ├── core_manager.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
├── data/
├── static/
├── docker-compose.yml
├── Dockerfile
└── requirements.txt`;

export const DOCKER_COMPOSE = `version: '3'
services:
  panel:
    build: .
    restart: always
    network_mode: "host"
    volumes:
      - ./data:/app/data
      - ./static:/app/static`;

export const CADDYFILE = `:80 {
    reverse_proxy localhost:8000
}`;

export const ENV_TEMPLATE = `API_KEY=
ADMIN_USER=admin
ADMIN_PWD=admin123`;

export const INSTALL_SH = `#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose
`;

export const DEPLOY_GUIDE = `# 极简转发面板部署指南 (v2.8)

1. **准备环境**: 确保你的 VPS 已安装 Docker。
2. **下载代码**: 将本页面提供的文件保存到 VPS 上。
3. **初始化**: 推荐使用 "一键初始化脚本"。
4. **启动**: 执行 \`docker-compose up -d --build\`。
5. **访问**: 默认端口 8000，默认账号 admin/admin123。

注意：建议在生产环境修改默认密码。`;

export const DATABASE_PY = `from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = "sqlite:////app/data/aurora.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()
`;

export const MODELS_PY = `from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class ForwardRule(Base):
    __tablename__ = "forward_rules"
    id = Column(Integer, primary_key=True, index=True)
    local_port = Column(Integer, nullable=False, unique=True)
    remote_ip = Column(String, nullable=False)
    remote_port = Column(Integer, nullable=False)
    protocol = Column(String, default="tcp")
    is_enabled = Column(Boolean, default=True)
    description = Column(String, nullable=True)
`;

export const SCHEMAS_PY = `from pydantic import BaseModel
from typing import Optional

class ForwardRuleBase(BaseModel):
    local_port: int
    remote_ip: str
    remote_port: int
    protocol: str = "tcp"
    is_enabled: bool = True
    description: Optional[str] = None

class ForwardRuleUpdate(BaseModel):
    is_enabled: Optional[bool] = None

class ForwardRuleCreate(ForwardRuleBase): pass
class ForwardRule(ForwardRuleBase):
    id: int
    class Config: from_attributes = True

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str

class SystemStats(BaseModel):
    cpu_usage: float
    mem_usage: float
    net_up: str
    net_down: str
`;

export const MAIN_PY = `from fastapi import FastAPI, Depends, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app import models, database, crud, schemas
from app.core_manager import manager
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import psutil
import os

logging.basicConfig(level=logging.INFO)
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ADMIN_USER = "admin"
ADMIN_PWD = "admin123"

# --- 真实系统状态接口 ---
@app.get("/api/sys/stats", response_model=schemas.SystemStats)
def get_stats():
    return {
        "cpu_usage": psutil.cpu_percent(),
        "mem_usage": psutil.virtual_memory().percent,
        "net_up": "0 KB/s", # 简略实现
        "net_down": "0 KB/s"
    }

# --- 业务接口 ---
@app.post("/token")
def login(username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USER and password == ADMIN_PWD:
        return {"access_token": "mini_key", "token_type": "bearer"}
    raise HTTPException(400, "Invalid credentials")

@app.get("/api/rules")
def list_rules(db: Session = Depends(database.get_db)):
    return crud.get_rules(db)

@app.post("/api/rules")
def add_rule(rule: schemas.ForwardRuleCreate, db: Session = Depends(database.get_db)):
    new_r = crud.create_forward_rule(db, rule)
    if new_r.is_enabled: manager.start_rule(new_r)
    return new_r

@app.patch("/api/rules/{rule_id}")
def update_rule(rule_id: int, updates: schemas.ForwardRuleUpdate, db: Session = Depends(database.get_db)):
    rule = crud.update_forward_rule(db, rule_id, updates)
    if rule:
        if rule.is_enabled: manager.start_rule(rule)
        else: manager.stop_rule(rule.id)
    return rule

@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(database.get_db)):
    manager.stop_rule(rule_id)
    crud.delete_forward_rule(db, rule_id)
    return {"status": "deleted"}

# --- 托管前端 (如果存在) ---
if os.path.exists("static/index.html"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    @app.get("/")
    def read_index():
        return FileResponse("static/index.html")
else:
    from fastapi.responses import HTMLResponse
    @app.get("/", response_class=HTMLResponse)
    def fallback():
        return "<h1>Backend is running. UI files not found in /static</h1>"

@app.on_event("startup")
def startup():
    db = database.SessionLocal()
    rules = crud.get_rules(db)
    manager.restart_all(rules)
    db.close()
`;

export const CORE_MANAGER_PY = `import subprocess
import logging

class GostManager:
    def __init__(self): self.processes = {}
    def start_rule(self, rule):
        self.stop_rule(rule.id)
        # 构造 Gost 命令
        cmd = ["gost", "-L", f"{rule.protocol}://:{rule.local_port}/{rule.remote_ip}:{rule.remote_port}"]
        try:
            self.processes[rule.id] = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            logging.error(f"Failed to start rule {rule.id}: {e}")
    def stop_rule(self, rid):
        if rid in self.processes:
            self.processes[rid].terminate()
            del self.processes[rid]
    def restart_all(self, rules):
        for r in rules:
            if r.is_enabled: self.start_rule(r)
manager = GostManager()
`;

export const DOCKERFILE = `FROM python:3.10-slim
RUN apt-get update && apt-get install -y wget ca-certificates procps && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/ginuerzh/gost/releases/download/v2.11.5/gost-linux-amd64-2.11.5.gz && \
    gunzip gost-linux-amd64-2.11.5.gz && \
    mv gost-linux-amd64-2.11.5 /usr/bin/gost && \
    chmod +x /usr/bin/gost
WORKDIR /app
RUN mkdir -p /app/data /app/app /app/static
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

export const ONE_CLICK_SETUP_SH = `
# 1. 准备目录
mkdir -p mini-panel/app mini-panel/data mini-panel/static
cd mini-panel

# 2. 写入 Python 后端代码 (略，使用原逻辑填充文件)
cat <<EOF > app/main.py
${MAIN_PY}
EOF
# ... 其他 app/*.py 同理 ...

# 3. 写入依赖
cat <<EOF > requirements.txt
fastapi
uvicorn
sqlalchemy
pydantic
python-multipart
psutil
EOF

# 4. 部署
docker compose up -d --build
echo "------------------------------------------------"
echo "✅ VPS 全功能面板已部署！"
echo "访问地址: http://\$(curl -s ifconfig.me):8000"
echo "默认账号: admin / admin123"
echo "------------------------------------------------"
`;

export const CRUD_PY = `from sqlalchemy.orm import Session
from app import models, schemas

def get_rules(db: Session): 
    return db.query(models.ForwardRule).all()

def create_forward_rule(db: Session, rule: schemas.ForwardRuleCreate):
    db_rule = models.ForwardRule(**rule.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def delete_forward_rule(db: Session, rule_id: int):
    db_rule = db.query(models.ForwardRule).filter(models.ForwardRule.id == rule_id).first()
    if db_rule:
        db.delete(db_rule)
        db.commit()
    return db_rule

def update_forward_rule(db: Session, rule_id: int, updates: schemas.ForwardRuleUpdate):
    db_rule = db.query(models.ForwardRule).filter(models.ForwardRule.id == rule_id).first()
    if db_rule:
        if updates.is_enabled is not None:
            db_rule.is_enabled = updates.is_enabled
        db.commit()
        db.refresh(db_rule)
    return db_rule
`;
