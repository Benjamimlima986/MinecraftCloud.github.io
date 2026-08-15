async function carregarVersoes() {
    try {
        const resposta = await fetch(
            "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
        );

        const dados = await resposta.json();

        const versoes = dados.versions;

        console.log("Total de versões:", versoes.length);
        console.log(versoes);

        return versoes;
    } catch (erro) {
        console.error("Erro ao carregar versões:", erro);
        return [];
    }
}
