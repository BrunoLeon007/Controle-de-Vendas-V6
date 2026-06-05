let lista = JSON.parse(localStorage.getItem('choculisses_vendas')) || [];
let abaAtiva = 'TODOS';
const hoje = new Date();
const dia = String(hoje.getDate()).padStart(2, '0');
const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
const anoAtual = hoje.getFullYear();
const dataHojeString = anoAtual + '-' + mesAtual + '-' + dia;
document.getElementById('data').value = dataHojeString;
document.getElementById('data').addEventListener('change', atualizarTela);
document.getElementById('formulario').addEventListener('submit', function (evento) {
    evento.preventDefault();
    let trufaQtd = parseInt(document.getElementById('trufa_qtd').value) || 0;
    let trufaValor = parseFloat(document.getElementById('trufa_valor').value) || 0;
    let barraQtd = parseInt(document.getElementById('barra_qtd').value) || 0;
    let barraValor = parseFloat(document.getElementById('barra_valor').value) || 0;
    let totalPedido = (trufaQtd * trufaValor) + (barraQtd * barraValor);
    if (totalPedido <= 0) {
        alert("Insira uma quantidade e valor válidos para os doces!");
        return;
    }
    let confirmar = confirm("Confirmar venda para " + document.getElementById('comprador').value + " no valor total de R$ " + totalPedido.toFixed(2) + "?");
    if (!confirmar) return;
    let novaVenda = {
        id: Date.now(),
        comprador: document.getElementById('comprador').value,
        data: document.getElementById('data').value,
        trufa_qtd: trufaQtd,
        trufa_valor: trufaValor,
        barra_qtd: barraQtd,
        barra_valor: barraValor,
        valor_total: totalPedido,
        status: document.getElementById('status').value
    };
    lista.push(novaVenda);
    localStorage.setItem('choculisses_vendas', JSON.stringify(lista));
    atualizarTela();
    limparFormulario();
});
function limparFormulario() {
    document.getElementById('comprador').value = '';
    document.getElementById('trufa_qtd').value = '0';
    document.getElementById('trufa_valor').value = '';
    document.getElementById('barra_qtd').value = '0';
    document.getElementById('barra_valor').value = '';
    document.getElementById('status').value = 'PAGO';
}
function mudarAba(novaAba) {
    abaAtiva = novaAba;
    document.getElementById('aba-todos').classList.remove('ativa');
    document.getElementById('aba-pagos').classList.remove('ativa');
    document.getElementById('aba-pendentes').classList.remove('ativa');
    if (novaAba === 'TODOS') document.getElementById('aba-todos').classList.add('ativa');
    if (novaAba === 'PAGO') document.getElementById('aba-pagos').classList.add('ativa');
    if (novaAba === 'PENDENTE') document.getElementById('aba-pendentes').classList.add('ativa');
    atualizarTela();
}
function marcarComoPago(id) {
    const index = lista.findIndex(venda => venda.id === id);
    if (index !== -1) {
        lista[index].status = 'PAGO';
        localStorage.setItem('choculisses_vendas', JSON.stringify(lista));
        atualizarTela();
    }
}
function apagarVenda(id) {
    if (confirm("Deseja mesmo remover esta venda do histórico?")) {
        lista = lista.filter(venda => venda.id !== id);
        localStorage.setItem('choculisses_vendas', JSON.stringify(lista));
        atualizarTela();
    }
}
function alternarDetalhes(id) {
    let painel = document.getElementById("detalhe-" + id);
    if (painel) {
        if (painel.style.display === "none" || painel.style.display === "") {
            painel.style.display = "block";
        } else {
            painel.style.display = "none";
        }
    }
}
function atualizarTela() {
    let dataSelecionada = document.getElementById('data').value;
    let partesData = dataSelecionada.split('-');
    let anoFiltro = partesData.at(0);
    let mesFiltro = partesData.at(1);
    let deveFiltrarMes = document.getElementById('filtrar-por-mes').checked;
    let termoBusca = document.getElementById('buscar-nome').value.toLowerCase();
    let totalHojePago = 0;
    let totalHojePendente = 0;
    let totalMesPago = 0;
    let totalMesPendente = 0;
    let trufasHoje = 0;
    let barrasHoje = 0;
    let trufasMes = 0;
    let barrasMes = 0;
    let htmlHistorico = '';
    let itensExibidosContador = 0;
    let listaInvertida = [...lista].reverse();
    listaInvertida.forEach(venda => {
        let partes = venda.data.split('-');
        let vendaAno = partes.at(0);
        let vendaMes = partes.at(1);
        let vendaDia = partes.at(2);
        if (venda.data === dataSelecionada) {
            trufasHoje += venda.trufa_qtd;
            barrasHoje += venda.barra_qtd;
            if (venda.status === 'PAGO') {
                totalHojePago += venda.valor_total;
            } else {
                totalHojePendente += venda.valor_total;
            }
        }
        if (vendaAno === anoFiltro && vendaMes === mesFiltro) {
            trufasMes += venda.trufa_qtd;
            barrasMes += venda.barra_qtd;
            if (venda.status === 'PAGO') {
                totalMesPago += venda.valor_total;
            } else {
                totalMesPendente += venda.valor_total;
            }
        }
        if (deveFiltrarMes) {
            if (vendaAno !== anoFiltro || vendaMes !== mesFiltro) {
                return;
            }
        }
        if (abaAtiva !== 'TODOS' && venda.status !== abaAtiva) {
            return;
        }
        if (termoBusca && !venda.comprador.toLowerCase().includes(termoBusca)) {
            return;
        }
        itensExibidosContador++;
        let classeBadge = venda.status === 'PAGO' ? 'pago' : 'pendente';
        let statusTexto = venda.status === 'PAGO' ? 'Pago' : 'Não Pago';
        let itensComprados = [];
        if (venda.trufa_qtd > 0) {
            itensComprados.push(venda.trufa_qtd + "x Trufa (R$ " + venda.trufa_valor.toFixed(2) + ")");
        }
        if (venda.barra_qtd > 0) {
            itensComprados.push(venda.barra_qtd + "x Barra (R$ " + venda.barra_valor.toFixed(2) + ")");
        }
        let botaoPagarHtml = '';
        if (venda.status !== 'PAGO') {
            botaoPagarHtml = '<button class="btn-pagar" onclick="marcarComoPago(' + venda.id + ')">Marcar como Pago</button>';
        }
        let compradorHtml = "<strong>Cliente:</strong> " + venda.comprador;
        let painelDetalhesHtml = '';
        if (venda.status === 'PENDENTE') {
            compradorHtml = "<strong>Cliente:</strong> <span class=\"comprador-link-pendente\" onclick=\"alternarDetalhes(" + venda.id + ")\" title=\"Clique para ver pendências\">" + venda.comprador + " 🔍</span>";
            let valorTotalTrufa = venda.trufa_qtd * venda.trufa_valor;
            let valorTotalBarra = venda.barra_qtd * venda.barra_valor;
            painelDetalhesHtml = '<div id="detalhe-' + venda.id + '" class="painel-detalhe-pendencia" style="display: none;">' +
                '<h4>📋 Detalhamento da Pendência</h4>' +
                '<p>📅 <strong>Data da Compra:</strong> ' + vendaDia + '/' + vendaMes + '/' + vendaAno + '</p>' +
                '<p>🍬 <strong>Trufa:</strong> ' + venda.trufa_qtd + ' un. x R$ ' + venda.trufa_valor.toFixed(2) + ' = <strong>R$ ' + valorTotalTrufa.toFixed(2) + '</strong></p>' +
                '<p>🍫 <strong>Barra de Chocolate:</strong> ' + venda.barra_qtd + ' un. x R$ ' + venda.barra_valor.toFixed(2) + ' = <strong>R$ ' + valorTotalBarra.toFixed(2) + '</strong></p>' +
                '<p class="total-destaque">🔴 <strong>Valor Total Devido:</strong> R$ ' + venda.valor_total.toFixed(2) + '</p>' +
            '</div>';
        }
        htmlHistorico += '<div class="item-venda">' +
            '<p>' + compradorHtml + '</p>' +
            '<p><span class="txt-itens">' + itensComprados.join(' | ') + '</span></p>' +
            '<p style="font-size: 0.9rem; color: #555;">' +
                '<strong>Data:</strong> ' + vendaDia + '/' + vendaMes + '/' + vendaAno +
            '</p>' +
            '<p>' +
                '<strong>Total:</strong> ' +
                '<span class="status-badge ' + classeBadge + '">' +
                    'R$ ' + venda.valor_total.toFixed(2) + ' (' + statusTexto + ')' +
                '</span>' +
            '</p>' +
            painelDetalhesHtml +
            '<div class="acoes-venda">' +
                botaoPagarHtml +
                '<button class="btn-apagar" onclick="apagarVenda(' + venda.id + ')">Apagar</button>' +
            '</div>' +
        '</div>';
    });
    document.getElementById('hoje-pago').innerHTML = 'R$ ' + totalHojePago.toFixed(2) + '<small style="display:block;font-size:0.75rem;color:#7d6b5d;font-weight:normal;margin-top:4px;">🍬 ' + trufasHoje + ' trufas | 🍫 ' + barrasHoje + ' barras</small>';
    document.getElementById('hoje-pendente').innerHTML = 'R$ ' + totalHojePendente.toFixed(2) + '<small style="display:block;font-size:0.75rem;color:#7d6b5d;font-weight:normal;margin-top:4px;">🍬 ' + trufasHoje + ' trufas | 🍫 ' + barrasHoje + ' barras</small>';
    document.getElementById('mes-pago').innerHTML = 'R$ ' + totalMesPago.toFixed(2) + '<small style="display:block;font-size:0.75rem;color:#7d6b5d;font-weight:normal;margin-top:4px;">🍬 ' + trufasMes + ' trufas | 🍫 ' + barrasMes + ' barras</small>';
    document.getElementById('mes-pendente').innerHTML = 'R$ ' + totalMesPendente.toFixed(2) + '<small style="display:block;font-size:0.75rem;color:#7d6b5d;font-weight:normal;margin-top:4px;">🍬 ' + trufasMes + ' trufas | 🍫 ' + barrasMes + ' barras</small>';
    let historicoContainer = document.getElementById('lista-vendas');
    if (itensExibidosContador === 0) {
        let mensagemVazia = 'Nenhuma venda registrada.';
        if (termoBusca) {
            mensagemVazia = 'Nenhum comprador encontrado com o nome "' + document.getElementById('buscar-nome').value + '".';
        } else if (deveFiltrarMes) {
            mensagemVazia = 'Nenhuma venda registrada neste mês.';
            if (abaAtiva === 'PAGO') mensagemVazia = 'Nenhum pedido pago encontrado neste mês.';
            if (abaAtiva === 'PENDENTE') mensagemVazia = 'Nenhum pedido pendente encontrado neste mês.';} else {if (abaAtiva === 'PAGO') messageVazia = 'Nenhum pedido pago em todo o histórico.';if (abaAtiva === 'PENDENTE') mensagemVazia = 'Nenhum pedido pendente em todo o histórico.';}historicoContainer.innerHTML = '' + mensagemVazia + '';} else {historicoContainer.innerHTML = htmlHistorico;}}atualizarTela();
