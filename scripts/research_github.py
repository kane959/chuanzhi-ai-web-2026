"""Capture read-only GitHub evidence for the selected frontend/agent references."""
import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1] / 'research' / 'github-2026-10-28'
REPOS = [
    'vercel-labs/agent-skills', 'anthropics/skills', 'ag-ui-protocol/ag-ui',
    'assistant-ui/assistant-ui', 'shadcn-ui/ui', 'xyflow/xyflow',
    'CopilotKit/CopilotKit', 'microsoft/markitdown',
    'Leonxlnx/taste-skill', 'oil-oil/oil-ui',
]


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'CampusFlow-readonly-research'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode('utf-8')


def capture(repo):
    folder = ROOT / repo.replace('/', '--')
    folder.mkdir(parents=True, exist_ok=True)
    result = {'repo': repo, 'url': f'https://github.com/{repo}', 'capturedAt': dt.datetime.now(dt.timezone.utc).isoformat()}
    try:
        metadata = json.loads(fetch(f'https://api.github.com/repos/{repo}'))
        branch = metadata['default_branch']
        result.update(license=(metadata.get('license') or {}).get('spdx_id'), defaultBranch=branch,
                      updatedAt=metadata['updated_at'], stars=metadata['stargazers_count'])
        commit = json.loads(fetch(f'https://api.github.com/repos/{repo}/commits/{branch}'))['sha']
        result['commit'] = commit
        for name in ['README.md', 'LICENSE', 'LICENSE.txt']:
            try:
                content = fetch(f'https://raw.githubusercontent.com/{repo}/{commit}/{name}')
                (folder / name).write_text(content, encoding='utf-8')
            except Exception as exc:
                result.setdefault('fileNotes', {})[name] = str(exc)
    except Exception as exc:
        result['error'] = str(exc)
    (folder / 'metadata.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    return result


if __name__ == '__main__':
    ROOT.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(capture, REPOS))
    (ROOT / 'index.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    for item in results:
        print(item['repo'], item.get('license'), item.get('commit', '')[:12], item.get('error', 'captured'))
