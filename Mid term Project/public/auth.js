const $ = (selector) => document.querySelector(selector);
const message = (text, isError = false) => {
  const node = $("#message");
  if (!node) return;
  node.textContent = text;
  node.className = isError ? "message error" : "message success";
};
const values = (form) => Object.fromEntries(new FormData(form).entries());

async function api(path, payload, method = "POST") {
  const response = await fetch(`/api/auth${path}`, {
    method, credentials: "same-origin",
    headers: payload ? { "Content-Type": "application/json" } : {},
    body: payload ? JSON.stringify(payload) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
function bindForm(id, path, onSuccess) {
  const form = $(`#${id}`);
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const result = await api(path, values(form));
      message(result.message);
      if (onSuccess) onSuccess(result);
    } catch (error) { message(error.message, true); }
    finally { button.disabled = false; }
  });
}

bindForm("signup-form", "/signup", (data) => {
  sessionStorage.setItem("pendingEmail", data.email);
  window.location.href = `/verify.html?email=${encodeURIComponent(data.email)}`;
});
bindForm("login-form", "/login", () => { window.location.href = "/dashboard.html"; });
bindForm("verify-form", "/verify-email", () => { window.location.href = "/login.html"; });
bindForm("forgot-form", "/forgot-password", () => {
  const email = $("#forgot-form [name=email]").value;
  sessionStorage.setItem("resetEmail", email);
  window.location.href = `/reset.html?email=${encodeURIComponent(email)}`;
});
bindForm("reset-form", "/reset-password", () => { window.location.href = "/login.html"; });

function fillEmail() {
  const params = new URLSearchParams(location.search);
  const input = $("#email");
  if (input && !input.value) input.value = params.get("email") || sessionStorage.getItem("pendingEmail") || sessionStorage.getItem("resetEmail") || "";
}
fillEmail();

const resend = $("#resend-verify");
if (resend) resend.addEventListener("click", async () => {
  const email = $("#verify-form [name=email]").value.trim();
  if (!email) return message("Enter your email address first.", true);
  resend.disabled = true;
  try {
    const result = await api("/resend-otp", { email, purpose: "verify_email" });
    message(result.message);
  } catch (error) { message(error.message, true); }
  finally { setTimeout(() => { resend.disabled = false; }, 1500); }
});

const logout = $("#logout");
if (logout) {
  api("/me", null, "GET").then(({ user }) => {
    $("#profile").textContent = `Signed in as ${user.name} (${user.email}).`;
  }).catch(() => { window.location.href = "/login.html"; });
  logout.addEventListener("click", async () => {
    try { const result = await api("/logout", {}); message(result.message); window.location.href = "/login.html"; }
    catch (error) { message(error.message, true); }
  });
}
