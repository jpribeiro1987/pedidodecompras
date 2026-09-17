const fs = require('fs');
let content = fs.readFileSync('src/lib/mailer.ts', 'utf8');

// Include observers in queries
content = content.replace(/buyer: true }/g, "buyer: true, observers: true }");

// Add observers to CC/BCC when sending email
const sendMailSearch = 'to: request.requester.email,\n      subject,';
const sendMailReplace = 'to: request.requester.email,\n      cc: request.observers?.map(obs => obs.email).join(\',\') || undefined,\n      subject,';
content = content.replace(sendMailSearch, sendMailReplace);
content = content.replace(sendMailSearch, sendMailReplace); // for both functions

fs.writeFileSync('src/lib/mailer.ts', content);