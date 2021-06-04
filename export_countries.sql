SELECT tp.year, tp.country, cc.latitude, cc.longitude, tp.per1K_60kgbag AS production, ts.per1K_60kgbag AS export 
FROM Total_Production AS tp
INNER JOIN Trade_Stats AS ts ON tp.id=ts.id
LEFT JOIN Country_Coordinates AS cc ON tp.country=cc.country_name
;

