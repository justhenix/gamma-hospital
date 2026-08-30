import React from "react";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

import * as m from "@/paraglide/messages.js";

interface AuditLogTimelineProps {
  logs: AuditLog[];
}

export function AuditLogTimeline({ logs }: AuditLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic p-4 border border-border rounded-lg bg-card">
        {m.empty_audit_logs()}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card divide-y divide-border overflow-hidden shadow-sm">
      {logs.map((log) => (
        <div key={log.id} className="p-3.5 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                {log.action}
              </Badge>
              {log.fromStatus && log.toStatus && (
                <span className="text-foreground flex items-center gap-1 font-medium">
                  <span>{log.fromStatus}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <strong className="text-foreground">{log.toStatus}</strong>
                </span>
              )}
              <span className="text-muted-foreground">oleh {log.actor}</span>
            </div>
            {log.notes && <div className="text-foreground/80 pl-1">{log.notes}</div>}
          </div>
          <div className="text-muted-foreground font-sans tabular-nums text-xs whitespace-nowrap">
            {formatDate(log.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
