import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { apiRoutes } from './routes/api'
import { pageRoutes } from './routes/pages'
import { adminRoutes } from './routes/admin'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// API routes
app.route('/api', apiRoutes)

// Admin routes
app.route('/admin', adminRoutes)

// Page routes (must be last - catches all)
app.route('/', pageRoutes)

export default app
