
const session  =require('express-session')
const express=require('express')
const Keycloak =require('keycloak-connect')

const memoryStore = new session.MemoryStore();

export const app = express();
app.use(
  session({
    secret: 'some-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

export const keycloak = new Keycloak({ store: memoryStore }, {
  realm: 'myapp-realm',
  'auth-server-url': 'http://localhost:8080/auth',
  resource: 'ReactClient',
  credentials: { secret: '<client-secret>' },
  'confidential-port': 0
});
