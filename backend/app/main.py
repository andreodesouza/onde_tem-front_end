from fastapi import FastAPI, HTTPException, status, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from . import models, schemas
from .database import engine, Base, get_db

# Cria automaticamente as tabelas (empresas, servicos, profissionais, etc.) na base de dados
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Onde Tem - Gestão de Salão")

app = FastAPI(title="API Onde Tem?", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS DE DADOS ---

class UsuarioCadastro(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    nome_fantasia: Optional[str] = None
    razao_social: Optional[str] = None
    email: str
    senha: str
    tipo: str  # "cliente" ou "empresa"

class UsuarioLogin(BaseModel):
    email: str
    senha: str

# --- BASES DE DADOS TEMPORÁRIAS ---
usuarios_db = []

saloes_db = [
    {
        "id": "1",
        "nome": "Studio Bella Donna",
        "email": "ficticio1@email.com",
        "telefone": "(22) 99876-5432",
        "endereco": "Av. Saquarema, 1200 - Porto da Roça",
        "avaliacao": 4.9,
        "total_avaliacoes": 128,
        "lat": -22.901844,
        "lng": -42.474725,
        "servicos": "Cabelo • Unhas • Sobrancelhas",
        "img": "https://frizzar.com.br/blog/wp-content/uploads/2025/01/salao-de-beleza-moderno.webp",
        "horario": "Terça a Sábado: 09h às 19h",
        "servicos_detalhados": [
            {
                "id": "s1_1",
                "nome": "Corte Feminino & Escova",
                "categoria": "cabelo",
                "descricao": "Lavagem com hidratação rápida, corte estilizado e finalização com escova.",
                "duracao_min": 60,
                "preco": 90.00
            },
            {
                "id": "s1_2",
                "nome": "Manicure Completa",
                "categoria": "manicure",
                "descricao": "Cutilagem funda, esmaltação tradicional e hidratação das mãos.",
                "duracao_min": 45,
                "preco": 45.00
            },
            {
                "id": "s1_3",
                "nome": "Design de Sobrancelhas com Henna",
                "categoria": "sobrancelhas",
                "descricao": "Mapeamento facial geométrico, remoção com pinça/linha e aplicação de henna.",
                "duracao_min": 40,
                "preco": 55.00
            }
        ]
    },
    {
        "id": "2",
        "nome": "Clínica Estética Flores",
        "email": "ficticio2@email.com",
        "telefone": "(22) 99123-4567",
        "endereco": "Rua das Pitabas, 45 - Centro",
        "avaliacao": 4.8,
        "total_avaliacoes": 94,
        "lat": -22.930476,
        "lng": -42.489812,
        "servicos": "Rosto • Depilação • Massagem",
        "img": "https://s2.glbimg.com/Ha2q-YYa3pCWtwM4E51zi_p-POI=/940x523/e.glbimg.com/og/ed/f/original/2019/02/20/blow-dry-bar-del-mar-chairs-counter-853427.jpg",
        "horario": "Segunda a Sexta: 08h às 18h",
        "servicos_detalhados": [
            {
                "id": "s2_1",
                "nome": "Limpeza de Pele Profunda",
                "categoria": "rosto",
                "descricao": "Higienização, vapor de ozônio, extração manual e máscara calmante.",
                "duracao_min": 75,
                "preco": 130.00
            },
            {
                "id": "s2_2",
                "nome": "Massagem Relaxante",
                "categoria": "massagem",
                "descricao": "Massagem corporal completa com óleos essenciais terapêuticos.",
                "duracao_min": 50,
                "preco": 110.00
            },
            {
                "id": "s2_3",
                "nome": "Depilação a Cera (Perna Inteira)",
                "categoria": "depilacao",
                "descricao": "Depilação suave com cera morna hipoalergênica.",
                "duracao_min": 45,
                "preco": 65.00
            }
        ]
    },
    {
        "id": "3",
        "nome": "Espaço Glow",
        "email": "ficticio3@email.com",
        "telefone": "(22) 99765-8899",
        "endereco": "Av. Oceânica, 510 - Itaúna",
        "avaliacao": 5.0,
        "total_avaliacoes": 62,
        "lat": -22.888828,
        "lng": -42.467136,
        "servicos": "Unhas • Sobrancelhas • Rosto",
        "img": "https://ferrante.com.br/wp-content/uploads/2024/11/decoracao-minimalista-salao.jpg.jpeg",
        "horario": "Terça a Domingo: 10h às 20h",
        "servicos_detalhados": [
            {
                "id": "s3_1",
                "nome": "Alongamento em Fibra de Vidro",
                "categoria": "manicure",
                "descricao": "Aplicação completa de unhas em fibra com acabamento natural.",
                "duracao_min": 120,
                "preco": 160.00
            },
            {
                "id": "s3_2",
                "nome": "Lash Lifting",
                "categoria": "sobrancelhas",
                "descricao": "Curvatura e hidratação profunda dos cílios naturais.",
                "duracao_min": 60,
                "preco": 110.00
            }
        ]
    }
]

# --- ROTAS DA API ---

@app.post("/api/cadastro", status_code=status.HTTP_201_CREATED)
def cadastrar_utilizador(usuario: UsuarioCadastro):
    for u in usuarios_db:
        if u["email"] == usuario.email.lower().strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Este e-mail já está registado.")
    novo = usuario.dict()
    novo["email"] = usuario.email.lower().strip()
    usuarios_db.append(novo)
    return {"mensagem": "Registo efetuado com sucesso!"}

@app.post("/api/login")
def efetuar_login(dados: UsuarioLogin):
    email_limpo = dados.email.lower().strip()
    for u in usuarios_db:
        if u["email"] == email_limpo and u["senha"] == dados.senha:
            return {
                "token": "token-jwt-exemplo-seguro",
                "usuario": {
                    "nome": u.get("nome") or u.get("nome_fantasia"),
                    "email": u["email"],
                    "tipo": u["tipo"]
                }
            }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou palavra-passe incorretos.")

@app.get("/api/saloes")
def listar_saloes():
    return saloes_db

# NOVA ROTA: Detalhes de um salão específico por ID
@app.get("/api/saloes/{salao_id}")
def obter_detalhes_salao(salao_id: str):
    for salao in saloes_db:
        if salao["id"] == str(salao_id):
            return salao
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salão não encontrado.")

# --- GERENCIAMENTO DE SERVIÇOS ---
@app.get("/api/servicos", response_model=list[schemas.ServicoResponse])
def listar_servicos(empresa_id: int, db: Session = Depends(get_db)):
    # Controle de acesso: retorna apenas os serviços da empresa logada
    servicos = db.query(models.Servico).filter(models.Servico.empresa_id == empresa_id).all()
    return servicos

@app.post("/api/servicos", response_model=schemas.ServicoResponse)
def criar_servico(servico: schemas.ServicoCreate, empresa_id: int, db: Session = Depends(get_db)):
    novo_servico = models.Servico(**servico.dict(), empresa_id=empresa_id)
    db.add(novo_servico)
    db.commit()
    db.refresh(novo_servico)
    return novo_servico

# --- GERENCIAMENTO DE AGENDAMENTOS ---
@app.put("/api/agendamentos/{agendamento_id}/status")
def atualizar_status_agendamento(
    agendamento_id: int, 
    atualizacao: schemas.StatusAgendamentoUpdate, 
    empresa_id: int, # Validação de segurança
    db: Session = Depends(get_db)
):
    agendamento = db.query(models.Agendamento).filter(models.Agendamento.id == agendamento_id).first()
    
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
    # Controle de acesso: garante que a empresa só edite seus próprios agendamentos
    if agendamento.empresa_id != empresa_id:
        raise HTTPException(status_code=403, detail="Acesso negado. Este agendamento pertence a outro estabelecimento.")

    status_validos = ["pendente", "confirmado", "recusado", "concluido"]
    if atualizacao.status not in status_validos:
        raise HTTPException(status_code=400, detail="Status inválido.")

    agendamento.status = atualizacao.status
    db.commit()
    
    return {"mensagem": f"Status atualizado com sucesso para: {atualizacao.status}"}

# --- PROFISSIONAIS VINCULADOS À EMPRESA ---
@app.get("/api/profissionais", response_model=list[schemas.ProfissionalResponse])
def listar_profissionais(empresa_id: int, db: Session = Depends(get_db)):
    # Retorna apenas profissionais da empresa logada
    return db.query(models.Profissional).filter(models.Profissional.empresa_id == empresa_id).all()

@app.post("/api/profissionais", response_model=schemas.ProfissionalResponse)
def cadastrar_profissional(
    profissional: schemas.ProfissionalCreate, 
    empresa_id: int, 
    db: Session = Depends(get_db)
):
    novo_profissional = models.Profissional(
        **profissional.dict(),
        empresa_id=empresa_id
    )
    db.add(novo_profissional)
    db.commit()
    db.refresh(novo_profissional)
    return novo_profissional