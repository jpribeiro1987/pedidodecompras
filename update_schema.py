import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace exactly in User model
user_model_pattern = r"(model User \{[\s\S]*?)department\s+Department\?\s+@relation\(fields:\s*\[departmentId\],\s*references:\s*\[id\]\)([\s\S]*?\})"
content = re.sub(
    user_model_pattern,
    r'\1department       Department?       @relation(name: "UserPrimaryDepartment", fields: [departmentId], references: [id])\n  additionalDepartments Department[] @relation("UserAdditionalDepartments")\2',
    content
)

# Replace exactly in Department model
dept_model_pattern = r"(model Department \{[\s\S]*?)users\s+User\[\]([\s\S]*?\})"
content = re.sub(
    dept_model_pattern,
    r'\1users            User[]            @relation("UserPrimaryDepartment")\n  additionalUsers  User[]            @relation("UserAdditionalDepartments")\2',
    content
)

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
