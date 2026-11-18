
// ELEMENTOS DO FORMULÁRIO

const formulario = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagem");

const telefone = document.getElementById("telefone");
const salario = document.getElementById("salario");
const cep = document.getElementById("cep");
const estado = document.getElementById("estado");


// ======================================
// 1. FUNÇÕES DE VALIDAÇÃO
// ======================================


// VALIDAÇÃO DO NOME COMPLETO

function validarNome(nome) {
    const partes = nome.trim().split(/\s+/);

    return partes.length >= 2 &&
        partes.every(parte => parte.length >= 2);
}


// VALIDAÇÃO DO E-MAIL

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
}


// VALIDAÇÃO DO TELEFONE

function validarTelefone(numero) {
    const numeros = numero.replace(/\D/g, "");

    return numeros.length === 10 || numeros.length === 11;
}


// VALIDAÇÃO DO CEP

function validarCEP(valor) {
    const numeros = valor.replace(/\D/g, "");

    return numeros.length === 8;
}


// VALIDAÇÃO DO ESTADO

function validarEstado(uf) {
    const estados = [
        "AC", "AL", "AP", "AM", "BA", "CE",
        "DF", "ES", "GO", "MA", "MT", "MS",
        "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC",
        "SP", "SE", "TO"
    ];

    return estados.includes(uf.trim().toUpperCase());
}


// VALIDAÇÃO DO SALÁRIO

function validarSalario(valor) {
    const numeros = valor.replace(/\D/g, "");
    const numero = Number(numeros) / 100;

    return Number.isFinite(numero) && numero > 0;
}


// ======================================
// 2. FORMATAÇÃO DOS CAMPOS
// ======================================


// FORMATAÇÃO DO TELEFONE

telefone.addEventListener("input", function () {

    let valor = telefone.value.replace(/\D/g, "");

    valor = valor.substring(0, 11);

    if (valor.length <= 10) {

        valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");

        valor = valor.replace(/(\d{4})(\d)/, "$1-$2");

    } else {

        valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");

        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

    }

    telefone.value = valor;

});


// FORMATAÇÃO DO CEP

cep.addEventListener("input", function () {

    let valor = cep.value.replace(/\D/g, "");

    valor = valor.substring(0, 8);

    if (valor.length > 5) {

        valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

    }

    cep.value = valor;

});


// FORMATAÇÃO DO ESTADO

estado.addEventListener("input", function () {

    estado.value = estado.value
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase();

});


// FORMATAÇÃO DO SALÁRIO EM REAIS

salario.addEventListener("input", function () {

    let valor = salario.value.replace(/\D/g, "");

    if (valor === "") {

        salario.value = "";

        return;

    }

    valor = Number(valor) / 100;

    salario.value = valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

});


// ======================================
// 3. EXIBIÇÃO DE MENSAGENS
// ======================================

