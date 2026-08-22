"""
Seed script: ~25 cities + 4-6 activities each.
Run:  python seeds/seed.py
Or via Docker:  docker-compose --profile seed run seed
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://globetrotter:globetrotter@localhost:5432/globetrotter",
)

CITIES = [
    {"name": "Paris", "country": "France", "region": "Western Europe", "cost_index": 78, "popularity_score": 98},
    {"name": "Tokyo", "country": "Japan", "region": "East Asia", "cost_index": 72, "popularity_score": 97},
    {"name": "New York", "country": "USA", "region": "North America", "cost_index": 90, "popularity_score": 96},
    {"name": "Rome", "country": "Italy", "region": "Southern Europe", "cost_index": 65, "popularity_score": 95},
    {"name": "Barcelona", "country": "Spain", "region": "Southern Europe", "cost_index": 60, "popularity_score": 93},
    {"name": "London", "country": "UK", "region": "Western Europe", "cost_index": 88, "popularity_score": 95},
    {"name": "Bangkok", "country": "Thailand", "region": "Southeast Asia", "cost_index": 35, "popularity_score": 92},
    {"name": "Amsterdam", "country": "Netherlands", "region": "Western Europe", "cost_index": 75, "popularity_score": 90},
    {"name": "Bali", "country": "Indonesia", "region": "Southeast Asia", "cost_index": 30, "popularity_score": 91},
    {"name": "Istanbul", "country": "Turkey", "region": "Eurasia", "cost_index": 40, "popularity_score": 89},
    {"name": "Prague", "country": "Czech Republic", "region": "Central Europe", "cost_index": 45, "popularity_score": 88},
    {"name": "Lisbon", "country": "Portugal", "region": "Western Europe", "cost_index": 50, "popularity_score": 87},
    {"name": "Sydney", "country": "Australia", "region": "Oceania", "cost_index": 82, "popularity_score": 89},
    {"name": "Dubai", "country": "UAE", "region": "Middle East", "cost_index": 80, "popularity_score": 90},
    {"name": "Singapore", "country": "Singapore", "region": "Southeast Asia", "cost_index": 77, "popularity_score": 91},
    {"name": "Kyoto", "country": "Japan", "region": "East Asia", "cost_index": 65, "popularity_score": 88},
    {"name": "Cairo", "country": "Egypt", "region": "North Africa", "cost_index": 28, "popularity_score": 85},
    {"name": "Mexico City", "country": "Mexico", "region": "North America", "cost_index": 38, "popularity_score": 82},
    {"name": "Buenos Aires", "country": "Argentina", "region": "South America", "cost_index": 33, "popularity_score": 80},
    {"name": "Cape Town", "country": "South Africa", "region": "Southern Africa", "cost_index": 42, "popularity_score": 84},
    {"name": "Marrakech", "country": "Morocco", "region": "North Africa", "cost_index": 32, "popularity_score": 83},
    {"name": "Vienna", "country": "Austria", "region": "Central Europe", "cost_index": 68, "popularity_score": 86},
    {"name": "Santorini", "country": "Greece", "region": "Southern Europe", "cost_index": 70, "popularity_score": 87},
    {"name": "Reykjavik", "country": "Iceland", "region": "Northern Europe", "cost_index": 95, "popularity_score": 81},
    {"name": "Hanoi", "country": "Vietnam", "region": "Southeast Asia", "cost_index": 22, "popularity_score": 80},
]

# city_name → list of activities
ACTIVITIES = {
    "Paris": [
        {"name": "Louvre Museum", "category": "sightseeing", "cost": 22, "duration_minutes": 180, "description": "World's largest art museum and historic monument."},
        {"name": "Eiffel Tower Visit", "category": "sightseeing", "cost": 28, "duration_minutes": 90, "description": "Iconic iron lattice tower on the Champ de Mars."},
        {"name": "Seine River Cruise", "category": "sightseeing", "cost": 18, "duration_minutes": 60, "description": "1-hour boat tour past Notre-Dame and the Pont Neuf."},
        {"name": "French Cooking Class", "category": "food", "cost": 85, "duration_minutes": 180, "description": "Learn to make croissants and coq au vin."},
        {"name": "Montmartre Walking Tour", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "Explore the artists' quarter and Sacré-Cœur."},
        {"name": "Paris Metro Day Pass", "category": "transport", "cost": 8, "duration_minutes": None, "description": "Unlimited metro/bus travel for one day."},
    ],
    "Tokyo": [
        {"name": "Shibuya Crossing & Harajuku", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "The world's busiest pedestrian crossing and quirky fashion street."},
        {"name": "teamLab Borderless", "category": "sightseeing", "cost": 32, "duration_minutes": 150, "description": "Immersive digital art museum in Odaiba."},
        {"name": "Tsukiji Outer Market Food Tour", "category": "food", "cost": 30, "duration_minutes": 90, "description": "Sample fresh sushi, tamagoyaki, and street snacks."},
        {"name": "Shinjuku Izakaya Crawl", "category": "food", "cost": 45, "duration_minutes": 180, "description": "Evening bar-hopping through Tokyo's most vibrant nightlife district."},
        {"name": "Mt Fuji Day Trip", "category": "adventure", "cost": 55, "duration_minutes": 480, "description": "Guided round-trip excursion to Fuji's 5th Station."},
        {"name": "IC Card (Suica)", "category": "transport", "cost": 10, "duration_minutes": None, "description": "Rechargeable transport card for trains and buses."},
    ],
    "New York": [
        {"name": "Central Park Bike Hire", "category": "adventure", "cost": 15, "duration_minutes": 120, "description": "Explore 843 acres of green on two wheels."},
        {"name": "Metropolitan Museum of Art", "category": "sightseeing", "cost": 30, "duration_minutes": 180, "description": "One of the world's greatest art collections."},
        {"name": "Brooklyn Food Walk", "category": "food", "cost": 35, "duration_minutes": 150, "description": "Smorgasburg-style walk through Brooklyn's best bites."},
        {"name": "Empire State Building", "category": "sightseeing", "cost": 44, "duration_minutes": 90, "description": "102-floor Art Deco skyscraper with panoramic views."},
        {"name": "Statue of Liberty & Ellis Island", "category": "sightseeing", "cost": 24, "duration_minutes": 240, "description": "Ferry and guided tour of the iconic harbour monuments."},
        {"name": "NYC Subway 7-Day Pass", "category": "transport", "cost": 34, "duration_minutes": None, "description": "Unlimited subway and bus rides for seven days."},
    ],
    "Rome": [
        {"name": "Colosseum & Roman Forum", "category": "sightseeing", "cost": 18, "duration_minutes": 180, "description": "Ancient amphitheatre and the political heart of ancient Rome."},
        {"name": "Vatican Museums & Sistine Chapel", "category": "sightseeing", "cost": 22, "duration_minutes": 240, "description": "Vast collection of art culminating in Michelangelo's masterpiece."},
        {"name": "Trastevere Food Tour", "category": "food", "cost": 65, "duration_minutes": 180, "description": "Gelato, supplì, and Roman pasta in the cobblestone quarter."},
        {"name": "Vespa Tour of Rome", "category": "adventure", "cost": 90, "duration_minutes": 180, "description": "See the Eternal City like a local on a vintage scooter."},
        {"name": "Cooking Class: Pasta & Tiramisu", "category": "food", "cost": 75, "duration_minutes": 180, "description": "Hands-on class in a Roman home kitchen."},
    ],
    "Barcelona": [
        {"name": "Sagrada Família", "category": "sightseeing", "cost": 26, "duration_minutes": 120, "description": "Gaudí's unfinished Gothic-modernist basilica."},
        {"name": "Park Güell", "category": "sightseeing", "cost": 10, "duration_minutes": 90, "description": "Colourful mosaic park with panoramic city views."},
        {"name": "La Boqueria Market", "category": "food", "cost": 0, "duration_minutes": 60, "description": "Iconic market on Las Ramblas bursting with produce and tapas."},
        {"name": "Barceloneta Beach", "category": "adventure", "cost": 0, "duration_minutes": 120, "description": "City beach for swimming and sun."},
        {"name": "Tapas & Wine Evening Tour", "category": "food", "cost": 55, "duration_minutes": 180, "description": "Guided evening tour through El Born and Gràcia tapas bars."},
        {"name": "T-Casual Metro Card", "category": "transport", "cost": 12, "duration_minutes": None, "description": "10-trip metro card for Barcelona's TMB network."},
    ],
    "London": [
        {"name": "British Museum", "category": "sightseeing", "cost": 0, "duration_minutes": 180, "description": "2 million years of human history in one museum — free entry."},
        {"name": "Tower of London", "category": "sightseeing", "cost": 34, "duration_minutes": 150, "description": "Historic castle, Crown Jewels, and Beefeater tour."},
        {"name": "Borough Market Food Tour", "category": "food", "cost": 20, "duration_minutes": 90, "description": "London's most celebrated food market near London Bridge."},
        {"name": "Thames Clipper", "category": "transport", "cost": 10, "duration_minutes": 60, "description": "Commuter ferry along the Thames — scenic and practical."},
        {"name": "West End Show", "category": "sightseeing", "cost": 75, "duration_minutes": 180, "description": "Top-tier theatre in London's entertainment district."},
        {"name": "Travelcard Zone 1-2", "category": "transport", "cost": 14, "duration_minutes": None, "description": "Unlimited travel on Tube, bus, and rail within zones 1-2."},
    ],
    "Bangkok": [
        {"name": "Grand Palace & Wat Phra Kaew", "category": "sightseeing", "cost": 15, "duration_minutes": 180, "description": "Thailand's most sacred temple complex."},
        {"name": "Chao Phraya River Boat", "category": "transport", "cost": 2, "duration_minutes": 60, "description": "Hop-on hop-off express boat through Bangkok's khlongs."},
        {"name": "Street Food Tour Yaowarat", "category": "food", "cost": 25, "duration_minutes": 150, "description": "Chinatown night market — pad thai, mango sticky rice, durian."},
        {"name": "Thai Cooking Class", "category": "food", "cost": 40, "duration_minutes": 240, "description": "Learn to make green curry and tom yum from scratch."},
        {"name": "Muay Thai Evening Show", "category": "adventure", "cost": 30, "duration_minutes": 150, "description": "Live professional Muay Thai fights at Rajadamnern stadium."},
    ],
    "Amsterdam": [
        {"name": "Rijksmuseum", "category": "sightseeing", "cost": 22, "duration_minutes": 150, "description": "Rembrandt, Vermeer, and Dutch Golden Age masterpieces."},
        {"name": "Anne Frank House", "category": "sightseeing", "cost": 16, "duration_minutes": 90, "description": "The hiding place where Anne Frank wrote her diary."},
        {"name": "Canal Boat Tour", "category": "sightseeing", "cost": 18, "duration_minutes": 75, "description": "1-hour cruise through Amsterdam's 165 canals."},
        {"name": "Dutch Cheese & Jenever Tasting", "category": "food", "cost": 30, "duration_minutes": 90, "description": "Sample Gouda, Edam, and traditional Dutch gin."},
        {"name": "Bike Hire (Day)", "category": "transport", "cost": 12, "duration_minutes": None, "description": "Explore the city the Dutch way — by bicycle."},
    ],
    "Bali": [
        {"name": "Tanah Lot Temple at Sunset", "category": "sightseeing", "cost": 5, "duration_minutes": 120, "description": "Iconic sea temple at the island's most famous sunset spot."},
        {"name": "Ubud Rice Terrace Walk", "category": "adventure", "cost": 0, "duration_minutes": 150, "description": "Trek through the UNESCO-listed Tegallalang terraces."},
        {"name": "Balinese Cooking Class", "category": "food", "cost": 35, "duration_minutes": 240, "description": "Market visit + hands-on cooking of Balinese classics."},
        {"name": "Surf Lesson Kuta", "category": "adventure", "cost": 20, "duration_minutes": 120, "description": "Beginner surf session on Bali's most famous beach."},
        {"name": "Spa & Massage (60 min)", "category": "other", "cost": 15, "duration_minutes": 60, "description": "Traditional Balinese massage in Seminyak."},
    ],
    "Istanbul": [
        {"name": "Hagia Sophia", "category": "sightseeing", "cost": 0, "duration_minutes": 90, "description": "Former Byzantine cathedral turned mosque — free entry."},
        {"name": "Topkapi Palace", "category": "sightseeing", "cost": 18, "duration_minutes": 180, "description": "Opulent palace and treasury of the Ottoman Empire."},
        {"name": "Grand Bazaar", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "One of the world's oldest and largest covered markets."},
        {"name": "Bosphorus Cruise", "category": "sightseeing", "cost": 15, "duration_minutes": 120, "description": "Scenic boat trip between Europe and Asia."},
        {"name": "Turkish Food & Meyhane Tour", "category": "food", "cost": 50, "duration_minutes": 180, "description": "Mezze, kebabs, and rakı in Beyoğlu's taverns."},
    ],
    "Prague": [
        {"name": "Prague Castle", "category": "sightseeing", "cost": 15, "duration_minutes": 180, "description": "Largest ancient castle in the world, overlooking the city."},
        {"name": "Charles Bridge at Dawn", "category": "sightseeing", "cost": 0, "duration_minutes": 60, "description": "Baroque bridge lined with 30 statues — best at sunrise."},
        {"name": "Czech Beer & Food Tour", "category": "food", "cost": 45, "duration_minutes": 210, "description": "Three pubs, pilsner, svíčková, and trdelník."},
        {"name": "Old Town & Astronomical Clock", "category": "sightseeing", "cost": 0, "duration_minutes": 90, "description": "Medieval clock with hourly show and panoramic tower."},
        {"name": "River Cruise", "category": "sightseeing", "cost": 14, "duration_minutes": 60, "description": "Romantic evening Vltava boat tour."},
    ],
    "Lisbon": [
        {"name": "Belém Tower & Jerónimos Monastery", "category": "sightseeing", "cost": 12, "duration_minutes": 120, "description": "UNESCO-listed Manueline architecture by the Tagus."},
        {"name": "Tram 28 Ride", "category": "transport", "cost": 3, "duration_minutes": 45, "description": "Historic yellow tram through Alfama and Mouraria."},
        {"name": "Pastel de Nata & Coffee Tour", "category": "food", "cost": 20, "duration_minutes": 90, "description": "Sample Lisbon's iconic custard tarts at three historic pastelarias."},
        {"name": "Sintra Day Trip", "category": "adventure", "cost": 35, "duration_minutes": 360, "description": "Fairy-tale palaces and forests in the hills above Lisbon."},
        {"name": "Fado Night in Alfama", "category": "sightseeing", "cost": 25, "duration_minutes": 150, "description": "Live performance of Portugal's soulful traditional music."},
    ],
    "Sydney": [
        {"name": "Sydney Opera House Tour", "category": "sightseeing", "cost": 43, "duration_minutes": 90, "description": "Backstage guided tour of the iconic UNESCO building."},
        {"name": "Bondi to Coogee Coastal Walk", "category": "adventure", "cost": 0, "duration_minutes": 180, "description": "6 km clifftop walk with stunning Pacific views."},
        {"name": "Harbour Bridge Climb", "category": "adventure", "cost": 174, "duration_minutes": 210, "description": "Climb to the summit of the 'Coathanger' for 360° views."},
        {"name": "Sydney Fish Market", "category": "food", "cost": 30, "duration_minutes": 90, "description": "The Southern Hemisphere's largest working fish market."},
        {"name": "Opal Transport Card", "category": "transport", "cost": 15, "duration_minutes": None, "description": "Tap-and-go card for Sydney trains, buses, ferries."},
    ],
    "Dubai": [
        {"name": "Burj Khalifa (At The Top)", "category": "sightseeing", "cost": 45, "duration_minutes": 90, "description": "World's tallest building — observation deck on floor 124."},
        {"name": "Desert Safari", "category": "adventure", "cost": 70, "duration_minutes": 360, "description": "Dune bashing, camel riding, and BBQ dinner under the stars."},
        {"name": "Dubai Creek Abra Ride", "category": "transport", "cost": 1, "duration_minutes": 15, "description": "Traditional wooden boat crossing the historic creek."},
        {"name": "Gold Souk & Spice Souk", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "Wander centuries-old trading bazaars in Deira."},
        {"name": "Emirati Brunch", "category": "food", "cost": 55, "duration_minutes": 150, "description": "Lavish Friday brunch spread featuring traditional Emirati cuisine."},
    ],
    "Singapore": [
        {"name": "Gardens by the Bay (Supertrees)", "category": "sightseeing", "cost": 20, "duration_minutes": 120, "description": "Futuristic conservatories and illuminated Supertree Grove."},
        {"name": "Hawker Centre Crawl", "category": "food", "cost": 15, "duration_minutes": 120, "description": "Hainanese chicken rice, chilli crab, and kaya toast at Maxwell."},
        {"name": "Sentosa Island Day", "category": "adventure", "cost": 40, "duration_minutes": 360, "description": "Universal Studios, S.E.A. Aquarium, and cable car."},
        {"name": "MRT Ez-Link Card", "category": "transport", "cost": 12, "duration_minutes": None, "description": "Stored-value card for Singapore's efficient MRT network."},
        {"name": "Marina Bay Sands SkyPark", "category": "sightseeing", "cost": 26, "duration_minutes": 60, "description": "Observation deck on the iconic three-tower hotel."},
    ],
    "Kyoto": [
        {"name": "Fushimi Inari Shrine", "category": "sightseeing", "cost": 0, "duration_minutes": 180, "description": "10,000 vermilion torii gates winding up Mt Inari."},
        {"name": "Arashiyama Bamboo Grove", "category": "sightseeing", "cost": 0, "duration_minutes": 90, "description": "Iconic towering bamboo forest in western Kyoto."},
        {"name": "Tea Ceremony Experience", "category": "sightseeing", "cost": 30, "duration_minutes": 60, "description": "Traditional matcha tea ceremony in a historic machiya."},
        {"name": "Nishiki Market", "category": "food", "cost": 15, "duration_minutes": 90, "description": "'Kyoto's Kitchen' — five blocks of food stalls and local delicacies."},
        {"name": "Kinkaku-ji (Golden Pavilion)", "category": "sightseeing", "cost": 5, "duration_minutes": 60, "description": "Zen temple whose top floors are covered in gold leaf."},
    ],
    "Cairo": [
        {"name": "Pyramids of Giza & Sphinx", "category": "sightseeing", "cost": 12, "duration_minutes": 240, "description": "The only remaining wonder of the ancient world."},
        {"name": "Egyptian Museum", "category": "sightseeing", "cost": 10, "duration_minutes": 180, "description": "Tutankhamun's treasures and 5,000 years of pharaonic history."},
        {"name": "Khan el-Khalili Bazaar", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "Medieval Islamic bazaar — spices, gold, and shisha cafes."},
        {"name": "Nile Felucca Sunset Sail", "category": "sightseeing", "cost": 10, "duration_minutes": 90, "description": "Traditional wooden sailboat ride at golden hour."},
        {"name": "Koshari at Abou Tarek", "category": "food", "cost": 4, "duration_minutes": 30, "description": "Egypt's national dish — rice, lentils, pasta, and fried onion."},
    ],
    "Mexico City": [
        {"name": "Teotihuacán Pyramids", "category": "sightseeing", "cost": 5, "duration_minutes": 300, "description": "Climb the Pyramid of the Sun — the third largest in the world."},
        {"name": "Frida Kahlo Museum", "category": "sightseeing", "cost": 12, "duration_minutes": 90, "description": "Casa Azul — the artist's vibrant home and life's work."},
        {"name": "Mercado de San Juan", "category": "food", "cost": 20, "duration_minutes": 90, "description": "Gourmet market with tacos, mole, and artisan produce."},
        {"name": "Lucha Libre Evening", "category": "sightseeing", "cost": 15, "duration_minutes": 150, "description": "Colourful Mexican folk wrestling at Arena México."},
        {"name": "Metro Single Ride", "category": "transport", "cost": 1, "duration_minutes": 30, "description": "One of the world's cheapest metros."},
    ],
    "Buenos Aires": [
        {"name": "La Boca & Caminito", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "Colourful tango district with street art and football culture."},
        {"name": "Tango Show & Dinner", "category": "sightseeing", "cost": 80, "duration_minutes": 180, "description": "Full evening of tango performance with Argentinian steak."},
        {"name": "Palermo Soho Food Walk", "category": "food", "cost": 30, "duration_minutes": 150, "description": "Empanadas, alfajores, and dulce de leche through trendy Palermo."},
        {"name": "MALBA Modern Art Museum", "category": "sightseeing", "cost": 8, "duration_minutes": 120, "description": "Latin American modern and contemporary art collection."},
        {"name": "Recoleta Cemetery", "category": "sightseeing", "cost": 0, "duration_minutes": 90, "description": "Grand mausoleum complex including Evita Perón's tomb."},
    ],
    "Cape Town": [
        {"name": "Table Mountain Cable Car", "category": "sightseeing", "cost": 28, "duration_minutes": 120, "description": "Rotating cable car to the flat-topped icon above the city."},
        {"name": "Boulders Beach Penguins", "category": "sightseeing", "cost": 5, "duration_minutes": 90, "description": "African penguin colony on a sheltered beach near Simon's Town."},
        {"name": "Cape Winelands Day Trip", "category": "food", "cost": 60, "duration_minutes": 360, "description": "Stellenbosch and Franschhoek wine tasting in the mountains."},
        {"name": "Robben Island Ferry & Tour", "category": "sightseeing", "cost": 22, "duration_minutes": 240, "description": "Where Nelson Mandela was imprisoned — guided by a former political prisoner."},
        {"name": "Braai (BBQ) Experience", "category": "food", "cost": 35, "duration_minutes": 150, "description": "Traditional South African barbecue in Langa township."},
    ],
    "Marrakech": [
        {"name": "Jemaa el-Fna Square & Souks", "category": "sightseeing", "cost": 0, "duration_minutes": 180, "description": "The pulsing heart of Marrakech — snake charmers, storytellers, food stalls."},
        {"name": "Majorelle Garden", "category": "sightseeing", "cost": 8, "duration_minutes": 90, "description": "Cobalt-blue Yves Saint Laurent garden oasis in the Ville Nouvelle."},
        {"name": "Moroccan Cooking Class", "category": "food", "cost": 45, "duration_minutes": 240, "description": "Souk shopping and hands-on tagine and couscous class."},
        {"name": "Hammam & Spa", "category": "other", "cost": 20, "duration_minutes": 120, "description": "Traditional Moroccan steam bath and argan oil massage."},
        {"name": "Sahara Desert Overnight", "category": "adventure", "cost": 120, "duration_minutes": 1440, "description": "Camel trek to camp under the stars in Merzouga dunes."},
    ],
    "Vienna": [
        {"name": "Schönbrunn Palace", "category": "sightseeing", "cost": 20, "duration_minutes": 150, "description": "1,441-room Baroque imperial summer palace with formal gardens."},
        {"name": "Vienna State Opera", "category": "sightseeing", "cost": 15, "duration_minutes": 180, "description": "Standing room at one of the world's premier opera houses."},
        {"name": "Naschmarkt", "category": "food", "cost": 20, "duration_minutes": 90, "description": "Vienna's most famous open-air market — cheeses, meats, and Viennese street food."},
        {"name": "Kunsthistorisches Museum", "category": "sightseeing", "cost": 18, "duration_minutes": 150, "description": "Imperial art collection spanning ancient Egypt to the Baroque."},
        {"name": "Coffee House Morning", "category": "food", "cost": 12, "duration_minutes": 90, "description": "Melange and Apfelstrudel in a UNESCO-listed Viennese Kaffeehaus."},
    ],
    "Santorini": [
        {"name": "Oia Sunset Walk", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "The world-famous blue-domed sunset in the whitewashed village of Oia."},
        {"name": "Caldera Catamaran Cruise", "category": "adventure", "cost": 85, "duration_minutes": 300, "description": "Sail around the volcanic caldera with snorkelling and BBQ on board."},
        {"name": "Akrotiri Archaeological Site", "category": "sightseeing", "cost": 12, "duration_minutes": 90, "description": "Minoan Bronze Age city buried by volcanic ash — the 'Pompeii of the Aegean'."},
        {"name": "Wine Tasting (Assyrtiko)", "category": "food", "cost": 30, "duration_minutes": 90, "description": "Volcanic-soil white wines at a cliff-edge winery."},
    ],
    "Reykjavik": [
        {"name": "Northern Lights Tour", "category": "adventure", "cost": 75, "duration_minutes": 240, "description": "Guided evening hunt for the Aurora Borealis outside the city."},
        {"name": "Golden Circle Day Trip", "category": "sightseeing", "cost": 65, "duration_minutes": 480, "description": "Þingvellir, Geysir, and Gullfoss waterfall in one loop."},
        {"name": "Blue Lagoon Geothermal Spa", "category": "other", "cost": 65, "duration_minutes": 180, "description": "Iconic milky-blue outdoor spa in a lava field."},
        {"name": "Whale Watching Cruise", "category": "adventure", "cost": 80, "duration_minutes": 210, "description": "3.5-hour boat trip from the Old Harbour with high sighting rates."},
        {"name": "Hallgrímskirkja Church", "category": "sightseeing", "cost": 10, "duration_minutes": 60, "description": "Modernist Lutheran church and tower with panoramic city views."},
    ],
    "Hanoi": [
        {"name": "Hoan Kiem Lake & Ngoc Son Temple", "category": "sightseeing", "cost": 2, "duration_minutes": 90, "description": "Serene lake in the heart of the Old Quarter with a Taoist island temple."},
        {"name": "Bun Cha Street Food Lunch", "category": "food", "cost": 4, "duration_minutes": 60, "description": "Grilled pork patties in broth with rice noodles — Hanoi's signature dish."},
        {"name": "Old Quarter Walking Tour", "category": "sightseeing", "cost": 0, "duration_minutes": 120, "description": "Weave through 36 ancient guild streets of crafts and street food."},
        {"name": "Ha Long Bay Day Cruise", "category": "adventure", "cost": 55, "duration_minutes": 600, "description": "Limestone karst cruise with kayaking and cave exploration."},
        {"name": "Vietnamese Cooking Class", "category": "food", "cost": 30, "duration_minutes": 210, "description": "Market visit + pho and banh xeo cooking class."},
    ],
}


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    from app.models.city import City
    from app.models.activity import Activity

    async with SessionLocal() as session:
        # Seed cities
        city_map = {}
        for city_data in CITIES:
            result = await session.execute(
                select(City).where(City.name == city_data["name"], City.country == city_data["country"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                city_map[city_data["name"]] = existing
                print(f"  [skip] City already exists: {city_data['name']}")
            else:
                city = City(**city_data)
                session.add(city)
                await session.flush()
                city_map[city_data["name"]] = city
                print(f"  [+] City: {city_data['name']}, {city_data['country']}")

        await session.commit()

        # Seed activities
        for city_name, acts in ACTIVITIES.items():
            city = city_map.get(city_name)
            if not city:
                print(f"  [warn] No city found for activities: {city_name}")
                continue
            for act_data in acts:
                result = await session.execute(
                    select(Activity).where(Activity.city_id == city.id, Activity.name == act_data["name"])
                )
                if result.scalar_one_or_none():
                    print(f"  [skip] Activity already exists: {act_data['name']}")
                    continue
                activity = Activity(city_id=city.id, **act_data)
                session.add(activity)
                print(f"  [+] Activity: {act_data['name']} ({city_name})")

        await session.commit()
        print("\nSeed complete.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
