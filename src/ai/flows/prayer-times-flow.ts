
'use server';
/**
 * @fileOverview A flow for fetching prayer times from Aladhan API with sane defaults.
 * - Auto-detects calculation method/timezone from Arabic country/city when possible.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';
import { resolveLocationMapping } from '@/lib/locations';

// Schema for getting prayer times
const PrayerTimesInputSchema = z.object({
  city: z.string().describe('The city to get prayer times for.'),
  country: z.string().describe('The country the city is in.'),
  method: z.number().optional().describe('Optional calculation method ID (overrides default).'),
  timezonestring: z.string().optional().describe('Optional IANA timezone (overrides default).'),
});
export type PrayerTimesInput = z.infer<typeof PrayerTimesInputSchema>;

const PrayerTimesOutputSchema = z.object({
  fajr: z.string().describe('Fajr prayer time in HH:MM format.'),
  shuruq: z.string().describe('Shuruq (sunrise) time in HH:MM format.'),
  dhuhr: z.string().describe('Dhuhr prayer time in HH:MM format.'),
  asr: z.string().describe('Asr prayer time in HH:MM format.'),
  maghrib: z.string().describe('Maghrib prayer time in HH:MM format.'),
  isha: z.string().describe('Isha prayer time in HH:MM format.'),
});
export type PrayerTimesOutput = z.infer<typeof PrayerTimesOutputSchema>;

const getPrayerTimesFlow = ai.defineFlow(
  {
    name: 'getPrayerTimesFlow',
    inputSchema: PrayerTimesInputSchema,
    outputSchema: PrayerTimesOutputSchema,
  },
  async (input) => {
    const mapping = resolveLocationMapping(input.country, input.city);
    const method = input.method ?? mapping.method ?? 23; // الأردن افتراضيًا
    const tz = input.timezonestring ?? mapping.timeZone;
    const countryParam = mapping.apiCountry ?? input.country;
    const cityParam = mapping.apiCity ?? input.city;

    const params = new URLSearchParams({
      city: cityParam,
      country: countryParam,
      method: String(method),
    });
    if (tz) params.append('timezonestring', tz);

    const url = `https://api.aladhan.com/v1/timingsByCity?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Aladhan API error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed to fetch prayer times. Status: ${response.status}`);
      }
      const data: any = await response.json();

      if (data.code !== 200 || !data.data?.timings) {
        console.error('Invalid data structure from Aladhan API', data);
        throw new Error('Invalid data structure received from prayer times API.');
      }

      const normalize = (v: string) => (v ? String(v).split(' ')[0] : '');
      const t = data.data.timings;

      return {
        fajr: normalize(t.Fajr),
        shuruq: normalize(t.Sunrise),
        dhuhr: normalize(t.Dhuhr),
        asr: normalize(t.Asr),
        maghrib: normalize(t.Maghrib),
        isha: normalize(t.Isha),
      };

    } catch (error) {
      console.error('Error fetching prayer times data:', error);
      throw error;
    }
  }
);

export async function getPrayerTimes(input: PrayerTimesInput): Promise<PrayerTimesOutput> {
  return getPrayerTimesFlow(input);
}
