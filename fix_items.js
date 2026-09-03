const fs = require('fs');
let c = fs.readFileSync('src/components/EditRequestForm.tsx', 'utf8');

c = c.replace(
  'const [items, setItems] = useState([{',
  'const [items, setItems] = useState(request.items && request.items.length > 0 ? request.items.map((i) => ({ ...i, quantity: String(i.quantity), file: null, previewUrl: i.imageUrl || "" })) : [{'
);
fs.writeFileSync('src/components/EditRequestForm.tsx', c);
