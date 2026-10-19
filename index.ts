import { patterns, safePath, shellQuote as q } from "./quote";

export type Values = Record<string, string | boolean>;
export interface Field {
  key: string;
  label: string;
  type: "text" | "number" | "checkbox" | "select";
  placeholder?: string;
  help?: string;
  required?: boolean;
  default?: string | boolean;
  options?: { value: string; label: string }[];
}
export interface BuildResult {
  command: string;
  errors: string[];
  explanations: string[];
  warnings: string[];
}
export interface BuilderDef {
  slug: string;
  title: string;
  description: string;
  platforms: string[];
  fields: Field[];
  build: (v: Values) => BuildResult;
}

const s = (v: Values, k: string) => (typeof v[k] === "string" ? (v[k] as string).trim() : "");
const b = (v: Values, k: string) => v[k] === true;
const result = (): BuildResult => ({ command: "", errors: [], explanations: [], warnings: [] });
const port = (n: string) => /^\d+$/.test(n) && Number(n) >= 1 && Number(n) <= 65535;

const gitClone: BuilderDef = {
  slug: "git-clone", title: "Git clone", description: "Copy a repository, optionally a single branch or shallow history.", platforms: ["linux", "macos", "windows", "termux"],
  fields: [
    { key: "url", label: "Repository URL", type: "text", required: true, placeholder: "https://github.com/user/repo.git" },
    { key: "directory", label: "Target directory (optional)", type: "text" },
    { key: "branch", label: "Branch (optional)", type: "text" },
    { key: "depth", label: "Shallow depth (optional)", type: "number", help: "1 downloads only the latest snapshot." },
    { key: "recursive", label: "Include submodules", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!patterns.gitUrl.test(s(v, "url"))) r.errors.push("Enter an https://, ssh:// or git@ repository URL without spaces or shell characters.");
    if (s(v, "directory") && !safePath(s(v, "directory"))) r.errors.push("Directory must not start with '-' or contain control characters.");
    if (s(v, "branch") && !patterns.ref.test(s(v, "branch"))) r.errors.push("Branch name contains invalid characters.");
    if (s(v, "depth") && !/^[1-9]\d{0,5}$/.test(s(v, "depth"))) r.errors.push("Depth must be a positive whole number.");
    if (r.errors.length) return r;
    const p = ["git clone"];
    if (b(v, "recursive")) { p.push("--recurse-submodules"); r.explanations.push("--recurse-submodules also clones submodules."); }
    if (s(v, "branch")) { p.push("--branch", q(s(v, "branch"))); r.explanations.push("--branch checks out that branch instead of the default."); }
    if (s(v, "depth")) { p.push("--depth", s(v, "depth")); r.explanations.push("--depth limits history, which is faster but hides older commits."); }
    p.push(q(s(v, "url"))); if (s(v, "directory")) p.push(q(s(v, "directory")));
    r.command = p.join(" ");
    return r;
  },
};

const gitCommit: BuilderDef = {
  slug: "git-commit", title: "Git commit", description: "Commit with a message and common options.", platforms: ["linux", "macos", "windows", "termux"],
  fields: [
    { key: "message", label: "Commit message", type: "text", required: true, placeholder: "Fix login redirect" },
    { key: "all", label: "Stage all tracked changes (-a)", type: "checkbox" },
    { key: "signoff", label: "Add Signed-off-by (-s)", type: "checkbox" },
    { key: "amend", label: "Amend the previous commit", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!s(v, "message") && !b(v, "amend")) r.errors.push("A commit message is required.");
    if (s(v, "message").length > 200) r.warnings.push("Subject lines over ~72 characters are hard to read in logs.");
    if (r.errors.length) return r;
    const p = ["git commit"];
    if (b(v, "all")) { p.push("-a"); r.explanations.push("-a stages modified and deleted tracked files; new files are not included."); }
    if (b(v, "signoff")) { p.push("-s"); r.explanations.push("-s appends a Signed-off-by trailer."); }
    if (b(v, "amend")) { p.push("--amend"); r.warnings.push("--amend rewrites the last commit. Avoid it if the commit was already pushed to a shared branch."); }
    if (s(v, "message")) p.push("-m", q(s(v, "message")));
    else p.push("--no-edit");
    r.command = p.join(" ");
    return r;
  },
};

