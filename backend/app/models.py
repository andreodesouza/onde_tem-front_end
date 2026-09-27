from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Profissional(Base):
    __tablename__ = "profissionais"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    especialidade = Column(String, nullable=False)  # Ex: Cabeleireira, Manicure, Designer
    telefone = Column(String, nullable=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)

    # Relacionamento com a empresa
    empresa = relationship("Empresa", back_populates="profissionais")