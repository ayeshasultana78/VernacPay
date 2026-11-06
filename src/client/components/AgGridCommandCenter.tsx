import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams, ICellRendererParams } from 'ag-grid-community';
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
  PackageCheck 
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

  // KPI Calculations
  const verifiedTxs = transactions.filter(t => t.status === 'VERIFIED_PAID');
  const totalVerifiedUsd = verifiedTxs.reduce((sum, t) => sum + t.settlement_amount_usd, 0);
  const totalVerifiedInr = verifiedTxs.reduce((sum, t) => sum + t.spoken_amount_inr, 0);

  const pendingTxs = transactions.filter(t => t.status === 'AWAITING_BUYER' || t.status === 'PENDING_APPROVAL');
  const totalPendingUsd = pendingTxs.reduce((sum, t) => sum + t.settlement_amount_usd, 0);

  const shippedCount = transactions.filter(t => t.shipment_status === 'SHIPPED').length;

  // React to voice-driven SSE grid filter commands
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
    params.api.sizeColumnsToFit();
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

  const handleExportCsv = () => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({
        fileName: `VernacPay_Global_Ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  };

  // Custom Cell Renderers (Memoized / Stable by reference per ag-dev skill)
  const StatusCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    const val = params.value;
    if (val === 'VERIFIED_PAID') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VERIFIED_PAID</span>
        </span>
      );
    } else if (val === 'AWAITING_BUYER') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          <span>UNPAID / OVERDUE</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
        <span>STAGED</span>
      </span>
    );
  };

  const TrackingCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    const data = params.data;
    if (!data) return null;

    if (data.shipment_status === 'SHIPPED' && data.tracking_number) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-950/60 text-blue-300 border border-blue-700/50">
          <Truck className="w-3 h-3 text-blue-400" />
          <span>{data.carrier_code || 'DHL'} #{data.tracking_number}</span>
        </span>
      );
    }

    if (data.status === 'VERIFIED_PAID') {
      return (
        <button
          onClick={() => onAddTracking(data)}
          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-600/50 transition-colors"
        >
          + Add Tracking
        </button>
      );
    }

    return <span className="text-[11px] text-slate-500">Unpaid</span>;
  };

  const ActionsCellRenderer = (params: ICellRendererParams<PayPalTransaction>) => {
    const data = params.data;
    if (!data) return null;

    return (
      <div className="flex items-center gap-1.5 h-full">
        <button
          onClick={() => onOpenQrModal(data)}
          title="View PayPal QR Code & Checkout"
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-paypal-lightBlue" />
        </button>

        {data.status === 'AWAITING_BUYER' && (
          <button
            onClick={() => onSendReminder(data)}
            title="Send PayPal Overdue Reminder"
            className="p-1 rounded bg-amber-950/40 hover:bg-amber-800/50 text-amber-300 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef<PayPalTransaction>[]>(() => [
    {
      headerName: 'PayPal Reference',
      field: 'paypal_invoice_id',
      valueGetter: (p) => p.data?.paypal_invoice_id || p.data?.paypal_order_id || p.data?.id,
      width: 140,
      cellClass: 'font-mono text-xs text-slate-300',
    },
    {
      headerName: 'Buyer & Destination',
      field: 'customer_name',
      valueGetter: (p) => `${p.data?.customer_name} (${p.data?.customer_country?.split('(')[1]?.replace(')', '') || 'US'})`,
      width: 170,
      cellClass: 'font-medium text-slate-100',
    },
    {
      headerName: 'Product Description',
      field: 'item_name',
      flex: 1,
      minWidth: 200,
      cellClass: 'text-slate-300 text-xs truncate',
    },
    {
      headerName: 'Spoken Base (₹ INR)',
      field: 'spoken_amount_inr',
      width: 140,
      valueFormatter: (p: ValueFormatterParams) => `₹${Number(p.value).toLocaleString('en-IN')}`,
      cellClass: 'font-semibold text-amber-400 font-mono text-xs',
    },
    {
      headerName: 'PayPal Amount ($ USD)',
      field: 'settlement_amount_usd',
      width: 145,
      valueFormatter: (p: ValueFormatterParams) => `$${Number(p.value).toFixed(2)} USD`,
      cellClass: 'font-bold text-emerald-400 font-mono text-xs',
    },
    {
      headerName: 'Payment Status',
      field: 'status',
      width: 155,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: 'Shipment Tracking',
      field: 'shipment_status',
      width: 180,
      cellRenderer: TrackingCellRenderer,
    },
    {
      headerName: 'Actions',
      width: 90,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 flex flex-col gap-4 h-full">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Total Verified USD</span>
            <span className="text-lg font-black text-emerald-400">${totalVerifiedUsd.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">₹{totalVerifiedInr.toLocaleString('en-IN')} INR</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Pending Collections</span>
            <span className="text-lg font-black text-amber-400">${totalPendingUsd.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">{pendingTxs.length} invoices awaiting</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Shipments Dispatched</span>
            <span className="text-lg font-black text-blue-400">{shippedCount}</span>
            <span className="text-[10px] text-slate-400 block">DHL / FedEx Tracked</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">PayPal Seller Shield</span>
            <span className="text-sm font-bold text-slate-200">Protected</span>
            <span className="text-[10px] text-emerald-400 block">100% Tracking Verified</span>
          </div>
          <div className="p-2.5 rounded-lg bg-paypal-blue/20 text-paypal-lightBlue">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter:</span>
          </span>

          <button
            onClick={() => handleQuickFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeQuickFilter === 'ALL'
                ? 'bg-paypal-lightBlue text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>

          <button
            onClick={() => handleQuickFilter('PAID')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeQuickFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Paid ({verifiedTxs.length})
          </button>

          <button
            onClick={() => handleQuickFilter('UNPAID')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeQuickFilter === 'UNPAID'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Unpaid ({pendingTxs.length})
          </button>

          <button
            onClick={() => handleQuickFilter('SHIPPED')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeQuickFilter === 'SHIPPED'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Shipped ({shippedCount})
          </button>
        </div>

        {/* Action: Export Ledger CSV */}
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 hover:text-white transition-all"
        >
          <Download className="w-3.5 h-3.5 text-paypal-lightBlue" />
          <span>[Export Ledger CSV]</span>
        </button>
      </div>

      {/* AG Grid React Table Container (With Explicit Height) */}
      <div className="ag-theme-quartz-dark rounded-xl overflow-hidden border border-slate-800 shadow-xl" style={{ height: '480px', width: '100%' }}>
        <AgGridReact<PayPalTransaction>
          rowData={transactions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(p) => p.data.id}
          onGridReady={onGridReady}
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};
