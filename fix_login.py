with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const password = formData.get('password') as string", "const password = (formData.get('password') as string)?.trim()")

old_cookie = """  cookieStore.set('userId', user.id, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })"""

new_cookie = """  cookieStore.set('userId', user.id, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })"""

content = content.replace(old_cookie, new_cookie)

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
