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
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async (event) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
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
        error: "Variáveis de ambiente não configuradas",
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const raw = event.body ? JSON.parse(event.body) : {};
    const email = String(raw.email || "").trim().toLowerCase();
    const password = String(raw.password || "");

    if (!email || !password) {
      return json(400, { ok: false, error: "Email e senha obrigatórios" });
    }

    // Buscar usuário pelo email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, cpf, birth_date, password_hash")
      .eq("email", email)
      .single();

    if (error || !user) {
      return json(401, { ok: false, error: "Email ou senha inválidos" });
    }

    // Comparar senha digitada com hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return json(401, { ok: false, error: "Email ou senha inválidos" });
    }

    // Login OK (não retornamos o hash)
    return json(200, {
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        birth_date: user.birth_date,
      },
    });
  } catch (e: any) {
    return json(500, { ok: false, error: e?.message || "Erro inesperado" });
  }
};
