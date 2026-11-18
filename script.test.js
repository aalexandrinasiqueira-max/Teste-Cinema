/**
 * @jest-environment jsdom
 */

/*
 * TESTES UNITÁRIOS – Cadastro de Funcionários | Cine Vision Cinemas
 * Baseado no Plano de Teste (CT01 a CT11).
 *
 * COMO RODAR (com a pasta do projeto aberta no terminal):
 *   1. npm init -y                                        (só na primeira vez)
 *   2. npm install --save-dev jest jest-environment-jsdom (só na primeira vez)
 *   3. npx jest
 *
 * Coloque este arquivo na mesma pasta de index.html, script.js e style.css.
 *
 * Observações:
 *  - O index.html é carregado em um navegador simulado (jsdom) e o script.js
 *    é executado sobre ele, simulando o preenchimento e o envio do formulário.
 *  - Casos bloqueados pelo próprio navegador (atributo "required", min, type="email")
 *    são verificados pela validação nativa (checkValidity / validity).
 *  - Casos que dependem de aparência real da tela (responsividade, foco visual,
 *    layout) não são testáveis em jsdom e estão marcados como test.todo (testar
 *    manualmente, conforme o plano).
 */

const fs = require("fs");
const path = require("path");

const HTML = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const CSS = fs.readFileSync(path.join(__dirname, "style.css"), "utf8");

// Dados válidos de referência (iguais aos do plano de teste)
const DADOS_VALIDOS = {
    nome: "Ana Souza",
    rua: "Rua das Acácias",
    numero: "120",
    bairro: "Centro",
    cep: "36300000",
    cidade: "São João del-Rei",
    estado: "mg",
    complemento: "Apto 12",
    email: "ana.souza@email.com",
    telefone: "32999991234",
    cargo: "Atendente de Bilheteria",
    salario: "250000",
    turno: "Manhã"
};

const CAMPOS_COM_MASCARA = ["cep", "estado", "telefone", "salario"];

let formulario;
let mensagem;

// ======================================
// FUNÇÕES AUXILIARES
// ======================================

function campo(id) {
    return document.getElementById(id);
}

// Digita um valor em um campo e dispara o evento "input" (aplica as máscaras)
function digitar(id, valor) {
    const elemento = campo(id);
    elemento.value = valor;
    elemento.dispatchEvent(new Event("input", { bubbles: true }));
}

// Preenche o formulário com os dados válidos, trocando apenas o que for informado
function preencher(alteracoes = {}) {
    const dados = { ...DADOS_VALIDOS, ...alteracoes };

    Object.keys(dados).forEach(function (id) {
        if (id === "turno") {
            return;
        }

        if (CAMPOS_COM_MASCARA.includes(id)) {
            digitar(id, dados[id]);
        } else {
            campo(id).value = dados[id];
        }
    });

    if (dados.turno) {
        document.querySelector(
            'input[name="turno"][value="' + dados.turno + '"]'
        ).checked = true;
    }
}

// Dispara o envio do formulário (executa as validações do JavaScript)
function enviar() {
    formulario.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
    );
}

// Texto da mensagem exibida, trocando espaços especiais por espaço comum
function textoMensagem() {
    return mensagem.textContent.replace(/\u00a0/g, " ").trim();
}

function esperarErro(texto) {
    expect(mensagem.className).toContain("erro");
    expect(textoMensagem()).toBe(texto);
}

function esperarSucesso() {
    expect(mensagem.className).toContain("sucesso");
    expect(textoMensagem()).toContain("Cadastro realizado com sucesso!");
}

// Lista os campos que o navegador consideraria inválidos (validação nativa)
function camposInvalidos() {
    return Array.from(formulario.elements).filter(function (elemento) {
        return elemento.willValidate && !elemento.checkValidity();
    });
}

// ======================================
// PREPARAÇÃO DE CADA TESTE
// ======================================

