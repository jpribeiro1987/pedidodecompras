const fs = require('fs');
let content = fs.readFileSync('src/lib/mailer.ts', 'utf8');

// Update Prisma includes to fetch all relations needed for "Detalhes"
content = content.replace(
  /include: { requester: true, items: true, attachments: true, history: { include: { user: true }, orderBy: { date: 'desc' } } }/g,
  "include: { requester: true, items: true, attachments: true, history: { include: { user: true }, orderBy: { date: 'desc' } }, department: true, group: true, buyer: true }"
);

// Inject Detalhes da Solicitação block
const detalhesHtml = `
      <div style="margin-top: 20px;">
        <p><strong>Detalhes da Solicitação:</strong></p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; background-color: #f8fafc; border-radius: 6px; text-align: left;">
          <tbody>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Data da Solicitação:</strong><br/>${"${new Date(request.createdAt).toLocaleDateString('pt-BR')}"}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Prioridade:</strong><br/>${"${request.priority || 'Normal'}"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Setor Solicitante:</strong><br/>${"${request.department?.name || 'Não informado'}"}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Classificação:</strong><br/>${"${request.classification || 'Não informado'}"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Comprador Responsável:</strong><br/>${"${request.buyer?.name || 'Ainda não atribuído'}"}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Grupo / Categoria:</strong><br/>${"${request.group?.name || 'Não agrupado'}"}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Justificativa da Solicitação (Motivo do Pedido):</strong><br/>${"${request.justification || 'Não informada'}"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px;">
        <p><strong>Itens Solicitados:</strong></p>
        <ul style="background-color: #f8fafc; padding: 12px 12px 12px 30px; font-size: 14px; border-radius: 6px;">
`;

// Find where <p><strong>Itens:</strong></p> and <ul> are and replace them
content = content.replace(/<p><strong>Itens:<\/strong><\/p>\s*<ul>/g, detalhesHtml);

fs.writeFileSync('src/lib/mailer.ts', content);
