import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

type User = {
  id: string
  name: string
  email: string
  password: string
}

const users: User[] = []

const generateId = () => crypto.randomUUID()

app.post('/signup', async (c) => {
  const { name, email, password } = await c.req.json()

  if (!name || !email || !password) {
    return c.json({ error: 'Missing fields' }, 400)
  }

  const exists = users.find(u => u.email === email)
  if (exists) {
    return c.json({ error: 'Email already exists' }, 409)
  }

  const user: User = {
    id: generateId(),
    name,
    email,
    password
  }

  users.push(user)

  return c.json({ id: user.id, name, email })
})

app.post('/signin', async (c) => {
  const { email, password } = await c.req.json()

  const user = users.find(u => u.email === email && u.password === password)

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  return c.json({
    message: 'Signin successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
})

app.get('/users', (c) => {
  return c.json(users.map(({ id, name, email }) => ({
    id,
    name,
    email
  })))
})

app.get('/users/:id', (c) => {
  const id = c.req.param('id')

  const user = users.find(u => u.id === id)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({
    id: user.id,
    name: user.name,
    email: user.email
  })
})

export default app
