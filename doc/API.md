# Blog API Documentation

Base URL:

```text
http://localhost:8081
```

API prefix:

```text
/api/v1
```

## Authentication

Authenticated endpoints require a bearer token:

```http
Authorization: Bearer <accessToken>
```

Tokens are returned by `POST /api/v1/auth/register` and `POST /api/v1/auth/login`.

## Roles

User types:

```text
ADMIN, USER, AUTHOR
```

Access rules:

| Route | Access |
| --- | --- |
| `POST /api/v1/auth/register` | Public |
| `POST /api/v1/auth/login` | Public |
| `POST /api/v1/auth/logout` | Authenticated |
| `/api/v1/users/**` | ADMIN only |
| `POST /api/v1/posts/**` | Authenticated |
| `PUT /api/v1/posts/**` | Authenticated |
| `DELETE /api/v1/posts/**` | Authenticated |
| Other `/api/**` routes | Public |

## Error Response

All handled API errors return:

```json
{
  "timestamp": "2026-07-21T14:11:09Z",
  "statusCode": 403,
  "message": "You do not have permission to access this resource."
}
```

Common statuses:

| Status | Meaning |
| --- | --- |
| `400` | Validation failed |
| `401` | Missing or invalid authentication |
| `403` | No permission |
| `404` | Resource not found, when thrown by service |
| `409` | Duplicate email/phone, when thrown by service |
| `429` | Too many auth attempts |
| `500` | Unexpected server error |

## Auth

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | 2-80 chars; letters, numbers, spaces, `.`, `_`, `'`, `@`, `-` |
| `email` | string | yes | Valid email, max 254 chars |
| `password` | string | yes | 8-72 chars; uppercase, lowercase, number |
| `phone` | string | no | Max 20 chars; numbers, spaces, `+`, `-`, parentheses |

Example:

```json
{
  "name": "Rookie@09",
  "email": "rookie@example.com",
  "password": "Rookie@09",
  "phone": "+855 12 345 678"
}
```

Response `201`:

```json
{
  "tokenType": "Bearer",
  "accessToken": "jwt-token",
  "expiresAt": "2026-07-21T15:11:09Z",
  "user": {
    "id": 1,
    "name": "Rookie@09",
    "email": "rookie@example.com",
    "type": "USER"
  }
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Request:

| Field | Type | Required |
| --- | --- | --- |
| `email` | string | yes |
| `password` | string | yes |

Response `200`: same shape as register response.

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

Response `204`: no body.

## Users

All user CRUD endpoints require `ADMIN`.

Base path:

```text
/api/v1/users
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/users` | Create user | `201 UserResponse` |
| `GET` | `/api/v1/users` | List users | `200 UserResponse[]` |
| `GET` | `/api/v1/users/{id}` | Get user by id | `200 UserResponse` |
| `PUT` | `/api/v1/users/{id}` | Update user | `200 UserResponse` |
| `POST` | `/api/v1/users/{id}/avatar` | Upload avatar | `200 UserResponse` |
| `DELETE` | `/api/v1/users/{id}/avatar` | Delete avatar | `204` |
| `DELETE` | `/api/v1/users/{id}` | Delete user | `204` |

Create request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Not blank |
| `email` | string | yes | Valid email |
| `password` | string | yes | 8-72 chars; uppercase, lowercase, number |
| `phone` | string | no |  |
| `avatar` | string | no |  |
| `position` | string | no |  |
| `emailVerified` | boolean | no |  |
| `type` | enum | no | `ADMIN`, `USER`, `AUTHOR` |

Update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Not blank |
| `email` | string | yes | Valid email |
| `password` | string | no | Empty or 8-72 chars with uppercase, lowercase, number |
| `phone` | string | no |  |
| `avatar` | string | no |  |
| `position` | string | no |  |
| `emailVerified` | boolean | no |  |
| `type` | enum | no | `ADMIN`, `USER`, `AUTHOR` |

Avatar upload:

```http
POST /api/v1/users/{id}/avatar
Content-Type: multipart/form-data
```

| Field | Type | Required |
| --- | --- | --- |
| `avatar` | file | yes |

User response fields:

```text
id, name, email, phone, avatar, position, emailVerified, type, createdAt, updatedAt
```

## Posts

Base path:

```text
/api/v1/posts
```

Write endpoints require authentication. Read endpoints are public.

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/posts` | Create post | `201 PostResponse` |
| `GET` | `/api/v1/posts` | List posts | `200 PostResponse[]` |
| `GET` | `/api/v1/posts/{id}` | Get post by id | `200 PostResponse` |
| `PUT` | `/api/v1/posts/{id}` | Update post | `200 PostResponse` |
| `POST` | `/api/v1/posts/{id}/image` | Upload image | `200 PostResponse` |
| `DELETE` | `/api/v1/posts/{id}/image` | Delete image | `204` |
| `DELETE` | `/api/v1/posts/{id}` | Delete post | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Not blank |
| `shortDesc` | string | no |  |
| `content` | string | yes | Not blank |
| `type` | enum | yes | `ARTICLE`, `NEWS`, `TUTORIAL`, `CODE` |
| `duration` | integer | no |  |
| `views` | integer | no |  |
| `status` | boolean | no |  |
| `image` | string | no |  |
| `authorId` | number | no | User id |
| `tagIds` | number[] | no | Tag ids |

