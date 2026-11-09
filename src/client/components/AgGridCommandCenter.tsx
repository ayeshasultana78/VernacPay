import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  ValueFormatterParams, 
  ICellRendererParams 
} from 'ag-grid-community';
import { 
  Download, 
  Filter, 
  RotateCcw, 
  QrCode, 
  Send, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  PackageCheck,
  Search
} from 'lucide-react';
import { PayPalTransaction } from '../../types';

interface AgGridCommandCenterProps {
  transactions: PayPalTransaction[];
  onOpenQrModal: (tx: PayPalTransaction) => void;
  onSendReminder: (tx: PayPalTransaction) => void;
  onAddTracking: (tx: PayPalTransaction) => void;
  sseFilterCommand?: {
    filterModel?: Record<string, any>;
    exportCsv?: boolean;
    speechAnnouncement?: string;
  };
}

export const AgGridCommandCenter: React.FC<AgGridCommandCenterProps> = ({
  transactions,
  onOpenQrModal,
  onSendReminder,
  onAddTracking,
  sseFilterCommand,
}) => {
  const gridApiRef = useRef<GridApi<PayPalTransaction> | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'SHIPPED'>('ALL');
  const [searchText, setSearchText] = useState('');

  // Handle Voice-Driven SSE Commands
  useEffect(() => {
    if (!sseFilterCommand || !gridApiRef.current) return;

    if (sseFilterCommand.exportCsv) {
      gridApiRef.current.exportDataAsCsv({
        fileName: `VernacPay_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }

    if (sseFilterCommand.filterModel) {
      gridApiRef.current.setFilterModel(sseFilterCommand.filterModel);
    }
  }, [sseFilterCommand]);

  const onGridReady = (params: GridReadyEvent<PayPalTransaction>) => {
    gridApiRef.current = params.api;
  };

  const handleQuickFilter = (type: 'ALL' | 'PAID' | 'UNPAID' | 'SHIPPED') => {
    setActiveQuickFilter(type);
    if (!gridApiRef.current) return;

    if (type === 'ALL') {
      gridApiRef.current.setFilterModel(null);
    } else if (type === 'PAID') {
      gridApiRef.current.setFilterModel({
        status: { type: 'equals', filter: 'VERIFIED_PAID' },
      });
    } else if (type === 'UNPAID') {
      gridApiRef.current.setFilterModel({
        status: { type: 'equals', filter: 'AWAITING_BUYER' },
      });
    } else if (type === 'SHIPPED') {
      gridApiRef.current.setFilterModel({
        shipment_status: { type: 'equals', filter: 'SHIPPED' },
      });
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (gridApiRef.current) {
      gridApiRef.current.setGridOption('quickFilterText', text);
    }
  };

  const handleExportCsv = () => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({
        fileName: `VernacPay_Global_Ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  };

  // Custom Cell Renderers
  const StatusCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    const status = params.value;
    if (status === 'VERIFIED_PAID') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>VERIFIED PAID</span>
        </span>
      );
    }
    if (status === 'AWAITING_BUYER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>AWAITING BUYER</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
        <span>{status || 'PENDING'}</span>
      </span>
    );
  };

  const TrackingCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    const data = params.data;
    if (!data) return null;

    if (data.shipment_status === 'SHIPPED' && data.tracking_number) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{data.carrier_code || 'DHL'} #{data.tracking_number}</span>
        </span>
      );
    }

    if (data.status === 'VERIFIED_PAID') {
      return (
        <button
          onClick={() => onAddTracking(data)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
        >
          + Add Tracking
        </button>
      );
    }

    return <span className="text-[11px] text-[var(--text-tertiary)] italic">Awaiting Payment</span>;
  };

  const ActionsCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    const data = params.data;
    if (!data) return null;

    return (
      <div className="flex items-center gap-2 h-full">
        <button
          onClick={() => onOpenQrModal(data)}
          title="View Scannable PayPal QR & URL"
          className="p-1.5 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] text-blue-400 border border-[var(--border-subtle)] transition-colors"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {data.status === 'AWAITING_BUYER' && (
          <button
            onClick={() => onSendReminder(data)}
            title="Stage PayPal Overdue Reminder (/remind)"
            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // AG Grid Column Definitions with Guaranteed MinWidths (Zero Header Truncations)
  const columnDefs = useMemo<ColDef<PayPalTransaction>[]>(() => [
    {
      headerName: 'PayPal Reference',
      field: 'paypal_invoice_id',
      valueGetter: (p) => p.data?.paypal_invoice_id || p.data?.paypal_order_id || p.data?.id,
      minWidth: 150,
      width: 170,
      cellClass: 'font-mono text-xs font-semibold text-[var(--text-primary)]',
    },
    {
      headerName: 'Buyer & Country',
      field: 'customer_name',
      valueGetter: (p) => `${p.data?.customer_name} (${p.data?.customer_country?.split('(')[1]?.replace(')', '') || 'US'})`,
      minWidth: 150,
      width: 170,
      cellClass: 'font-medium text-[var(--text-primary)]',
    },
    {
      headerName: 'Item Description',
      field: 'item_name',
      minWidth: 240,
      flex: 1,
      cellClass: 'text-[var(--text-secondary)] text-xs truncate',
    },
    {
      headerName: 'Spoken INR',
      field: 'spoken_amount_inr',
      minWidth: 130,
      width: 140,
      valueFormatter: (p: ValueFormatterParams) => `₹${Number(p.value).toLocaleString('en-IN')}`,
      cellClass: 'font-mono font-bold text-amber-400 text-xs tabular-nums',
    },
    {
      headerName: 'Settled USD',
      field: 'settlement_amount_usd',
      minWidth: 130,
      width: 140,
      valueFormatter: (p: ValueFormatterParams) => `$${Number(p.value).toFixed(2)} USD`,
      cellClass: 'font-mono font-bold text-emerald-400 text-xs tabular-nums',
    },
    {
      headerName: 'Payment Status',
      field: 'status',
      minWidth: 155,
      width: 165,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: 'Shipment Tracking',
      field: 'shipment_status',
      minWidth: 155,
      width: 180,
      cellRenderer: TrackingCellRenderer,
    },
    {
      headerName: 'Actions',
      minWidth: 120,
      width: 130,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
    },
  ], [onOpenQrModal, onSendReminder, onAddTracking]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4 md:p-6">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-emerald)]" />
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Enterprise PayPal Ledger (AG Grid Community v32)
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Live double-entry verified transactions, scannable QR generation, and Seller Protection tracking.
          </p>
        </div>

        {/* Global CSV Export */}
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-surface-highlight)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-[var(--accent-emerald)]" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)] mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => handleQuickFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'ALL'
                ? 'bg-[var(--accent-emerald)] text-slate-950'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Records ({transactions.length})
          </button>
          <button
            onClick={() => handleQuickFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'PAID'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Verified Paid ({transactions.filter(t => t.status === 'VERIFIED_PAID').length})
          </button>
          <button
            onClick={() => handleQuickFilter('UNPAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'UNPAID'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Awaiting Buyer ({transactions.filter(t => t.status === 'AWAITING_BUYER').length})
          </button>
          <button
            onClick={() => handleQuickFilter('SHIPPED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'SHIPPED'
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Shipped ({transactions.filter(t => t.shipment_status === 'SHIPPED').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by invoice, customer..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-emerald)] transition-colors"
          />
        </div>
      </div>

      {/* The AG Grid Community Canvas */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm h-[600px] w-full ag-theme-quartz-dark">
        <AgGridReact<PayPalTransaction>
          rowData={transactions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          animateRows={true}
          rowSelection="single"
          domLayout="normal"
        />
      </div>
    </div>
  );
};