const gitBranch: BuilderDef = {
  slug: "git-branch", title: "Git branch", description: "Create, switch, rename or delete branches.", platforms: ["linux", "macos", "windows", "termux"],
  fields: [
    { key: "action", label: "Action", type: "select", default: "create", options: [
      { value: "create", label: "Create and switch" }, { value: "switch", label: "Switch" }, { value: "rename", label: "Rename current branch" },
      { value: "delete", label: "Delete (merged only)" }, { value: "force-delete", label: "Delete (force)" } ] },
    { key: "name", label: "Branch name", type: "text", required: true, placeholder: "feature/search" },
    { key: "from", label: "Start point (create only, optional)", type: "text" },
  ],
  build(v) {
    const r = result();
    const a = s(v, "action");
    if (!patterns.ref.test(s(v, "name"))) r.errors.push("Enter a valid branch name (letters, numbers, . _ / -; no leading '-').");
    if (s(v, "from") && !patterns.ref.test(s(v, "from"))) r.errors.push("Start point contains invalid characters.");
    if (r.errors.length) return r;
    const n = q(s(v, "name"));
    if (a === "create") { r.command = `git switch -c ${n}${s(v, "from") ? " " + q(s(v, "from")) : ""}`; r.explanations.push("switch -c creates the branch and moves to it (Git 2.23+)."); }
    else if (a === "switch") r.command = `git switch ${n}`;
    else if (a === "rename") { r.command = `git branch -m ${n}`; r.explanations.push("-m renames the branch you are currently on."); }
    else if (a === "delete") { r.command = `git branch -d ${n}`; r.explanations.push("-d refuses to delete unmerged branches."); }
    else { r.command = `git branch -D ${n}`; r.warnings.push("-D deletes the branch even if unmerged. Unmerged commits may become hard to recover."); }
    return r;
  },
};

const npmSetup: BuilderDef = {
  slug: "npm-setup", title: "npm project setup", description: "Create a folder, initialize package.json and install packages.", platforms: ["linux", "macos", "windows", "termux"],
  fields: [
    { key: "dir", label: "Project folder", type: "text", required: true, placeholder: "my-app" },
    { key: "deps", label: "Dependencies (space-separated)", type: "text", placeholder: "express zod" },
    { key: "devDeps", label: "Dev dependencies (space-separated)", type: "text", placeholder: "typescript vitest" },
  ],
  build(v) {
    const r = result();
    const dir = s(v, "dir");
    if (!patterns.dirName.test(dir) || dir.includes("..")) r.errors.push("Folder name is invalid.");
    const list = (k: string) => s(v, k).split(/\s+/).filter(Boolean);
    for (const name of [...list("deps"), ...list("devDeps")]) if (!patterns.pkg.test(name)) r.errors.push(`Invalid package name: ${name}`);
    if (r.errors.length) return r;
    const cmds = [`mkdir -p ${q(dir)}`, `cd ${q(dir)}`, "npm init -y"];
    r.explanations.push("mkdir -p creates the folder; npm init -y writes a default package.json.");
    if (list("deps").length) cmds.push(`npm install ${list("deps").join(" ")}`);
    if (list("devDeps").length) cmds.push(`npm install -D ${list("devDeps").join(" ")}`);
    r.command = cmds.join(" && ");
    r.warnings.push("Check package names carefully; look-alike names on npm can be malicious.");
    return r;
  },
};

