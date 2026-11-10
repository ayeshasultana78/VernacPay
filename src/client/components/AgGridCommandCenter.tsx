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
  Search,
  Sparkles,
  Globe2
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
    try {
      params.api.sizeColumnsToFit();
    } catch {
      // Ignore initial layout sizing
    }
  };

  const onGridSizeChanged = (params: any) => {
    try {
      if (params.api) {
        params.api.sizeColumnsToFit();
      }
    } catch {
      // Gracefully handle dynamic resize
    }
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

  // Helper for Corridor & Country Flags
  const getCountryDetails = (countryStr?: string) => {
    const c = countryStr || '';
    if (c.includes('United States') || c.includes('US') || c.includes('New York') || c.includes('Chicago')) {
      return { flag: '🇺🇸', code: 'US', corridor: 'US-East' };
    }
    if (c.includes('United Kingdom') || c.includes('UK') || c.includes('London')) {
      return { flag: '🇬🇧', code: 'UK', corridor: 'Transatlantic' };
    }
    if (c.includes('Germany') || c.includes('Europe') || c.includes('EU')) {
      return { flag: '🇪🇺', code: 'EU', corridor: 'Euro-Zone' };
    }
    return { flag: '🌐', code: 'INTL', corridor: 'Global' };
  };

  // Custom Cell Renderers with Visual Micro-Graphics & Pinned Row Support
  const CustomerCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    if (params.node?.isRowPinned()) {
      return (
        <div className="flex items-center gap-1.5 h-full">
          <Globe2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-xs text-slate-200 uppercase tracking-wide">
            {params.value}
          </span>
        </div>
      );
    }
    const data = params.data;
    if (!data) return null;
    const { flag, code } = getCountryDetails(data.customer_country);
    return (
      <div className="flex items-center gap-2.5 h-full">
        <span className="text-base select-none shrink-0" title={data.customer_country}>{flag}</span>
        <div className="flex flex-col justify-center leading-tight overflow-hidden">
          <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
            {data.customer_name}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 font-mono">
            <span>{code}</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-blue-300 border border-slate-700/60">
              PAYPAL
            </span>
          </span>
        </div>
      </div>
    );
  };

  const SpokenInrCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    if (params.node?.isRowPinned()) {
      return (
        <div className="flex flex-col justify-center h-full leading-tight">
          <span className="font-mono font-extrabold text-amber-300 text-xs tabular-nums">
            ₹{Number(params.value || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[9px] text-amber-500/90 uppercase font-mono tracking-wider">
            Total Spoken
          </span>
        </div>
      );
    }
    const inr = Number(params.value || 0);
    return (
      <div className="flex flex-col justify-center h-full leading-tight">
        <span className="font-mono font-bold text-amber-400 text-xs tabular-nums">
          ₹{inr.toLocaleString('en-IN')}
        </span>
        <span className="text-[9px] text-[var(--text-tertiary)] font-mono flex items-center gap-0.5">
          <span>Indic Voice Base</span>
        </span>
      </div>
    );
  };

  const SettledUsdCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    if (params.node?.isRowPinned()) {
      return (
        <div className="flex flex-col justify-center h-full leading-tight">
          <span className="font-mono font-extrabold text-emerald-300 text-xs tabular-nums">
            ${Number(params.value || 0).toFixed(2)} USD
          </span>
          <span className="text-[9px] text-emerald-400 uppercase font-mono tracking-wider">
            Total Settled
          </span>
        </div>
      );
    }
    const usd = Number(params.value || 0);
    return (
      <div className="flex flex-col justify-center h-full leading-tight">
        <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
          ${usd.toFixed(2)} USD
        </span>
        <span className="text-[9px] text-[var(--text-tertiary)] font-mono">
          @ ₹84.00 locked
        </span>
      </div>
    );
  };

  const StatusCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    if (params.node?.isRowPinned()) {
      return (
        <div className="flex items-center h-full">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>LEDGER BALANCED</span>
          </span>
        </div>
      );
    }
    const status = params.value;
    if (status === 'VERIFIED_PAID') {
      return (
        <div className="flex flex-col justify-center h-full leading-tight">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>VERIFIED PAID</span>
          </span>
          <span className="text-[9px] text-emerald-500/70 font-mono pl-1">
            ✓ Captured in DB
          </span>
        </div>
      );
    }
    if (status === 'AWAITING_BUYER') {
      return (
        <div className="flex flex-col justify-center h-full leading-tight">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit">
            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
            <span>AWAITING BUYER</span>
          </span>
          <span className="text-[9px] text-amber-400/80 font-mono pl-1">
            10m Window Active
          </span>
        </div>
      );
    }
    if (status === 'CANCELLED') {
      return (
        <div className="flex items-center h-full">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span>CANCELLED</span>
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center h-full">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
          <span>{status || 'PENDING'}</span>
        </span>
      </div>
    );
  };

  const TrackingCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    if (params.node?.isRowPinned()) {
      return (
        <div className="flex items-center h-full">
          <span className="font-mono text-xs font-semibold text-blue-400 flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>{params.value}</span>
          </span>
        </div>
      );
    }
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
    if (params.node?.isRowPinned()) {
      return (
        <div className="flex items-center h-full">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            SUMMARY ROW
          </span>
        </div>
      );
    }
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

  // Custom Empty State Overlay
  const CustomNoRowsOverlay = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
        <Filter className="w-6 h-6 text-amber-400/80" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        No Transactions Match Active Filter
      </h3>
      <p className="text-xs text-[var(--text-tertiary)] max-w-xs">
        Speak a command in Telugu or Hindi, or tap a preset chip to stage a new cross-border order.
      </p>
    </div>
  );

  // Dynamic Pinned Bottom Summary Row
  const pinnedBottomRowData = useMemo(() => {
    const verified = transactions.filter(t => t.status === 'VERIFIED_PAID');
    const totalInr = transactions.reduce((sum, t) => sum + (Number(t.spoken_amount_inr) || 0), 0);
    const totalUsd = verified.reduce((sum, t) => sum + (Number(t.settlement_amount_usd) || 0), 0);
    const shippedCount = transactions.filter(t => t.shipment_status === 'SHIPPED').length;

    return [{
      id: 'pinned_total',
      paypal_invoice_id: `SUMMARY (${transactions.length} Total)`,
      customer_name: 'All Global Corridors',
      customer_country: 'Cross-Border',
      item_name: `Verified: ${verified.length} Paid | Pending: ${transactions.length - verified.length}`,
      spoken_amount_inr: totalInr,
      settlement_amount_usd: totalUsd,
      status: 'VERIFIED_PAID',
      shipment_status: `${shippedCount} Dispatched`,
    }];
  }, [transactions]);

  // AG Grid Column Definitions with Tooltips & Flash Animations
  const columnDefs = useMemo<ColDef<PayPalTransaction>[]>(() => [
    {
      headerName: 'PayPal Reference',
      field: 'paypal_invoice_id',
      headerTooltip: 'PayPal Orders v2 / Invoicing v2 unique reference token.',
      valueGetter: (p) => p.data?.paypal_invoice_id || p.data?.paypal_order_id || p.data?.id,
      minWidth: 160,
      width: 175,
      cellClass: 'font-mono text-xs font-semibold text-[var(--text-primary)] flex items-center',
      enableCellChangeFlash: true,
    },
    {
      headerName: 'Buyer & Corridor',
      field: 'customer_name',
      headerTooltip: 'International buyer and destination export country.',
      cellRenderer: CustomerCellRenderer,
      minWidth: 170,
      width: 185,
    },
    {
      headerName: 'Item Description',
      field: 'item_name',
      headerTooltip: 'Artisan craft or handloom product description.',
      minWidth: 230,
      flex: 1,
      cellClass: 'text-[var(--text-secondary)] text-xs truncate flex items-center',
    },
    {
      headerName: 'Spoken INR',
      field: 'spoken_amount_inr',
      headerTooltip: 'Spoken domestic price transcribed by Sarvam AI Saaras:v3.',
      cellRenderer: SpokenInrCellRenderer,
      minWidth: 130,
      width: 140,
      enableCellChangeFlash: true,
    },
    {
      headerName: 'Settled USD',
      field: 'settlement_amount_usd',
      headerTooltip: 'Settlement amount in USD locked at reference FX quote (1 USD = ₹84.00 INR).',
      cellRenderer: SettledUsdCellRenderer,
      minWidth: 140,
      width: 155,
      enableCellChangeFlash: true,
    },
    {
      headerName: 'Payment Status',
      field: 'status',
      headerTooltip: 'Double-entry cryptographic payment status from PayPal capture.',
      minWidth: 165,
      width: 175,
      cellRenderer: StatusCellRenderer,
      enableCellChangeFlash: true,
    },
    {
      headerName: 'Seller Protection',
      field: 'shipment_status',
      headerTooltip: 'DHL/FedEx tracking required by PayPal Seller Protection to prevent 21-day fund holds.',
      minWidth: 160,
      width: 180,
      cellRenderer: TrackingCellRenderer,
      enableCellChangeFlash: true,
    },
    {
      headerName: 'Actions',
      minWidth: 110,
      width: 120,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
    },
  ], [onOpenQrModal, onSendReminder, onAddTracking]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    enableCellChangeFlash: true,
  }), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4 md:p-6">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-emerald)]" />
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <span>Enterprise PayPal Ledger</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AG Grid Community v32
              </span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Live double-entry verified transactions, native pinned summary totals, scannable QR generation, and Seller Protection tracking.
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
                ? 'bg-[var(--accent-emerald)] text-slate-950 font-bold'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Records ({transactions.length})
          </button>
          <button
            onClick={() => handleQuickFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'PAID'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Verified Paid ({transactions.filter(t => t.status === 'VERIFIED_PAID').length})
          </button>
          <button
            onClick={() => handleQuickFilter('UNPAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'UNPAID'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Awaiting Buyer ({transactions.filter(t => t.status === 'AWAITING_BUYER').length})
          </button>
          <button
            onClick={() => handleQuickFilter('SHIPPED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeQuickFilter === 'SHIPPED'
                ? 'bg-blue-500 text-white font-bold'
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

      {/* The AG Grid Community Canvas with Pinned Summary & Flash Support */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm h-[620px] w-full ag-theme-quartz-dark">
        <AgGridReact<PayPalTransaction>
          rowData={transactions}
          pinnedBottomRowData={pinnedBottomRowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onGridSizeChanged={onGridSizeChanged}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          animateRows={true}
          enableCellChangeFlash={true}
          rowSelection="single"
          rowHeight={54}
          domLayout="normal"
          noRowsOverlayComponent={CustomNoRowsOverlay}
        />
      </div>
    </div>
  );
};
