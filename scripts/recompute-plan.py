"""Recalculates meal-plan-data.json after an edit: recipe macros (from per-100g values), day totals,
and every week's shopping list (quantities, days used, opened-pack notes).

Buy text is kept as written unless that week's total changes or the item is new to the week.

Usage: python3 scripts/recompute-plan.py [meal-plan-data.json]
Import recompute(data) to edit and recalculate in one script.
"""
import json
import math
import sys

# Raw packs that get a "keep it sealed" note when cooked on more than one day.
RAW_SHARED = {'chicken', 'thigh', 'beefmince', 'turkeymince', 'smokedsalmon'}
MACROS = ('kcal', 'protein', 'carbs', 'fat')


def default_buy(i, total):
    if i['category'] == 'pantry' or (i['category'] == 'frozen' and not i['stockTracked']):
        return None
    if i['unit'] == 'each':
        return f"{math.ceil(total - 1e-9)} loose"
    if i['packSize'] and i['unit'] == i['packUnit']:
        return f"{math.ceil(total / i['packSize'] - 1e-9)} × {i['packSize']}{i['unit']}"
    return None


def recompute(d):
    I = {i['id']: i for i in d['ingredients']}
    R = {r['id']: r for r in d['recipes']}
    for r in d['recipes']:
        if r['meal'] == 'batch':
            continue
        m = {k: 0.0 for k in MACROS}
        for x in r['ingredients']:
            i = I[x['ingredient']]
            g = x['qty'] if x['unit'] in ('g', 'ml') else x['qty'] * (i['unitWeight'] or 0)
            for k in m:
                m[k] += g * i['per100g'][k] / 100
        r['macros'] = {k: round(v) for k, v in m.items()}

    notes = []
    for w in d['weeks']:
        for day in w['days']:
            t = {k: 0 for k in MACROS}
            for meal in day['meals']:
                if meal['recipe']:
                    for k in t:
                        t[k] += R[meal['recipe']]['macros'][k]
            day['totals'] = t

        agg = {}
        for day in w['days']:
            for meal in day['meals']:
                if not meal['recipe']:
                    continue
                r = R[meal['recipe']]
                cook = r.get('batchCookedOn') or day['day']
                for x in r['ingredients']:
                    a = agg.setdefault(x['ingredient'], {'qty': 0, 'days': [], 'cook': []})
                    a['qty'] += x['qty']
                    if day['day'] not in a['days']:
                        a['days'].append(day['day'])
                    if cook not in a['cook']:
                        a['cook'].append(cook)

        old = {s['ingredient']: s for s in w['shopping']}
        out = []
        for iid, a in agg.items():
            i = I[iid]
            s = old.get(iid)
            total = round(a['qty'] * 100) / 100
            if total == int(total):
                total = int(total)
            e = {'ingredient': iid, 'name': i['name'], 'category': i['category'], 'totalQty': total, 'unit': i['unit'],
                 'packSize': i['packSize'], 'packUnit': i['packUnit'], 'stockTracked': i['stockTracked'], 'usedOnDays': a['days']}
            if s and abs(s['totalQty'] - total) < 1e-9 and 'buy' in s:
                e['buy'] = s['buy']
            else:
                b = default_buy(i, total)
                if b:
                    e['buy'] = b
                if s is None:
                    notes.append(f"W{w['week']} {iid} added: {total}{i['unit']}, buy {b}")
                elif s.get('buy') != b:
                    notes.append(f"W{w['week']} {iid}: {s.get('buy')} -> {b} (total {total})")
            order = d['dayOrder']
            first = min(a['cook'], key=order.index)
            last = max(a['cook'], key=order.index)
            # The app turns these days into real dates from the shop date.
            e['lastNeededOn'] = last
            if iid in RAW_SHARED and len(a['cook']) > 1:
                e['openedPack'] = {'openedOn': first}
            out.append(e)
        for k in old:
            if k not in agg:
                notes.append(f"W{w['week']} {k} no longer used")
        rank = {k: n for n, k in enumerate(old)}
        out.sort(key=lambda e: rank.get(e['ingredient'], 10_000))
        w['shopping'] = out
    return notes


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def save(path, d):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(d, indent=2, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'meal-plan-data.json'
    data = load(path)
    print('\n'.join(recompute(data)) or 'No shopping changes')
    save(path, data)
