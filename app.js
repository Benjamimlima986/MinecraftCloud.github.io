// ============================================
// CloudCraft - app.js
// ============================================

const versionList = document.getElementById("versionList");
const search = document.getElementById("search");

const username = document.getElementById("username");
const createProfile = document.getElementById("createProfile");
const profileStatus = document.getElementById("profileStatus");

const overlay = document.getElementById("gameOverlay");
const gameTitle = document.getElementById("gameTitle");
const gameStatus = document.getElementById("gameStatus");
const closeGame = document.getElementById("closeGame");

let versions = [];
let profile = null;


// ============================================
// CARREGAR PERFIL SALVO
// ============================================

try {
    profile = JSON.parse(
        localStorage.getItem("cloudcraft_profile") || "null"
    );
} catch {
    profile = null;
}


// ============================================
// MOSTRAR PERFIL
// ============================================

function renderProfile() {

    if (!profile) {

        if (profileStatus) {
            profileStatus.textContent =
                "Nenhum perfil criado.";
        }

        return;
    }

    if (username) {
        username.value = profile.name;
    }

    if (profileStatus) {
        profileStatus.textContent =
            `Perfil: ${profile.name} • Offline`;
    }
}

renderProfile();


// ============================================
// CRIAR PERFIL OFFLINE
// ============================================

if (createProfile) {

    createProfile.addEventListener("click", async () => {

        const name =
            username.value.trim();

        if (!name) {
            alert("Digite um nome.");
            return;
        }

        if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) {

            alert(
                "O nome precisa ter entre 3 e 16 caracteres e usar apenas letras, números ou _. "
            );

            return;
        }

        createProfile.disabled = true;
        createProfile.textContent = "Criando...";

        try {

            const response = await fetch(
                "/api/profile",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: name
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Não foi possível criar o perfil."
                );
            }

            profile = data.profile;

            localStorage.setItem(
                "cloudcraft_profile",
                JSON.stringify(profile)
            );

            renderProfile();

            alert(
                `Perfil "${profile.name}" criado!`
            );

        } catch (error) {

            alert(
                error.message ||
                "Erro ao criar perfil."
            );

        } finally {

            createProfile.disabled = false;
            createProfile.textContent =
                "Criar perfil offline";
        }
    });
}


// ============================================
// CARREGAR VERSÕES
// ============================================

