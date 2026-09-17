const fs = require('fs');
let content = fs.readFileSync('src/lib/mailer.ts', 'utf8');

const extraInfo = `
      ${"${request.winnerJustification ? `"}
      <div style="margin-top: 20px;">
        <p><strong>Justificativa do Comprador (Cotação):</strong></p>
        <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #94a3b8; font-size: 14px; border-radius: 4px;">
          ${"${request.winnerJustification}"}
        </p>
      </div>
      ${"` : ''}"}

      ${"${request.history.some(h => h.observation && h.observation.trim() !== 'Atualização de status' && h.observation.trim() !== 'Pedido editado' && !h.observation.startsWith('Mercadoria informada')) ? `"}
      <div style="margin-top: 20px;">
        <p><strong>Observações do Processo:</strong></p>
        <ul style="background-color: #f8fafc; padding: 12px 12px 12px 30px; font-size: 14px; border-radius: 6px;">
          ${"${request.history.filter(h => h.observation && h.observation.trim() !== 'Atualização de status' && h.observation.trim() !== 'Pedido editado' && !h.observation.startsWith('Mercadoria informada')).map(h => `"}
            <li style="margin-bottom: 8px;">
              <strong>${"${new Date(h.date).toLocaleDateString('pt-BR')}"}:</strong> ${"${h.observation}"}
              <br/><span style="font-size: 11px; color: #64748b;">(por ${"${h.user?.name || 'Sistema'}"})</span>
            </li>
          ${"`).join('')}"}
        </ul>
      </div>
      ${"` : ''}"}
`;

content = content.replace(/<\/ul>\s*<br \/>\s*<p>As imagens/g, '</ul>' + extraInfo + '      <br />\n      <p>As imagens');

fs.writeFileSync('src/lib/mailer.ts', content);
