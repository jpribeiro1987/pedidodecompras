const fs = require('fs');
let content = fs.readFileSync('src/app/actions.ts', 'utf8');

// Inside createRequestAction
const findStr = "const items = []\n  for (let i = 0; i < itemsCount; i++) {";
const replaceStr = `const observersCount = parseInt(formData.get('observersCount') as string || '0', 10)
  const observers: { id: string }[] = []
  for (let i = 0; i < observersCount; i++) {
    const obsId = formData.get(\`observer_\${i}\`) as string
    if (obsId) observers.push({ id: obsId })
  }

  const items = []
  for (let i = 0; i < itemsCount; i++) {`;
content = content.replace(findStr, replaceStr);

const createFindStr = "groupId: groupId || null,\n        history: {\n          create: {";
const createReplaceStr = "groupId: groupId || null,\n        ...(observers.length > 0 ? { observers: { connect: observers } } : {}),\n        history: {\n          create: {";
content = content.replace(createFindStr, createReplaceStr);

fs.writeFileSync('src/app/actions.ts', content);