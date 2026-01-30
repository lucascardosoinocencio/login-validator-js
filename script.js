// ===== SPA NAVIGATION (telas) =====

// Reaplica a animação CSS na tela (truque do "reflow" para reiniciar animação)
function animate(screenId) {
  const screen = document.getElementById(screenId);
  screen.classList.remove("screen");
  void screen.offsetWidth; // força o navegador recalcular o layout
  screen.classList.add("screen");
}

// Didático: transforma texto em Base64 para não salvar a senha "crua"
// ⚠️ Não é segurança real (é reversível com atob), serve só pra aprender o fluxo
function simpleHash(text) {
  return btoa(text);
}

// Mostra a Home e centraliza as "regras" de estado da UI quando voltamos pra ela
function showHome() {
  // Mostra Home e esconde Login/Register
  document.getElementById("home").classList.remove("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("register").classList.add("hidden");

  // Limpa mensagens (pra não ficar erro/sucesso "preso" ao voltar)
  document.getElementById("loginResult").innerText = "";
  document.getElementById("registerResult").innerText = "";

  // Limpa inputs do Login
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";

  // Limpa inputs do Register
  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";

  // Animação da Home
  animate("home");

  // Lê o usuário logado (sessão) do localStorage
  const loggedUserJSON = localStorage.getItem("loggedUser");
  const loggedUser = loggedUserJSON ? JSON.parse(loggedUserJSON) : null;

  // Elementos da Home que mudam dependendo do login
  const homeUser = document.getElementById("homeUser");
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const showDataBtn = document.getElementById("showDataBtn");
  const loginHomeBtn = document.getElementById("loginHomeBtn");
  const registerHomeBtn = document.getElementById("registerHomeBtn");

  // Se tiver usuário logado, mostra welcome e botões; se não, esconde
  if (loggedUser) {
    homeUser.innerText = `Welcome, ${loggedUser.name}!`;
    logoutBtn.classList.remove("hidden");
    deleteBtn.classList.remove("hidden");
    showDataBtn.classList.remove("hidden");
    loginHomeBtn.classList.add("hidden");
    registerHomeBtn.classList.add("hidden");
  } else {
    homeUser.innerText = "";
    logoutBtn.classList.add("hidden");
    deleteBtn.classList.add("hidden");
    showDataBtn.classList.add("hidden");
    const box = document.getElementById("userDataBox");
    box.innerHTML = "";
    box.classList.add("hidden");
    loginHomeBtn.classList.remove("hidden");
    registerHomeBtn.classList.remove("hidden");
  }
}

// Troca de tela: Home -> Login
function showLogin() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("register").classList.add("hidden");

  animate("login");
}

// Troca de tela: Home -> Register
function showRegister() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("register").classList.remove("hidden");

  animate("register");
}

// ===== LOGIN =====

// Listener do botão de login (evento -> função)
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", login);

function login() {
  // Pega valores do formulário de login (normaliza email em minúsculo)
  const emailValue = document
    .getElementById("email")
    .value.trim()
    .toLowerCase();
  const passwordValue = document.getElementById("password").value;

  // Elemento onde mostramos mensagem de erro/sucesso do login
  const loginResult = document.getElementById("loginResult");

  // Carrega lista de usuários cadastrados
  const usersJSON = localStorage.getItem("users");
  const users = JSON.parse(usersJSON) || [];

  // Procura 1 usuário com o email digitado
  const user = users.find((u) => u.email === emailValue);

  // Validações (primeiro valida formato, depois valida se existe e senha)
  if (emailValue === "") {
    loginResult.innerText = "Please enter your email";
    loginResult.className = "message error";
  } else if (!emailValue.includes("@") || !emailValue.includes(".")) {
    loginResult.innerText = "Invalid email format";
    loginResult.className = "message error";
  } else if (passwordValue.length < 6) {
    loginResult.innerText = "Password too short";
    loginResult.className = "message error";
  } else if (!user) {
    loginResult.innerText = "Email not found";
    loginResult.className = "message error";
  } else if (user.passwordHash !== simpleHash(passwordValue)) {
    // Compara a versão "transformada" da senha
    loginResult.innerText = "Wrong password";
    loginResult.className = "message error";
  } else {
    // Sucesso: cria "sessão" guardando dados seguros (sem senha)
    loginResult.innerText = "Login successful";
    loginResult.className = "message success";

    const safeUser = { name: user.name, age: user.age, email: user.email };
    localStorage.setItem("loggedUser", JSON.stringify(safeUser));

    // Volta pra Home (Home vai mostrar Welcome/Logout/Delete)
    showHome();
  }
}

