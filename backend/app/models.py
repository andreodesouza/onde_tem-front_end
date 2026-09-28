from sqlalchemy import Column, Integer, String
from .database import Base

class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    senha = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    nome = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    nome_fantasia = Column(String, nullable=True)
    razao_social = Column(String, nullable=True)