import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export const handler: Handler = async () => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('drawings')
      .select('draw_date, contest_number, numbers')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        statusCode: 200,
        body: JSON.stringify(null),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        date: data.draw_date,
        contest: data.contest_number,
        numbers: data.numbers,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
