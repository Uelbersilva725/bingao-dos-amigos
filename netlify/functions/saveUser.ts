import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

// Esperado: "DD/MM/AAAA" → converte para "YYYY-MM-DD"
function brDateToIso(br: string) {
  const parts = (br || "").split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return null;
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export const handler: Handler = async (event) => {
  // Preflight (CORS)
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  // GET informativo
  if (event.httpMethod === "GET") {
    return json(200, {
      ok: true,
      message:
        "Esta é a Function saveUser. Use POST enviando JSON: { name, email, password, cpf, birth_date }",
    });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Método não permitido" });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(500, {
        ok: false,
        error:
          "Variáveis de ambiente não configuradas (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).",
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const raw = event.body ? JSON.parse(event.body) : {};
    const name = String(raw.name || "").trim();
    const email = String(raw.email || "").trim().toLowerCase();
    const password = String(raw.password || "");
    const cpfDigits = onlyDigits(String(raw.cpf || ""));
    const birthIso =
      String(raw.birth_date || "").includes("-")
        ? String(raw.birth_date)
        : brDateToIso(String(raw.birth_date || ""));

    // Validação simples
    if (name.length < 3) return json(400, { ok: false, error: "Nome inválido" });
    if (!email.includes("@")) return json(400, { ok: false, error: "Email inválido" });
    if (password.length < 8) return json(400, { ok: false, error: "Senha inválida" });
    if (cpfDigits.length !== 11) return json(400, { ok: false, error: "CPF inválido" });
    if (!birthIso || birthIso.length !== 10) {
      return json(400, { ok: false, error: "Data de nascimento inválida" });
    }

    // 🔐 CRIPTOGRAFAR A SENHA
    const password_hash = await bcrypt.hash(password, 10);

    // Salvar no banco
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash, // 🔒 agora seguro
          cpf: cpfDigits,
          birth_date: birthIso,
        },
      ])
      .select("id, name, email")
      .single();

    if (error) {
      return json(500, { ok: false, error: error.message });
    }

    return json(200, { ok: true, user: data });
  } catch (e: any) {
    return json(500, { ok: false, error: e?.message || "Erro inesperado" });
  }
};