function mostrarMensagem(tipo, texto) {

    mensagem.className = "mensagem " + tipo;

    mensagem.innerHTML = texto;

    mensagem.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


// PROTEÇÃO CONTRA INSERÇÃO DE HTML

function escaparHTML(texto) {

    return String(texto).replace(/[&<>"']/g, function (caractere) {

        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return caracteres[caractere];

    });

}


// ======================================
// 4. CADASTRO DO FUNCIONÁRIO
// ======================================

formulario.addEventListener("submit", function (event) {

    event.preventDefault();


    // CAPTURA DOS DADOS PESSOAIS

    const nome = document.getElementById("nome").value.trim();

    const rua = document.getElementById("rua").value.trim();

    const numero = document.getElementById("numero").value;

    const bairro = document.getElementById("bairro").value.trim();

    const cidade = document.getElementById("cidade").value.trim();

    const uf = estado.value.trim().toUpperCase();

    const cepFuncionario = cep.value.trim();

    const complemento = document.getElementById("complemento").value.trim();

    const email = document.getElementById("email").value.trim();

    const numeroTelefone = telefone.value;


    // CAPTURA DAS INFORMAÇÕES PROFISSIONAIS

    const cargo = document.getElementById("cargo").value;

    const salarioFuncionario = salario.value;

    const turno = document.querySelector(
        'input[name="turno"]:checked'
    );


    // ======================================
    // 5. VERIFICAÇÃO DOS CAMPOS
    // ======================================


    // NOME

    if (!validarNome(nome)) {

        mostrarMensagem(
            "erro",
            "Informe seu nome completo corretamente."
        );

        return;

    }


    // ENDEREÇO

    if (!rua || !numero || Number(numero) <= 0 || !bairro || !cidade) {

        mostrarMensagem(
            "erro",
            "Preencha corretamente os campos do endereço."
        );

        return;

    }


    // CEP

    if (!validarCEP(cepFuncionario)) {

        mostrarMensagem(
            "erro",
            "Informe um CEP válido com 8 números."
        );

        return;

    }


    // ESTADO

    if (!validarEstado(uf)) {

        mostrarMensagem(
            "erro",
            "Informe uma sigla de estado brasileiro válida."
        );

        return;

    }


    // E-MAIL

    if (!validarEmail(email)) {

        mostrarMensagem(
            "erro",
            "Informe um endereço de e-mail válido."
        );

        return;

    }


    // TELEFONE

    if (!validarTelefone(numeroTelefone)) {

        mostrarMensagem(
            "erro",
            "Informe um telefone válido com DDD."
        );

        return;

    }


    // CARGO

    if (!cargo) {

        mostrarMensagem(
            "erro",
            "Selecione um cargo para o funcionário."
        );

        return;

    }


    // SALÁRIO

    if (!validarSalario(salarioFuncionario)) {

        mostrarMensagem(
            "erro",
            "Informe um salário maior que zero."
        );

        return;

    }


    // TURNO

    if (!turno) {

        mostrarMensagem(
            "erro",
            "Selecione um turno de trabalho."
        );

        return;

    }


    // ======================================
    // 6. OBJETO DO FUNCIONÁRIO
    // ======================================

    const valorSalario = Number(
        salarioFuncionario.replace(/\D/g, "")
    ) / 100;

    const funcionario = {

        nome: nome,

        endereco: {
            rua: rua,
            numero: numero,
            bairro: bairro,
            cep: cepFuncionario,
            cidade: cidade,
            estado: uf,
            complemento: complemento
        },

        email: email,

        telefone: numeroTelefone,

        cargo: cargo,

        salario: valorSalario.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }),

        turno: turno.value

    };


    // ======================================
    // 7. CONFIRMAÇÃO DO CADASTRO
    // ======================================

    mostrarMensagem(
        "sucesso",

        `
            <strong>✓ Cadastro realizado com sucesso!</strong>

            <br><br>

            <strong>Funcionário:</strong>
            ${escaparHTML(funcionario.nome)}

            <br>

            <strong>Endereço:</strong>
            ${escaparHTML(funcionario.endereco.rua)},
            ${escaparHTML(funcionario.endereco.numero)}
            - ${escaparHTML(funcionario.endereco.bairro)}

            <br>

            <strong>CEP:</strong>
            ${escaparHTML(funcionario.endereco.cep)}

            <br>

            <strong>Cidade:</strong>
            ${escaparHTML(funcionario.endereco.cidade)}
            - ${escaparHTML(funcionario.endereco.estado)}

            <br>

            <strong>E-mail:</strong>
            ${escaparHTML(funcionario.email)}

            <br>

            <strong>Telefone:</strong>
            ${escaparHTML(funcionario.telefone)}

            <br>

            <strong>Cargo:</strong>
            ${escaparHTML(funcionario.cargo)}

            <br>

            <strong>Salário:</strong>
            ${escaparHTML(funcionario.salario)}

            <br>

            <strong>Turno:</strong>
            ${escaparHTML(funcionario.turno)}

            <br><br>

            Os dados foram validados e o cadastro foi simulado!
        `
    );


    // EXIBE OS DADOS NO CONSOLE

    console.log("Funcionário cadastrado:", funcionario);

});


// ======================================
// 8. LIMPEZA DO FORMULÁRIO
// ======================================

formulario.addEventListener("reset", function () {

    mensagem.className = "mensagem";

    mensagem.textContent = "";

});