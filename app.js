const OWNER = "MagicDippyEgg";
const REPO = "Minecraft-Version-Archive";

const versions = document.getElementById("versions");
const status = document.getElementById("status");
const search = document.getElementById("search");

let releases = [];

async function loadVersions() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=100`
    );

    if (!response.ok) {
      throw new Error(`GitHub HTTP ${response.status}`);
    }

    const data = await response.json();

    releases = data.filter(release =>
      release.assets.some(asset =>
        asset.name.toLowerCase() === "client.jar"
      )
    );

    renderVersions();

    status.textContent =
      `${releases.length} versões encontradas.`;

  } catch (error) {
    status.textContent =
      "Erro ao carregar versões: " + error.message;
  }
}

function renderVersions() {
  const query = search.value.toLowerCase();

  const filtered = releases.filter(release => {
    const name =
      release.name || release.tag_name || "";

    return name.toLowerCase().includes(query);
  });

  versions.innerHTML = filtered.map(release => {
    const name =
      release.name || release.tag_name;

    return `
      <article class="version">
        <h3>${escapeHTML(name)}</h3>

        <small>
          client.jar disponível
        </small>

        <button
          onclick="startMachine(${release.id})">
          Criar máquina
        </button>
      </article>
    `;
  }).join("");
}

async function startMachine(id) {
  const release = releases.find(x => x.id === id);

  if (!release) return;

  const version =
    release.name || release.tag_name;

  /*
   * Aqui entra a chamada para o Worker:
   *
   * POST /api/machine
   *
   * O Worker vai criar/obter o Container.
   */

  alert(
    `Máquina solicitada para Minecraft ${version}`
  );
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

search.addEventListener(
  "input",
  renderVersions
);

const modal =
  document.getElementById("loginModal");

document.getElementById("login")
  .onclick = () => modal.classList.add("open");

document.querySelector(".close")
  .onclick = () => modal.classList.remove("open");

loadVersions();
