import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { TopBar } from './components/TopBar';
import { TrustBar } from './components/TrustBar';
import { WorkspaceLayout } from './components/WorkspaceLayout';
import { VoiceAgentPane } from './components/VoiceAgentPane';
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
    isComplianceOpen,
    setComplianceOpen,
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

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchTransactions();
    fetchAuditEvents();
    fetchPendingStaged();
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
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach((track) => track.stop());

          setIsLoading(true);
          resetStages();
          setStageState(1, 'active');

          const formData = new FormData();
          formData.append('audio', audioBlob, 'mic.webm');
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
      } catch (err) {
        console.warn('Microphone permission not granted or unavailable, executing demo preset.');
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

  // 5. Merchant Authorizes Staged Action (Gate 3 -> Gate 4)
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

  // 7. Simulate Buyer Sandbox Payment Capture (Gate 5)
  const handleSimulateCapture = async (tx: PayPalTransaction) => {
    try {
      const res = await fetch('/api/sandbox/simulate-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: tx.paypal_order_id,
          invoiceId: tx.paypal_invoice_id,
        }),
      });
      const data = await res.json();
      if (data.transaction) {
        setSelectedQrTx(data.transaction);
      }
      toast.success(`Payment verified and ledger locked for ${tx.customer_name}!`);
    } catch (err: any) {
      toast.error(`Capture simulation error: ${err.message}`);
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-200">
      {/* 56px Top Bar */}
      <TopBar />

      {/* Sticky 5-Stage Trust Boundary Bar */}
      <TrustBar />

      {/* Main Split-Screen Workspace (Resizable on desktop, tabs on mobile/tablet) */}
      <WorkspaceLayout
        leftPane={
          <VoiceAgentPane
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
          />
        }
        rightPane={
          <AgGridCommandCenter
            transactions={transactions}
            onOpenQrModal={(tx) => setSelectedQrTx(tx)}
            onSendReminder={handleSendReminderFromGrid}
            onAddTracking={handleAddTrackingFromGrid}
            sseFilterCommand={sseFilterCommand}
          />
        }
      />

      {/* Bottom Collapsible Drawer: Live Trust Boundary & Cryptographic Audit Stream */}
      <TrustBoundaryDrawer events={auditEvents} />

      {/* Live PayPal QR & Sandbox Checkout Modal */}
      <CheckoutQrModal
        transaction={selectedQrTx}
        isOpen={!!selectedQrTx}
        onClose={() => setSelectedQrTx(null)}
        onSimulateCapture={handleSimulateCapture}
      />

      {/* Indian Exporter Compliance Readiness Modal */}
      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setComplianceOpen(false)}
      />

      {/* Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette
        onRunSample={handleSelectSampleCommand}
        onFilterGrid={(status) => {
          setSseFilterCommand({
            filterModel: status ? { status: { type: 'equals', filter: status } } : null,
            speechAnnouncement: status ? `Filtered to ${status}` : 'Cleared filters',
          });
        }}
        onExportCsv={() => {
          setSseFilterCommand({ exportCsv: true });
        }}
      />

      {/* Sonner Toast Provider */}
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
