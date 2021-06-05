# Import Flask
from flask import Flask, request, jsonify, render_template

# Import SQL Alchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import Column, Integer,Float, String,  create_engine
from sqlalchemy.orm import Session

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
        f"/api/v1.0/trade_statistics<br>"
        f"/api/v1.0/total_production<br>"
        f"/api/v1.0/country_coordinates<br>"
    )

@app.route("/api/v1.0/trade_statistics")
def trade():
    print("Server access: trade statistics data")
    s = Session(bind=engine)

    results = s.query(trade_stats.year, trade_stats.country, trade_stats.per1K_60kgbag,
    trade_stats.transaction_type
    ).all()

    s.close()

    trade_stats_list = []
    for year, country, per1k_60kgbag, transaction_type in results:
        trade_stats_dict = {}
        trade_stats_dict['year'] = year
        trade_stats_dict['country'] = country
        trade_stats_dict['per1k_60kgbag'] = per1k_60kgbag
        trade_stats_dict['transaction_type'] = transaction_type
        trade_stats_list.append(trade_stats_dict)

    return jsonify(trade_stats_list)

@app.route("/api/v1.0/total_production")
def production():
    print("Server access: total production per exporting country")
    s = Session(bind=engine)

    results = s.query(total_prod.year, total_prod.country, total_prod.per1K_60kgbag,
    total_prod.month_group
    ).all()

    total_prod_list = []
    for id, year, country, per1k_60kgbag, month_group in results:
        total_prod_dict = {}
        total_prod_dict['year'] = year
        total_prod_dict['country'] = country
        total_prod_dict['per1k_60kgbag'] = per1k_60kgbag
        total_prod_dict['month_group'] = month_group
        total_prod_list.append(total_prod_dict)
    
    return jsonify(total_prod_list)

@app.route("/api/v1.0/country_coordinates")
def location():
    print("Server access: country coordinates")
    s = Session(bind=engine)

    results = s.query( coordinate.country_code, coordinate.latitude, coordinate.longitude,
    coordinate.country_name
    ).all()

    coordinate_list = []
    for country_code, latitude, longitude, country_name in results:
        coordinate_dict = {}
        coordinate_dict['country_code'] = country_code
        coordinate_dict['latitude'] = latitude
        coordinate_dict['longitude'] = longitude
        coordinate_dict['country_name'] = country_name
        coordinate_list.append(coordinate_dict)

    return jsonify(coordinate_list)

if __name__=="__main__":
    app.run(debug = True)