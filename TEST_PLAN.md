# Backend testing plan

Use pytest with FastAPI TestClient and a fixture that restores the fictional activity database before and after each test. Cover the redirect, activity listing, signup, duplicate prevention, unknown activities, unregister, missing participant, missing email and a complete signup/unregister round trip. Run `python -m pytest -v` and `node --check src/static/app.js`. CI runs the same commands on branch pushes and pull requests. This exercise is an unauthenticated fictional-data demo, not a production student system.
