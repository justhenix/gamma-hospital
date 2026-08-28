import React from "react";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface AuditLogTimelineProps {
  logs: AuditLog[];
}

export function AuditLogTimeline({ logs }: AuditLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-xs text-slate-500 font-mono italic p-3 border rounded">
        No audit log events recorded yet.
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-white divide-y">
      {logs.map((log) => (
        <div key={log.id} className="p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                {log.action}
              </Badge>
              {log.fromStatus && log.toStatus && (
                <span className="font-mono text-slate-700 flex items-center gap-1">
                  <span>{log.fromStatus}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <strong>{log.toStatus}</strong>
                </span>
              )}
              <span className="text-slate-500 font-mono">by {log.actor}</span>
            </div>
            {log.notes && <div className="text-slate-600 pl-1">{log.notes}</div>}
          </div>
          <div className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
            {formatDate(log.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
