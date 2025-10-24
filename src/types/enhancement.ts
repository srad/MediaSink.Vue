import type { Ref } from "vue";
import type { ResponsesEnhancementDescriptions } from "../services/api/v1/MediaSinkClient";

// --------------------------------------------------------------------------------------
// Form Fields
// --------------------------------------------------------------------------------------

export interface EnhancementFormFields {
  targetResolution: Ref<string>;
  encodingPreset: Ref<string>;
  crf: Ref<number | undefined>;
  denoiseStrength: Ref<number>;
  sharpenStrength: Ref<number>;
  applyNormalize: Ref<boolean>;
}

// --------------------------------------------------------------------------------------
// UI State
// --------------------------------------------------------------------------------------

export interface EnhancementUIState {
  showModal: Ref<boolean>;
  enhancementDescriptions: Ref<ResponsesEnhancementDescriptions | null>;
  estimatedSize: Ref<number | null>;
  estimating: Ref<boolean>;
  busy: Ref<boolean>;
}

// --------------------------------------------------------------------------------------
// Modal Display Methods
// --------------------------------------------------------------------------------------

export interface EnhancementModalMethods {
  getCrfMinValue: () => number;
  getCrfMaxValue: () => number;
  getCrfDescription: () => string;
  setCrfRecommended: () => void;
  formatFileSize: (bytes: number) => string;
}

// --------------------------------------------------------------------------------------
// Modal Data Interface (for VideoEnhancementModal)
// --------------------------------------------------------------------------------------

export interface IVideoEnhancementModalData extends EnhancementFormFields, Pick<EnhancementUIState, 'enhancementDescriptions' | 'estimatedSize' | 'estimating'>, EnhancementModalMethods {}

// --------------------------------------------------------------------------------------
// Composable Methods
// --------------------------------------------------------------------------------------

export interface EnhancementMethods {
  openModal: () => Promise<void>;
  enhance: () => Promise<void>;
}

// --------------------------------------------------------------------------------------
// Combined Interface (for convenience)
// --------------------------------------------------------------------------------------

export interface IVideoEnhancement extends EnhancementFormFields, EnhancementUIState, EnhancementMethods, EnhancementModalMethods {}
