from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Importa da própria estrutura do app
from .database import engine, Base, get_db
from .models import UsuarioModel
from .schemas import UsuarioCadastro, UsuarioLogin

# Cria as tabelas automaticamente se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Onde Tem?", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SALÕES FICTÍCIOS ---
saloes_db = [
    {
        "id": "1",
        "nome": "Studio Bella Donna",
        "email": "ficticio1@email.com",
        "lat": -22.901844,
        "lng": -42.474725,
        "servicos": "Cabelo • Unhas • Sobrancelhas",
        "img": "https://frizzar.com.br/blog/wp-content/uploads/2025/01/salao-de-beleza-moderno.webp"
    },
    {
        "id": "2",
        "nome": "Clínica Estética Flores",
        "email": "ficticio2@email.com",
        "lat": -22.930476,
        "lng": -42.489812,
        "servicos": "Rosto • Depilação • Massagem",
        "img": "https://s2.glbimg.com/Ha2q-YYa3pCWtwM4E51zi_p-POI=/940x523/e.glbimg.com/og/ed/f/original/2019/02/20/blow-dry-bar-del-mar-chairs-counter-853427.jpg"
    },
    {
        "id": "3",
        "nome": "Espaço Glow",
        "email": "ficticio3@email.com",
        "lat": -22.888828,
        "lng": -42.467136,
        "servicos": "Unhas • Sobrancelhas • Rosto",
        "img": "https://ferrante.com.br/wp-content/uploads/2024/11/decoracao-minimalista-salao.jpg.jpeg"
    }
]

# --- ROTAS DA API ---

@app.post("/api/cadastro", status_code=status.HTTP_201_CREATED)
def cadastrar_utilizador(usuario: UsuarioCadastro, db: Session = Depends(get_db)):
    email_limpo = usuario.email.lower().strip()
    
    # Verifica se já existe no PostgreSQL
    existente = db.query(UsuarioModel).filter(UsuarioModel.email == email_limpo).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Este e-mail já está registado."
        )
    
    novo_usuario = UsuarioModel(
        email=email_limpo,
        senha=usuario.senha,
        tipo=usuario.tipo,
        nome=usuario.nome,
        telefone=usuario.telefone,
        nome_fantasia=usuario.nome_fantasia,
        razao_social=usuario.razao_social
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return {"mensagem": "Registo efetuado com sucesso!"}

@app.post("/api/login")
def efetuar_login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    email_limpo = dados.email.lower().strip()
    
    usuario = db.query(UsuarioModel).filter(
        UsuarioModel.email == email_limpo,
        UsuarioModel.senha == dados.senha
    ).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="E-mail ou palavra-passe incorretos."
        )
        
    return {
        "token": "token-jwt-exemplo-seguro",
        "usuario": {
            "nome": usuario.nome or usuario.nome_fantasia,
            "email": usuario.email,
            "tipo": usuario.tipo
        }
    }

@app.get("/api/saloes")
def listar_saloes():
    # Retorna os salões fictícios para alimentar o front-end e o mapa
    return saloes_db