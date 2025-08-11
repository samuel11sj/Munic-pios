const apiKey = "SUA_CHAVE_OPENWEATHER"; // coloque sua chave aqui
let historico = [];

// Classe Estados
class Estados {
    constructor(cidade, populacao, regiao, disponivel) {
        this.cidade = cidade;
        this.populacao = populacao;
        this.regiao = regiao;
        this.disponivel = disponivel;
    }

    async PrevisaoDoTempo() {
        if (!this.disponivel) {
            return "Cidade não disponível para consulta.";
        }
        const temp = await this.TemperaturaAtual();
        return `A temperatura atual em ${this.cidade} é ${temp}°C`;
    }

    async TemperaturaAtual() {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.cidade},BR&appid=${apiKey}&units=metric&lang=pt_br`;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const data = await resp.json();
        return data.main.temp;
    }

    Informacoes() {
        return `Cidade: ${this.cidade} | População: ${this.populacao} | Região: ${this.regiao}`;
    }
}

// Função para validar cidade usando API IBGE
async function validarCidadeBrasileira(cidade) {
    const url = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
    const resp = await fetch(url);
    const data = await resp.json();

    const cidadeEncontrada = data.find(m => m.nome.toLowerCase() === cidade.toLowerCase());
    if (cidadeEncontrada) {
        return {
            nome: cidadeEncontrada.nome,
            regiao: cidadeEncontrada.microrregiao.mesorregiao.UF.regiao.nome,
            disponivel: true
        };
    }
    return null;
}

// Função principal
async function consultar() {
    const cidade = document.getElementById("cidade").value.trim();
    const infoCidade = await validarCidadeBrasileira(cidade);

    const resultadoDiv = document.getElementById("resultado");

    if (!infoCidade) {
        resultadoDiv.innerHTML = "Cidade inválida ou fora do Brasil.";
        return;
    }

    const estado = new Estados(infoCidade.nome, "Desconhecida", infoCidade.regiao, infoCidade.disponivel);
    const tempMsg = await estado.PrevisaoDoTempo();
    resultadoDiv.innerHTML = `${estado.Informacoes()}<br>${tempMsg}`;

    // Salvar no histórico
    historico.push(infoCidade.nome);
    atualizarHistorico();
}

function atualizarHistorico() {
    const historicoUl = document.getElementById("historico");
    historicoUl.innerHTML = "";
    historico.forEach(cidade => {
        const li = document.createElement("li");
        li.textContent = cidade;
        historicoUl.appendChild(li);
    });
}