beforeAll(() => {
    // O jsdom não implementa o scrollIntoView usado em mostrarMensagem()
    Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
    const documentoOriginal = new DOMParser().parseFromString(HTML, "text/html");

    documentoOriginal.querySelectorAll("script").forEach(function (s) {
        s.remove();
    });

    document.body.innerHTML = documentoOriginal.body.innerHTML;

    jest.spyOn(console, "log").mockImplementation(() => {});
    Element.prototype.scrollIntoView.mockClear();

    // Carrega o script.js do zero, ligado ao novo formulário
    jest.resetModules();
    require("./script.js");

    formulario = campo("formCadastro");
    mensagem = campo("mensagem");
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ======================================
// CT01: TESTES FUNCIONAIS BÁSICOS (CAMINHO FELIZ)
// ======================================

describe("CT01 - Testes Funcionais Básicos (Caminho Feliz)", () => {

    test("1.1 Cadastro completo com todos os campos válidos, incluindo complemento", () => {
        preencher();

        expect(formulario.checkValidity()).toBe(true);

        enviar();

        esperarSucesso();

        const texto = textoMensagem();
        expect(texto).toContain("Ana Souza");
        expect(texto).toContain("Rua das Acácias");
        expect(texto).toContain("36300-000");
        expect(texto).toContain("São João del-Rei");
        expect(texto).toContain("MG");
        expect(texto).toContain("ana.souza@email.com");
        expect(texto).toContain("(32) 99999-1234");
        expect(texto).toContain("Atendente de Bilheteria");
        expect(texto).toContain("R$ 2.500,00");
        expect(texto).toContain("Manhã");

        expect(console.log).toHaveBeenCalledWith(
            "Funcionário cadastrado:",
            expect.objectContaining({
                nome: "Ana Carolina Souza",
                cargo: "Atendente de Bilheteria",
                turno: "Manhã",
                endereco: expect.objectContaining({ complemento: "Apto 12" })
            })
        );
    });

    test("1.2 Cadastro sem preencher o complemento (campo opcional)", () => {
        preencher({ complemento: "" });

        expect(formulario.checkValidity()).toBe(true);

        enviar();

        esperarSucesso();
    });

    test.each([
        "Atendente de Bilheteria",
        "Operador de Cinema",
        "Gerente de Unidade",
        "Atendente de Bomboniere",
        "Auxiliar Administrativo",
        "Supervisor de Atendimento"
    ])("1.3 Cadastro com o cargo: %s", (cargo) => {
        preencher({ cargo: cargo });

        enviar();

        esperarSucesso();
        expect(textoMensagem()).toContain(cargo);
    });

    test.each(["Manhã", "Tarde", "Noite"])(
        "1.4 Cadastro com o turno: %s",
        (turno) => {
            preencher({ turno: turno });

            enviar();

            esperarSucesso();
            expect(textoMensagem()).toContain(turno);
        }
    );
});

// ======================================
// CT02: VALIDAÇÃO DO NOME COMPLETO
// ======================================

describe("CT02 - Validação do Nome Completo", () => {

    test("2.1 Nome com acentos e espaços extras no início e no fim é aceito sem os espaços das pontas", () => {
        preencher({ nome: "  José   da Silva  " });

        enviar();

        esperarSucesso();

        expect(console.log).toHaveBeenCalledWith(
            "Funcionário cadastrado:",
            expect.objectContaining({ nome: "José   da Silva" })
        );
    });

    test("2.2 Nome com apenas uma palavra", () => {
        preencher({ nome: "Maria" });

        enviar();

        esperarErro("Informe seu nome completo corretamente.");
        expect(console.log).not.toHaveBeenCalled();
    });

    test("2.3 Sobrenome com apenas uma letra", () => {
        preencher({ nome: "Ana S" });

        enviar();

        esperarErro("Informe seu nome completo corretamente.");
    });

    // DEFEITO CONHECIDO (plano, caso 2.4): o código atual aceita nome só com números.
    // O teste descreve o comportamento CORRETO e, por isso, está marcado como
    // "failing": ele passa enquanto o defeito existir. Quando o defeito for
    // corrigido, o Jest avisará; então troque test.failing por test.
    test.failing("2.4 Nome formado apenas por números deveria ser rejeitado", () => {
        preencher({ nome: "123 456" });

        enviar();

        expect(mensagem.className).toContain("erro");
    });
});

// ======================================
// CT03: VALIDAÇÃO DO ENDEREÇO
// ======================================

describe("CT03 - Validação do Endereço (Rua, Número, Bairro e Cidade)", () => {

    test("3.1 Número igual a zero é bloqueado", () => {
        preencher({ numero: "0" });

        // Validação nativa do navegador (valor mínimo é 1)
        expect(campo("numero").validity.rangeUnderflow).toBe(true);
        expect(formulario.checkValidity()).toBe(false);

        // Proteção do JavaScript
        enviar();
        esperarErro("Preencha corretamente os campos do endereço.");
    });

    test("3.2 Número negativo ou decimal é bloqueado", () => {
        preencher({ numero: "-5" });

        expect(campo("numero").validity.rangeUnderflow).toBe(true);
        expect(formulario.checkValidity()).toBe(false);

        enviar();
        esperarErro("Preencha corretamente os campos do endereço.");

        preencher({ numero: "1.5" });

        expect(campo("numero").validity.stepMismatch).toBe(true);
        expect(formulario.checkValidity()).toBe(false);
    });

    test("3.3 Rua preenchida apenas com espaços", () => {
        preencher({ rua: "     " });

        enviar();

        esperarErro("Preencha corretamente os campos do endereço.");
    });

    test.each([
        ["bairro", "   "],
        ["cidade", "   "]
    ])("3.4 %s preenchido apenas com espaços", (id, valor) => {
        preencher({ [id]: valor });

        enviar();

        esperarErro("Preencha corretamente os campos do endereço.");
    });
});

// ======================================
// CT04: VALIDAÇÃO E MÁSCARA DO CEP
// ======================================

describe("CT04 - Validação e Máscara do CEP", () => {

    test("4.1 Máscara automática do CEP", () => {
        digitar("cep", "36300000");

        expect(campo("cep").value).toBe("36300-000");
    });

    test("4.2 CEP com menos de 8 dígitos", () => {
        // Obs.: o exemplo "3630-00" do plano tem 6 dígitos; aqui usamos 7 dígitos.
        preencher({ cep: "3630000" });

        enviar();

        esperarErro("Informe um CEP válido com 8 números.");
    });

    test("4.3 Letras e símbolos no CEP são removidos", () => {
        digitar("cep", "abc12#");

        expect(campo("cep").value).toBe("12");
    });

    test("4.4 CEP colado com mais de 8 dígitos mantém apenas 8 números", () => {
        digitar("cep", "363000001234");

        expect(campo("cep").value).toBe("36300-000");
    });
});

// ======================================
// CT05: VALIDAÇÃO E FORMATAÇÃO DO ESTADO (UF)
// ======================================

describe("CT05 - Validação e Formatação do Estado (UF)", () => {

    test("5.1 UF digitada em minúsculas vira maiúscula e é aceita", () => {
        digitar("estado", "mg");

        expect(campo("estado").value).toBe("MG");

        preencher({ estado: "mg" });
        enviar();

        esperarSucesso();
    });

    test("5.2 Sigla inexistente", () => {
        preencher({ estado: "XX" });

        enviar();

        esperarErro("Informe uma sigla de estado brasileiro válida.");
    });

    test("5.3 Números e símbolos na UF são removidos", () => {
        digitar("estado", "M1");
        expect(campo("estado").value).toBe("M");

        digitar("estado", "@#");
        expect(campo("estado").value).toBe("");
    });

    test("5.4 UF com apenas 1 letra", () => {
        preencher({ estado: "M" });

        enviar();

        esperarErro("Informe uma sigla de estado brasileiro válida.");
    });

    test.each(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
        "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS",
        "RO", "RR", "SC", "SP", "SE", "TO"])("5.5 UF brasileira válida é aceita: %s", (uf) => {
        preencher({ estado: uf });

        enviar();

        esperarSucesso();
    });
});

// ======================================
// CT06: VALIDAÇÃO DO E-MAIL
// ======================================

describe("CT06 - Validação do E-mail", () => {

    test("6.1 E-mail válido", () => {
        preencher({ email: "ana.souza@email.com" });

        enviar();

        esperarSucesso();
        expect(textoMensagem()).toContain("ana.souza@email.com");
    });

    test("6.2 E-mail sem o símbolo @", () => {
        preencher({ email: "anaemail.com" });

        // Validação nativa do navegador
        expect(campo("email").validity.typeMismatch).toBe(true);
        expect(formulario.checkValidity()).toBe(false);

        // Proteção do JavaScript
        enviar();
        esperarErro("Informe um endereço de e-mail válido.");
    });

    test("6.3 E-mail sem domínio completo (sem ponto)", () => {
        preencher({ email: "ana@email" });

        enviar();

        esperarErro("Informe um endereço de e-mail válido.");
    });

    test("6.4 E-mail com espaço no meio", () => {
        preencher({ email: "ana souza@email.com" });

        enviar();

        esperarErro("Informe um endereço de e-mail válido.");
    });
});

// ======================================
// CT07: VALIDAÇÃO E MÁSCARA DO TELEFONE
// ======================================

describe("CT07 - Validação e Máscara do Telefone", () => {

    test("7.1 Celular com 11 dígitos", () => {
        digitar("telefone", "32999991234");

        expect(campo("telefone").value).toBe("(32) 99999-1234");

        preencher({ telefone: "32999991234" });
        enviar();

        esperarSucesso();
    });

    test("7.2 Telefone fixo com 10 dígitos", () => {
        digitar("telefone", "3233331234");

        expect(campo("telefone").value).toBe("(32) 3333-1234");

        preencher({ telefone: "3233331234" });
        enviar();

        esperarSucesso();
    });

    test("7.3 Telefone com 9 dígitos", () => {
        preencher({ telefone: "329999123" });

        enviar();

        esperarErro("Informe um telefone válido com DDD.");
    });

    test("7.4 Letras no telefone são ignoradas e a máscara é aplicada", () => {
        digitar("telefone", "abc(32)99999-1234");

        expect(campo("telefone").value).toBe("(32) 99999-1234");
        expect(campo("telefone").value).not.toMatch(/[a-zA-Z]/);
    });
});

// ======================================
// CT08: INFORMAÇÕES PROFISSIONAIS
// ======================================

describe("CT08 - Informações Profissionais (Cargo, Salário e Turno)", () => {

    test("8.1 Máscara automática do salário em reais", () => {
        digitar("salario", "250000");

        expect(campo("salario").value.replace(/\u00a0/g, " ")).toBe("R$ 2.500,00");
    });

    test("8.2 Salário igual a zero", () => {
        preencher({ salario: "0" });

        enviar();

        esperarErro("Informe um salário maior que zero.");
    });

    test("8.3 Cargo não selecionado", () => {
        preencher({ cargo: "" });

        // Validação nativa do navegador
        expect(campo("cargo").validity.valueMissing).toBe(true);
        expect(formulario.checkValidity()).toBe(false);

        // Proteção do JavaScript
        enviar();
        esperarErro("Selecione um cargo para o funcionário.");
    });

    test("8.4 Turno não selecionado", () => {
        preencher({ turno: null });

        // Validação nativa do navegador
        expect(formulario.checkValidity()).toBe(false);

        // Proteção do JavaScript
        enviar();
        esperarErro("Selecione um turno de trabalho.");
    });
});

// ======================================
// CT09: CAMPOS OBRIGATÓRIOS EM BRANCO (CAMINHO DE FALHA)
// ======================================

describe("CT09 - Campos Obrigatórios em Branco", () => {

    test("9.1 Formulário totalmente vazio é bloqueado e o primeiro campo inválido é o nome", () => {
        expect(formulario.checkValidity()).toBe(false);
        expect(camposInvalidos()[0].id).toBe("nome");

        enviar();

        expect(mensagem.className).toContain("erro");
        expect(console.log).not.toHaveBeenCalled();
    });

    test("9.2 Apenas o nome em branco", () => {
        preencher({ nome: "" });

        expect(formulario.checkValidity()).toBe(false);
        expect(camposInvalidos()[0].id).toBe("nome");

        enviar();
        esperarErro("Informe seu nome completo corretamente.");
    });

    test("9.3 Apenas o e-mail em branco", () => {
        preencher({ email: "" });

        expect(formulario.checkValidity()).toBe(false);
        expect(camposInvalidos()[0].id).toBe("email");

        enviar();
        esperarErro("Informe um endereço de e-mail válido.");
    });

    test("9.4 Vários dados inválidos: aparece só a primeira mensagem da ordem de validação", () => {
        preencher({ nome: "Maria", cep: "123", estado: "XX" });

        enviar();

        esperarErro("Informe seu nome completo corretamente.");
    });
});

// ======================================
// CT10: VALOR LIMITE E DADOS EXTREMOS
// ======================================

describe("CT10 - Testes de Valor Limite e Dados Extremos", () => {

    test("10.1 Menor salário possível (R$ 0,01)", () => {
        preencher({ salario: "1" });

        enviar();

        esperarSucesso();
        expect(textoMensagem()).toContain("R$ 0,01");
    });

    test("10.2 Salário com muitos dígitos", () => {
        preencher({ salario: "999999999999" });

        expect(campo("salario").value.replace(/\u00a0/g, " ")).toBe("R$ 9.999.999.999,99");

        enviar();

        esperarSucesso();
        expect(textoMensagem()).toContain("R$ 9.999.999.999,99");
    });

    test("10.3 Nome e rua com textos muito longos", () => {
        const nomeLongo = "Maria ".repeat(25).trim();
        const ruaLonga = "Rua " + "X".repeat(196);

        preencher({ nome: nomeLongo, rua: ruaLonga });

        enviar();

        esperarSucesso();
        expect(textoMensagem()).toContain(ruaLonga);
    });

    test("10.4 Número da residência muito grande", () => {
        preencher({ numero: "99999999" });

        enviar();

        esperarSucesso();
        expect(textoMensagem()).toContain("99999999");
    });
});

// ======================================
// CT11: INTERFACE E COMPORTAMENTO (UI)
// ======================================

describe("CT11 - Interface e Comportamento (UI)", () => {

    test("11.1 O botão Limpar reseta os campos e remove a mensagem", () => {
        preencher({ nome: "Maria" });
        enviar();

        expect(mensagem.className).toContain("erro");

        formulario.reset();

        expect(mensagem.className).toBe("mensagem");
        expect(mensagem.textContent).toBe("");
        expect(campo("nome").value).toBe("");
        expect(campo("cargo").value).toBe("");
        expect(campo("salario").value).toBe("");
        expect(document.querySelector('input[name="turno"]:checked')).toBeNull();
    });

    test("11.2 A mensagem aparece imediatamente após o envio e a tela rola até ela", () => {
        preencher();

        enviar();

        expect(mensagem.className).toContain("sucesso");
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

        preencher({ nome: "Maria" });

        enviar();

        expect(mensagem.className).toContain("erro");
    });

    test("11.3 Proteção contra HTML: o texto digitado não é interpretado como código", () => {
        preencher({ nome: "<b>Ana</b> Silva" });

        enviar();

        esperarSucesso();
        expect(mensagem.querySelectorAll("b").length).toBe(0);
        expect(textoMensagem()).toContain("<b>Ana</b> Silva");
    });

    test("11.4 (parcial) O CSS reorganiza os campos em coluna em telas de até 700px", () => {
        const bloco = CSS.split("@media (max-width: 700px)")[1];

        expect(bloco).toBeDefined();
        expect(bloco).toMatch(/\.linha-campos\s*{[^}]*flex-direction:\s*column/);
        expect(bloco).toMatch(/\.botoes\s*{[^}]*flex-direction:\s*column-reverse/);
        expect(bloco).toMatch(/\.botoes button\s*{[^}]*width:\s*100%/);
    });

    test("11.6 O logotipo referenciado no HTML existe na pasta do projeto", () => {
        const logo = document.querySelector("img.logo");

        expect(logo).not.toBeNull();
        expect(fs.existsSync(path.join(__dirname, logo.getAttribute("src")))).toBe(true);
    });

    // Testes visuais: devem ser feitos manualmente, conforme o plano de teste.
    test.todo("11.4 Conferir visualmente a responsividade em 1366px, 768px e 375px");
    test.todo("11.5 Conferir navegação por teclado (Tab) e foco visível nos campos e turnos");
});