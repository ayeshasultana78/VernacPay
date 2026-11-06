import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { TrustBoundaryStage, WebhookAndAuditEvent } from '../../types/index.js';

class AuditService {
  private sseClients = new Set<Response>();

  registerClient(res: Response): void {
    this.sseClients.add(res);
    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  broadcast(eventType: string, data: any): void {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  async recordStage(params: {
    stage: TrustBoundaryStage;
    actionName: string;
    status: 'SUCCESS' | 'WARNING' | 'REJECTED' | 'PENDING';
    details: string;
    rawPayload?: any;
    webhookEventId?: string;
  }): Promise<WebhookAndAuditEvent> {
    const event: WebhookAndAuditEvent = {
      id: `aud_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      webhook_event_id: params.webhookEventId,
      stage_name: params.stage,
      action_name: params.actionName,
      verification_status: params.status,
      details: params.details,
      raw_payload: params.rawPayload,
      timestamp: new Date().toISOString(),
    };

    await db.recordAuditEvent(event);
    this.broadcast('audit_event', event);
    return event;
  }

  broadcastGridUpdate(transaction: any): void {
    this.broadcast('grid_update', transaction);
  }

  broadcastGridFilterCommand(command: {
    filterModel?: Record<string, any>;
    sortModel?: Array<{ colId: string; sort: 'asc' | 'desc' }>;
    exportCsv?: boolean;
    speechAnnouncement?: string;
  }): void {
    this.broadcast('grid_filter_command', command);
  }
}

export const auditService = new AuditService();
