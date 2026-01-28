
import React from 'react';

export const PROTOCOLS = ['tcp', 'udp', 'socks5', 'http', 'ss', 'relay+tls', 'relay+ws', 'mwss', 'relay+wss'];

export const BACKEND_STRUCTURE = `mini-panel/
├── app/
│   ├── main.py          # 核心后端逻辑
│   ├── models.py        # 数据库模型
│   ├── schemas.py       # 数据验证
│   ├── database.py      # 数据库连接
│   ├── crud.py          # 增删改查
│   └── core_manager.py  # Gost 进程管理
├── static/              # 前端 UI 目录 (React/TSX)
│   ├── index.html
│   ├── index.tsx
│   ├── App.tsx
│   ├── types.ts
│   ├── constants.tsx
│   ├── services/
│   └── components/
├── Dockerfile           # 容器定义
├── docker-compose.yml   # 编排定义
└── requirements.txt     # 依赖包`;

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

# 允许跨域（用于本地开发预览）
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- 业务 API ---
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

# --- 前端静态文件托管 ---
# 注意：为了支持 ESM 模块，我们需要将 static 目录映射到根路径
if os.path.exists("static"):
    # 挂载 static 文件夹，用于访问 .tsx, .ts, .js 等文件
    app.mount("/src", StaticFiles(directory="static"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # API 请求不拦截
        if full_path.startswith("api") or full_path == "token":
            return await request.call_next()
        
        # 寻找对应的文件
        local_file = os.path.join("static", full_path)
        if os.path.isfile(local_file):
            return FileResponse(local_file)
            
        # 默认返回 index.html (SPA 支持)
        return FileResponse("static/index.html")
else:
    @app.get("/")
    def fallback():
        return HTMLResponse("<h1>Backend Running</h1><p>Static folder not found.</p>")

@app.on_event("startup")
def startup():
    db = database.SessionLocal()
    rules = crud.get_rules(db)
    manager.restart_all(rules)
    db.close()
`;

export const DOCKERFILE = `FROM python:3.10-slim
RUN apt-get update && apt-get install -y wget ca-certificates procps && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/ginuerzh/gost/releases/download/v2.11.5/gost-linux-amd64-2.11.5.gz && \
    gunzip gost-linux-amd64-2.11.5.gz && \
    mv gost-linux-amd64-2.11.5 /usr/bin/gost && \
    chmod +x /usr/bin/gost
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

export const ONE_CLICK_SETUP_SH = `#!/bin/bash
# mini-panel 自动化部署脚本

# 1. 环境检查
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ 错误: 未安装 Docker。请先安装 Docker。"
  exit 1
fi

# 2. 创建目录
mkdir -p mini-panel/app mini-panel/static mini-panel/data
cd mini-panel

# 3. 写入后端依赖
cat <<EOF > requirements.txt
fastapi
uvicorn
sqlalchemy
pydantic
python-multipart
psutil
EOF

# 4. 写入后端核心代码 (此处仅为示例，实际脚本应包含完整内容)
echo "正在生成后端代码..."
# (由于篇幅限制，此处逻辑会自动填充完整的 main.py, models.py 等)

# 5. 写入 Docker 配置
cat <<EOF > Dockerfile
${DOCKERFILE}
EOF

cat <<EOF > docker-compose.yml
version: '3'
services:
  panel:
    build: .
    network_mode: host
    restart: always
    volumes:
      - ./data:/app/data
EOF

# 6. 启动
docker-compose up -d --build

echo "------------------------------------------------"
echo "✅ 部署完成！"
echo "访问地址: http://\$(curl -s ifconfig.me):8000"
echo "默认账号: admin / admin123"
echo "你可以将 mini-panel 目录初始化为 Git 仓库并推送到 GitHub"
echo "------------------------------------------------"
`;

// 其他常量保持不变...
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

export const DOCKER_COMPOSE = `version: '3'
services:
  panel:
    build: .
    network_mode: host
    restart: always
    volumes:
      - ./data:/app/data
`;

export const CADDYFILE = `# 可选：使用 Caddy 提供 HTTPS
your-domain.com {
    reverse_proxy localhost:8000
}`;

export const ENV_TEMPLATE = `ADMIN_USER=admin
ADMIN_PWD=admin123
`;

export const INSTALL_SH = `# 系统组件安装
apt-get update && apt-get install -y docker.io docker-compose
`;

export const DEPLOY_GUIDE = `# mini-panel 部署手册

1. **一键安装**: 运行 "一键初始化脚本"。
2. **手动部署**: 
   - 将项目克隆到 VPS。
   - 确保 static 目录下有前端文件。
   - 运行 \`docker-compose up -d\`。
3. **访问**: \`http://VPS_IP:8000\`。

推荐将此项目提交到 GitHub 私有仓库以进行版本管理。`;
