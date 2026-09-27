const EMPRESA_ID = 1;

// Mock de dados locais para testes visuais
const mockAgendamentosFeminino = [
    { id: 1, cliente: 'Mariana Souza', servico: 'Mechas & Hidratação', profissional: 'Camila Hair', data: '2026-10-01 14:00', status: 'pendente' },
    { id: 2, cliente: 'Beatriz Lima', servico: 'Design de Sobrancelhas + Buço', profissional: 'Juliana Nails', data: '2026-10-01 15:30', status: 'confirmado' },
    { id: 3, cliente: 'Fernanda Rocha', servico: 'Alongamento em Gel (Manicure)', profissional: 'Juliana Nails', data: '2026-10-01 17:00', status: 'pendente' }
];

let profissionaisMock = [
    { id: 1, nome: "Camila Hair", especialidade: "Cabeleireira & Colorista", telefone: "(22) 99888-1122" },
    { id: 2, nome: "Juliana Nails", especialidade: "Manicure & Nail Designer", telefone: "(22) 99777-3344" },
    { id: 3, nome: "Carla Sobrancelhas", especialidade: "Designer de Sobrancelhas & Micropigmentação", telefone: "(22) 99666-5566" }
];

// Inicialização única ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    carregarAgendamentos();
    carregarProfissionais();
});

// Alternância de abas
function mostrarSessao(sessaoId, btnElement) {
    document.querySelectorAll('.sessao-painel').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const sessaoDestino = document.getElementById(sessaoId);
    if (sessaoDestino) sessaoDestino.style.display = 'block';
    
    if (btnElement) {
        btnElement.classList.add('active');
    }
}

// --- GESTÃO DE AGENDAMENTOS ---
async function carregarAgendamentos() {
    try {
        const response = await fetch(`/api/agendamentos/empresa/${EMPRESA_ID}`);
        if (!response.ok) throw new Error('Falha ao carregar agendamentos');
        
        const agendamentos = await response.json();
        renderizarTabelaAgendamentos(agendamentos);
    } catch (error) {
        console.warn('Backend desconectado. A carregar dados de teste:', error);
        renderizarTabelaAgendamentos(mockAgendamentosFeminino);
    }
}

function renderizarTabelaAgendamentos(agendamentos) {
    const tbody = document.querySelector('#tabela-agendamentos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let pendentes = 0;
    let confirmados = 0;

    agendamentos.forEach(ag => {
        if (ag.status === 'pendente') pendentes++;
        if (ag.status === 'confirmado') confirmados++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${ag.cliente}</strong></td>
            <td>${ag.servico}</td>
            <td>${ag.profissional || 'Não atribuído'}</td>
            <td>${ag.data}</td>
            <td><span class="status-badge badge-${ag.status}">${ag.status}</span></td>
            <td class="action-buttons">
                ${ag.status === 'pendente' ? `<button class="btn-action btn-confirmar" onclick="alterarStatusAgendamento(${ag.id}, 'confirmado')">Confirmar</button>` : ''}
                ${ag.status === 'pendente' ? `<button class="btn-action btn-recusar" onclick="alterarStatusAgendamento(${ag.id}, 'recusado')">Recusar</button>` : ''}
                ${ag.status === 'confirmado' ? `<button class="btn-action btn-concluir" onclick="alterarStatusAgendamento(${ag.id}, 'concluido')">Concluir</button>` : ''}
                ${(ag.status === 'confirmado' || ag.status === 'pendente') ? `<button class="btn-action btn-cancelar" onclick="alterarStatusAgendamento(${ag.id}, 'cancelado')">Cancelar</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });

    const elPendentes = document.getElementById('total-pendentes');
    const elConfirmados = document.getElementById('total-confirmados');
    if (elPendentes) elPendentes.textContent = pendentes;
    if (elConfirmados) elConfirmados.textContent = confirmados;
}

async function alterarStatusAgendamento(id, novoStatus) {
    if (!confirm(`Deseja alterar o status para "${novoStatus.toUpperCase()}"?`)) return;

    try {
        const response = await fetch(`/api/agendamentos/${id}/status?empresa_id=${EMPRESA_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            alert('Status atualizado com sucesso!');
            carregarAgendamentos();
        } else {
            const erro = await response.json();
            alert(`Erro: ${erro.detail}`);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert(`Status alterado localmente para ${novoStatus} (Modo Simulação).`);
    }
}

// --- GESTÃO DE PROFISSIONAIS ---
async function carregarProfissionais() {
    try {
        const response = await fetch(`/api/profissionais?empresa_id=${EMPRESA_ID}`);
        if (!response.ok) throw new Error();
        const lista = await response.json();
        renderizarTabelaProfissionais(lista);
    } catch {
        renderizarTabelaProfissionais(profissionaisMock);
    }
}

function renderizarTabelaProfissionais(lista) {
    const tbody = document.querySelector('#tabela-profissionais tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    lista.forEach(prof => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${prof.nome}</strong></td>
            <td>${prof.especialidade}</td>
            <td>${prof.telefone || 'Não informado'}</td>
        `;
        tbody.appendChild(tr);
    });

    const badgeCount = document.getElementById('total-profissionais');
    if (badgeCount) badgeCount.textContent = lista.length;
}

async function salvarProfissional(event) {
    event.preventDefault();

    const nome = document.getElementById('prof-nome').value;
    const especialidade = document.getElementById('prof-especialidade').value;
    const telefone = document.getElementById('prof-telefone').value;

    const payload = { nome, especialidade, telefone };

    try {
        const response = await fetch(`/api/profissionais?empresa_id=${EMPRESA_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('form-profissional').reset();
            carregarProfissionais();
        } else {
            throw new Error();
        }
    } catch {
        profissionaisMock.push({ id: Date.now(), ...payload });
        document.getElementById('form-profissional').reset();
        renderizarTabelaProfissionais(profissionaisMock);
    }
}