import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { supabase } from './supabaseClient';

export const handler: Handler = async () => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("user_games")
      .select("numbers");

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    const counter: Record<number, number> = {};

    data.forEach(game => {
      game.numbers.forEach((num: number) => {
        counter[num] = (counter[num] || 0) + 1;
      });
    });

    const favorites = Object.entries(counter)
      .map(([number, count]) => ({
        number: Number(number),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      statusCode: 200,
      body: JSON.stringify({ favorites }),
    };

  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
