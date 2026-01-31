import socketio


MARKET_SOURCE_URL = 'https://socket.haremaltin.com'
MARKET_SOURCE_ORIGIN = 'https://canlipiyasalar.haremaltin.com'

price_stream = socketio.Client()


@price_stream.on('price_changed')
def handle_price_update(data):
    market_data = data.get('data', {})
    
    if not market_data:
        return

    for symbol_key, price_info in market_data.items():
        display_name = price_info.get('code', symbol_key)
        buy_price = price_info.get('alis', 'N/A')
        sell_price = price_info.get('satis', 'N/A')
        
        print(f"  {display_name} | Alış: {buy_price} | Satış: {sell_price}")
    
    print("-" * 60)


@price_stream.event
def connect():
    try:
        price_stream.emit('get_all_prices')
    except:
        pass


@price_stream.event 
def disconnect():
    pass


if __name__ == '__main__':
    try:
        price_stream.connect(
            MARKET_SOURCE_URL,
            headers={"Origin": MARKET_SOURCE_ORIGIN},
            transports=['websocket']
        )
        
        price_stream.wait()
        
    except KeyboardInterrupt:
        price_stream.disconnect()
        
    except Exception as e:
        price_stream.disconnect()