const nodeServer: BuilderDef = {
  slug: "node-server", title: "Node.js server start", description: "Start a Node.js script with a port and optional watch mode.", platforms: ["linux", "macos", "termux"],
  fields: [
    { key: "file", label: "Entry file", type: "text", required: true, default: "server.js" },
    { key: "port", label: "PORT (optional)", type: "number", placeholder: "3000" },
    { key: "watch", label: "Restart on file changes (--watch)", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!safePath(s(v, "file"))) r.errors.push("Enter a valid file path.");
    if (s(v, "port") && !port(s(v, "port"))) r.errors.push("Port must be 1-65535.");
    if (r.errors.length) return r;
    r.command = `${s(v, "port") ? `PORT=${s(v, "port")} ` : ""}node${b(v, "watch") ? " --watch" : ""} ${q(s(v, "file"))}`;
    if (s(v, "port")) r.explanations.push("PORT is read in your code via process.env.PORT.");
    if (b(v, "watch")) r.explanations.push("--watch needs Node 18.11 or newer.");
    if (s(v, "port") && Number(s(v, "port")) < 1024) r.warnings.push("Ports below 1024 usually need elevated privileges, and are unavailable in Termux without root.");
    return r;
  },
};

const pythonVenv: BuilderDef = {
  slug: "python-venv", title: "Python virtual environment", description: "Create, activate and populate a venv.", platforms: ["linux", "macos", "windows", "termux"],
  fields: [
    { key: "dir", label: "Folder", type: "text", default: ".venv", required: true },
    { key: "python", label: "Python command", type: "select", default: "python3", options: [{ value: "python3", label: "python3" }, { value: "python", label: "python" }, { value: "py", label: "py (Windows)" }] },
    { key: "shell", label: "Activate for", type: "select", default: "posix", options: [{ value: "posix", label: "Linux / macOS / Termux" }, { value: "cmd", label: "Windows cmd" }, { value: "ps", label: "Windows PowerShell" }] },
    { key: "requirements", label: "Install requirements.txt", type: "checkbox" },
    { key: "upgradePip", label: "Upgrade pip", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!patterns.dirName.test(s(v, "dir")) || s(v, "dir").includes("..")) r.errors.push("Folder name is invalid.");
    if (r.errors.length) return r;
    const d = q(s(v, "dir")); const py = s(v, "python") || "python3";
    const act = s(v, "shell") === "cmd" ? `${s(v, "dir")}\\Scripts\\activate` : s(v, "shell") === "ps" ? `${s(v, "dir")}\\Scripts\\Activate.ps1` : `source ${d}/bin/activate`;
    const lines = [`${py} -m venv ${d}`, act];
    r.explanations.push("venv creates an isolated environment; activating it points python and pip at that folder.");
    if (b(v, "upgradePip")) lines.push("python -m pip install --upgrade pip");
    if (b(v, "requirements")) lines.push("pip install -r requirements.txt");
    r.command = lines.join("\n");
    r.warnings.push("Add the folder to .gitignore. PowerShell may require: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned.");
    return r;
  },
};

