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

// Mock inicial de serviços femininos
let servicosMock = [
    { id: 1, nome: "Mechas & Hidratação", descricao: "Descoloração segura com tratamento reconstrutor", preco: 250.00, duracao_minutos: 180, profissional_nome: "Camila Hair" },
    { id: 2, nome: "Design de Sobrancelhas + Buço", descricao: "Alinhamento com pinça/cera e acabamento com henna", preco: 55.00, duracao_minutos: 45, profissional_nome: "Carla Sobrancelhas" },
    { id: 3, nome: "Alongamento em Gel (Manicure)", descricao: "Aplicação e cutilagem russa", preco: 130.00, duracao_minutos: 120, profissional_nome: "Juliana Nails" }
];

// Inicialização única ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    carregarAgendamentos();
    carregarProfissionais();
    carregarServicos();
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
    atualizarSelectProfissionais(lista);
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

// --- GESTÃO DE SERVIÇOS ---
async function carregarServicos() {
    try {
        const response = await fetch(`/api/servicos?empresa_id=${EMPRESA_ID}`);
        if (!response.ok) throw new Error();
        const lista = await response.json();
        renderizarTabelaServicos(lista);
    } catch {
        renderizarTabelaServicos(servicosMock);
    }
}

function renderizarTabelaServicos(lista) {
    const tbody = document.querySelector('#tabela-servicos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    lista.forEach(serv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${serv.nome}</strong></td>
            <td>${serv.descricao || 'Sem descrição'}</td>
            <td>R$ ${parseFloat(serv.preco).toFixed(2)}</td>
            <td>${serv.duracao_minutos} min</td>
            <td>${serv.profissional_nome || 'Equipe Geral'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Atualiza o select de profissionais dentro do formulário de serviço
function atualizarSelectProfissionais(profissionais) {
    const select = document.getElementById('serv-profissional');
    if (!select) return;
    
    select.innerHTML = '<option value="">Qualquer profissional (Geral)</option>';
    profissionais.forEach(prof => {
        const opt = document.createElement('option');
        opt.value = prof.id;
        opt.textContent = `${prof.nome} (${prof.especialidade})`;
        select.appendChild(opt);
    });
}

async function salvarServico(event) {
    event.preventDefault();

    const nome = document.getElementById('serv-nome').value;
    const preco = parseFloat(document.getElementById('serv-preco').value);
    const duracao_minutos = parseInt(document.getElementById('serv-duracao').value);
    const profissional_id = document.getElementById('serv-profissional').value || null;
    const descricao = document.getElementById('serv-descricao').value;

    const payload = {
        nome,
        preco,
        duracao_minutos,
        profissional_id: profissional_id ? parseInt(profissional_id) : null,
        descricao
    };

    try {
        const response = await fetch(`/api/servicos?empresa_id=${EMPRESA_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('form-servico').reset();
            carregarServicos();
        } else {
            throw new Error();
        }
    } catch {
        // Fallback local se a API não estiver conectada
        const profSelect = document.getElementById('serv-profissional');
        const profNome = profSelect.selectedIndex > 0 ? profSelect.options[profSelect.selectedIndex].text.split(' (')[0] : 'Equipe Geral';

        servicosMock.push({
            id: Date.now(),
            ...payload,
            profissional_nome: profNome
        });
        document.getElementById('form-servico').reset();
        renderizarTabelaServicos(servicosMock);
    }
}