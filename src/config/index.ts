import merge from 'lodash.merge'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const requiredEnv = [
  'BASE_URL',
  'DATABASE_URL',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'JWT_SECRET',
  'STAGE'
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const stage = process.env.STAGE || 'local'

let envConfig

if (stage === 'production') {
  envConfig = require('./prod').default
} else if (stage === 'testing') {
  envConfig = require('./testing').default
} else {
    envConfig = require('./local').default
}


export default merge({
    stage,
    env: process.env.NODE_ENV,
    port: 3000,
    secrets: {
        jwt: process.env.JWT_SECRET,
        dbUrl: process.env.DATABASE_URL,
        emailUser: process.env.EMAIL_USERNAME,
        emailPass: process.env.EMAIL_PASSWORD,
        baseUrl: process.env.BASE_URL
    }

}, envConfig)


