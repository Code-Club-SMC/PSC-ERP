import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'https://psc.up.railway.app',
      'http://localhost:5173',
      'https://193.203.169.122',
      'http://193.203.169.122',
      'http://193.203.169.122:8080',
      'https://193.203.169.122:8080',
      'https://admin.peshawarservicesclub.com',
    ],
    credentials: true,
  },
  namespace: 'realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RealtimeGateway');
  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const token = this.extractAccessToken(client);
    if (token) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_ACCESS_SECRET!,
        });
        const adminId = Number(payload?.id);
        if (Number.isInteger(adminId)) {
          client.join(`admin:${adminId}`);
          client.data.adminId = adminId;
          this.logger.log(`Admin socket connected: ${adminId} (${client.id})`);
          return;
        }
      } catch (error) {
        this.logger.warn(`Socket auth failed: ${client.id}`);
      }
    }
    this.logger.log(`Client connected without admin session: ${client.id}`);
  }

  @SubscribeMessage('subscribe_payment')
  handleSubscribePayment(client: Socket, voucherId: string) {
    client.join(`payment_${voucherId}`);
    this.logger.log(`Client ${client.id} subscribed to payment_${voucherId}`);
  }

  emitPaymentUpdate(
    voucherId: string | number,
    status: string,
    additionalData: any = {},
  ) {
    this.server.to(`payment_${voucherId}`).emit('payment_status', {
      voucherId,
      status,
      ...additionalData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(
      `Emitted payment status '${status}' for voucher ${voucherId}`,
    );
  }

  emitActivityNotification(adminId: number, payload: any) {
    this.server.to(`admin:${adminId}`).emit('activity_notification', payload);
  }

  private extractAccessToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken) return authToken;

    const rawCookie = client.handshake.headers.cookie || '';
    const cookies = rawCookie.split(';').reduce<Record<string, string>>((acc, part) => {
      const [rawKey, ...rawValue] = part.trim().split('=');
      if (!rawKey) return acc;
      acc[rawKey] = decodeURIComponent(rawValue.join('='));
      return acc;
    }, {});
    return cookies.access_token || null;
  }
}
