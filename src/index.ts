import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
type User = {
  id: string;
  name: string;
  email: string;
  password: string; 
};

const users: User[] = [];


function generateId() {
  return crypto.randomUUID();
}

function sanitizeUser(user: User) {
  const { password: _password, ...rest } = user;
  return rest;
}

app.get("/users", (c) => {
  const publicUsers = users.map(sanitizeUser);
  return c.json(publicUsers);
});

app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  const user = users.find((u) => u.id === id);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(sanitizeUser(user));
});

app.post("/signup", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return c.json({ error: "name, email, and password are required" }, 400);
  }

  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return c.json({ error: "Email already exists" }, 409);
  }

  const newUser: User = {
    id: generateId(),
    name,
    email,
    password,
  };

  users.push(newUser);
  return c.json(sanitizeUser(newUser), 201);
});

app.post("/signin", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, password } = body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return c.json({ error: "email and password are required" }, 400);
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  if (user.password !== password) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  return c.json({
    message: "Signin successful",
    user: sanitizeUser(user),
  });
});

export default app
