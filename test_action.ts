const { prisma } = require('./src/lib/prisma.ts')

// We will simulate what createRequestAction does
async function test() {
  const items = [{
    description: 'Teste',
    quantity: '1',
    link: '',
    priority: 'MEDIA',
    classification: 'Consumo',
    groupId: ''
  }]
  const justification = 'Justificativa de teste'
  const targetRequesterId = 'f9b31d04-4b5f-4a00-b6f1-a8e52e4b4cc8' // Need a valid user ID

  // Get a valid user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log('No user found')
    return
  }
  console.log('Using user', user.id)

  for (const item of items) {
    try {
      const newRequest = await prisma.purchaseRequest.create({
        data: {
          description: null,
          quantity: null,
          link: null,
          justification,
          priority: item.priority || 'MEDIA',
          classification: item.classification || 'Consumo',
          groupId: item.groupId || null,
          requesterId: user.id,
          items: {
            create: [{
              description: item.description,
              quantity: parseInt(item.quantity, 10),
              link: item.link || null
            }]
          }
        }
      })
      console.log('Created request', newRequest.id)

      await prisma.statusHistory.create({
        data: {
          newStatus: 'CRIADA',
          requestId: newRequest.id,
          userId: user.id
        }
      })
      console.log('Created history')
    } catch (err) {
      console.error('ERROR:', err)
    }
  }
}
test()
