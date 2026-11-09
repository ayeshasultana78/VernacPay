import { create } from 'zustand';
import { 
  LanguageCode, 
  TrustStageNumber, 
  TrustStageState, 
  StagedConfirmationEvent, 
  LedgerRow 
} from '../../contracts';

export type NavigationView = 
  | 'overview' 
  | 'voice' 
  | 'transactions' 
  | 'invoices' 
  | 'shipments' 
  | 'compliance' 
  | 'audit';

export interface BackendConfig {
  appMode: 'MOCK' | 'SANDBOX' | 'PRODUCTION';
  isLivePayPal: boolean;
  service: string;
  fxRate: number;
  sandboxBuyer?: {
    email: string;
    password?: string;
  };
}

export interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Language
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // Navigation & Layout
  activeView: NavigationView;
  setActiveView: (view: NavigationView) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Modals & Panels
  isComplianceOpen: boolean;
  setComplianceOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isAuditDrawerOpen: boolean;
  setAuditDrawerOpen: (open: boolean) => void;
  qrModalRow: LedgerRow | null;
  setQrModalRow: (row: LedgerRow | null) => void;

  // Backwards compatibility for responsive tab
  activeTab: 'workspace' | 'ledger';
  setActiveTab: (tab: 'workspace' | 'ledger') => void;

  // Trust Boundary Stages (1..5)
  runId: string;
  runStartTime: number | null;
  stageStates: Record<TrustStageNumber, TrustStageState>;
  stageReasons: Record<TrustStageNumber, string | undefined>;
  setStageState: (stage: TrustStageNumber, state: TrustStageState, reason?: string) => void;
  resetStages: (newRunId?: string) => void;

  // Current Staged Action
  stagedConfirmation: StagedConfirmationEvent | null;
  setStagedConfirmation: (staged: StagedConfirmationEvent | null) => void;

  // Transcript
  transcriptOriginal: string;
  transcriptEnglish: string;
  transcriptAudioBase64?: string;
  setTranscript: (orig: string, eng: string, audio?: string) => void;

  // Voice Recording state
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isProcessingVoice: boolean;
  setIsProcessingVoice: (processing: boolean) => void;

  // Backend Config
  backendConfig: BackendConfig | null;
  setBackendConfig: (config: BackendConfig | null) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('vernacpay_theme') as 'light' | 'dark') ||
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');

  return {
    theme: savedTheme,
    setTheme: (theme) => {
      localStorage.setItem('vernacpay_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      set({ theme });
    },
    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },

    language: 'te-IN',
    setLanguage: (language) => set({ language }),

    activeView: 'overview',
    setActiveView: (activeView) => set({ activeView }),
    sidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    isComplianceOpen: false,
    setComplianceOpen: (isComplianceOpen) => set({ isComplianceOpen }),
    isCommandPaletteOpen: false,
    setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
    isAuditDrawerOpen: false,
    setAuditDrawerOpen: (isAuditDrawerOpen) => set({ isAuditDrawerOpen }),
    qrModalRow: null,
    setQrModalRow: (qrModalRow) => set({ qrModalRow }),

    activeTab: 'workspace',
    setActiveTab: (activeTab) => set({ activeTab }),

    runId: 'RUN-INIT',
    runStartTime: null,
    stageStates: {
      1: 'idle',
      2: 'idle',
      3: 'idle',
      4: 'idle',
      5: 'idle',
    },
    stageReasons: {
      1: undefined,
      2: undefined,
      3: undefined,
      4: undefined,
      5: undefined,
    },

    setStageState: (stage, state, reason) => {
      set((prev) => ({
        stageStates: { ...prev.stageStates, [stage]: state },
        stageReasons: { ...prev.stageReasons, [stage]: reason },
      }));
    },

    resetStages: (newRunId) => {
      set({
        runId: newRunId || `RUN-${Date.now().toString().slice(-6)}`,
        runStartTime: Date.now(),
        stageStates: {
          1: 'idle',
          2: 'idle',
          3: 'idle',
          4: 'idle',
          5: 'idle',
        },
        stageReasons: {
          1: undefined,
          2: undefined,
          3: undefined,
          4: undefined,
          5: undefined,
        },
      });
    },

    stagedConfirmation: null,
    setStagedConfirmation: (stagedConfirmation) => set({ stagedConfirmation }),

    transcriptOriginal: '',
    transcriptEnglish: '',
    transcriptAudioBase64: undefined,
    setTranscript: (transcriptOriginal, transcriptEnglish, transcriptAudioBase64) =>
      set({ transcriptOriginal, transcriptEnglish, transcriptAudioBase64 }),

    isRecording: false,
    setIsRecording: (isRecording) => set({ isRecording }),
    isProcessingVoice: false,
    setIsProcessingVoice: (isProcessingVoice) => set({ isProcessingVoice }),

    backendConfig: {
      appMode: 'MOCK',
      isLivePayPal: false,
      service: 'VernacPay-Global v2.0',
      fxRate: 84.00,
    },
    setBackendConfig: (backendConfig) => set({ backendConfig }),
  };
});
