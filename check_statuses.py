import re

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    
statuses = set(re.findall(r'currentStatus\s*===\s*[\'"]([A-Z_]+)[\'"]', content) + 
               re.findall(r'status\s*:\s*[\'"]([A-Z_]+)[\'"]', content) + 
               re.findall(r'newStatus\s*:\s*[\'"]([A-Z_]+)[\'"]', content))
print(statuses)