const dockerRun: BuilderDef = {
  slug: "docker-run", title: "Docker run", description: "Build a docker run command with ports, volumes and environment variables.", platforms: ["linux", "macos", "windows"],
  fields: [
    { key: "image", label: "Image", type: "text", required: true, placeholder: "nginx:alpine" },
    { key: "name", label: "Container name (optional)", type: "text" },
    { key: "port", label: "Port mapping (optional)", type: "text", placeholder: "8080:80", help: "Use 127.0.0.1:8080:80 to keep it private." },
    { key: "env", label: "Environment variable (optional)", type: "text", placeholder: "NODE_ENV=production", help: "Do not put secrets here; they end up in shell history." },
    { key: "volume", label: "Volume (optional)", type: "text", placeholder: "mydata:/data" },
    { key: "restart", label: "Restart policy", type: "select", default: "", options: [{ value: "", label: "None" }, { value: "unless-stopped", label: "unless-stopped" }, { value: "on-failure", label: "on-failure" }] },
    { key: "detach", label: "Run in background (-d)", type: "checkbox", default: true },
    { key: "rm", label: "Remove when it exits (--rm)", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!patterns.image.test(s(v, "image"))) r.errors.push("Enter a valid image name, e.g. nginx:alpine.");
    if (s(v, "name") && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(s(v, "name"))) r.errors.push("Container name is invalid.");
    if (s(v, "port") && !patterns.portMap.test(s(v, "port"))) r.errors.push("Port mapping must look like 8080:80.");
    if (s(v, "env") && !patterns.envPair.test(s(v, "env"))) r.errors.push("Environment variable must be KEY=value.");
    if (s(v, "volume") && (!/^[^\s:]+:[^\s:]+(:(ro|rw))?$/.test(s(v, "volume")) || s(v, "volume").startsWith("-"))) r.errors.push("Volume must look like source:/path[:ro].");
    if (r.errors.length) return r;
    const p = ["docker run"];
    if (b(v, "detach")) { p.push("-d"); r.explanations.push("-d runs the container in the background."); }
    if (b(v, "rm")) { p.push("--rm"); r.explanations.push("--rm deletes the container when it stops."); }
    if (s(v, "name")) p.push("--name", s(v, "name"));
    if (s(v, "port")) { p.push("-p", s(v, "port")); r.explanations.push("-p publishes a container port on the host."); if (!s(v, "port").startsWith("127.0.0.1")) r.warnings.push("This port is reachable from other machines on your network. Prefix 127.0.0.1: to keep it local."); }
    if (s(v, "env")) p.push("-e", q(s(v, "env")));
    if (s(v, "volume")) { p.push("-v", q(s(v, "volume"))); if (s(v, "volume").startsWith("/") && !s(v, "volume").endsWith(":ro")) r.warnings.push("A writable host path mount lets the container modify your files. Consider :ro."); }
    if (s(v, "restart")) p.push("--restart", s(v, "restart"));
    p.push(s(v, "image"));
    r.command = p.join(" ");
    return r;
  },
};

const ssh: BuilderDef = {
  slug: "ssh", title: "SSH connection", description: "Connect with a user, port and identity file.", platforms: ["linux", "macos", "windows", "termux"],
  fields: [
    { key: "user", label: "Username", type: "text", required: true, placeholder: "deploy" },
    { key: "host", label: "Host or IP", type: "text", required: true, placeholder: "203.0.113.10" },
    { key: "port", label: "Port (optional)", type: "number", placeholder: "22" },
    { key: "identity", label: "Identity file (optional)", type: "text", placeholder: "~/.ssh/id_ed25519" },
    { key: "verbose", label: "Verbose output (-v)", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!patterns.user.test(s(v, "user"))) r.errors.push("Username is invalid.");
    if (!patterns.host.test(s(v, "host"))) r.errors.push("Host must be a hostname or IP address.");
    if (s(v, "port") && !port(s(v, "port"))) r.errors.push("Port must be 1-65535.");
    if (s(v, "identity") && !safePath(s(v, "identity"))) r.errors.push("Identity path is invalid.");
    if (r.errors.length) return r;
    const p = ["ssh"];
    if (b(v, "verbose")) { p.push("-v"); r.explanations.push("-v prints debugging details about key selection."); }
    if (s(v, "port")) { p.push("-p", s(v, "port")); r.explanations.push("-p sets the server port (lowercase for ssh, uppercase -P for scp)."); }
    if (s(v, "identity")) { p.push("-i", s(v, "identity").startsWith("~/") ? "~/" + q(s(v, "identity").slice(2)) : q(s(v, "identity"))); r.explanations.push("-i selects which private key to offer."); }
    p.push(`${s(v, "user")}@${s(v, "host")}`);
    r.command = p.join(" ");
    r.warnings.push("Verify the host fingerprint on first connection. Termux's own sshd uses port 8022.");
    return r;
  },
};

