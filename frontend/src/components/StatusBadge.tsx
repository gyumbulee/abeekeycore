const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-success/10 text-success',
  accepted: 'bg-success/10 text-success',
  active: 'bg-success/10 text-success',
  completed: 'bg-success/10 text-success',
  signed: 'bg-success/10 text-success',
  won: 'bg-success/10 text-success',
  registered: 'bg-success/10 text-success',
  successful: 'bg-success/10 text-success',
  replied: 'bg-success/10 text-success',

  sent: 'bg-blue-primary/10 text-blue-primary',
  quoted: 'bg-blue-primary/10 text-blue-primary',
  new: 'bg-blue-primary/10 text-blue-primary',
  processing: 'bg-blue-primary/10 text-blue-primary',
  pending: 'bg-blue-primary/10 text-blue-primary',
  pending_payment: 'bg-blue-primary/10 text-blue-primary',
  draft: 'bg-slate-200 text-text-soft',
  reviewed: 'bg-warning/10 text-warning',

  overdue: 'bg-danger/10 text-danger',
  declined: 'bg-danger/10 text-danger',
  terminated: 'bg-danger/10 text-danger',
  lost: 'bg-danger/10 text-danger',
  failed: 'bg-danger/10 text-danger',
  registration_failed: 'bg-danger/10 text-danger',
  cancelled: 'bg-danger/10 text-danger',

  expired: 'bg-warning/10 text-warning',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-200 text-text-soft';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}