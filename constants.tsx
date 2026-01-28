
import React from 'react';

export const PROTOCOL_GROUPS = {
  proxy: [
    { value: 'socks5', label: 'SOCKS5 (支持认证)' },
    { value: 'http', label: 'HTTP 代理' },
    { value: 'ss', label: 'Shadowsocks (加密)' }
  ],
  tunnel: [
    { value: 'tcp', label: 'TCP 端口转发' },
    { value: 'udp', label: 'UDP 端口转发' },
    { value: 'relay+tls', label: 'Relay+TLS (高隐蔽)' },
    { value: 'relay+ws', label: 'Relay+WS (WebSocket)' },
    { value: 'mwss', label: 'MWSS (多路复用 WS)' },
    { value: 'relay+wss', label: 'Relay+WSS (加密 WS)' }
  ]
};

export const PROTOCOLS = [
  ...PROTOCOL_GROUPS.proxy.map(p => p.value),
  ...PROTOCOL_GROUPS.tunnel.map(p => p.value)
];

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
`;

export const CRUD_PY = `from sqlalchemy.orm import Session
from app import models, schemas

def get_rules(db: Session): 
    return db.query(models.ForwardRule).all()

def create_forward_rule(db: Session, rule: schemas.ForwardRuleCreate):
    data = rule.model_dump() if hasattr(rule, 'model_dump') else rule.dict()
    db_rule = models.ForwardRule(**data)
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

export const MAIN_PY = `from fastapi import FastAPI, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app import models, database, crud, schemas
from app.core_manager import manager
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mini-backend")

database.Base.metadata.create_all(bind=database.engine)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ADMIN_USER = "admin"
ADMIN_PWD = "admin123"

@app.get("/", response_class=HTMLResponse)
def index():
    return """
    <html>
        <head><title>mini Panel Backend</title></head>
        <body style="background:#020617;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;margin:0;">
            <div style="background:rgba(249,115,22,0.1);padding:40px;border-radius:30px;border:1px solid rgba(249,115,22,0.2);text-align:center;max-width:500px;">
                <h1 style="color:#f97316;font-size:40px;margin-bottom:10px;">✅ 后端运行中</h1>
                <p style="color:#64748b;font-size:18px;line-height:1.6;">您已经成功部署了 mini 面板后端程序！</p>
                <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:20px 0;">
                <p style="color:#94a3b8;font-size:14px;">接下来，请回到您生成代码的 <b>AI 对话网页</b>：</p>
                <ol style="text-align:left;color:#cbd5e1;font-size:14px;">
                    <li>在登录框的“后端地址”输入本页面 URL</li>
                    <li>使用默认账号 admin 登录</li>
                </ol>
                <div style="background:#0f172a;padding:15px;border-radius:15px;margin-top:20px;font-family:monospace;font-size:12px;color:#f97316;">
                    API Endpoint: /api/rules [ACTIVE]
                </div>
            </div>
        </body>
    </html>
    """

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
    if new_r.is_enabled:
        manager.start_rule(new_r)
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

@app.post("/api/settings/password")
def change_password(data: schemas.PasswordUpdate):
    global ADMIN_PWD
    if data.old_password == ADMIN_PWD:
        ADMIN_PWD = data.new_password
        return {"status": "ok"}
    raise HTTPException(400, "Old password incorrect")

@app.post("/api/settings/restart")
def restart():
    sys.exit(0)

@app.on_event("startup")
def startup():
    db = database.SessionLocal()
    rules = crud.get_rules(db)
    manager.restart_all(rules)
    db.close()
`;

export const CORE_MANAGER_PY = `import subprocess
import logging

logger = logging.getLogger("gost-manager")

class GostManager:
    def __init__(self): self.processes = {}
    def start_rule(self, rule):
        cmd = ["gost", "-L", f"{rule.protocol}://:{rule.local_port}/{rule.remote_ip}:{rule.remote_port}"]
        self.stop_rule(rule.id)
        logger.info(f"Starting tunnel {rule.id}: {' '.join(cmd)}")
        self.processes[rule.id] = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    def stop_rule(self, rid):
        if rid in self.processes:
            logger.info(f"Stopping tunnel {rid}")
            self.processes[rid].terminate()
            try: self.processes[rid].wait(timeout=5)
            except: self.processes[rid].kill()
            del self.processes[rid]
    def restart_all(self, rules):
        for r in rules:
            if r.is_enabled: self.start_rule(r)
manager = GostManager()
`;

export const DOCKERFILE = `FROM python:3.10-slim
RUN apt-get update && apt-get install -y wget ca-certificates && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/ginuerzh/gost/releases/download/v2.11.5/gost-linux-amd64-2.11.5.gz && \
    gunzip gost-linux-amd64-2.11.5.gz && \
    mv gost-linux-amd64-2.11.5 /usr/bin/gost && \
    chmod +x /usr/bin/gost
WORKDIR /app
RUN mkdir -p /app/data /app/app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

export const DOCKER_COMPOSE = `
services:
  mini-backend:
    build: .
    container_name: mini-backend
    restart: always
    network_mode: host
    environment:
      - PYTHONPATH=/app
    volumes:
      - ./data:/app/data
`;

export const CADDYFILE = `
{$DOMAIN_NAME} {
    reverse_proxy localhost:8000
    encode gzip
}
`;

export const ONE_CLICK_SETUP_SH = `
# 1. 确保目录存在
mkdir -p mini-panel/app mini-panel/data
cd mini-panel

# 2. 写入 Python 包初始化文件
touch app/__init__.py

# 3. 完整写入所有核心代码
cat <<EOF > app/database.py
${DATABASE_PY}
EOF

cat <<EOF > app/models.py
${MODELS_PY}
EOF

cat <<EOF > app/schemas.py
${SCHEMAS_PY}
EOF

cat <<EOF > app/crud.py
${CRUD_PY}
EOF

cat <<EOF > app/core_manager.py
${CORE_MANAGER_PY}
EOF

cat <<EOF > app/main.py
${MAIN_PY}
EOF

# 4. 写入依赖和 Docker 配置
cat <<EOF > requirements.txt
fastapi
uvicorn
sqlalchemy
pydantic
python-multipart
EOF

cat <<EOF > Dockerfile
${DOCKERFILE}
EOF

cat <<EOF > docker-compose.yml
${DOCKER_COMPOSE}
EOF

# 5. 强制重构并启动
docker compose up -d --build
echo "✅ 后端修复完成！请回到前端 UI 输入后端地址进行登录。"
`;

export const ENV_TEMPLATE = `DOMAIN_NAME=panel.yourdomain.com
`;

export const DEPLOY_GUIDE = `
# 🏁 mini 面板 访问与使用指南

### 1. 立即进入面板
就在你现在的这个网页界面（AI 预览窗格）！

### 2. 连接你的 VPS
在登录界面，你会看到一个“后端 API 地址”输入框。
输入：\`http://你的VPS_IP:8000\`

### 3. 默认凭据
- **账号**: \`admin\`
- **密码**: \`admin123\`

### 4. 常见问题
- **进不去**: 请确保 VPS 防火墙放行了 8000 端口。
- **Not Found**: 这是正常的，说明后端通了。请在前端输入地址登录。
`;

export const BACKEND_STRUCTURE = `
mini-panel/
├── app/
│   ├── main.py
│   └── ...
├── Dockerfile
└── docker-compose.yml
`;

export const INSTALL_SH = `docker compose up -d --build`;
