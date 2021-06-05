SELECT ts.year AS year, ts.country AS country, cc.latitude AS latitude, cc.longitude AS longitude, ts.per1K_60kgbag AS import
FROM Trade_Stats AS ts
LEFT JOIN Country_Coordinates AS cc ON ts.country=cc.country_name
WHERE ts.transaction_type='Import' AND latitude IS NOT NULL
ORDER BY country ASC
;

SELECT *
FROM Retail_Prices
ORDER BY country ASC
;