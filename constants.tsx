
import React from 'react';

export const PROTOCOLS = ['tcp', 'udp', 'socks5', 'http', 'ss', 'relay+tls', 'relay+ws', 'mwss', 'relay+wss'];

export const BACKEND_STRUCTURE = `mini-panel/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── crud.py
│   └── core_manager.py
├── static/              # 存放 index.html 和前端代码
├── data/                # 数据库持久化目录
├── Dockerfile
├── docker-compose.yml
└── requirements.txt`;

export const DOCKERFILE = `FROM python:3.10-slim
RUN apt-get update && apt-get install -y wget ca-certificates procps && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/ginuerzh/gost/releases/download/v2.11.5/gost-linux-amd64-2.11.5.gz && \\
    gunzip gost-linux-amd64-2.11.5.gz && \\
    mv gost-linux-amd64-2.11.5 /usr/bin/gost && \\
    chmod +x /usr/bin/gost
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`;

export const DOCKER_COMPOSE = `version: '3.8'

services:
  panel:
    build: .
    container_name: vps-mini-panel
    restart: always
    network_mode: "host"
    volumes:
      - ./data:/app/data
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"`;

export const ONE_CLICK_SETUP_SH = `#!/bin/bash
# 自动化部署脚本 v3.0

# 检查 Docker
if ! [ -x "$(command -v docker)" ]; then
  echo "正在安装 Docker..."
  curl -fsSL https://get.docker.com | bash -s docker
fi

# 创建目录
mkdir -p vps-mini/app vps-mini/static vps-mini/data
cd vps-mini

# 写入后端依赖
cat <<EOF > requirements.txt
fastapi
uvicorn
sqlalchemy
pydantic
python-multipart
psutil
EOF

# 写入 Dockerfile
cat <<EOF > Dockerfile
${DOCKERFILE}
EOF

# 写入 docker-compose.yml
cat <<EOF > docker-compose.yml
${DOCKER_COMPOSE}
EOF

# 启动
docker-compose up -d --build

echo "------------------------------------------------"
echo "✅ 部署完成！"
echo "访问地址: http://\$(curl -s ifconfig.me):8000"
echo "默认账号: admin / admin123"
echo "------------------------------------------------"
`;

export const MAIN_PY = `from fastapi import FastAPI, Depends, Form, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app import models, database, crud, schemas
from app.core_manager import manager
from fastapi.middleware.cors import CORSMiddleware
import os
import psutil
import logging

logging.basicConfig(level=logging.INFO)
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/sys/stats")
def get_stats():
    return {
        "cpu_usage": psutil.cpu_percent(),
        "mem_usage": psutil.virtual_memory().percent,
        "net_up": "0 KB/s",
        "net_down": "0 KB/s"
    }

@app.post("/token")
def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "admin123":
        return {"access_token": "mini_key", "token_type": "bearer"}
    raise HTTPException(401, "认证失败")

@app.get("/api/rules")
def list_rules(db: Session = Depends(database.get_db)):
    return crud.get_rules(db)

@app.post("/api/rules")
def add_rule(rule: schemas.ForwardRuleCreate, db: Session = Depends(database.get_db)):
    db_rule = crud.create_forward_rule(db, rule)
    if db_rule.is_enabled: manager.start_rule(db_rule)
    return db_rule

@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(database.get_db)):
    manager.stop_rule(rule_id)
    return crud.delete_forward_rule(db, rule_id)

@app.patch("/api/rules/{rule_id}")
def update_rule(rule_id: int, updates: schemas.ForwardRuleUpdate, db: Session = Depends(database.get_db)):
    rule = crud.update_forward_rule(db, rule_id, updates)
    if rule:
        if rule.is_enabled: manager.start_rule(rule)
        else: manager.stop_rule(rule.id)
    return rule

# 修正：去掉了错误的括号
if os.path.exists("static/index.html"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    @app.get("/")
    def serve_index(): return FileResponse("static/index.html")
else:
    @app.get("/")
    def fallback(): return HTMLResponse("<h1>Backend Running</h1><p>UI files missing in static/</p>")

@app.on_event("startup")
def startup():
    db = database.SessionLocal()
    rules = crud.get_rules(db)
    manager.restart_all(rules)
    db.close()
`;

export const DATABASE_PY = `from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:////app/data/panel.db"
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

class ForwardRuleCreate(ForwardRuleBase): pass
class ForwardRuleUpdate(BaseModel):
    is_enabled: Optional[bool] = None

class ForwardRule(ForwardRuleBase):
    id: int
    class Config: from_attributes = True

class SystemStats(BaseModel):
    cpu_usage: float
    mem_usage: float
    net_up: str
    net_down: str
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
    return {"status": "success"}

def update_forward_rule(db: Session, rule_id: int, updates: schemas.ForwardRuleUpdate):
    db_rule = db.query(models.ForwardRule).filter(models.ForwardRule.id == rule_id).first()
    if db_rule:
        if updates.is_enabled is not None:
            db_rule.is_enabled = updates.is_enabled
        db.commit()
        db.refresh(db_rule)
    return db_rule
`;

export const CORE_MANAGER_PY = `import subprocess
import logging

class GostManager:
    def __init__(self): self.processes = {}
    def start_rule(self, rule):
        self.stop_rule(rule.id)
        cmd = ["gost", "-L", f"{rule.protocol}://:{rule.local_port}/{rule.remote_ip}:{rule.remote_port}"]
        try:
            self.processes[rule.id] = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            logging.error(f"Error starting rule {rule.id}: {e}")
    def stop_rule(self, rid):
        if rid in self.processes:
            self.processes[rid].terminate()
            del self.processes[rid]
    def restart_all(self, rules):
        for r in rules:
            if r.is_enabled: self.start_rule(r)
manager = GostManager()
`;

export const CADDYFILE = `# 可选：HTTPS 反代
:80 {
    reverse_proxy localhost:8000
}`;

export const ENV_TEMPLATE = `ADMIN_USER=admin
ADMIN_PWD=admin123`;

export const INSTALL_SH = `apt-get update && apt-get install -y docker.io docker-compose`;

export const DEPLOY_GUIDE = `# 部署指南
1. 修正缩进：确保 docker-compose.yml 的 services 下方有缩进。
2. 端口检查：确保 8000 端口未被占用。
3. 容器管理：使用 docker-compose ps 查看状态。`;
