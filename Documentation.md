# Briz Documentation

Lightweight JavaScript library for making AJAX requests using declarative HTML attributes, inspired by hypermedia-driven application

## Installation

download the file and include it on your project

```html
<script src="main.js"></script>
```

The library will automatically initialize on `DOMContentLoaded`.

## Basic Usage

### GET Request

```html
<button z-get="/api/data" z-target="#result">
  Load Data
</button>

<div id="result"></div>
```

### POST Request

```html
<button z-post="/api/submit" z-target="#response">
  Submit
</button>
```

## Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `z-get` | URL for GET request | `z-get="/api/users"` |
| `z-post` | URL for POST request | `z-post="/api/create"` |
| `z-target` | CSS selector target for HTML response | `z-target="#content"` |
| `z-trigger` | Event that triggers the request | `z-trigger="input"` |
| `z-data` | CSS selector of form for POST data | `z-data="#myForm"` |
| `z-headers` | Custom headers (JSON string) | `z-headers='{"X-Token":"abc"}'` |
| `z-options` | Additional fetch options (JSON string) | `z-options='{"cache":"no-cache"}'` |

## Default Triggers

If `z-trigger` is not specified, default events based on element type:

- `BUTTON`, `A` → `click`
- `FORM` → `submit`
- `INPUT`, `TEXTAREA` → `input`
- `SELECT` → `change`

## Form Data Example

```html
<form id="userForm">
  <input name="username" value="john">
  <input name="email" value="john@example.com">
</form>

<button z-post="/api/user" z-data="#userForm" z-target="#result">
  Submit Form
</button>
```

## Global Configuration

```javascript
// Inject global headers and options
$fetch.inject({
  headers: {
    "Authorization": "Bearer token123",
    "X-Custom": "value"
  },
  options: {
    credentials: "include",
    cache: "no-cache"
  }
});
```

## Manual Fetch

```javascript
// Use $fetch programmatically
await $fetch("/api/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
  target: "#result"
});
```

## Features

✅ Event delegation (efficient)  
✅ Automatic form data handling  
✅ Global headers/options injection  
✅ Multiple request types (GET, POST)  
✅ Auto-submit prevention for forms  
✅ Built-in error handling

## Browser Support

Modern browsers with support for:
- `fetch` API
- `FormData`
- `URLSearchParams`
- ES6+ syntax

## Examples

### Live Search

```html
<input 
  type="text" 
  z-get="/search" 
  z-trigger="input"
  z-target="#results"
  placeholder="Search...">

<div id="results"></div>
```

### Form Submission

```html
<form id="loginForm">
  <input name="username" type="text">
  <input name="password" type="password">
  <button z-post="/login" z-data="#loginForm" z-target="#message">
    Login
  </button>
</form>

<div id="message"></div>
```

### Custom Headers

```html
<button 
  z-get="/api/protected" 
  z-headers='{"Authorization":"Bearer xyz123"}'
  z-target="#content">
  Load Protected Data
</button>
```

### Select Change Event

```html
<select z-get="/filter" z-target="#filtered">
  <option value="all">All</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>

<div id="filtered"></div>
```

## License

MIT