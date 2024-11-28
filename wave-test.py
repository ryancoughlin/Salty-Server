import xarray as xr
import numpy as np
from datetime import datetime
import pandas as pd

# Open the dataset (Block Island coordinates)
lat = 41.1687
lon = -71.5757
lon_360 = lon + 360  # Convert to 0-360 format for the model

print("Opening dataset...")
url = "https://nomads.ncep.noaa.gov/dods/wave/gfswave/gfswave.atlocn.0p16_00z"
ds = xr.open_dataset(url)

# Find nearest grid points
lat_idx = abs(ds.lat - lat).argmin().item()
lon_idx = abs(ds.lon - lon_360).argmin().item()

actual_lat = float(ds.lat[lat_idx])
actual_lon = float(ds.lon[lon_idx])

print(f"\nLocation: Block Island")
print(f"Requested: {lat}°N, {lon}°W")
print(f"Nearest grid point: {actual_lat:.3f}°N, {actual_lon-360:.3f}°W")

# Get the first 24 hours (8 timesteps at 3-hour intervals)
times = ds.time.values[:8]
print("\nForecast:")
print("-" * 50)

for t_idx, time in enumerate(times):
    timestamp = pd.Timestamp(time).strftime('%Y-%m-%d %H:%M UTC')
    wave_height = float(ds.htsgwsfc[t_idx, lat_idx, lon_idx])
    wave_period = float(ds.perpwsfc[t_idx, lat_idx, lon_idx])
    wave_dir = float(ds.dirpwsfc[t_idx, lat_idx, lon_idx])
    wind_speed = float(ds.windsfc[t_idx, lat_idx, lon_idx])
    wind_dir = float(ds.wdirsfc[t_idx, lat_idx, lon_idx])
    
    # Convert units
    wave_height_ft = wave_height * 3.28084  # meters to feet
    wind_speed_mph = wind_speed * 2.23694   # m/s to mph
    
    print(f"\n{timestamp}")
    print(f"Waves: {wave_height_ft:.1f}ft @ {wave_period:.1f}s from {wave_dir:.0f}°")
    print(f"Wind: {wind_speed_mph:.1f}mph from {wind_dir:.0f}°")