Image upload:

```http
POST /api/v1/posts/{id}/image
Content-Type: multipart/form-data
```

| Field | Type | Required |
| --- | --- | --- |
| `image` | file | yes |

Post response fields:

```text
id, title, slug, shortDesc, content, type, duration, views, status, image, author, tags, createdAt, updatedAt
```

Nested post response fields:

| Object | Fields |
| --- | --- |
| `author` | `id`, `name`, `email` |
| `tags[]` | `id`, `title`, `slug` |

## Tags

Base path:

```text
/api/v1/tags
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/tags` | Create tag | `201 TagResponse` |
| `GET` | `/api/v1/tags` | List tags | `200 TagResponse[]` |
| `GET` | `/api/v1/tags/{id}` | Get tag by id | `200 TagResponse` |
| `PUT` | `/api/v1/tags/{id}` | Update tag | `200 TagResponse` |
| `DELETE` | `/api/v1/tags/{id}` | Delete tag | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Not blank |

Tag response fields:

```text
id, title, slug, createdAt, updatedAt
```

## Pages

Base path:

```text
/api/v1/pages
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/pages` | Create page | `201 PageResponse` |
| `GET` | `/api/v1/pages` | List pages | `200 PageResponse[]` |
| `GET` | `/api/v1/pages/{id}` | Get page by id | `200 PageResponse` |
| `PUT` | `/api/v1/pages/{id}` | Update page | `200 PageResponse` |
| `DELETE` | `/api/v1/pages/{id}` | Delete page | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `type` | enum | yes | `ABOUT`, `CONTACT`, `PRIVACY_POLICY`, `TERMS_AND_CONDITIONS` |
| `content` | string | yes | Not blank |

Page response fields:

```text
id, type, content, createdAt, updatedAt
```

## Contacts

Base path:

```text
/api/v1/contacts
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/contacts` | Create contact message | `201 ContactResponse` |
| `GET` | `/api/v1/contacts` | List contact messages | `200 ContactResponse[]` |
| `GET` | `/api/v1/contacts/{id}` | Get contact by id | `200 ContactResponse` |
| `PUT` | `/api/v1/contacts/{id}` | Update contact | `200 ContactResponse` |
| `DELETE` | `/api/v1/contacts/{id}` | Delete contact | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Not blank |
| `email` | string | yes | Valid email |
| `subject` | string | yes | Not blank |
| `message` | string | yes | Not blank |

Contact response fields:

```text
id, name, email, subject, message, createdAt, updatedAt
```

## Newsletters

Base path:

```text
/api/v1/newsletters
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/newsletters` | Create newsletter subscription | `201 NewsletterResponse` |
| `GET` | `/api/v1/newsletters` | List subscriptions | `200 NewsletterResponse[]` |
| `GET` | `/api/v1/newsletters/{id}` | Get subscription by id | `200 NewsletterResponse` |
| `PUT` | `/api/v1/newsletters/{id}` | Update subscription | `200 NewsletterResponse` |
| `DELETE` | `/api/v1/newsletters/{id}` | Delete subscription | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `email` | string | yes | Valid email |
| `accepted` | boolean | no |  |

Newsletter response fields:

```text
id, email, accepted, createdAt, updatedAt
```

## Notifications

Base path:

```text
/api/v1/notifications
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/notifications` | Create notification | `201 NotificationResponse` |
| `GET` | `/api/v1/notifications` | List notifications | `200 NotificationResponse[]` |
| `GET` | `/api/v1/notifications?userId={id}` | List notifications for user | `200 NotificationResponse[]` |
| `GET` | `/api/v1/notifications/{id}` | Get notification by id | `200 NotificationResponse` |
| `PUT` | `/api/v1/notifications/{id}` | Update notification | `200 NotificationResponse` |
| `DELETE` | `/api/v1/notifications/{id}` | Delete notification | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Not blank |
| `message` | string | yes | Not blank |
| `type` | enum | yes | `SYSTEM`, `COMMENT`, `LIKE` |
| `isRead` | boolean | no |  |
| `userId` | number | no | User id |

Notification response fields:

```text
id, title, message, type, isRead, user, createdAt, updatedAt
```

Nested notification user fields:

```text
id, name, email
```

## Settings

Base path:

```text
/api/v1/settings
```

Endpoints:

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/settings` | Create setting | `201 SettingResponse` |
| `GET` | `/api/v1/settings` | List settings | `200 SettingResponse[]` |
| `GET` | `/api/v1/settings/{id}` | Get setting by id | `200 SettingResponse` |
| `PUT` | `/api/v1/settings/{id}` | Update setting | `200 SettingResponse` |
| `DELETE` | `/api/v1/settings/{id}` | Delete setting | `204` |

Create/update request:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `key` | string | yes | Not blank |
| `value` | string | yes | Not blank |

Setting response fields:

```text
id, key, value, createdAt, updatedAt
```
