import { io, Socket } from 'socket.io-client';

export const socket: Socket = io({
    transports: ['websocket'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    autoConnect: true,
});

socket.on('connect', () => {
    console.log('[Soket] Bağlantı başarılı');
});

socket.on('disconnect', (reason) => {
    console.log('[Soket] Bağlantı kesildi:', reason);
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

export default socket;
