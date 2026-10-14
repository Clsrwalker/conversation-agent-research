# Conversation Agent Research

Research website by Xiang Li, with harness architecture diagrams, recorded-run
dashboards, studies, limitations, and downloadable evidence.

**Website:** https://clsrwalker.github.io/conversation-agent-research/

## What works online

The overview, interactive diagrams, historical dashboards, case explorer, study
pages, and existing evidence downloads are static files included in this
repository. They work without the original experiment environment or a model
server. The website does not start model runs or receive new local runs.

The Harness Test Bench and live monitor are separate local applications. The
Lab button asks for a connection on first use; localhost is an explicit option
for the computer running the service. The overview lets an owner save a
private Tailscale HTTPS Lab address in that browser for access from another
device. Each browser and website origin needs its own saved address. Both
devices must be connected to the owner's Tailscale account, and
the Windows Lab must have private remote access configured. The private address
is not sent to this website. GitHub Pages does not host Python, Ollama, or the
agent execution service. Recorded runs remain available online.

## Publish and update

In this repository's **Settings → Pages**, select **Deploy from a branch**,
branch **main**, and folder **/ (root)**. Keep `index.html`, `.nojekyll`, and the
other exported files at the repository root. Subsequent pushes to `main`
automatically update the Pages site through GitHub's Pages deployment.

This repository contains the already exported website. CI does not need to
rebuild research evidence or install the original experiment environment.

The maintained website source belongs to the parent research project at
`sites/conversation-agent-research/`. To refresh this publication checkout from
that project, run:

```sh
python scripts/publication/export_github_pages.py
```

The default destination is
`output/publications/github-pages/conversation-agent-research`. Use
`--destination` for another checkout. Review the exported changes, then commit
and push from the publication checkout. The export preserves `.git`, does not
push, and refuses to overwrite unrelated or locally edited files. It also
refuses stale managed files instead of silently deleting them.

The exporter copies `sites/conversation-agent-research/dist/`, including its
existing downloads, and records relative filenames and hashes in
`.github-pages-export.json`. Local absolute paths are not exported. Research
evidence must be regenerated and reviewed in the parent project before export;
this publication copy does not replace the original logs or frozen results.
