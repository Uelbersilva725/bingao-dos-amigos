import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Método não permitido" });
  }

  try {
    const { token, newPassword } = JSON.parse(event.body || "");

    if (!token || !newPassword || newPassword.length < 8) {
      return json(400, { error: "Dados inválidos" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error } = await supabase
      .from("users")
      .select("id, reset_token_expires")
      .eq("reset_token", token)
      .single();

    if (error || !user) {
      return json(400, { error: "Token inválido" });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return json(400, { error: "Token expirado" });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await supabase
      .from("users")
      .update({
        password_hash,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq("id", user.id);

    return json(200, { ok: true, message: "Senha atualizada com sucesso" });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
};
