import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.comment.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Criar setores
  const ti = await prisma.department.create({ data: { name: 'Tecnologia da Informação' } });
  const rh = await prisma.department.create({ data: { name: 'Recursos Humanos' } });
  const compras = await prisma.department.create({ data: { name: 'Compras' } });
  const diretoria = await prisma.department.create({ data: { name: 'Diretoria' } });

  // Criar usuários
  await prisma.user.create({
    data: {
      name: 'João Solicitante',
      email: 'joao@hospital.com',
      password: '123',
      role: 'SOLICITANTE',
      departmentId: ti.id,
    }
  });

  await prisma.user.create({
    data: {
      name: 'Maria Compradora',
      email: 'maria@hospital.com',
      password: '123',
      role: 'COMPRADOR',
      departmentId: compras.id,
    }
  });

  await prisma.user.create({
    data: {
      name: 'Carlos Autorizador',
      email: 'carlos@hospital.com',
      password: '123',
      role: 'AUTORIZADOR',
      departmentId: diretoria.id,
    }
  });

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@hospital.com',
      password: '123',
      role: 'ADMIN',
    }
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
