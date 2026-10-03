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
        "img": "https://frizzar.com.br/blog/wp-content/uploads/2025/01/salao-de-beleza-moderno.webp",
        "endereco": "Rua das Flores, 123 - Centro, Araruama",
        "horario": "Segunda a Sábado, das 09:00 às 19:00",
        "telefone": "22998887766",
        "avaliacao": 4.8,
        "total_avaliacoes": 42,
        "servicos_detalhados": [
            {
                "id": "srv-1",
                "nome": "Corte de Cabelo Feminino",
                "descricao": "Corte personalizado com lavagem e escova inclusas.",
                "duracao_min": 50,
                "preco": 80.00
            },
            {
                "id": "srv-2",
                "nome": "Manicure e Pedicure",
                "descricao": "Cutilagem completa e esmaltação à escolha.",
                "duracao_min": 60,
                "preco": 50.00
            }
        ]
    },
    {
        "id": "2",
        "nome": "Clínica Estética Flores",
        "email": "ficticio2@email.com",
        "lat": -22.930476,
        "lng": -42.489812,
        "servicos": "Rosto • Depilação • Massagem",
        "img": "https://s2.glbimg.com/Ha2q-YYa3pCWtwM4E51zi_p-POI=/940x523/e.glbimg.com/og/ed/f/original/2019/02/20/blow-dry-bar-del-mar-chairs-counter-853427.jpg",
        "endereco": "Av. Principal, 456 - Iguabinha",
        "horario": "Segunda a Sexta, das 08:00 às 18:00",
        "telefone": "22988776655",
        "avaliacao": 4.9,
        "total_avaliacoes": 38,
        "servicos_detalhados": [
            {
                "id": "srv-3",
                "nome": "Limpeza de Pele Profunda",
                "descricao": "Remoção de cravos, esfoliação e hidratação facial.",
                "duracao_min": 90,
                "preco": 120.00
            },
            {
                "id": "srv-4",
                "nome": "Massagem Relaxante",
                "descricao": "Massagem corporal com óleos essenciais.",
                "duracao_min": 60,
                "preco": 100.00
            }
        ]
    },
    {
        "id": "3",
        "nome": "Espaço Glow",
        "email": "ficticio3@email.com",
        "lat": -22.888828,
        "lng": -42.467136,
        "servicos": "Unhas • Sobrancelhas • Rosto",
        "img": "https://ferrante.com.br/wp-content/uploads/2024/11/decoracao-minimalista-salao.jpg.jpeg",
        "endereco": "Praça da Matriz, 78 - Centro",
        "horario": "Terça a Domingo, das 10:00 às 20:00",
        "telefone": "22977665544",
        "avaliacao": 4.7,
        "total_avaliacoes": 19,
        "servicos_detalhados": [
            {
                "id": "srv-5",
                "nome": "Design de Sobrancelhas",
                "descricao": "Alinhamento com pinça e henna (opcional).",
                "duracao_min": 30,
                "preco": 45.00
            }
        ]
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

# --- ROTA PARA LISTAR TODOS OS SALÕES ---
@app.get("/api/saloes")
def listar_saloes():
    return saloes_db

# --- ROTA PARA BUSCAR SALÃO POR ID ---
@app.get("/api/saloes/{salao_id}")
def obter_salao(salao_id: str):
    salao = next((s for s in saloes_db if s["id"] == salao_id), None)
    if not salao:
        raise HTTPException(status_code=404, detail="Salão não encontrado")
    return salao