// ===== REGISTER =====

const registerBtn = document.getElementById("registerBtn");
registerBtn.addEventListener("click", register);

function register() {
  // Pega valores do formulário de cadastro
  const nameValue = document.getElementById("name").value.trim();
  const ageValue = Number(document.getElementById("age").value);

  // Normaliza email em minúsculo (evita duplicidade por diferença de maiúsculas)
  const emailValue = document
    .getElementById("registerEmail")
    .value.trim()
    .toLowerCase();

  const passwordValue = document.getElementById("registerPassword").value;

  // Carrega lista atual de usuários
  const usersJSON = localStorage.getItem("users");
  const users = JSON.parse(usersJSON) || [];

  // Verifica se email já existe (some retorna true se algum item bater)
  const emailExists = users.some((u) => u.email === emailValue);

  // Elemento onde mostramos mensagem de erro/sucesso do cadastro
  const registerResult = document.getElementById("registerResult");

  // Validações (mesma linha do login + name/age)
  if (nameValue === "") {
    registerResult.innerText = "Please enter your name";
    registerResult.className = "message error";
  } else if (ageValue <= 0) {
    registerResult.innerText = "Please enter your age";
    registerResult.className = "message error";
  } else if (emailValue === "") {
    registerResult.innerText = "Please enter your email";
    registerResult.className = "message error";
  } else if (!emailValue.includes("@") || !emailValue.includes(".")) {
    registerResult.innerText = "Invalid email format";
    registerResult.className = "message error";
  } else if (passwordValue.length < 6) {
    registerResult.innerText = "Password too short";
    registerResult.className = "message error";
  } else if (emailExists) {
    // Bloqueia cadastro repetido
    registerResult.innerText = "Email already registered";
    registerResult.className = "message error";
  } else {
    // Cria novo usuário e salva no array
    const newUser = {
      name: nameValue,
      age: ageValue,
      email: emailValue,
      passwordHash: simpleHash(passwordValue),
    };

    users.push(newUser);

    // Salva de volta no localStorage como JSON (string)
    localStorage.setItem("users", JSON.stringify(users));

    // Feedback pro usuário
    registerResult.innerText = "Registration successful";
    registerResult.className = "message success";

    // Limpa campos do cadastro após sucesso
    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";
  }
}

// ===== DELETE ACCOUNT (remove o usuário do array users e desloga) =====

document.getElementById("deleteBtn").addEventListener("click", () => {
  // Lê o usuário logado (quem será deletado)
  const loggedUserJSON = localStorage.getItem("loggedUser");
  const loggedUser = loggedUserJSON ? JSON.parse(loggedUserJSON) : null;

  // Se não tem sessão, não tem o que deletar
  if (!loggedUser) return;

  // Carrega usuários e cria nova lista SEM o usuário logado
  const usersJSON = localStorage.getItem("users");
  const users = JSON.parse(usersJSON) || [];

  // filter cria um novo array mantendo só quem NÃO tem o email do loggedUser
  const newUsers = users.filter((u) => u.email !== loggedUser.email);

  // Salva lista atualizada e remove sessão
  localStorage.setItem("users", JSON.stringify(newUsers));
  localStorage.removeItem("loggedUser");

  // Volta pra Home (vai ficar deslogado)
  showHome();
});

document.getElementById("showDataBtn").addEventListener("click", () => {
  const loggedUserJSON = localStorage.getItem("loggedUser");
  const loggedUser = loggedUserJSON ? JSON.parse(loggedUserJSON) : null;

  if (!loggedUser) return;

  const box = document.getElementById("userDataBox");
  if (!box.classList.contains("hidden")) {
    box.classList.add("hidden");
    return;
  }

  box.innerHTML = `
  <div><b>Name:</b> ${loggedUser.name}</div>
  <div><b>Age:</b> ${loggedUser.age}</div>
  <div><b>Email:</b> ${loggedUser.email}</div>
`;

  box.classList.remove("hidden");
  box.classList.remove("error");
  box.classList.add("message", "success");
});

// ===== LOGOUT (remove sessão e volta pra home) =====

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  showHome();
});

// ===== INIT (quando a página abre, a Home já configura a UI) =====
showHome();
