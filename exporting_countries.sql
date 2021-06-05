SELECT tp.year AS year, tp.country AS country, cc.latitude AS latitude, cc.longitude AS longitude, tp.per1K_60kgbag AS production, ts.per1K_60kgbag AS export
FROM Total_Production AS tp
LEFT JOIN Trade_Stats AS ts ON tp.year=ts.year AND tp.country=ts.country
LEFT JOIN Country_Coordinates AS cc ON tp.country=cc.country_name
ORDER BY country ASC
;