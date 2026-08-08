document.addEventListener("DOMContentLoaded", () => {
    const cliInput = document.getElementById("cli-input");
    const outputHistory = document.getElementById("output-history");
    const terminalBody = document.getElementById("terminal-body");
    const preloader = document.getElementById("preloader");
    const progressFill = document.getElementById("progress-fill");
    const loaderStatus = document.getElementById("loader-status");
    const terminal = document.getElementById("terminal");
    const promptLine = document.getElementById("prompt-line");
    const promptPath = document.getElementById("prompt-path");
    const promptUser = document.getElementById("prompt-user");

    let commandHistory = [];
    let historyIndex = -1;
    let currentDir = "~";
    let username = "";
    let isWaitingForName = true;

    const bootSteps = [
        { progress: 25, status: "LOADING." },
        { progress: 50, status: "MOUNTING." },
        { progress: 85, status: "STARTING." },
        { progress: 100, status: "READY." }
    ];

    let stepIdx = 0;
    const bootInterval = setInterval(() => {
        if (stepIdx < bootSteps.length) {
            progressFill.style.width = bootSteps[stepIdx].progress + "%";
            loaderStatus.innerText = bootSteps[stepIdx].status;
            stepIdx++;
        } else {
            clearInterval(bootInterval);
            setTimeout(() => {
                preloader.style.opacity = "0";
                setTimeout(() => {
                    preloader.style.display = "none";
                    terminal.classList.remove("hidden");
                    startTypewriterIntro();
                }, 400);
            }, 200);
        }
    }, 220);

    const asciiLines = [
    " _______  _______ _________ _______  _______           _______  _    _________ _______  _______ ",
    "(  ____ \\(  ____ )\\__   __/(  ____ \\(  ____ \\|\\     /|(  ____ \\( \\   \\__   __/(  ____ \\(  ____ )",
    "| (    \\/| (    )|   ) (   | (    \\/| (    \\/| )   ( || (    \\/| (      ) (   | (    \\/| (    )|",
    "| (__    | (____)|   | |   | |      | (_____ | (___) || (__    | |      | |   | (__    | (____)|",
    "|  __)   |  _____)   | |   | |      (_____  )|  ___  ||  __)   | |      | |   |  __)   |  ___  )",
    "| (      | (         | |   | |            ) || (   ) || (      | |      | |   | (      | (   ) |",
    "| (____/\\| )      ___) (___| (____/\\/\\____) || )   ( || (____/\\| (____/\\| |   | (____/\\| )   ( |",
    "(_______/|/       \\_______/(_______/\\_______)|/     \\|(_______/(_______/)_(   (_______/|/     \\|"
];
    function startTypewriterIntro() {
        const asciiContainer = document.createElement("pre");
        asciiContainer.className = "ascii-art";
        outputHistory.appendChild(asciiContainer);

        let lineIdx = 0;

        function printAsciiLine() {
            if (lineIdx < asciiLines.length) {
                asciiContainer.textContent += (lineIdx === 0 ? "" : "\n") + asciiLines[lineIdx];
                scrollToBottom();
                lineIdx++;
                setTimeout(printAsciiLine, 60);
            } else {
                const promptNameNode = document.createElement("div");
                promptNameNode.className = "cmd-output";
                promptNameNode.innerHTML = `<p style="color: #00e5ff; margin-top: 0.5rem;">[SYSTEM INITIALIZED] Please enter your username to log in:</p>`;
                outputHistory.appendChild(promptNameNode);
                scrollToBottom();

                promptUser.innerText = "login";
                promptLine.classList.remove("hidden");
                cliInput.focus();
            }
        }

        printAsciiLine();
    }

    const directoryContent = {
        about: `
<div class="cmd-output">
  <div class="term-card">
    <p class="term-card-title">PROGRAMMING & HARDWARE </p>
    <p>Building at the intersection of embedded hardware and modern software. Work includes microcontrollers, PCB design, dynamic desktop tools, ML models, Quantum Computing and Ethical Hacking</p>
  </div>
</div>`,

        projects: `
<div class="cmd-output">
  <div class="term-card">
    <p class="term-card-title">01. Standalone Keyboard</p>
    <p>Custom KiCad PCB layout, hardware matrix debouncing, and custom firmware.</p>
    <p><a href="https://github.com/yajurrsharma/bitshift" target="_blank" class="term-link">[View Repo]</a></p>
  </div>
  <div class="term-card">
    <p class="term-card-title">EpicShelter</p>
    <p>EpicShelter is a lightweight, high-performance CLI backup engine built on FastCDC.</p>
    <p><a href="https://github.com/yajurrsharma/epic-shelter" class="term-link">[View Repo]</a></p>
  </div>
  <div class="term-card">
    <p class="term-card-title">03. Spotify Metadata & Extractor Tool</p>
    <p>Python desktop application for metadata scraping, album art injection, and automated audio fetching.</p>
    <p><a href="https://github.com/yajurrsharma/" target="_blank" class="term-link">[View Repo]</a></p>
  </div>
</div>`,

        skills: `
<div class="cmd-output">
  <table class="term-table">
    <tr><th>DOMAIN</th><th>STACK / TOOLING</th></tr>
    <tr><td>Languages</td><td>Python, C++, SQL, C, HTML, CSS.</td></tr>
    <tr><td>Hardware</td><td>Microcontrollers, PCB Design, 3D Modelling, Hardware Code</td></tr>
    <tr><td>ML & Tools</td><td>TensorFlow, Keras, Scikit-Learn, Linux CLI, Git, Bash, Hugging Face</td></tr>
  </table>
</div>`,

        contact: `
<div class="cmd-output">
  <p>• <b>GitHub:</b> <a href="https://github.com/yajurrsharma" class="term-link">github.com</a></p>
  <p>• <b>Email:</b> <a href="mailto:yajursharma@gmail.com" class="term-link">yajursharma@gmail.com</a></p>
</div>`
    };

    function executeCommand(cmdRaw) {
        const fullCmd = cmdRaw.trim();

        if (isWaitingForName) {
            username = fullCmd !== "" ? fullCmd.toLowerCase().replace(/\s+/g, "") : "guest";
            isWaitingForName = false;

            promptUser.innerText = `${username}@terminal`;

            const welcomeNode = document.createElement("div");
            welcomeNode.className = "history-block";
            welcomeNode.innerHTML = `
<div class="cmd-output" style="margin-top:0.4rem;">
  <p style="color: #ffaa00;">Welcome, <b>${escapeHtml(username)}</b>!</p>
  <p class="motd-sub">Type <span class="cmd-highlight">'ls'</span> to list directories or <span class="cmd-highlight">'cd &lt;dir&gt;'</span> to navigate. Type <span class="cmd-highlight">'help'</span> for commands.</p>
</div>`;
            outputHistory.appendChild(welcomeNode);
            scrollToBottom();
            return;
        }

        const parts = fullCmd.split(" ");
        const cmd = parts[0].toLowerCase();
        const arg = parts[1] ? parts[1].toLowerCase() : "";

        const historyBlock = document.createElement("div");
        historyBlock.className = "history-block";

        const echoLine = document.createElement("div");
        echoLine.className = "cmd-echo";
        echoLine.innerHTML = `<span class="prompt-user">${username}@terminal</span>:<span class="prompt-path">${currentDir}</span><span class="prompt-sym">$</span> <span>${escapeHtml(fullCmd)}</span>`;
        historyBlock.appendChild(echoLine);

        if (fullCmd === "") {
            outputHistory.appendChild(historyBlock);
            scrollToBottom();
            return;
        }

        if (cmd === "clear") {
            outputHistory.innerHTML = "";
            cliInput.value = "";
            return;
        }

        if (cmd === "cd") {
            if (arg === "" || arg === "~" || arg === "/") {
                currentDir = "~";
                promptPath.innerText = "~";
            } else if (arg === "..") {
                currentDir = "~";
                promptPath.innerText = "~";
            } else if (directoryContent[arg]) {
                currentDir = "~/" + arg;
                promptPath.innerText = currentDir;
                const outNode = document.createElement("div");
                outNode.innerHTML = directoryContent[arg];
                historyBlock.appendChild(outNode);
            } else {
                const errNode = document.createElement("div");
                errNode.className = "cmd-output";
                errNode.innerHTML = `<p style="color: #ff4d4d;">cd: no such directory: ${escapeHtml(arg)}</p>`;
                historyBlock.appendChild(errNode);
            }
            outputHistory.appendChild(historyBlock);
            scrollToBottom();
            return;
        }

        if (cmd === "ls") {
            const outNode = document.createElement("div");
            outNode.className = "cmd-output";
            if (currentDir === "~") {
                outNode.innerHTML = `
<p><span class="cmd-highlight">~/</span>  about/</p>
<p><span class="cmd-highlight">~/</span>  projects/</p>
<p><span class="cmd-highlight">~/</span>  skills/</p>
<p><span class="cmd-highlight">~/   </span>  contact/</p>`;
            } else {
                outNode.innerHTML = `<p>Directory contents loaded. Type <span class="cmd-highlight">'cd ..'</span> to return home.</p>`;
            }
            historyBlock.appendChild(outNode);
            outputHistory.appendChild(historyBlock);
            scrollToBottom();
            return;
        }

        if (cmd === "help") {
            const outNode = document.createElement("div");
            outNode.className = "cmd-output";
            outNode.innerHTML = `
<table class="term-table">
  <tr><th>COMMAND</th><th>DESCRIPTION</th></tr>
  <tr><td><span class="cmd-highlight">ls</span></td><td>List available directories</td></tr>
  <tr><td><span class="cmd-highlight">cd &lt;dir&gt;</span></td><td>Navigate into directory (about, projects, skills, contact)</td></tr>
  <tr><td><span class="cmd-highlight">cd ..</span></td><td>Return to root directory</td></tr>
  <tr><td><span class="cmd-highlight">whoami</span></td><td>Print current active session user</td></tr>
  <tr><td><span class="cmd-highlight">clear</span></td><td>Clear terminal screen buffer</td></tr>
</table>`;
            historyBlock.appendChild(outNode);
        } else if (cmd === "whoami") {
            const outNode = document.createElement("div");
            outNode.className = "cmd-output";
            outNode.innerHTML = `<p><span class="cmd-highlight">${escapeHtml(username)}</span></p>`;
            historyBlock.appendChild(outNode);
        } else if (directoryContent[cmd]) {
            currentDir = "~/" + cmd;
            promptPath.innerText = currentDir;
            const outNode = document.createElement("div");
            outNode.innerHTML = directoryContent[cmd];
            historyBlock.appendChild(outNode);
        } else {
            const errorNode = document.createElement("div");
            errorNode.className = "cmd-output";
            errorNode.innerHTML = `<p style="color: #ff4d4d;">zsh: command not found: ${escapeHtml(fullCmd)}. Type <span class="cmd-highlight">'ls'</span> or <span class="cmd-highlight">'help'</span>.</p>`;
            historyBlock.appendChild(errorNode);
        }

        outputHistory.appendChild(historyBlock);
        scrollToBottom();
    }

    function scrollToBottom() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    cliInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const val = cliInput.value;
            if (!isWaitingForName && val.trim() !== "") {
                commandHistory.push(val);
                historyIndex = commandHistory.length;
            }
            executeCommand(val);
            cliInput.value = "";
        } else if (e.key === "ArrowUp") {
            if (historyIndex > 0) {
                historyIndex--;
                cliInput.value = commandHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === "ArrowDown") {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                cliInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                cliInput.value = "";
            }
            e.preventDefault();
        }
    });

    terminalBody.addEventListener("click", () => {
        cliInput.focus();
    });
});