async function loadVersions() {

    if (!versionList) return;

    versionList.innerHTML = `
        <div class="loadingVersions">
            Carregando versões...
        </div>
    `;

    try {

        const response =
            await fetch("/api/versions", {
                cache: "no-store"
            });

        if (!response.ok) {
            throw new Error(
                "Servidor não conseguiu carregar as versões."
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "Resposta inválida do servidor."
            );
        }

        versions = data;

        renderVersions(versions);

    } catch (error) {

        console.error(error);

        versionList.innerHTML = `
            <div class="version-error">
                <strong>Erro ao carregar versões</strong>
                <br>
                <small>
                    ${escapeHTML(error.message)}
                </small>
                <br><br>
                <button onclick="loadVersions()">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}


// ============================================
// RENDERIZAR VERSÕES
// ============================================

function renderVersions(list) {

    if (!versionList) return;

    versionList.innerHTML = "";

    if (!list.length) {

        versionList.innerHTML = `
            <div class="version-empty">
                Nenhuma versão encontrada.
            </div>
        `;

        return;
    }

    for (const version of list) {

        const card =
            document.createElement("div");

        card.className = "version";

        card.innerHTML = `
            <div class="version-info">

                <div class="version-name">
                    Minecraft ${escapeHTML(version)}
                </div>

                <small>
                    Java Edition
                </small>

            </div>

            <button
                class="install-button"
                data-version="${escapeHTML(version)}"
            >
                Instalar
            </button>
        `;

        const button =
            card.querySelector(".install-button");

        button.addEventListener(
            "click",
            () => startMinecraft(version)
        );

        versionList.appendChild(card);
    }
}


// ============================================
// PESQUISA
// ============================================

if (search) {

    search.addEventListener("input", () => {

        const query =
            search.value
                .trim()
                .toLowerCase();

        const filtered =
            versions.filter(version =>
                String(version)
                    .toLowerCase()
                    .includes(query)
            );

        renderVersions(filtered);
    });
}


// ============================================
// INICIAR MINECRAFT
// ============================================

async function startMinecraft(version) {

    // ----------------------------------------
    // Verificar perfil
    // ----------------------------------------

    if (!profile) {

        alert(
            "Primeiro crie um perfil offline."
        );

        if (username) {
            username.focus();
        }

        return;
    }


    // ----------------------------------------
    // Mostrar tela de carregamento
    // ----------------------------------------

    showOverlay(
        `Minecraft ${version}`,
        "Verificando sua sessão..."
    );


    try {

        // ------------------------------------
        // Verificar estado do servidor
        // ------------------------------------

        const statusResponse =
            await fetch(
                "/api/status",
                {
                    cache: "no-store"
                }
            );

        if (!statusResponse.ok) {
            throw new Error(
                "Não foi possível conectar ao servidor."
            );
        }

        const status =
            await statusResponse.json();


        // ------------------------------------
        // Verificar client.jar
        // ------------------------------------

        if (!status.clientInstalled) {

            throw new Error(
                "O client.jar desta sessão ainda não está instalado."
            );
        }


        // ------------------------------------
        // Verificar se já está rodando
        // ------------------------------------

        if (status.running) {

            throw new Error(
                "Já existe uma sessão do Minecraft executando."
            );
        }


        // ------------------------------------
        // Informar usuário
        // ------------------------------------

        updateOverlay(
            `Minecraft ${version}`,
            "Iniciando o cliente..."
        );


        // ------------------------------------
        // Iniciar backend
        // ------------------------------------

        const response =
            await fetch(
                "/api/start",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        version: version,
                        profile: profile
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "O Minecraft não pôde ser iniciado."
            );
        }


        // ------------------------------------
        // Sucesso
        // ------------------------------------

        updateOverlay(
            `Minecraft ${version}`,
            "Minecraft iniciado. Abrindo sessão..."
        );


        /*
         * Neste ponto abrimos game.html.
         *
         * O streaming gráfico será conectado
         * posteriormente.
         */

        setTimeout(() => {

            window.location.href =
                `game.html?version=${encodeURIComponent(version)}`;

        }, 800);


    } catch (error) {

        console.error(
            "Erro ao iniciar Minecraft:",
            error
        );

        updateOverlay(
            "Erro",
            error.message ||
            "Não foi possível iniciar o Minecraft."
        );


        // botão para fechar continua disponível
    }
}


// ============================================
// OVERLAY
// ============================================

function showOverlay(title, message) {

    if (!overlay) return;

    overlay.classList.add("active");

    updateOverlay(
        title,
        message
    );
}


function updateOverlay(title, message) {

    if (gameTitle) {
        gameTitle.textContent = title;
    }

    if (gameStatus) {
        gameStatus.textContent = message;
    }
}


// ============================================
// FECHAR OVERLAY
// ============================================

if (closeGame) {

    closeGame.addEventListener("click", async () => {

        try {

            await fetch(
                "/api/stop",
                {
                    method: "POST"
                }
            );

        } catch (error) {

            console.error(
                "Erro ao parar Minecraft:",
                error
            );
        }

        if (overlay) {
            overlay.classList.remove("active");
        }
    });
}


// ============================================
// ESCAPE
// ============================================

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            if (
                overlay &&
                overlay.classList.contains("active")
            ) {
                overlay.classList.remove(
                    "active"
                );
            }
        }
    }
);


// ============================================
// ESCAPE HTML
// Evita inserir conteúdo inesperado
// ============================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================
// INICIAR
// ============================================

loadVersions();
