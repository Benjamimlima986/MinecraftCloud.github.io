const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 8080;

const MINECRAFT_DIR = "/minecraft";
const CLIENT_JAR = path.join(MINECRAFT_DIR, "client.jar");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const versions = [
    "26.2",
    "26.1.2",
    "26.1.1",
    "26.1",
    "1.21.11",
    "1.21.10",
    "1.21.9",
    "1.21.8",
    "1.21.7",
    "1.21.6",
    "1.21.5",
    "1.21.4",
    "1.21.3",
    "1.21.2",
    "1.21.1",
    "1.21",
    "1.20.6",
    "1.20.5",
    "1.20.4",
    "1.20.3",
    "1.20.2",
    "1.20.1",
    "1.20"
];

app.get("/api/versions", (req, res) => {
    res.json(versions);
});

app.get("/api/status", (req, res) => {
    res.json({
        java: true,
        clientInstalled: fs.existsSync(CLIENT_JAR),
        running: minecraftProcess !== null
    });
});

let minecraftProcess = null;

app.post("/api/profile", (req, res) => {
    const name = String(req.body.name || "").trim();

    if (!name) {
        return res.status(400).json({
            error: "Digite um nome."
        });
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) {
        return res.status(400).json({
            error: "Nome inválido. Use 3-16 caracteres."
        });
    }

    const profile = {
        name,
        mode: "offline",
        createdAt: new Date().toISOString()
    };

    fs.writeFileSync(
        "/minecraft/profile.json",
        JSON.stringify(profile, null, 2)
    );

    res.json({
        ok: true,
        profile
    });
});

app.post("/api/start", (req, res) => {
    const version = String(req.body.version || "");
    
    if (!versions.includes(version)) {
        return res.status(400).json({
            error: "Versão inválida."
        });
    }

    if (!fs.existsSync(CLIENT_JAR)) {
        return res.status(400).json({
            error: "client.jar não está instalado no container."
        });
    }

    if (minecraftProcess) {
        return res.status(409).json({
            error: "Minecraft já está executando."
        });
    }

    console.log(`Iniciando Minecraft ${version}`);

    minecraftProcess = spawn(
        "java",
        [
            "-Xms1G",
            "-Xmx4G",
            "-jar",
            CLIENT_JAR
        ],
        {
            cwd: MINECRAFT_DIR,
            env: process.env
        }
    );

    minecraftProcess.stdout.on("data", data => {
        console.log("[Minecraft]", data.toString());
    });

    minecraftProcess.stderr.on("data", data => {
        console.error("[Minecraft]", data.toString());
    });

    minecraftProcess.on("close", code => {
        console.log("Minecraft finalizado:", code);
        minecraftProcess = null;
    });

    res.json({
        ok: true,
        message: `Minecraft ${version} iniciado.`
    });
});

app.post("/api/stop", (req, res) => {
    if (!minecraftProcess) {
        return res.json({
            ok: true,
            message: "Minecraft não está executando."
        });
    }

    minecraftProcess.kill("SIGTERM");

    res.json({
        ok: true,
        message: "Minecraft encerrando..."
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`CloudCraft rodando na porta ${PORT}`);
});raft rodando na porta ${PORT}`);
});
