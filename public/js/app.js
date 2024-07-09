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
                    <p><strong>Valor:</strong> ${valor}</p>
                    <p><strong>Moeda de Origem:</strong> ${moedaOrigem}</p>
                    <p><strong>Moeda de Destino:</strong> ${moedaDestino}</p>
                    <p><strong>Valor Convertido:</strong> ${valorConvertido}</p>
                `;
            }
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
            const descricao = document.getElementById('descricao').value;
            const quantidade = document.getElementById('quantidade').value;
            const valor = document.getElementById('valor').value;
            const moedaOrigem = document.getElementById('moeda-origem').value;
            const moedaDestino = document.getElementById('moeda-destino').value;

            // Chamada à API para conversão de moeda
            const valorConvertido = await converterMoeda(valor, moedaOrigem, moedaDestino);

            const expenseTable = document.getElementById('expense-table');
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${descricao}</td>
                <td>${quantidade}</td>
                <td>${valor}</td>
                <td>${moedaOrigem}</td>
                <td>${moedaDestino}</td>
                <td>${valorConvertido}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarDespesa(this)">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deletarDespesa(this)">Deletar</button>
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
            document.getElementById('output').innerHTML = '<p>Os valores digitados aparecerão aqui.</p>';
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

        function editarDespesa(button) {
            const row = button.closest('tr');
            const cells = row.querySelectorAll('td');

            document.getElementById('descricao').value = cells[0].innerText;
            document.getElementById('quantidade').value = cells[1].innerText;
            document.getElementById('valor').value = cells[2].innerText;
            document.getElementById('moeda-origem').value = cells[3].innerText;
            document.getElementById('moeda-destino').value = cells[4].innerText;

            row.remove();
        }

        function deletarDespesa(button) {
            const row = button.closest('tr');
            row.remove();
        }