const rsync: BuilderDef = {
  slug: "rsync", title: "rsync transfer", description: "Sync a folder to a local or remote destination.", platforms: ["linux", "macos", "termux"],
  fields: [
    { key: "src", label: "Source", type: "text", required: true, placeholder: "./dist/" },
    { key: "dest", label: "Destination", type: "text", required: true, placeholder: "deploy@203.0.113.10:/var/www/app/" },
    { key: "dry", label: "Dry run (preview only)", type: "checkbox", default: true },
    { key: "compress", label: "Compress (-z)", type: "checkbox", default: true },
    { key: "del", label: "Delete extra files at destination", type: "checkbox" },
  ],
  build(v) {
    const r = result();
    if (!safePath(s(v, "src"))) r.errors.push("Source path is invalid.");
    if (!safePath(s(v, "dest"))) r.errors.push("Destination path is invalid.");
    if (r.errors.length) return r;
    const p = ["rsync", b(v, "compress") ? "-avz" : "-av"];
    r.explanations.push("-a preserves permissions and times, -v is verbose.");
    if (b(v, "dry")) { p.push("--dry-run"); r.explanations.push("--dry-run shows what would change without changing anything."); }
    if (b(v, "del")) { p.push("--delete"); r.warnings.push("--delete removes files at the destination that do not exist in the source. Run with --dry-run first."); }
    p.push(q(s(v, "src")), q(s(v, "dest")));
    r.command = p.join(" ");
    if (s(v, "src") && !s(v, "src").endsWith("/")) r.warnings.push("Without a trailing slash on the source, rsync copies the folder itself into the destination.");
    return r;
  },
};

const fileOps: BuilderDef = {
  slug: "file-ops", title: "File and directory operations", description: "Create, copy, move or delete files safely.", platforms: ["linux", "macos", "termux"],
  fields: [
    { key: "op", label: "Operation", type: "select", default: "mkdir", options: [
      { value: "mkdir", label: "Create directory" }, { value: "cp", label: "Copy" }, { value: "mv", label: "Move / rename" }, { value: "rm", label: "Delete file" }, { value: "rmdir", label: "Delete directory recursively" } ] },
    { key: "a", label: "Path", type: "text", required: true, placeholder: "projects/app" },
    { key: "b", label: "Target (copy / move)", type: "text" },
  ],
  build(v) {
    const r = result();
    const op = s(v, "op");
    if (!safePath(s(v, "a"))) r.errors.push("Path is invalid.");
    if ((op === "cp" || op === "mv") && !safePath(s(v, "b"))) r.errors.push("Target is required for copy and move.");
    if (["/", "~", ".", "..", "*"].includes(s(v, "a")) && (op === "rm" || op === "rmdir")) r.errors.push("Refusing to build a delete command for that path.");
    if (r.errors.length) return r;
    const a = q(s(v, "a")); const t = q(s(v, "b"));
    if (op === "mkdir") { r.command = `mkdir -p ${a}`; r.explanations.push("-p creates parent folders and does not fail if it exists."); }
    else if (op === "cp") { r.command = `cp -r -i ${a} ${t}`; r.explanations.push("-r copies folders, -i asks before overwriting."); }
    else if (op === "mv") { r.command = `mv -i ${a} ${t}`; r.explanations.push("-i asks before overwriting."); }
    else if (op === "rm") { r.command = `rm -i ${a}`; r.warnings.push("Deleted files cannot be recovered from a trash folder."); }
    else { r.command = `rm -ri ${a}`; r.warnings.push("Recursive deletion is permanent. Confirm the path before pressing Enter; -i prompts for each item."); }
    return r;
  },
};

export const BUILDERS: BuilderDef[] = [gitClone, gitCommit, gitBranch, npmSetup, nodeServer, pythonVenv, dockerRun, ssh, rsync, fileOps];
export const getBuilder = (slug: string) => BUILDERS.find((x) => x.slug === slug);
export function defaultValues(def: BuilderDef): Values {
  return Object.fromEntries(def.fields.map((f) => [f.key, f.default ?? (f.type === "checkbox" ? false : "")]));
}
