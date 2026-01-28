
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

export const MAIN_PY = `from fastapi import FastAPI, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app import models, database, crud, schemas
from app.core_manager import manager
from fastapi.middleware.cors import CORSMiddleware

database.Base.metadata.create_all(bind=database.engine)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/token")
def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "admin123":
        return {"access_token": "mini_key", "token_type": "bearer"}
    raise HTTPException(400, "Invalid credentials")

@app.get("/api/rules", response_model=list[schemas.ForwardRule])
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

@app.on_event("startup")
def startup():
    db = database.SessionLocal()
    rules = crud.get_rules(db)
    manager.restart_all(rules)
    db.close()
`;

export const CORE_MANAGER_PY = `import subprocess
class GostManager:
    def __init__(self): self.processes = {}
    def start_rule(self, rule):
        cmd = ["gost", "-L", f"{rule.protocol}://:{rule.local_port}/{rule.remote_ip}:{rule.remote_port}"]
        self.stop_rule(rule.id)
        self.processes[rule.id] = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    def stop_rule(self, rid):
        if rid in self.processes:
            self.processes[rid].terminate()
            self.processes[rid].wait()
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

export const ENV_TEMPLATE = `DOMAIN_NAME=panel.yourdomain.com
`;

export const BACKEND_STRUCTURE = `
mini-panel/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   └── core_manager.py
├── data/
├── Caddyfile
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
`;

export const ONE_CLICK_SETUP_SH = `# (略去，保持一致)`;
export const DEPLOY_GUIDE = `# (略去，保持一致)`;
export const INSTALL_SH = `docker compose up -d --build`;
export const DOCKER_COMPOSE = `# (略去，保持一致)`;
export const CADDYFILE = `# (略去，保持一致)`;
