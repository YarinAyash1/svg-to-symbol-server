# Server

### Includes API Server utilities:

* [morgan](https://www.npmjs.com/package/morgan)
    * HTTP request logger middleware for node.js
* [helmet](https://www.npmjs.com/package/helmet)
    * Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
* [dotenv](https://www.npmjs.com/package/dotenv)
    * Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`
* [cors](https://www.npmjs.com/package/cors)
    * CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

### Development utilities:

* [nodemon](https://www.npmjs.com/package/nodemon)
    * nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
* [eslint](https://www.npmjs.com/package/eslint)
    * ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
* [jest](https://www.npmjs.com/package/jest)
    * Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
* [supertest](https://www.npmjs.com/package/supertest)
    * HTTP assertions made easy via superagent.

### API
The app has an API with the following routes:

*  POST `/api/v1/convert-to-symbol`: Converts the provided SVG data to a symbol and returns it.

### Middlewares
The app has the following custom middlewares:

*  `notFound`: Handles 404 errors.
*  `errorHandler`: Handles other errors. In production, the stack trace is not shown.

## Setup

```
npm install
```

## Lint

```
npm run lint
```

## Test

```
npm test
```

## Development

```
npm run dev
```

