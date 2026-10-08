from pydantic import BaseModel
from typing import Optional

class UsuarioCadastro(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    nome_fantasia: Optional[str] = None
    razao_social: Optional[str] = None
    email: str
    senha: str
    tipo: str  

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class AtivacaoConta(BaseModel):
    email: str
    codigo: str    

class SolicitarRecuperacaoSchema(BaseModel):
    email: str

class RedefinirSenhaSchema(BaseModel):
    email: str
    codigo: str
    nova_senha: str    