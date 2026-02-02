import threading
import time
from flask import Flask
from flask_socketio import SocketIO
import socketio as h_socketio

app = Flask(__name__)
socket_server = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

harem_client = h_socketio.Client()

MARKET_SOURCE_URL = 'https://socket.haremaltin.com'
MARKET_SOURCE_ORIGIN = 'https://canlipiyasalar.haremaltin.com'

SYMBOL_MAPPING = {
    'ONS': 'Altın Ons',
    'ALTIN': 'Has Altın',
    'KULCEALTIN': 'Gram Altın',
    'HAS_ALTIN': 'Has Altın',
    'CEYREK_YENI': 'Çeyrek Altın',
    'YARIM_YENI': 'Yarım Altın',
    'TEK_YENI': 'Tam Altın',
    'ATA_YENI': 'Ata Altın',
    'GREMESE_YENI': 'Gremse Altın',
    'ATA5_YENI': "Ata 5'li",
    'AYAR22': '22 Ayar Altın',
    'AYAR14': '14 Ayar Altın',
    'AYAR18': '18 Ayar Altın',
    'XAGUSD': 'Gümüş Ons',
    'GUMUSTRY': 'Gram Gümüş',
}

LATEST_MARKET_STATE = {}
LATEST_UPDATE_TIME = None

def parse_price(value):
    try:
        if value is None: 
            return 0.0
        s_val = str(value).replace(',', '.')
        if not s_val.strip() or s_val == 'None': 
            return 0.0
        return float(s_val)
    except (ValueError, TypeError):
        return 0.0

@harem_client.on('price_changed')
def handle_price_update(data):
    global LATEST_MARKET_STATE, LATEST_UPDATE_TIME
    
    incoming_data = data.get('data', {})
    meta = data.get('meta', {})
    
    if 'tarih' in meta:
        tarih = meta['tarih']
        if ' ' in tarih:
            LATEST_UPDATE_TIME = tarih.split(' ')[1]
        else:
            LATEST_UPDATE_TIME = tarih

    for symbol, info in incoming_data.items():
        LATEST_MARKET_STATE[symbol] = info
        
    formatted_data = []
    
    snapshot = LATEST_MARKET_STATE.copy()
    
    for symbol_key, info in snapshot.items():
        if symbol_key not in SYMBOL_MAPPING:
            continue
            
        display_name = SYMBOL_MAPPING[symbol_key]
        
        try:
            alis = parse_price(info.get('alis'))
            satis = parse_price(info.get('satis'))
            kapanis = parse_price(info.get('kapanis'))
            
            change_rate = 0
            if kapanis > 0:
                change_rate = ((alis - kapanis) / kapanis) * 100
                
            formatted_data.append({
                'symbol': display_name,
                'code': symbol_key,
                'price': alis,
                'buy': alis,
                'sell': satis,
                'change': change_rate
            })
        except Exception:
            continue
            
    if formatted_data:
        socket_server.emit('market_data', {
            'tickers': formatted_data, 
            'time': LATEST_UPDATE_TIME
        })

@harem_client.event
def connect():
    try:
        harem_client.emit('get_all_prices')
    except:
        pass

@harem_client.event
def disconnect():
    print("Harem Altın bağlantısı kesildi")

def run_harem_client():
    while True:
        try:
            harem_client.connect(
                MARKET_SOURCE_URL,
                headers={"Origin": MARKET_SOURCE_ORIGIN},
                transports=['websocket'],
                wait_timeout=10
            )
            harem_client.wait()
        except Exception as e:
            print(f"Harem bağlantı hatası: {e}")
            time.sleep(5)

if __name__ == '__main__':
    t = threading.Thread(target=run_harem_client, daemon=True)
    t.start()
    socket_server.run(app, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)