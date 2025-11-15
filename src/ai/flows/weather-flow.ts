'use server';
/**
 * @fileOverview A flow for fetching weather information.
 *
 * - getWeather - A function that returns the current temperature for a given location.
 * - WeatherInput - The input type for the getWeather function.
 * - WeatherOutput - The return type for the getWeather function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const WeatherInputSchema = z.object({
  city: z.string().describe('The city to get the weather for.'),
  country: z.string().describe('The country the city is in.'),
});
export type WeatherInput = z.infer<typeof WeatherInputSchema>;

const WeatherOutputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
});
export type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

export async function getWeather(input: WeatherInput): Promise<WeatherOutput> {
  return getWeatherFlow(input);
}

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHERMAP_API_KEY is not set in the environment.');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(input.city)},${encodeURIComponent(input.country)}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Weather API error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
      }
      const data: any = await response.json();
      
      if (!data.main || typeof data.main.temp !== 'number') {
        console.error("Invalid data structure from Weather API", data);
        throw new Error('Invalid data structure received from weather API.');
      }
      
      const temperature = Math.round(data.main.temp);
      return { temperature };

    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return a default or cached value in case of an error to not break the UI
      return { temperature: 25 }; // Default to 25 degrees on error
    }
  }
);
