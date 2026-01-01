import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Resend } from "resend";

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
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return json(400, { error: "E-mail obrigatório" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const resend = new Resend(process.env.RESEND_API_KEY!);

    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await supabase
      .from("users")
      .update({
        reset_token: token,
        reset_token_expires: expires.toISOString(),
      })
      .eq("email", email.toLowerCase());

    const resetLink = `http://localhost:8888/reset-password?token=${token}`;

    await resend.emails.send({
      from: "Bingão dos Amigos <no-reply@bingaodosamigos.com.br>",
      to: email,
      subject: "Recuperação de senha - Bingão dos Amigos",
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <p>
          <a href="${resetLink}" 
             style="display:inline-block;padding:10px 16px;
             background:#16a34a;color:#fff;border-radius:6px;
             text-decoration:none">
            Redefinir senha
          </a>
        </p>
        <p>Este link expira em 15 minutos.</p>
      `,
    });

    return json(200, {
      ok: true,
      message: "E-mail de recuperação enviado",
    });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
};
