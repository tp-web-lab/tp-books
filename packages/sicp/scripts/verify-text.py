"""Compare all reading sections with the supplied PDF. Requires pymupdf==2.1.

Normalization ignores layout, punctuation, case and Unicode ligatures. Numeric
characters are retained. Math/typesetting fragments are reviewed separately;
this is not a pixel or punctuation identity test. Unexpected differences fail.
"""
import hashlib, html, json, re, unicodedata
from pathlib import Path
from difflib import SequenceMatcher
import pymupdf
ROOT = Path(__file__).resolve().parent.parent

def normalize(text):
    text = unicodedata.normalize('NFKC', html.unescape(text)).lower()
    text = re.sub(r'(?<=\w)-\s*\n\s*(?=\w)', '', text)
    return re.sub(r'[^a-z0-9]', '', text)

def extract(pdf):
    pages = []
    for page in pdf:
        rules = [d['rect'].y0 for d in page.get_drawings()
                 if d['rect'].height < 1 and 149 < d['rect'].width < 180
                 and 116 < d['rect'].x0 < 121 and d['rect'].y0 > 150
                 and .49 < d['width'] < .51]
        cut = min(rules) if rules else page.rect.height
        lines = [ ''.join(s['text'] for s in line['spans'])
                  for block in page.get_text('dict')['blocks']
                  for line in block.get('lines', []) if line['bbox'][1] > 110 ]
        pages.append(dict(text='\n'.join(lines),sorted=page.get_text(sort=True),
            body=page.get_text(clip=pymupdf.Rect(0,110,page.rect.width,cut),sort=True),
            notes=page.get_text(clip=pymupdf.Rect(0,cut,page.rect.width,page.rect.height),sort=True) if rules else ''))
    return pages

def fragments(text):
    text = re.sub(r'```.*?```|(?m:^:::[^\n]*$)|!\[[^\]]*\]\([^)]*\)|(?m:^> ?\\[^\n]*$)', '\n\n', text, flags=re.S)
    text = re.sub(r'\$\$.*?\$\$|(?<!\\)\$(?:\\.|[^$])+\$', '\n\n', text, flags=re.S)
    text = re.sub(r'\[\^[\d-]+\]:?', '', text)
    text = re.sub(r'(?m:^#+ )', '', text)
    return [s.strip() for s in re.split(r'\n\s*\n|(?<=[.!?;:])\s+', text) if len(normalize(s)) >= 15]

def interrupted_match(needle, haystack):
    # Check all characters in order, allowing inserted floating figures,
    # footnotes, and page furniture inside the PDF sentence.
    for offset in (0,len(needle)//2,max(0,len(needle)-25)):
        anchor=needle[offset:offset+20]; pos=haystack.find(anchor)
        for _ in range(10):
            if pos < 0: break
            window=haystack[max(0,pos-offset-250):pos-offset+len(needle)+1500]
            matcher=SequenceMatcher(None,needle,window,autojunk=False)
            if sum(b.size for b in matcher.get_matching_blocks()) == len(needle): return True
            pos=haystack.find(anchor,pos+1)
    return False

def code_normalize(text):
    text=html.unescape(unicodedata.normalize('NFKC',text))
    for before,after in [('’',"'"),('‘',"'"),('“','"'),('”','"'),('−','-'),('–','-')]: text=text.replace(before,after)
    return re.sub(r'\s+', '', text)

def clean_pdf_commands(text):
    for _ in range(6):
        text=re.sub(r'\\(?:emph|textit)\{([^{}]*)\}',r'\1',text)
        text=re.sub(r'\{\\JS~([^~]*)~\}',r'\1',text)
    return text

def check_codes(content,pages,spans,headings):
    counts=dict(matched=0,corrected_pdf_formatting=0,interrupted=0,reviewed=0,unresolved=0)
    findings=[]
    for match in re.finditer(r'```(scheme|text)\n([\s\S]*?)```',content):
        section=max(i for i,h in enumerate(headings) if h.start()<match.start())
        span=spans[section];selected=pages[span['pdfPage']-1:span['pdfLastPage']]
        raw='|'.join(code_normalize('\n'.join(p[k] for p in selected)) for k in ('sorted','body','notes'))
        cleaned='|'.join(code_normalize(clean_pdf_commands('\n'.join(p[k] for p in selected))) for k in ('sorted','body','notes'))
        code=match[2].strip();needle=code_normalize(code);normalized=code_normalize(clean_pdf_commands(code))
        if needle in raw:status='matched'
        elif normalized in cleaned:status='corrected_pdf_formatting'
        elif interrupted_match(normalized,cleaned):status='interrupted'
        elif hashlib.sha256(code.encode()).hexdigest() == 'ea69c3f45420dcf5231122410a35903d25624a766518bf2ac74caedf1681da68':
            status='reviewed' # PDF page 82 loses the caret pointers; retain the XML annotation.
        else:status='unresolved'
        counts[status]+=1
        if status not in ('matched',):findings.append(dict(section=headings[section][1],status=status,code=code))
    return counts,findings

def main():
    pdf_path=ROOT/'public/original/sicp.pdf'; source=ROOT/'source/sicp-canonical.md'
    content=source.read_text(); pages=extract(pymupdf.open(pdf_path))
    spans=json.loads((ROOT/'source/pdf-sections.json').read_text())
    reviews=json.loads((ROOT/'source/text-review.json').read_text())
    headings=list(re.finditer(r'^#{1,2} (.+)$',content,re.M)); sections=[]; findings=[]
    for index,heading in enumerate(headings):
        span=spans[index]; selected=pages[span['pdfPage']-1:span['pdfLastPage']]
        # A separate body and footnote stream preserves sentences split by a page break.
        haystack='|'.join(normalize('\n'.join(p[k] for p in selected)) for k in ('text','body','notes'))
        text=content[heading.end():headings[index+1].start() if index+1<len(headings) else len(content)]
        counts=dict(matched=0,interrupted=0,reviewed=0,unresolved=0)
        for unit in fragments(text):
            needle=normalize(unit); key=hashlib.sha256(unit.encode()).hexdigest()
            if needle in haystack: status='matched'
            elif interrupted_match(needle,haystack): status='interrupted'
            elif key in reviews: status='reviewed'
            else: status='unresolved'
            counts[status]+=1
            if status in ('reviewed','unresolved'):
                findings.append(dict(section=heading[1],key=key,text=unit,status=status,review=reviews.get(key)))
        sections.append(dict(section=heading[1],pdfPages=[span['pdfPage'],span['pdfLastPage']],**counts))
    code_counts,code_findings=check_codes(content,pages,spans,headings)
    report=dict(codeCounts=code_counts,codeFindings=code_findings,pdfSha256=hashlib.sha256(pdf_path.read_bytes()).hexdigest(),sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),sections=sections,findings=findings)
    (ROOT/'text-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    totals={key:sum(s[key] for s in sections) for key in ('matched','interrupted','reviewed','unresolved')}
    print(json.dumps(totals));print('Code:',json.dumps(code_counts));return bool(totals['unresolved'] or code_counts['unresolved'])
if __name__=='__main__': raise SystemExit(main())
