# tabsnap

CLI tool to save and restore browser tab sessions as JSON bookmarks.

## Installation

```bash
npm install -g tabsnap
```

## Usage

Save your current browser tabs to a snapshot file:

```bash
tabsnap save my-session
```

Restore tabs from a previously saved snapshot:

```bash
tabsnap restore my-session
```

List all saved snapshots:

```bash
tabsnap list
```

Snapshots are stored as JSON files in `~/.tabsnap/` and can be version-controlled, shared, or edited by hand.

```json
{
  "name": "my-session",
  "created": "2024-01-15T10:30:00Z",
  "tabs": [
    { "title": "GitHub", "url": "https://github.com" },
    { "title": "MDN Web Docs", "url": "https://developer.mozilla.org" }
  ]
}
```

## Requirements

- Node.js 16+
- Chrome or Firefox with the companion browser extension installed

## License

MIT © tabsnap contributors