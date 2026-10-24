# StormWise Quiz

A small educational web app that helps students in Switzerland learn about
extreme weather safety. Three scenarios (flooding, heatwaves, severe
thunderstorms), three multiple-choice questions each, instant feedback with
explanations and links to official Swiss guidance, and a final score with a
summary.

No accounts, no database, no build step, no dependencies: plain HTML, CSS and
JavaScript.

## Run it locally

Option A (recommended, any machine with Python 3):

```bash
cd stormwise-quiz
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

Option B: open `index.html` directly as a file. The app then loads its content
from `content-fallback.js`, which mirrors `content.json` (run the tests after
editing content so the two stay in sync).

## Edit the content

All questions, answers, explanations and source links live in **content.json**.
Structure per scenario: `id`, `title`, `icon`, `tagline`, a scenario-level
`source`, and `questions`. Each question has `question`, `options`,
`answerIndex` (0-based index of the correct option), `explanation`, and a
`source` with `label` and `url`.

After editing content.json, regenerate the fallback and run the checks:

```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('content.json','utf8'));fs.writeFileSync('content-fallback.js','window.STORMWISE_CONTENT = '+JSON.stringify(d,null,1)+';\n')"
node --test tests/content.test.js
```

The tests verify: three scenarios in order, three questions per scenario,
unique options, a valid answer index, an explanation, and an https source
link on every question.

## Files

- `index.html` page structure and screens (home, quiz, results)
- `style.css` responsive styling, mobile and desktop
- `app.js` quiz flow, scoring and feedback logic
- `content.json` all editable quiz content
- `content-fallback.js` generated mirror of content.json for file:// use
- `tests/content.test.js` content validation tests (Node 18+, no packages)

## Dependencies and third-party assets

None. No frameworks, no CDN calls, no web fonts, no images. Scenario icons
are standard Unicode emoji rendered by the visitor's own device.

## Licence

MIT (see LICENSE). The sample quiz content is provided as a learning aid;
verify factual content and links against the official sources before
classroom or production use.

## AI disclosure

This prototype was drafted with the assistance of a generative AI tool
(Muse, by Meta). All generated output was checked by the developer:
the content structure is covered by automated tests, the quiz flow was
reviewed line by line, and explanations were written against the official
sources linked in the app (MeteoSwiss, the federal natural hazards portal
naturgefahren.ch, and the Federal Office of Public Health). The client
should still verify every question, answer and link against their own
approved content before delivery to students.
