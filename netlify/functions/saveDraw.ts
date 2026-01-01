import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

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
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const { contestNumber, drawDate, numbers } = JSON.parse(event.body || "{}");

    if (!contestNumber || !drawDate || !numbers || numbers.length !== 5) {
      return json(400, { error: "Dados inválidos" });
    }

    const { data, error } = await supabase
      .from("draws") // ✅ TABELA CORRETA
      .insert([
        {
          contest_number: contestNumber,
          draw_date: drawDate, // YYYY-MM-DD (sem timezone)
          numbers,
        },
      ])
      .select("*") // 🔴 FUNDAMENTAL
      .single();

    if (error) {
      return json(500, { error: error.message });
    }

    return json(200, {
      ok: true,
      draw: data,
    });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
};
