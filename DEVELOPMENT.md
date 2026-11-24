# Development notes

This training application serves a static HTML/CSS/JavaScript interface using FastAPI. The backend in `src/app.py` holds an in-memory activity dictionary; data resets on restart. The frontend fetches the activities API and submits signups.

## Run locally

```sh
python -m venv .venv
# Activate the virtual environment for your shell.
python -m pip install -r requirements.txt
python -m uvicorn src.app:app --reload
```

Open `http://localhost:8000` for the app or `/docs` for interactive API documentation.

## Development branch

```sh
git switch -c accelerate-with-copilot
git push -u origin accelerate-with-copilot
```

The branch already exists in this exercise repository; use `git switch accelerate-with-copilot` when it is available locally.

These notes were prepared with ChatGPT from the repository sources. The Copilot-specific IDE practice is separate.
