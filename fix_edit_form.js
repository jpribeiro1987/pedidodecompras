const fs = require('fs');
let c = fs.readFileSync('src/components/EditRequestForm.tsx', 'utf8');

c = c.replace(
  /departments\s*=\s*\[\]\s*\}\s*:\s*\{\s*user:\s*any,\s*groups:\s*any\[\],\s*targetUsers\?:\s*any\[\],\s*isComprador\?:\s*boolean,\s*departments\?:\s*any\[\]\s*\}/g,
  `departments = [],
  request
}: {
  user: any,
  groups: any[],
  targetUsers?: any[],
  isComprador?: boolean,
  departments?: any[],
  request: any
}`
);

c = c.replace(
  /const \[items, setItems\] = useState\(\[\{/g,
  `const [items, setItems] = useState(request.items && request.items.length > 0 ? request.items.map((i) => ({ ...i, quantity: String(i.quantity), file: null, previewUrl: i.imageUrl || "" })) : [{`
);

fs.writeFileSync('src/components/EditRequestForm.tsx', c);
