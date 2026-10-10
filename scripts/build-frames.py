#!/usr/bin/env python3
"""Inspect source PNG frames, pick motion-weighted subsets, write optimized WebP + src/data/frames.json.
Usage: python3 scripts/build-frames.py [--src source-assets/frames_24fps] [--keep-mark]
Needs: pip install pillow numpy opencv-python  (opencv only for watermark removal)"""
import argparse, glob, json, os
import numpy as np
from PIL import Image
ap = argparse.ArgumentParser()
ap.add_argument('--src', default='source-assets/frames_24fps')
ap.add_argument('--keep-mark', action='store_true', help='do not inpaint the generator watermark')
ap.add_argument('--mark', default='1128,570,1192,632', help='x0,y0,x1,y1 of watermark')
a = ap.parse_args()
files = sorted(glob.glob(os.path.join(a.src, '*.png')))
N = len(files); assert N, f'no PNGs in {a.src}'
small = [np.asarray(Image.open(f).convert('L').resize((160, 90)), dtype=np.float32) for f in files]
diff = np.array([0] + [np.abs(small[i] - small[i-1]).mean() for i in range(1, N)])
def pick(k, boost=0.6):  # evenly spaced in (1 + boost*normalized motion) space, endpoints kept
    w = 1 + boost * diff / max(diff.mean(), 1e-6)
    c = np.cumsum(w); c = (c - c[0]) / (c[-1] - c[0])
    idx = sorted({int(np.abs(c - t).argmin()) for t in np.linspace(0, 1, k)})
    idx[0], idx[-1] = 0, N - 1
    return idx
sets = {'desktop': (121, 1280, 80), 'mobile': (61, 960, 72)}
mark = None
if not a.keep_mark:
    import cv2
    x0, y0, x1, y1 = map(int, a.mark.split(','))
    mark = np.zeros((720, 1280), np.uint8); mark[y0:y1, x0:x1] = 255
    mark = cv2.dilate(mark, np.ones((9, 9), np.uint8))
out = {'source': {'count': N, 'fps': 24}}
print('Top motion frames:', np.argsort(diff)[-5:][::-1] + 1)
for name, (k, w, q) in sets.items():
    d = f'public/frames/{name}'; os.makedirs(d, exist_ok=True)
    for old in glob.glob(d + '/*.webp'): os.remove(old)
    idx = pick(k)
    for n, i in enumerate(idx):
        im = Image.open(files[i]).convert('RGB')
        if mark is not None:
            import cv2
            arr = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
            arr = cv2.inpaint(arr, mark, 6, cv2.INPAINT_TELEA)
            im = Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f'{d}/{n:03d}.webp', 'WEBP', quality=q, method=6)
    out[name] = {'dir': name, 'count': len(idx), 'width': w, 'height': h, 'sourceFrames': [i + 1 for i in idx]}
    print(name, len(idx), 'frames')
json.dump(out, open('src/data/frames.json', 'w'), indent=1)
