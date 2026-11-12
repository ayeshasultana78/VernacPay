import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { TrustBoundary } from './components/TrustBoundary';
import { OverviewView } from './components/views/OverviewView';
import { VoiceStudioView } from './components/views/VoiceStudioView';
import { InvoicesView } from './components/views/InvoicesView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { AuditTrailView } from './components/views/AuditTrailView';
import { AgGridCommandCenter } from './components/AgGridCommandCenter';
import { TrustBoundaryDrawer } from './components/TrustBoundaryDrawer';
import { CheckoutQrModal } from './components/CheckoutQrModal';
import { ComplianceModal } from './components/ComplianceModal';
import { CommandPalette } from './components/CommandPalette';
import { useAppStore } from './store/useAppStore';
import { 
  LanguageCode, 
  PayPalTransaction, 
  WebhookAndAuditEvent, 
  StagedConfirmation, 
  TrustBoundaryStage 
} from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppContent: React.FC = () => {
  const {
    theme,
    language,
    setLanguage,
    activeView,
    setActiveView,
    isComplianceOpen,
    setComplianceOpen,
    isAuditDrawerOpen,
    setAuditDrawerOpen,
    resetStages,
    setStageState,
  } = useAppStore();

  const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
  const [auditEvents, setAuditEvents] = useState<WebhookAndAuditEvent[]>([]);
  const [currentStage, setCurrentStage] = useState<TrustBoundaryStage>('1. AI PROPOSED (Untrusted)');
  const [stagedConfirmation, setStagedConfirmation] = useState<StagedConfirmation | null>(null);
  const [transcriptNative, setTranscriptNative] = useState('');
  const [transcriptEnglish, setTranscriptEnglish] = useState('');
  const [ttsAudioBase64, setTtsAudioBase64] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedQrTx, setSelectedQrTx] = useState<PayPalTransaction | null>(null);
  const [sseFilterCommand, setSseFilterCommand] = useState<any>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Initial Data Fetch & URL Redirect Handlers
  useEffect(() => {
    fetchTransactions();
    fetchAuditEvents();
    fetchPendingStaged();

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment_success') === 'true') {
      const orderId = searchParams.get('order_id');
      toast.success(`PayPal payment verified! Order ${orderId || ''} recorded on ledger.`);
      setStageState(5, 'done');
      setCurrentStage('5. WEBHOOK VERIFIED & LEDGER LOCKED');
      // Clean URL without refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (searchParams.get('order_cancelled') === 'true') {
      toast.warning('PayPal checkout was cancelled by the buyer.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 2. Server-Sent Events (SSE) Live Stream
  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.addEventListener('audit_event', (e) => {
      try {
        const event: WebhookAndAuditEvent = JSON.parse(e.data);
        setAuditEvents((prev) => [event, ...prev]);
        setCurrentStage(event.stage_name);

        // Update TrustBar visual states
        if (event.stage_name.includes('1.')) {
          setStageState(1, 'done');
          setStageState(2, 'active');
        } else if (event.stage_name.includes('2.')) {
          if (event.verification_status === 'REJECTED') {
            setStageState(2, 'blocked', event.details);
          } else {
            setStageState(2, 'done');
            setStageState(3, 'active');
          }
        } else if (event.stage_name.includes('3.')) {
          setStageState(3, 'done');
          setStageState(4, 'active');
        } else if (event.stage_name.includes('4.')) {
          setStageState(4, 'done');
          setStageState(5, 'active');
        } else if (event.stage_name.includes('5.')) {
          setStageState(5, 'done');
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    eventSource.addEventListener('grid_update', (e) => {
      try {
        const updatedTx: PayPalTransaction = JSON.parse(e.data);
        setTransactions((prev) => {
          const index = prev.findIndex((t) => t.id === updatedTx.id);
          if (index >= 0) {
            const clone = [...prev];
            clone[index] = updatedTx;
            return clone;
          }
          return [updatedTx, ...prev];
        });
        setSelectedQrTx((curr) => (curr && curr.id === updatedTx.id ? updatedTx : curr));
      } catch (err) {
        console.error('grid_update parse error:', err);
      }
    });

    eventSource.addEventListener('grid_filter_command', (e) => {
      try {
        const cmd = JSON.parse(e.data);
        setSseFilterCommand(cmd);
        if (cmd.speechAnnouncement) {
          toast.info(cmd.speechAnnouncement);
        }
      } catch (err) {
        console.error('grid_filter_command parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [setStageState]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const fetchAuditEvents = async () => {
    try {
      const res = await fetch('/api/audit-events');
      const data = await res.json();
      setAuditEvents(data);
    } catch (err) {
      console.error('Failed to fetch audit events:', err);
    }
  };

  const fetchPendingStaged = async () => {
    try {
      const res = await fetch('/api/staged-confirmations');
      const data = await res.json();
      if (data && data.length > 0) {
        setStagedConfirmation(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch staged confirmations:', err);
    }
  };

  // 3. Process Voice Utterance via Preset Key
  const handleSelectSampleCommand = async (presetKey: string) => {
    setIsLoading(true);
    resetStages();
    setStageState(1, 'active');

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetKey, languageCode: language }),
      });
      const data = await res.json();

      setTranscriptNative(data.transcript_native || '');
      setTranscriptEnglish(data.transcript_english || '');
      if (data.detected_language) {
        setLanguage(data.detected_language);
      }
      if (data.staged_confirmation) {
        setStagedConfirmation(data.staged_confirmation);
        toast.warning(`Merchant approval required for ${data.staged_confirmation.auth_code}`);
      }
      if (data.audio_base64) {
        setTtsAudioBase64(data.audio_base64);
      }
      if (data.message_english) {
        toast.info(data.message_english);
      }
    } catch (err: any) {
      toast.error(`Voice error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Live Microphone Toggle
  const handleToggleRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const supportedMime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus'))
          ? 'audio/webm;codecs=opus'
          : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4'))
          ? 'audio/mp4'
          : 'audio/webm';

        const mediaRecorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const recordMime = mediaRecorder.mimeType || supportedMime;
          const audioBlob = new Blob(audioChunksRef.current, { type: recordMime });
          stream.getTracks().forEach((track) => track.stop());

          setIsLoading(true);
          resetStages();
          setStageState(1, 'active');

          const formData = new FormData();
          const ext = recordMime.includes('mp4') ? 'mic.mp4' : 'mic.webm';
          formData.append('audio', audioBlob, ext);
          formData.append('languageCode', language);

          try {
            const res = await fetch('/api/voice/process', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();

            setTranscriptNative(data.transcript_native || '');
            setTranscriptEnglish(data.transcript_english || '');
            if (data.staged_confirmation) {
              setStagedConfirmation(data.staged_confirmation);
            }
            if (data.audio_base64) {
              setTtsAudioBase64(data.audio_base64);
            }
          } catch (err: any) {
            toast.error(`Audio upload failed: ${err.message}`);
          } finally {
            setIsLoading(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch {
        console.warn('Microphone permission not granted, executing demo preset.');
        handleSelectSampleCommand(
          language === 'te-IN'
            ? 'telugu_invoice_sarah'
            : language === 'hi-IN'
            ? 'hindi_tracking_emma'
            : 'english_unpaid_remind'
        );
      }
    }
  };

  // 5. Merchant Authorizes Staged Action
  const handleConfirmStaged = async (authCode: string) => {
    setIsLoading(true);
    setStageState(3, 'active');

    try {
      const res = await fetch('/api/staged/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode }),
      });
      const data = await res.json();

      setStagedConfirmation(null);
      if (data.transaction) {
        setSelectedQrTx(data.transaction);
      }
      toast.success(data.message_english || `Action ${authCode} executed on PayPal Sandbox!`);
    } catch (err: any) {
      toast.error(`Confirmation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Merchant Cancels Staged Action
  const handleCancelStaged = async (authCode: string) => {
    try {
      await fetch('/api/staged/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode }),
      });
      setStagedConfirmation(null);
      toast.info(`Action ${authCode} cancelled.`);
    } catch (err: any) {
      toast.error(`Cancel error: ${err.message}`);
    }
  };

  const handleSendReminderFromGrid = async (tx: PayPalTransaction) => {
    setIsLoading(true);
    resetStages();
    setStageState(1, 'active');

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: `Send reminder to ${tx.customer_name} for overdue invoice`,
          languageCode: language,
        }),
      });
      const data = await res.json();
      if (data.staged_confirmation) {
        setStagedConfirmation(data.staged_confirmation);
      }
      toast.info(`Staged reminder for ${tx.customer_name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrackingFromGrid = async (tx: PayPalTransaction) => {
    setIsLoading(true);
    resetStages();
    setStageState(1, 'active');

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: `Add DHL tracking number 9845123650 to ${tx.customer_name}'s order`,
          languageCode: language,
        }),
      });
      const data = await res.json();
      if (data.staged_confirmation) {
        setStagedConfirmation(data.staged_confirmation);
      }
      toast.info(`Staged DHL tracking for ${tx.customer_name}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex font-sans antialiased">
      {/* 1. Left Persistent Sidebar */}
      <AppSidebar />

      {/* 2. Main Application Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <AppHeader />

        {/* Responsive Trust Boundary Stepper */}
        <TrustBoundary />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'overview' && (
            <OverviewView
              transactions={transactions}
              onOpenQrModal={(tx) => setSelectedQrTx(tx)}
              onSendPreset={handleSelectSampleCommand}
              isLoadingVoice={isLoading}
            />
          )}

          {activeView === 'voice' && (
            <VoiceStudioView
              currentLanguage={language}
              isRecording={isRecording}
              onToggleRecord={handleToggleRecord}
              isLoading={isLoading}
              transcriptNative={transcriptNative}
              transcriptEnglish={transcriptEnglish}
              stagedConfirmation={stagedConfirmation}
              onConfirmStaged={handleConfirmStaged}
              onCancelStaged={handleCancelStaged}
              ttsAudioBase64={ttsAudioBase64}
              onSendPreset={handleSelectSampleCommand}
            />
          )}

          {activeView === 'transactions' && (
            <AgGridCommandCenter
              transactions={transactions}
              onOpenQrModal={(tx) => setSelectedQrTx(tx)}
              onSendReminder={handleSendReminderFromGrid}
              onAddTracking={handleAddTrackingFromGrid}
              sseFilterCommand={sseFilterCommand}
            />
          )}

          {activeView === 'invoices' && (
            <InvoicesView
              transactions={transactions}
              onOpenQrModal={(tx) => setSelectedQrTx(tx)}
              onSendReminder={handleSendReminderFromGrid}
              onSendPreset={handleSelectSampleCommand}
            />
          )}

          {activeView === 'shipments' && (
            <ShipmentsView
              transactions={transactions}
              onAddTracking={handleAddTrackingFromGrid}
            />
          )}

          {activeView === 'audit' && (
            <AuditTrailView
              auditEvents={auditEvents}
              onRefresh={fetchAuditEvents}
            />
          )}

          {activeView === 'compliance' && (
            <div className="p-6 max-w-4xl mx-auto">
              <ComplianceModal
                isOpen={true}
                onClose={() => setActiveView('overview')}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. Global Overlays & Modals */}
      <TrustBoundaryDrawer events={auditEvents} />

      <CheckoutQrModal
        transaction={selectedQrTx}
        isOpen={!!selectedQrTx}
        onClose={() => setSelectedQrTx(null)}
      />

      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setComplianceOpen(false)}
      />

      <CommandPalette
        onRunSample={handleSelectSampleCommand}
        onFilterGrid={(status) => {
          setActiveView('transactions');
          setSseFilterCommand({
            filterModel: status ? { status: { type: 'equals', filter: status } } : null,
            speechAnnouncement: status ? `Filtered to ${status}` : 'Cleared filters',
          });
        }}
        onExportCsv={() => {
          setSseFilterCommand({ exportCsv: true });
        }}
      />

      <Toaster
        theme={theme === 'dark' ? 'dark' : 'light'}
        position="bottom-right"
        richColors
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};
