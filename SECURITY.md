## Security

> **The project contributors advise this is not "production ready"! There should be no reasonable expectation of proper security measures.**

If you have discovered a new security vulnerability, please report it through the means described below.

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Send an email to [git@stephenmendez.dev](mailto:git@stephenmendez.dev). Expect to receive a response within 72 hours. 

Please include the following information (when available):

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

## Known Vulnerabilities

> For the sake of transparency, this project will publicly expose some known vulnerabilities as a reminder it is not be deployed as a public facing API or used in critical implementations as is.

### Server

* The server is an HTTP server so information will be communicated in plaintext, without encryption.
* Therefore, it is recommended to be run behind a reverse proxy such as NGINX.
* Information about exceptions may be returned in the response body. 

### Endpoints

* There is no endpoint rate limiting implemented.
* There is **no input validation** for all endpoints, regardless of method (GET, POST, etc).
* The user can override data objects "id" field causing data corruption.

### Authentication

* There is specific no authentication policy defined.
* The user manually creates API tokens. The level of security depends on the level of complexity.
* As with most APIs, there is no MFA or user account options.
* There are no checks against brute-force authentication attacks.

### Logging

* There is very limited logging.
* User authentication tokens will be logged within HTTP request logs.
