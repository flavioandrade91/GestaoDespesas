let rowToDelete;
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('#descricao, #quantidade, #valor, #moeda-origem, #moeda-destino');
    const output = document.getElementById('output');
    
    inputs.forEach(input => {
        input.addEventListener('input', updateOutput);
    });

    fetchMoedas();

    async function updateOutput() {
        const descricao = document.getElementById('descricao').value;
        const quantidade = document.getElementById('quantidade').value;
        const valor = document.getElementById('valor').value;
        const moedaOrigem = document.getElementById('moeda-origem').value;
        const moedaDestino = document.getElementById('moeda-destino').value;

        let valorConvertido = '';

        if (valor && moedaOrigem && moedaDestino) {
            valorConvertido = await converterMoeda(valor, moedaOrigem, moedaDestino);
        }

        output.innerHTML = `
            <p><strong>Descrição:</strong> ${descricao}</p>
            <p><strong>Quantidade:</strong> ${quantidade}</p>
            <p><strong>Valor:</strong> ${formatarMoeda(valor, moedaOrigem)}</p>
            <p><strong>Moeda de Origem:</strong> ${moedaOrigem}</p>
            <p><strong>Moeda de Destino:</strong> ${moedaDestino}</p>
            <p><strong>Valor Convertido:</strong> ${formatarMoeda(valorConvertido, moedaDestino)}</p>
        `;
    }

    document.getElementById('confirmDeleteButton').addEventListener('click', function() {
        if (rowToDelete) {
            rowToDelete.remove();
            $('#deleteConfirmationModal').modal('hide');
        }
    });
});

async function fetchMoedas() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const moedas = Object.keys(data.rates);
        const moedaOrigemSelect = document.getElementById('moeda-origem');
        const moedaDestinoSelect = document.getElementById('moeda-destino');

        moedas.forEach(moeda => {
            const option1 = document.createElement('option');
            option1.value = moeda;
            option1.text = moeda;
            moedaOrigemSelect.add(option1);

            const option2 = document.createElement('option');
            option2.value = moeda;
            option2.text = moeda;
            moedaDestinoSelect.add(option2);
        });
    } catch (error) {
        console.error('Erro ao buscar moedas:', error);
    }
}

async function adicionarDespesa() {
    const descricao = document.getElementById('descricao').value.trim();
    const quantidade = document.getElementById('quantidade').value.trim();
    const valor = document.getElementById('valor').value.trim();
    const moedaOrigem = document.getElementById('moeda-origem').value.trim();
    const moedaDestino = document.getElementById('moeda-destino').value.trim();

    // Validação dos campos
    if (!descricao || !quantidade || !valor || !moedaOrigem || !moedaDestino) {
        // Exibir modal do Bootstrap
        $('#validationModal').modal('show');
        return;
    }

    // Chamada à API para conversão de moeda
    const valorConvertido = await converterMoeda(valor, moedaOrigem, moedaDestino);

    const expenseTable = document.getElementById('expense-table');
    const row = document.createElement('tr');

    row.dataset.valorOriginal = valor; // Armazenar o valor original no atributo data

    row.innerHTML = `
        <td>${descricao}</td>
        <td>${quantidade}</td>
        <td>${formatarMoeda(valor, moedaOrigem)}</td>
        <td>${moedaOrigem}</td>
        <td>${moedaDestino}</td>
        <td>${formatarMoeda(valorConvertido, moedaDestino)}</td>
        <td>
            <button class="btn btn-warning btn-sm" onclick="editarDespesa(this)">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="confirmarDelecao(this)">Deletar</button>
        </td>
    `;

    expenseTable.appendChild(row);

    // Limpar campos de entrada
    document.getElementById('descricao').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('moeda-origem').value = '';
    document.getElementById('moeda-destino').value = '';

    // Atualizar a exibição do resumo
    document.getElementById('output').innerHTML = '<p>Seus dados serão demonstrados aqui.</p>';
}

async function converterMoeda(valor, moedaOrigem, moedaDestino) {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${moedaOrigem}`);
        const data = await response.json();
        const taxaConversao = data.rates[moedaDestino];
        return (valor * taxaConversao).toFixed(2);
    } catch (error) {
        console.error('Erro ao converter moeda:', error);
        return 'Erro';
    }
}

function formatarMoeda(valor, moeda) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: moeda
    }).format(parseFloat(valor));
}

function editarDespesa(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');

    document.getElementById('descricao').value = cells[0].innerText;
    document.getElementById('quantidade').value = cells[1].innerText;
    document.getElementById('valor').value = row.dataset.valorOriginal; // Usar o valor original armazenado
    document.getElementById('moeda-origem').value = cells[3].innerText;
    document.getElementById('moeda-destino').value = cells[4].innerText;

    row.remove();
}

function confirmarDelecao(button) {
    const row = button.closest('tr');
    rowToDelete = row; // Armazenar a linha a ser deletada
    $('#deleteConfirmationModal').modal('show');
}