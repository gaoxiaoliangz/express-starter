import { DefinedError, UnauthorizedError, NotFoundError } from '../lib/error'

const debug = require('debug')('myapp:middlewares:apperror')
const isEnvDevelopment = process.env.NODE_ENV === 'development'

export const renderError = ({ renderPage = false } = {}) => (err, req, res, next) => {
  let statusCode = 500
  let errorCode
  let errors

  if (err instanceof DefinedError) {
    errorCode = err.code || 1000
    errors =
      (err.errors &&
        err.errors.length > 1 &&
        err.errors.map(error => DefinedError.toObject(error))) ||
      undefined
    if (err instanceof UnauthorizedError) {
      statusCode = 401
    } else if (err instanceof NotFoundError) {
      statusCode = 404
    } else {
      statusCode = 400
    }
  }
  debug(err)
  const errObject = {
    code: errorCode,
    message: err.message || 'Unknown error occurred',
    details: err.details,
    ...((isEnvDevelopment || statusCode === 500) && { stack: err.stack }),
    errors,
  }

  if (renderPage) {
    return res.status(statusCode).render('error', {
      error: errObject,
    })
  }
  res.status(statusCode).send(errObject)
}