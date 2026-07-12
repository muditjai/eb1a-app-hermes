# eb1a.fyi API samples

All responses use JSON unless the endpoint streams a PDF. Errors use `{ "error": "message" }`.

### GET /api/health
Sample request
```http
GET /api/health
```
Sample response
```json
{ "status": "ok", "service": "eb1a.fyi-api" }
```

### GET /api/petitions
Sample request
```http
GET /api/petitions?query=research%20scientist%20google%20awards
```
Sample response
```json
{
  "data": [
    {
      "id": "seed-research-scientist",
      "title": "Research Scientist EB1A petition",
      "jobProfile": "Research Scientist",
      "company": "Google",
      "location": "Mountain View, CA",
      "criteria": ["awards", "original contribution"],
      "summary": "Approved AI research scientist EB1A...",
      "totalPages": 11,
      "redactionCount": 1,
      "pdfUrl": "/api/petitions/seed-research-scientist/pdf"
    }
  ]
}
```

### GET /api/petitions/:id
Sample request
```http
GET /api/petitions/seed-founder
```
Sample response
```json
{ "data": { "id": "seed-founder", "title": "Founder EB1A petition", "company": "Venture-backed startup" } }
```

### GET /api/petitions/:id/access
Sample request
```http
GET /api/petitions/seed-founder/access
Authorization: Bearer user_reader
```
Sample response
```json
{ "data": { "allowedPages": 3, "paywall": "payment" } }
```

### GET /api/petitions/:id/pdf
Sample request
```http
GET /api/petitions/seed-founder/pdf
```
Sample response
```http
HTTP/1.1 200 OK
Content-Type: application/pdf

%PDF-1.4 ...
```

### POST /api/petitions/upload
Sample request
```http
POST /api/petitions/upload
Content-Type: multipart/form-data

petitionPdf=@petition.pdf
title=Senior ML Engineer EB1A
jobProfile=ML Engineer
company=OpenAI
location=San Francisco
criteria=original contribution,critical role
```
Sample response
```json
{
  "data": {
    "id": "petition_123",
    "title": "Senior ML Engineer EB1A",
    "jobProfile": "ML Engineer",
    "company": "OpenAI",
    "location": "San Francisco",
    "criteria": ["original contribution", "critical role"],
    "totalPages": 12,
    "redactionCount": 0,
    "pdfUrl": "/api/petitions/petition_123/pdf"
  },
  "status": "draft"
}
```

### POST /api/petitions/:id/redactions
Sample request
```http
POST /api/petitions/petition_123/redactions
Content-Type: application/json

{ "page": 1, "pageWidth": 800, "pageHeight": 1000, "boxes": [{ "x": 10, "y": 20, "width": 160, "height": 32, "label": "name" }] }
```
Sample response
```json
{ "data": { "id": "petition_123", "redactionCount": 1, "redactions": [{ "page": 1, "boxes": [{ "label": "name" }] }] } }
```

### POST /api/petitions/:id/publish
Sample request
```http
POST /api/petitions/petition_123/publish
```
Sample response
```json
{ "data": { "id": "petition_123", "status": "published", "redactionCount": 1 } }
```

### POST /api/feedback
Sample request
```http
POST /api/feedback
Content-Type: application/json

{
  "buyerInterest": "yes",
  "buyerPriceUsd": 250,
  "buyerComment": null,
  "contributorInterest": "no",
  "contributorCompensationUsd": null,
  "contributorComment": "Need clearer redaction guarantees",
  "email": null
}
```
Sample response
```json
{
  "data": {
    "id": "feedback_123",
    "buyerInterest": "yes",
    "buyerPriceUsd": 250,
    "contributorInterest": "no",
    "contributorComment": "Need clearer redaction guarantees",
    "email": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/login
Sample request
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "reader@example.com" }
```
Sample response
```json
{ "data": { "id": "user_cmVhZGVyQGV4YW1wbGUuY29t", "email": "reader@example.com", "paid": false, "token": "user_cmVhZGVyQGV4YW1wbGUuY29t" } }
```

### GET /api/me
Sample request
```http
GET /api/me
Authorization: Bearer user_cmVhZGVyQGV4YW1wbGUuY29t
```
Sample response
```json
{ "data": { "id": "user_cmVhZGVyQGV4YW1wbGUuY29t", "email": "reader@example.com", "paid": false } }
```

### POST /api/payments/create-checkout-session
Sample request
```http
POST /api/payments/create-checkout-session
Authorization: Bearer user_cmVhZGVyQGV4YW1wbGUuY29t
Content-Type: application/json

{ "petitionId": "seed-founder", "successUrl": "https://eb1a.fyi/success", "cancelUrl": "https://eb1a.fyi/cancel" }
```
Sample response
```json
{ "data": { "id": "cs_mock_seed-founder", "url": "https://stripe.mock/checkout/seed-founder?user=user_cmVh..." } }
```

### POST /api/payments/webhook
Sample request
```http
POST /api/payments/webhook
Content-Type: application/json

{ "type": "checkout.session.completed", "data": { "object": { "id": "cs_123", "metadata": { "userToken": "user_cmVhZGVy", "petitionId": "seed-founder" } } } }
```
Sample response
```json
{ "received": true }
```
