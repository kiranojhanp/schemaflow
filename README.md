# SchemaFlow

DBML visualizer that just works. Built with React Flow.

## The Story

I love DBML for its simplicity in defining database schemas. The official tool (dbdiagram.io) is great but those subscription prompts were driving me nuts. Looking for alternatives, I found... well, nothing good.

So I built SchemaFlow. Turns out making a decent DBML visualizer is trickier than I thought - had to write my own syntax highlighter for Monaco editor and everything. But hey, it works! 

Currently thinking about extracting the DB viewer into a separate package. We'll see.

## Features

- 🎨 Clean DBML visualization
- ✍️ Code editor with syntax highlighting
- 🔄 Live updates
- 📱 Drag tables around
- 💾 Remembers table positions
- 🌓 Dark mode (because why not)
- 🆓 Free, open source, no annoying prompts

## Quick Start

```bash
npm install
npm run dev
```

## How to Use

1. Paste your DBML in the editor
2. Watch the magic happen
3. Move stuff around if you want
4. That's it!

## Example

```dbml
Table users {
  id integer [primary key]
  username varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  author_id integer
}

Ref: posts.author_id > users.id
```

## Tech Stack

- React + TypeScript
- React Flow
- Monaco Editor
- Zustand
- @dbml/core

## Want to Help?

Found a bug? Want a feature? PRs welcome!

## License

MIT

---

Made with ❤️ 