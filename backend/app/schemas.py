from pydantic import BaseModel
from typing import List, Optional

class ServicoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float
    duracao_minutos: int

class ServicoCreate(ServicoBase):
    pass

class ServicoResponse(ServicoBase):
    id: int
    empresa_id: int
    class Config:
        orm_mode = True

class StatusAgendamentoUpdate(BaseModel):
    status: str # Deve ser: pendente, confirmado, recusado ou concluido

class ProfissionalBase(BaseModel):
    nome: str
    especialidade: str
    telefone: Optional[str] = None

class ProfissionalCreate(ProfissionalBase):
    pass

class ProfissionalResponse(ProfissionalBase):
    id: int
    empresa_id: int

    class Config:
        orm_mode = True