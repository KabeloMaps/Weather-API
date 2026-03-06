import { useEffect, useState } from "react";
import type { FormEvent } from "react";
type WeatherData = {
  temp: number;
  location: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

const Weather = () => {
  //stores the user input
  const [query, setQuery] = useState("Pretoria");

  //stores the weather data fetched
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  //controls the UI feedback when loading
  const [loading, setLoading] = useState(false);

  //controls the UI feedback when an error occurs
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (city: string) => {
    if (!city) return;
    setLoading(true);
    setError(null);

    const API = "42c74de229ad64fd061ada29aa0b1b77";

    try {
      const apiKey = API;
      if (!apiKey) throw new Error("Missing API key");
      //step 1: build the URL
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`;

      //step 2: fetch the data and store it in response
      const response = await fetch(url);

      //step 3: validate the response

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = (payload as { message?: string }).message;
        throw new Error(message ?? "Could not fetch weather data");
      }
      //step 4: extract the data from response and store it in data
      const data = await response.json();
      const weather = data.weather?.[0];

      //step 5: transformation of data
      setWeatherData({
        temp: Math.round(data.main.temp),
        location: `${data.name}, ${data.sys?.country ?? ""}`.trim(),
        description: weather?.description ?? "",
        icon: weather?.icon ?? "01d",
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed ?? 0,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchWeather(query);
  };

  return (
    <div className="weather font-[poppins] place-self-center items-center gap-6 p-10 rounded-[10px] bg-[#541fbf] flex flex-col">
      <div className="search-bar flex items-center gap-3 w-full">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="text"
          placeholder="Search"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleSearch();
            }
          }}
          className="flex-1 bg-white outline-none rounded-full p-3 text-[1.2rem] font-[poppins]"
        />

        <button className="cursor-pointer">
          {" "}
          <img
            src="/public/search.png"
            alt="search-icon"
            tabIndex={0}
            onClick={handleSearch}
            className="rounded-full bg-white p-3 text-[1rem] font-semibold text-[#541fbf]"
          />
        </button>
      </div>

      {loading && <p className="text-white text-xl">Loading...</p>}
      {error && !loading && <p className="text-red-300">{error}</p>}

      {weatherData && !loading && !error && (
        <>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`}
            alt={weatherData.description}
            className="weather-icon"
          />
          <p className="temperature text-white text-[80px]">
            {weatherData.temp}°C
          </p>
          <p className="location text-white text-[40px]">
            {weatherData.location}
          </p>
          <p className="text-white/70 capitalize">{weatherData.description}</p>
          <div className="weather-data text-white flex items-center gap-10 text-[22px]">
            <div className="col flex gap-3 items-start">
              <img src="/public/humidity.png" alt="humidity-icon" />
              <p>{weatherData.humidity}%</p>
              <span>Humidity</span>
            </div>
            <div className="col flex items-start gap-3">
              <img src="/public/wind.png" alt="wind-icon" />
              <p>{weatherData.windSpeed.toFixed(1)} km/h</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
