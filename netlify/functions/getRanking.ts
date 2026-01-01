import { Handler } from '@netlify/functions';
import { supabase } from './supabaseClient';

export const handler: Handler = async () => {
  try {
    // 🔹 buscar sorteios
    const { data: draws } = await supabase
      .from('draws')
      .select('contest_number, numbers');

    if (!draws || draws.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ranking: [] })
      };
    }

    const drawMap = new Map(
      draws.map(d => [d.contest_number, d.numbers])
    );

    // 🔹 buscar apostas + usuário
    const { data: bets } = await supabase
      .from('user_bets')
      .select(`
        numbers,
        contest_number,
        users (
          id,
          name
        )
      `);

    if (!bets) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ranking: [] })
      };
    }

    const ranking: Record<number, {
      name: string;
      maxHits: number;
      totalGames: number;
    }> = {};

    for (const bet of bets) {
      const drawNumbers = drawMap.get(bet.contest_number);
      if (!drawNumbers) continue;

      const hits = bet.numbers.filter((n: number) =>
        drawNumbers.includes(n)
      ).length;

      const userId = bet.users.id;

      if (!ranking[userId]) {
        ranking[userId] = {
          name: bet.users.name,
          maxHits: hits,
          totalGames: 1
        };
      } else {
        ranking[userId].totalGames += 1;
        ranking[userId].maxHits = Math.max(
          ranking[userId].maxHits,
          hits
        );
      }
    }

    const rankingArray = Object.values(ranking)
      .sort((a, b) => {
        if (b.maxHits !== a.maxHits) {
          return b.maxHits - a.maxHits;
        }
        return b.totalGames - a.totalGames;
      });

    return {
      statusCode: 200,
      body: JSON.stringify({ ranking: rankingArray })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Erro ao gerar ranking'
    };
  }
};
