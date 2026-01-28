
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

export const BACKEND_STRUCTURE = `
aurora-panel/
├── app/
│   ├── main.py          # 程序入口
│   ├── database.py      # 数据库配置
│   ├── models.py        # 数据模型 (含 Owner 字段)
│   ├── schemas.py       # Pydantic 验证
│   ├── crud.py          # 数据库操作
│   └── core_manager.py  # Gost 进程控制引擎
├── data/                # 持久化目录 (数据库/日志)
├── Caddyfile            # 自动 SSL 配置
├── .env                 # 环境变量
├── Dockerfile           # 镜像构建
├── docker-compose.yml   # Host 模式编排
├── requirements.txt     # Python 依赖
└── install.sh           # 一键安装脚本
`;

export const INSTALL_SH = `#!/bin/bash
# Aurora Panel 一键安装脚本

RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
NC='\\033[0m'

echo -e "\${BLUE}===> 开始部署 Aurora VPS 转发面板... <===\${NC}"

# 1. 检查 Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "\${RED}检测到未安装 Docker，正在安装... \${NC}"
  curl -fsSL https://get.docker.com | bash -s docker
fi

if ! [ -x "$(command -v docker-compose)" ]; then
  echo -e "\${RED}检测到未安装 Docker Compose，正在安装... \${NC}"
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

# 2. 创建持久化目录
echo -e "\${BLUE}正在创建必要目录...\${NC}"
mkdir -p data/caddy_data data/caddy_config
chmod -R 777 data

# 3. 检查 .env
if [ ! -f .env ]; then
  echo -e "\${RED}未找到 .env 配置文件，请先根据模板创建！\${NC}"
  exit 1
fi

# 4. 启动服务
echo -e "\${BLUE}正在启动容器 (Host 网络模式)...\${NC}"
docker-compose up -d --build

# 5. 完成提示
DOMAIN=$(grep DOMAIN_NAME .env | cut -d '=' -f2)
IP=$(curl -s ifconfig.me)

echo -e "\${GREEN}--------------------------------------------------\${NC}"
echo -e "\${GREEN}面板部署成功！\${NC}"
echo -e "\${GREEN}HTTPS 访问: https://\$DOMAIN\${NC}"
echo -e "\${GREEN}备用访问: http://\$IP:8000\${NC}"
echo -e "\${GREEN}--------------------------------------------------\${NC}"
`;

export const ENV_TEMPLATE = `
# 访问域名 (用于 Caddy 自动申请 SSL)
DOMAIN_NAME=panel.yourdomain.com

# 后端 JWT 签名密钥
SECRET_KEY=AURORA_$(openssl rand -hex 16)

# 数据库路径 (容器内持久化路径)
DATABASE_URL=sqlite:////app/data/aurora.db
`;

export const DATABASE_PY = `
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////app/data/aurora.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`;

export const DOCKER_COMPOSE = `
version: '3.8'

services:
  # 后端服务
  aurora-panel:
    build: .
    container_name: aurora-panel
    restart: always
    network_mode: host
    env_file: .env
    volumes:
      - ./data:/app/data
    logging:
      driver: "json-file"
      options:
        max-size: "10m"

  # Caddy 网关
  caddy:
    image: caddy:2-alpine
    container_name: aurora-gateway
    restart: always
    network_mode: host
    environment:
      - DOMAIN_NAME=\${DOMAIN_NAME}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data/caddy_data:/data
      - ./data/caddy_config:/config
    depends_on:
      - aurora-panel
`;

export const MODELS_PY = `
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from .database import Base

class ForwardRule(Base):
    __tablename__ = "forward_rules"
    id = Column(Integer, primary_key=True, index=True)
    local_port = Column(Integer, nullable=False, unique=True)
    remote_ip = Column(String, nullable=False)
    remote_port = Column(Integer, nullable=False)
    protocol = Column(String, default="tcp")
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    is_enabled = Column(Boolean, default=True)
    description = Column(String, nullable=True)
    owner = Column(String, nullable=True) # 商业管理：所属客户/备注
    expire_date = Column(DateTime, nullable=True)
`;

export const SCHEMAS_PY = `
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ForwardRuleBase(BaseModel):
    local_port: int = Field(..., ge=1, le=65535)
    remote_ip: str
    remote_port: int = Field(..., ge=1, le=65535)
    protocol: str = "tcp"
    username: Optional[str] = None
    password: Optional[str] = None
    is_enabled: bool = True
    description: Optional[str] = None
    owner: Optional[str] = None
    expire_date: Optional[datetime] = None

class ForwardRuleCreate(ForwardRuleBase):
    pass

class ForwardRule(ForwardRuleBase):
    id: int
    class Config:
        from_attributes = True
`;

export const CRUD_PY = `
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas

def get_rules(db: Session):
    return db.query(models.ForwardRule).all()

def create_forward_rule(db: Session, rule: schemas.ForwardRuleCreate):
    db_rule = models.ForwardRule(**rule.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def delete_rule(db: Session, rule_id: int):
    db_rule = db.query(models.ForwardRule).filter(models.ForwardRule.id == rule_id).first()
    if db_rule:
        db.delete(db_rule)
        db.commit()
    return db_rule
`;

export const CORE_MANAGER_PY = `
import subprocess
import threading
import time
from . import models

class GostManager:
    def __init__(self, binary_path: str = "gost"):
        self.binary_path = binary_path
        self.processes = {}
        self._lock = threading.Lock()

    def restart_all(self, rules):
        with self._lock:
            for p in self.processes.values(): p.terminate()
            self.processes.clear()
            for rule in rules:
                if not rule.is_enabled: continue
                cmd = [self.binary_path, "-L", f"{rule.protocol}://:{rule.local_port}/{rule.remote_ip}:{rule.remote_port}"]
                if rule.protocol in ["socks5", "http"]:
                    auth = f"{rule.username}:{rule.password}@" if rule.username else ""
                    cmd = [self.binary_path, "-L", f"{rule.protocol}://{auth}:{rule.local_port}"]
                self.processes[rule.id] = subprocess.Popen(cmd)

manager = GostManager()
`;

export const MAIN_PY = `
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import models, database, crud, schemas
from .core_manager import manager

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

@app.get("/api/rules", response_model=list[schemas.ForwardRule])
def list_rules(db: Session = Depends(database.get_db)):
    return crud.get_rules(db)

@app.post("/api/rules")
def add_rule(rule: schemas.ForwardRuleCreate, db: Session = Depends(database.get_db)):
    new_rule = crud.create_forward_rule(db, rule)
    manager.restart_all(crud.get_rules(db))
    return new_rule
`;

export const CADDYFILE = `
{$DOMAIN_NAME} {
    reverse_proxy localhost:8000
    encode gzip
}
`;

export const DOCKERFILE = `
FROM python:3.10-slim
RUN apt-get update && apt-get install -y wget ca-certificates && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/ginuerzh/gost/releases/download/v2.11.5/gost-linux-amd64-2.11.5.gz && gunzip gost-linux-amd64-2.11.5.gz && mv gost-linux-amd64-2.11.5 /usr/bin/gost && chmod +x /usr/bin/gost
WORKDIR /app
RUN mkdir -p /app/data
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
