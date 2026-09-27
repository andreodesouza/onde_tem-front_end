from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    # Outros campos existentes da empresa...

    # Relacionamentos com os serviços e os profissionais
    servicos = relationship("Servico", back_populates="empresa", cascade="all, delete-orphan")
    profissionais = relationship("Profissional", back_populates="empresa", cascade="all, delete-orphan")


class Profissional(Base):
    __tablename__ = "profissionais"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    especialidade = Column(String, nullable=False)
    telefone = Column(String, nullable=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)

    # Relacionamento com a Empresa e com os Serviços prestados
    empresa = relationship("Empresa", back_populates="profissionais")
    servicos = relationship("Servico", back_populates="profissional")


class Servico(Base):
    __tablename__ = "servicos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    preco = Column(Float, nullable=False)
    duracao_minutos = Column(Integer, nullable=False)  # Duração em minutos

    # Chaves estrangeiras para associar à Empresa e (opcionalmente) ao Profissional
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    profissional_id = Column(Integer, ForeignKey("profissionais.id"), nullable=True)

    # Relacionamentos ORM
    empresa = relationship("Empresa", back_populates="servicos")
    profissional = relationship("Profissional", back_populates="servicos")