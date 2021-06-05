# Import Flask
from flask import Flask, jsonify, render_template

# Import SQL Alchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import Column, Integer,Float, String, create_engine
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

#################################################
# Database Setup
#################################################

# Set database path and engine
dbPath = 'sqlite:///coffee_db.sqlite'
engine = create_engine(dbPath, connect_args={'check_same_thread': False})

# Re-create table classes
Base = declarative_base()

class trade_stats(Base):
    __tablename__ = 'Trade_Stats'
    id = Column(Integer, primary_key=True)
    year = Column(Integer)
    country = Column(String(255))
    per1K_60kgbag = Column(Float)
    transaction_type = Column(String(255))

class total_prod(Base):
    __tablename__ = 'Total_Production'
    id = Column(Integer, primary_key=True)
    year = Column(Integer)
    country = Column(String(255))
    per1K_60kgbag = Column(Float)
    month_group = Column(String(255))

class coordinate(Base):
    __tablename__ = 'Country_Coordinates'
    id = Column(Integer, primary_key=True)
    country_code = Column(String(10))
    latitude = Column(String(255))
    longitude = Column(String(255))
    country_name = Column(String(255))

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

# Create routes
@app.route("/")
def index():
    print("Server access: Home page")
    return render_template("index.html")

@app.route("/routes")
def routes(): 
    print("Server access: available API routes")
    return(
        f"ICO public data API<br>"
        f"Available routes:<br>"
        f"/api/v1.0/export_countries<br>"
        f"/api/v1.0/import_countries<br>"
        f"/api/v1.0/country_coordinates<br>"
    )

@app.route("/api/v1.0/export_countries")
def trade():
    print("Server access: export country data")
    s = Session(bind=engine)

    sql_query = text("SELECT tp.year AS year, tp.country AS country, cc.latitude AS latitude, cc.longitude AS longitude, tp.per1K_60kgbag AS production, ts.per1K_60kgbag AS export FROM Total_Production AS tp LEFT JOIN Trade_Stats AS ts ON tp.year=ts.year AND tp.country=ts.country LEFT JOIN Country_Coordinates AS cc ON tp.country=cc.country_name ORDER BY country ASC")
    export_country_results = s.execute(sql_query).all()

    s.close()

    export_countries_list = []
    for row in export_country_results:
        for i in row:
            year = row[0]
            country = row[1]
            latitude = row[2]
            longitude = row[3]
            production = row[4]
            export_1k = row[5]
        export_countries_dict = {}
        export_countries_dict['year'] = year
        export_countries_dict['country'] = country
        export_countries_dict['latitude'] = latitude
        export_countries_dict['longitude'] = longitude
        export_countries_dict['production'] = production
        export_countries_dict['export_1k'] = export_1k
        export_countries_list.append(export_countries_dict)

    return jsonify(export_countries_list)

@app.route("/api/v1.0/import_countries")
def production():
    print("Server access: import country data")
    s = Session(bind=engine)

    sql_query = text("SELECT ts.year AS year, ts.country AS country, cc.latitude AS latitude, cc.longitude AS longitude, ts.per1K_60kgbag AS import FROM Trade_Stats AS ts LEFT JOIN Country_Coordinates AS cc ON ts.country=cc.country_name WHERE ts.transaction_type='Import' AND latitude IS NOT NULL ORDER BY country ASC")
    import_country_results = s.execute(sql_query).all()

    import_countries_list = []
    for row in import_country_results:
        for i in row:
            year = row[0]
            country = row[1]
            latitude = row[2]
            longitude = row[3]
            import_1k = row[4]
        import_countries_dict = {}
        import_countries_dict['year'] = year
        import_countries_dict['country'] = country
        import_countries_dict['latitude'] = latitude
        import_countries_dict['longitude'] = longitude
        import_countries_dict['import_1k'] = import_1k
        import_countries_list.append(import_countries_dict)
    
    return jsonify(import_countries_list)

if __name__=="__main__":
    app.run(debug = True)