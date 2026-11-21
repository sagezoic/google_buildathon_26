import numpy as np, wave
SR = 44100; BPM = 120; B = 60 / BPM; DUR = 21.0
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR)); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[:j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.414 / 1.414
    R[i:j] += s * np.sqrt((1 + pan) / 2)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def pluck(m, dur=1.2, bright=0.5):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2*np.pi*f*t) * env(n, .003, .45) + bright*0.35*np.sin(2*np.pi*f*4*t) * env(n, .001, .05) + 0.18*np.sin(2*np.pi*f*2*t)*env(n,.002,.2)
    return s
def kick():
    n = int(SR * .35); t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t / .03)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t / .12)
def shaker():
    n = int(SR * .06); x = rng.standard_normal(n)
    x = np.diff(np.concatenate([[0], x]))  # brighten
    return x * env(n, .004, .015)
def bass(m, dur):
    n = int(SR * dur); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2*np.pi*f*t) + 0.25*np.sin(2*np.pi*2*f*t)
    a = np.minimum(1, t/.01) * np.minimum(1, (dur - t)/.05).clip(0) * np.exp(-t/1.2)
    return s * a
def pad(ms, dur, att=.6):
    n = int(SR * dur); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for d in (-0.07, 0.07):
            s += np.sin(2*np.pi*hz(m + d)*t) + 0.2*np.sin(2*np.pi*2*hz(m+d)*t)
    a = np.minimum(1, t/att) * np.minimum(1, (dur - t)/.5).clip(0)
    return s * a / (2*len(ms))
def stamp(m=38):
    n = int(SR * .6); t = np.arange(n) / SR
    f = hz(m) * (1 + 0.6*np.exp(-t/.02))
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t/.16)
    nz = rng.standard_normal(n); nz = np.convolve(nz, np.ones(40)/40, 'same') * np.exp(-t/.03)
    return body + 0.8*nz
def click():
    n = int(SR*.03); t = np.arange(n)/SR
    return np.sin(2*np.pi*2200*t) * np.exp(-t/.004)

# D major. Chords per bar (4 beats = 2 s)
CH = {'D':[50,54,57], 'Bm':[47,50,54], 'G':[43,47,50], 'A':[45,49,52]}
prog = ['D','Bm','G','A','D','Bm','G','A','Bm','D','D']
for bar, c in enumerate(prog):
    t0 = bar * 4 * B
    if t0 >= DUR: break
    dur = min(4*B, DUR - t0) + (2.5 if bar >= 9 else 0.3)
    add(pad([m+12 for m in CH[c]], dur), t0, 0.10 if bar < 2 else 0.13)
    if 2 <= bar <= 8:
        root = CH[c][0] - 12
        for k in range(4):
            add(bass(root, B*0.9), t0 + k*B, 0.28)
# Hook: sparse plucks on half-bar beats
for b, m in [(0,74),(2,69),(4,71),(6,73)]:
    add(pluck(m, 1.5, .3), b*B, 0.16, -0.2)
# Groove beats 8..36
for b in range(8, 36):
    add(kick(), b*B, 0.42 if b % 2 == 0 else 0.3)
    add(shaker(), b*B + B/2, 0.05, 0.35)
    add(shaker(), b*B + B/4, 0.02, -0.35)
# Melody arpeggio from beat 8, quieter under busy captions
for b in range(8, 36):
    c = CH[prog[b // 4]]; tones = [c[0]+24, c[1]+24, c[2]+24, c[0]+36]
    if b % 2 == 0:
        add(pluck(tones[(b//2) % 4], 0.9, .4), b*B, 0.07, 0.25)
# Reveal swell at beat 8
add(pad([62, 66, 69, 74], 3.0, .05), 8*B, 0.09)
# SFX in key
add(stamp(38), 5*B, 0.55)                       # 465 stamp
for i, m in enumerate([62, 66, 69, 74, 78]):    # upload rows 7.5..8.5
    add(pluck(m, .5, .6), 7.5 + .25*i, 0.11, -0.3 + .15*i)
for i, m in enumerate([81, 83, 85, 86]):        # badge scan 9.0..9.75
    add(pluck(m, .35, .8), 9.0 + .25*i, 0.05, 0.3)
add(stamp(38), 25*B, 0.6)                       # finding stamp 12.5
add(click(), 32*B, 0.06)                        # cursor click 16.0
for i, m in enumerate([74, 78, 81, 86]):        # anchored chime
    add(pluck(m, 1.6, .2), 32*B + i*B/4, 0.12, -0.2 + .13*i)
# Outro resolve at 18.0
add(pad([50, 57, 62, 66, 69], 3.0, .02), 36*B, 0.16)
add(bass(38, 2.8), 36*B, 0.3)
for i, m in enumerate([62, 66, 69, 74]):
    add(pluck(m, 2.5, .25), 36*B + i*B/2, 0.1, -0.2 + .13*i)
add(kick(), 36*B, 0.35)

# Reverb: exponential noise IR
def reverb(x, sec=1.4, mix=.18):
    n = int(SR*sec); t = np.arange(n)/SR
    ir = rng.standard_normal(n) * np.exp(-t/0.35); ir[:int(.012*SR)] = 0; ir /= np.sqrt((ir**2).sum())
    M = len(x) + n; F = 1 << (M-1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]
    return x + mix * y
L, R = reverb(L), reverb(R)
# gentle lowpass to soften highs
def lp(x, a=.35):
    y = np.empty_like(x); acc = 0.0
    from itertools import accumulate
    # one-pole via lfilter-like loop vectorised with cumulative trick avoided; simple loop is fine
    for i in range(len(x)): acc += a*(x[i]-acc); y[i] = acc
    return y
L, R = lp(L, .55), lp(R, .55)
st = np.stack([L, R], 1)
fade = np.ones(N); fn = int(.6*SR); fade[-fn:] = np.linspace(1, 0, fn); st *= fade[:, None]
st = np.tanh(st / np.abs(st).max() * 1.1) ; st /= np.abs(st).max(); st *= 0.89
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', st.shape)
