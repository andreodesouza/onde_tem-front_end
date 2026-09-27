from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="API Onde Tem?", version="1.0.0")

# Configuração do CORS para permitir a comunicação com o front-end (Vercel ou local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, pode substituir pelo domínio exato da sua Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS DE DADOS (Pydantic) ---

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

# --- BASES DE DADOS TEMPORÁRIAS (Substituir posteriormente por PostgreSQL/Supabase) ---
usuarios_db = []

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
def cadastrar_utilizador(usuario: UsuarioCadastro):
    # Verifica se o e-mail já existe na base de dados
    for u in usuarios_db:
        if u["email"] == usuario.email.lower().strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Este e-mail já está registado."
            )
    
    # Guarda o utilizador normalizado
    novo_usuario = usuario.dict()
    novo_usuario["email"] = usuario.email.lower().strip()
    usuarios_db.append(novo_usuario)
    
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
            
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="E-mail ou palavra-passe incorretos."
    )


@app.get("/api/saloes")
def listar_saloes():
    # Retorna a lista de estabelecimentos para preencher os cards no index.html
    return saloes_db

# --- MODELO E BASE DE DADOS PARA AGENDAMENTOS ---

class AgendamentoCriacao(BaseModel):
    salao_id: str
    data: str
    hora: str
    cliente_email: Optional[str] = "cliente@email.com"

agendamentos_db = []

@app.post("/api/agendamentos", status_code=status.HTTP_201_CREATED)
def criar_agendamento(agendamento: AgendamentoCriacao):
    # Verifica se o horário já está ocupado para o mesmo salão, data e hora
    for a in agendamentos_db:
        if a["salao_id"] == agendamento.salao_id and a["data"] == agendamento.data and a["hora"] == agendamento.hora:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Este horário já está ocupado neste estabelecimento!"
            )
    
    agendamentos_db.append(agendamento.dict())
    return {"mensagem": "Agendamento guardado com sucesso na base de dados!"}

@app.get("/api/agendamentos/{salao_id}")
def listar_agendamentos_salao(salao_id: str):
    # Retorna todos os horários já ocupados daquele salão específico
    return [a for a in agendamentos_db if a["salao_id"] == salao_id]

from pydantic import BaseModel
from typing import Optional

# Modelo para receber os dados do agendamento enviados pelo front-end
class AgendamentoCriacao(BaseModel):
    salao_id: str
    data: str
    hora: str
    cliente_email: Optional[str] = "cliente@email.com"

# Lista temporária que armazena os agendamentos na memória
agendamentos_db = []

@app.post("/api/agendamentos", status_code=status.HTTP_201_CREATED)
def criar_agendamento(agendamento: AgendamentoCriacao):
    # Valida se os campos obrigatórios foram preenchidos
    if not agendamento.salao_id or not agendamento.data or not agendamento.hora:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Todos os campos (salão, data e hora) são obrigatórios."
        )

    # Validação de conflito: barra se o mesmo salão já tiver marcação no mesmo dia e hora
    for a in agendamentos_db:
        if (a["salao_id"] == agendamento.salao_id and 
            a["data"] == agendamento.data and 
            a["hora"] == agendamento.hora):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Este horário já está ocupado neste estabelecimento!"
            )
    
    # Se estiver livre, salva o agendamento na lista
    agendamentos_db.append(agendamento.dict())
    return {"mensagem": "Agendamento validado e cadastrado com sucesso!"}