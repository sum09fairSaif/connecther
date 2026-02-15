import { Router } from 'express';

const router = Router();
const CACHE_TTL_MS = 10 * 60 * 1000;

const doctorsCache = new Map<
  string,
  { expiresAt: number; data: { success: true; source: string; doctors: any[] } }
>();

type NpiTaxonomy = {
  desc?: string;
  primary?: boolean;
};

type NpiAddress = {
  address_purpose?: string;
  address_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  telephone_number?: string;
};

type NpiResult = {
  number?: string;
  basic?: {
    first_name?: string;
    last_name?: string;
    organization_name?: string;
  };
  taxonomies?: NpiTaxonomy[];
  addresses?: NpiAddress[];
};

type NpiSearchResponse = {
  results?: NpiResult[];
};

const SPECIALTY_ALIASES: Record<string, string> = {
  'ob-gyn': 'Obstetrics & Gynecology',
  obgyn: 'Obstetrics & Gynecology',
  'ob gyn': 'Obstetrics & Gynecology',
  obstetrics: 'Obstetrics & Gynecology',
  gynecology: 'Obstetrics & Gynecology',
  "women's health": 'Obstetrics & Gynecology',
  'womens health': 'Obstetrics & Gynecology',
  'maternal fetal medicine': 'Maternal & Fetal Medicine',
  midwife: 'Advanced Practice Midwife',
  doula: 'Doula',
  pediatrics: 'Pediatrics',
  family: 'Family Medicine',
  primary: 'Family Medicine',
  internal: 'Internal Medicine',
};

function normalizeSpecialty(input: string): string {
  const raw = input.trim();
  if (!raw) return '';

  const key = raw.toLowerCase().replace(/\s+/g, ' ');
  if (SPECIALTY_ALIASES[key]) {
    return SPECIALTY_ALIASES[key];
  }

  return raw;
}

function pickPrimaryTaxonomy(taxonomies?: NpiTaxonomy[]): string {
  if (!taxonomies || taxonomies.length === 0) {
    return 'General Practice';
  }

  const primary = taxonomies.find((taxonomy) => taxonomy.primary && taxonomy.desc);
  if (primary?.desc) {
    return primary.desc;
  }

  return taxonomies[0].desc || 'General Practice';
}

function pickLocationAddress(addresses?: NpiAddress[]): NpiAddress | null {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  return (
    addresses.find(
      (address) => address.address_purpose?.toUpperCase() === 'LOCATION'
    ) || addresses[0]
  );
}

function buildCacheKey(params: {
  city: string;
  state: string;
  zip: string;
  specialty: string;
  limit: number;
}): string {
  return JSON.stringify({
    city: params.city.toLowerCase(),
    state: params.state.toUpperCase(),
    zip: params.zip,
    specialty: params.specialty.toLowerCase(),
    limit: params.limit,
  });
}

async function fetchNpiResults(params: URLSearchParams): Promise<NpiResult[]> {
  const npiResponse = await fetch(
    `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`
  );

  if (!npiResponse.ok) {
    throw new Error(`NPI API request failed with status ${npiResponse.status}`);
  }

  const payload = (await npiResponse.json()) as NpiSearchResponse;
  return payload.results || [];
}

function mapNpiDoctors(results: NpiResult[], defaults: { city: string; state: string }) {
  return results
    .map((result) => {
      const fullName = [result.basic?.first_name, result.basic?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      const name = fullName || result.basic?.organization_name || 'Provider';
      const locationAddress = pickLocationAddress(result.addresses);

      return {
        id: `npi-${result.number || name.toLowerCase().replace(/\s+/g, '-')}`,
        name: `Dr. ${name}`,
        specialty: pickPrimaryTaxonomy(result.taxonomies),
        distanceMiles: null,
        rating: null,
        accepts: 'Insurance info unavailable',
        telehealth: false,
        address: locationAddress?.address_1 || '',
        city: locationAddress?.city || defaults.city,
        state: locationAddress?.state || defaults.state,
        zip: locationAddress?.postal_code || '',
        phone: locationAddress?.telephone_number || '',
        npi: result.number || '',
      };
    })
    .filter((doctor) => doctor.name.trim().length > 0);
}

// GET /api/doctors/search
router.get('/search', async (req, res) => {
  try {
    const zip =
      typeof req.query.zip === 'string' ? req.query.zip.trim() : '';
    const specialty =
      typeof req.query.specialty === 'string'
        ? req.query.specialty.trim()
        : '';
    const normalizedSpecialty = normalizeSpecialty(specialty);
    const city =
      typeof req.query.city === 'string' && req.query.city.trim()
        ? req.query.city.trim()
        : 'Boston';
    const state =
      typeof req.query.state === 'string' && req.query.state.trim()
        ? req.query.state.trim().toUpperCase()
        : 'MA';
    const requestedLimit =
      typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(50, Math.floor(requestedLimit)))
      : 20;
    const cacheKey = buildCacheKey({
      city,
      state,
      zip,
      specialty: normalizedSpecialty,
      limit,
    });
    const cached = doctorsCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }

    const params = new URLSearchParams({
      version: '2.1',
      enumeration_type: 'NPI-1',
      address_purpose: 'LOCATION',
      city,
      state,
      limit: String(limit),
    });

    if (zip) {
      params.set('postal_code', zip);
    }

    if (normalizedSpecialty) {
      params.set('taxonomy_description', normalizedSpecialty);
    }

    let results = await fetchNpiResults(params);

    // If a specialty filter returns no results, retry once without specialty.
    if (results.length === 0 && normalizedSpecialty) {
      params.delete('taxonomy_description');
      results = await fetchNpiResults(params);
    }

    const doctors = mapNpiDoctors(results, { city, state });
    const response = {
      success: true,
      source: 'npi',
      doctors,
    } as const;

    doctorsCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: response,
    });

    // Opportunistic cleanup to prevent unbounded growth.
    if (doctorsCache.size > 200) {
      for (const [key, entry] of doctorsCache.entries()) {
        if (entry.expiresAt <= Date.now()) {
          doctorsCache.delete(key);
        }
      }
    }

    return res.json(response);
  } catch (error: any) {
    console.error('Error searching doctors:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch doctors',
    });
  }
});

export default router;
