// PDOK Locatieserver: free Dutch government address search (no API key).
// https://www.pdok.nl/pdok-locatieserver
const BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

export interface Suggestion { id: string; label: string; type: string }
export interface Place { label: string; type: string; lng: number; lat: number; postcode?: string }

export async function suggest(q: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const params = new URLSearchParams({
    q,
    rows: '6',
    fq: 'type:(adres OR postcode OR weg OR woonplaats OR wijk OR buurt)',
    // Bias results towards Nieuwegein / IJsselstein / Utrecht-Zuid / Vianen.
    lat: '52.03', lon: '5.09',
  });
  const res = await fetch(`${BASE}/suggest?${params}`, { signal });
  if (!res.ok) throw new Error(`PDOK ${res.status}`);
  const json = await res.json();
  return (json.response?.docs ?? []).map((d: any) => ({ id: d.id, label: d.weergavenaam, type: d.type }));
}

export async function lookup(id: string, signal?: AbortSignal): Promise<Place> {
  const params = new URLSearchParams({ id, fl: 'weergavenaam,type,centroide_ll,postcode' });
  const res = await fetch(`${BASE}/lookup?${params}`, { signal });
  if (!res.ok) throw new Error(`PDOK ${res.status}`);
  const d = (await res.json()).response?.docs?.[0];
  const m = /POINT\(([\d.-]+) ([\d.-]+)\)/.exec(d?.centroide_ll ?? '');
  if (!m) throw new Error('PDOK: no coordinates');
  return { label: d.weergavenaam, type: d.type, lng: +m[1], lat: +m[2], postcode: d.postcode };
}
