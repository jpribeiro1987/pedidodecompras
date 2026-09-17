const fs = require('fs');
let content = fs.readFileSync('src/lib/mailer.ts', 'utf8');

// Include quotes in query for both sendPickupStatusEmail and sendManualStatusEmail
content = content.replace(/buyer: true, observers: true }/g, "buyer: true, observers: true, quotes: { include: { supplier: true } } }");

// Generate quotes HTML
const quotesHtmlTarget = "const itemsListHtml = request.items.map(item => `<li>${item.quantity}x ${item.description}</li>`).join('')";
const quotesHtmlReplace = `const itemsListHtml = request.items.map(item => \`<li>\${item.quantity}x \${item.description}</li>\`).join('')
  
  let quotesHtml = '';
  if (request.quotes && request.quotes.length > 0) {
    quotesHtml = \`
      <div style="margin-top: 20px;">
        <p><strong>Cotações Realizadas (Ação do Comprador):</strong></p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 10px;">Fornecedor</th>
              <th style="padding: 10px;">Valor Inicial</th>
              <th style="padding: 10px;">Valor Negociado</th>
              <th style="padding: 10px;">Vencedor</th>
            </tr>
          </thead>
          <tbody>
            \${request.quotes.map(q => \`
              <tr style="border-bottom: 1px solid #e2e8f0; \${q.isWinner ? 'background-color: #dcfce7;' : ''}">
                <td style="padding: 10px;">\${q.supplier?.name || q.supplierName || 'Não informado'}</td>
                <td style="padding: 10px;">R$ \${q.price.toFixed(2)}</td>
                <td style="padding: 10px;">\${q.negotiatedPrice ? \`R$ \${q.negotiatedPrice.toFixed(2)}\` : '-'}</td>
                <td style="padding: 10px;">\${q.isWinner ? '<strong>Sim</strong>' : 'Não'}</td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      </div>
    \`
  }`;
content = content.replace(quotesHtmlTarget, quotesHtmlReplace);
content = content.replace(quotesHtmlTarget, quotesHtmlReplace); // for the second function

const insertQuotesTarget = "      ${request.winnerJustification ? `\n      <div style=\"margin-top: 20px;\">";
const insertQuotesReplace = "      ${quotesHtml}\n      ${request.winnerJustification ? `\n      <div style=\"margin-top: 20px;\">";
content = content.replace(insertQuotesTarget, insertQuotesReplace);
content = content.replace(insertQuotesTarget, insertQuotesReplace); // for the second function

fs.writeFileSync('src/lib/mailer.ts', content);