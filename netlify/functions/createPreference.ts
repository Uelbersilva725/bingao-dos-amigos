const result = await preference.create({
  body: {
    items: [
      {
        title: 'Bingão dos Amigos - Aposta',
        quantity: 1,
        unit_price: total,
        currency_id: 'BRL',
      },
    ],
    metadata: {
      user_id: body.userId,     // auth.uid()
      numbers: body.numbers,    // array de números
      amount: total,
    },
    back_urls: {
      success: `${process.env.URL}/payment/success`,
      failure: `${process.env.URL}/payment/failure`,
      pending: `${process.env.URL}/payment/pending`,
    },
    auto_return: 'approved',
  },
})
